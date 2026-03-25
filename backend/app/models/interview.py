from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

class InterviewMode(str, Enum):
    VOICE_TO_VOICE = "voice-to-voice"
    VOICE_TO_TEXT = "voice-to-text"
    TEXT_TO_TEXT = "text-to-text"

class InterviewRound(str, Enum):
    HR = "HR"
    TECHNICAL = "Technical"
    MANAGEMENT = "Management"

class Answer(BaseModel):
    question: str
    answer: str
    timestamp: datetime
    round: InterviewRound
    keywords: List[str] = []

class Interview(BaseModel):
    user_id: str
    mode: InterviewMode
    started_at: datetime = datetime.now()
    ended_at: Optional[datetime] = None
    current_round: InterviewRound = InterviewRound.HR
    current_question_index: int = 0
    answers: List[Answer] = []
    feedback: Optional[Dict] = None
    status: str = "in_progress"

class InterviewSession(BaseModel):
    session_id: str
    user_id: str
    interview: Interview

    