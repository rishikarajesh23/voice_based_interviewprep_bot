from pydantic import BaseModel
from typing import Optional

class Question(BaseModel):
    category: str
    question: str
    order: int
    keywords: Optional[list] = []