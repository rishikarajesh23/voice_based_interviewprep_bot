from fastapi import APIRouter, HTTPException
from app.core.database import get_database
from app.services.ai_service import generate_feedback

router = APIRouter()

@router.get("/{session_id}")
async def get_feedback(session_id: str):
    """Generate or retrieve feedback for a completed interview"""
    db = get_database()
    
    # Fetch interview document
    interview = await db.interviews.find_one({"session_id": session_id})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if interview.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Interview not yet completed")
    
    # Generate feedback only if not already available
    if not interview.get("feedback"):
        answers = [
            {
                "question": a.get("question", ""),
                "answer": a.get("answer", "")
            }
            for a in interview.get("answers", [])
            if a.get("question")
        ]
        
        if not answers:
            raise HTTPException(status_code=400, detail="No answers available for feedback generation")
        
        # Generate feedback using AI
        feedback = await generate_feedback(answers, interview.get("mode", "text-to-text"))
        
        # Store generated feedback
        await db.interviews.update_one(
            {"session_id": session_id},
            {"$set": {"feedback": feedback}}
        )
        interview["feedback"] = feedback
    
    return interview["feedback"]


@router.get("/{session_id}/summary")
async def get_feedback_summary(session_id: str):
    """Return a concise summary of interview performance"""
    db = get_database()
    
    interview = await db.interviews.find_one({"session_id": session_id})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    total_questions = len(interview.get("answers", [])) or 30
    answered_questions = len([a for a in interview.get("answers", []) if a.get("answer", "").strip()])
    skipped_questions = total_questions - answered_questions
    completion_rate = (answered_questions / total_questions) * 100 if total_questions > 0 else 0
    
    duration = "In progress"
    if interview.get("ended_at") and interview.get("started_at"):
        duration = str(interview["ended_at"] - interview["started_at"])
    
    return {
        "session_id": session_id,
        "total_questions": total_questions,
        "questions_answered": answered_questions,
        "questions_skipped": skipped_questions,
        "completion_rate": f"{completion_rate:.1f}%",
        "status": interview.get("status"),
        "mode": interview.get("mode"),
        "duration": duration
    }
