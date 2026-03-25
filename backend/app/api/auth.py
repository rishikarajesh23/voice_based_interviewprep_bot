from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_database
from app.core.firebase_admin import verify_firebase_token
from app.models.user import User, UserUpdate
from typing import Optional

router = APIRouter()

async def get_current_user(token: str) -> Optional[dict]:
    """Verify Firebase token and return user data"""
    user_data = await verify_firebase_token(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return user_data

@router.post("/register")
async def register_user(user: User):
    """Register a new user"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"uid": user.uid})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Insert new user with empty interview history
    user_dict = user.dict()
    if "interview_history" not in user_dict:
        user_dict["interview_history"] = []
    
    await db.users.insert_one(user_dict)
    return {"message": "User registered successfully"}

@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile with interview count"""
    db = get_database()
    user = await db.users.find_one({"uid": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get the actual count of completed interviews
    interview_count = await db.interviews.count_documents({
        "user_id": user_id,
        "status": "completed"
    })
    
    user["_id"] = str(user["_id"])
    user["total_interviews"] = interview_count  # Add the actual count
    
    # Also update the interview_history if it's not accurate
    if len(user.get("interview_history", [])) != interview_count:
        # Get all completed interview session IDs
        completed_interviews = await db.interviews.find(
            {"user_id": user_id, "status": "completed"},
            {"session_id": 1}
        ).to_list(None)
        
        interview_ids = [interview["session_id"] for interview in completed_interviews]
        
        # Update user's interview history
        await db.users.update_one(
            {"uid": user_id},
            {"$set": {"interview_history": interview_ids}}
        )
        
        user["interview_history"] = interview_ids
    
    return user

@router.put("/profile/{user_id}")
async def update_user_profile(user_id: str, update: UserUpdate):
    """Update user profile"""
    db = get_database()
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    
    result = await db.users.update_one(
        {"uid": user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Profile updated successfully"}

@router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    """Get detailed statistics for a user"""
    db = get_database()
    
    # Get total interviews
    total_interviews = await db.interviews.count_documents({
        "user_id": user_id,
        "status": "completed"
    })
    
    # Get interviews by mode
    voice_to_voice = await db.interviews.count_documents({
        "user_id": user_id,
        "status": "completed",
        "mode": "voice-to-voice"
    })
    
    voice_to_text = await db.interviews.count_documents({
        "user_id": user_id,
        "status": "completed",
        "mode": "voice-to-text"
    })
    
    text_to_text = await db.interviews.count_documents({
        "user_id": user_id,
        "status": "completed",
        "mode": "text-to-text"
    })
    
    # Get average scores if feedback exists
    interviews_with_feedback = await db.interviews.find({
        "user_id": user_id,
        "status": "completed",
        "feedback": {"$exists": True}
    }).to_list(None)
    
    avg_score = 0
    if interviews_with_feedback:
        total_score = sum(interview.get("feedback", {}).get("overall_score", 0) 
                         for interview in interviews_with_feedback)
        avg_score = total_score / len(interviews_with_feedback) if interviews_with_feedback else 0
    
    return {
        "total_interviews": total_interviews,
        "by_mode": {
            "voice_to_voice": voice_to_voice,
            "voice_to_text": voice_to_text,
            "text_to_text": text_to_text
        },
        "average_score": round(avg_score, 2)
    }