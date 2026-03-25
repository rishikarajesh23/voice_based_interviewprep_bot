from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    uid: str
    email: EmailStr
    name: str
    created_at: datetime = datetime.now()
    interview_history: List[str] = []

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None