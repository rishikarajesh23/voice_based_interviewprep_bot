from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from app.core.database import get_database
from app.models.interview import Interview, InterviewMode, InterviewRound, Answer
from app.services.question_generator import get_next_question
from app.services.speech_service import text_to_speech, speech_to_text
from app.services.keyword_extractor import extract_keywords
from datetime import datetime
from typing import Dict
import uuid

router = APIRouter()

# Active interview sessions in memory
active_sessions: Dict[str, Interview] = {}

@router.post("/start")
async def start_interview(user_id: str, mode: InterviewMode):
    """Start a new interview session"""
    db = get_database()
    
    # Create a new interview document
    interview = Interview(
        user_id=user_id,
        mode=mode,
        current_round=InterviewRound.HR,
        current_question_index=1,
        started_at=datetime.now(),
        status="in_progress"
    )
    
    session_id = str(uuid.uuid4())
    interview_dict = interview.dict()
    interview_dict["session_id"] = session_id
    interview_dict["answers"] = []  # Initialize answer list
    
    await db.interviews.insert_one(interview_dict)
    active_sessions[session_id] = interview
    
    # Generate and return first question
    first_question = await get_next_question(
        round=interview.current_round.value,
        question_index=1,
        is_first_question=True
    )
    
    # Optionally store the first question text for reference
    await db.interviews.update_one(
        {"session_id": session_id},
        {"$set": {"current_question_text": first_question}}
    )
    
    return {
        "session_id": session_id,
        "question": first_question,
        "round": interview.current_round.value,
        "question_index": 1
    }


@router.post("/answer/{session_id}")
async def submit_answer(session_id: str, answer_text: str):
    """Submit an answer and get the next question"""
    db = get_database()

    # Load session if not active
    if session_id not in active_sessions:
        interview_doc = await db.interviews.find_one({"session_id": session_id})
        if not interview_doc:
            raise HTTPException(status_code=404, detail="Session not found")
        active_sessions[session_id] = Interview(**interview_doc)

    interview = active_sessions[session_id]

    # Get current question (the one just asked)
    current_question = await get_next_question(
        round=interview.current_round.value,
        question_index=interview.current_question_index,
        is_first_question=(interview.current_question_index == 1 and interview.current_round == InterviewRound.HR)
    )

    # Extract keywords from user's answer
    keywords = []
    if answer_text and answer_text.strip():
        keywords = await extract_keywords(answer_text)

    # Create an Answer entry (includes question + answer)
    answer_entry = Answer(
        question=current_question,
        answer=answer_text,
        timestamp=datetime.now(),
        round=interview.current_round,
        keywords=keywords
    )

    # Append to interview and DB immediately
    interview.answers.append(answer_entry)
    await db.interviews.update_one(
        {"session_id": session_id},
        {"$push": {"answers": answer_entry.dict()}}
    )

    # Increment question index / handle round transition
    interview.current_question_index += 1

    if interview.current_question_index > 10:
        if interview.current_round == InterviewRound.HR:
            interview.current_round = InterviewRound.TECHNICAL
            interview.current_question_index = 1
        elif interview.current_round == InterviewRound.TECHNICAL:
            interview.current_round = InterviewRound.MANAGEMENT
            interview.current_question_index = 1
        elif interview.current_round == InterviewRound.MANAGEMENT:
            # End interview
            interview.status = "completed"
            interview.ended_at = datetime.now()

            await db.interviews.update_one(
                {"session_id": session_id},
                {"$set": interview.dict()}
            )

            await db.users.update_one(
                {"uid": interview.user_id},
                {"$push": {"interview_history": session_id}}
            )

            if session_id in active_sessions:
                del active_sessions[session_id]

            return {"status": "completed", "message": "Interview completed successfully"}

    # Generate next question
    next_question = await get_next_question(
        round=interview.current_round.value,
        question_index=interview.current_question_index,
        previous_answer=answer_text if answer_text else None
    )

    # Store current state and next question for context
    await db.interviews.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "current_question_text": next_question,
                "current_round": interview.current_round.value,
                "current_question_index": interview.current_question_index
            }
        }
    )

    await db.interviews.update_one(
        {"session_id": session_id},
        {"$set": interview.dict()}
    )

    return {
        "next_question": next_question,
        "round": interview.current_round.value,
        "question_index": interview.current_question_index
    }


@router.get("/history/{user_id}")
async def get_interview_history(user_id: str):
    """Retrieve past completed interviews for a user"""
    db = get_database()
    
    interviews = await db.interviews.find(
        {"user_id": user_id, "status": "completed"}
    ).sort("ended_at", -1).to_list(20)
    
    for interview in interviews:
        interview["_id"] = str(interview["_id"])
    
    return interviews


@router.websocket("/ws/{session_id}")
async def websocket_interview(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time interviews (voice or text)"""
    await websocket.accept()
    
    if session_id not in active_sessions:
        await websocket.send_json({"error": "Session not found"})
        await websocket.close()
        return
    
    interview = active_sessions[session_id]
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data["type"] == "audio":
                # Convert speech to text
                audio_data = data["audio"]
                text = await speech_to_text(audio_data)
                
                if text:
                    response = await submit_answer(session_id, text)
                    if interview.mode in [InterviewMode.VOICE_TO_VOICE]:
                        audio_response = await text_to_speech(response.get("next_question", ""))
                        response["audio"] = audio_response
                    await websocket.send_json(response)
                else:
                    await websocket.send_json({"error": "Could not understand speech"})
            
            elif data["type"] == "text":
                response = await submit_answer(session_id, data["text"])
                await websocket.send_json(response)
            
            elif data["type"] == "skip":
                interview.current_question_index += 1
                next_question = await get_next_question(
                    round=interview.current_round.value,
                    question_index=interview.current_question_index
                )
                await websocket.send_json({
                    "next_question": next_question,
                    "round": interview.current_round.value,
                    "question_index": interview.current_question_index
                })
    
    except WebSocketDisconnect:
        if session_id in active_sessions:
            del active_sessions[session_id]
