from app.core.database import get_database
from app.services.ai_service import generate_follow_up_question
from app.services.keyword_extractor import extract_keywords
from typing import Optional
import random

# Predefined technical topics for rotation
TECH_TOPICS = ["OOP", "DBMS", "DSA", "Operating Systems", "Networking", "Web Development"]

# Track topics per session
session_topics = {}

# Common phrases that trigger DB fallback
DONT_KNOW_PHRASES = ["i don’t know", "i don't know", "not sure", "no idea", "don’t remember", "don't remember", "idk"]

async def get_next_question(
    round: str,
    question_index: int,
    previous_answer: Optional[str] = None,
    is_first_question: bool = False,
    session_id: Optional[str] = None
) -> str:
    """
    Get the next question for the interview.
    Handles: first question, AI follow-ups, DB fallbacks, and topic rotation.
    """

    db = get_database()

    # --- HR ROUND ---
    if round.lower() == "hr":
        if is_first_question:
            return "Tell me about yourself."

        # Fallback to DB if user says "I don't know"
        if previous_answer and any(phrase in previous_answer.lower() for phrase in DONT_KNOW_PHRASES):
            question = await db.questions.find_one({"category": "HR", "order": question_index})
            if question:
                return question["question"]

        # Try AI-generated follow-up
        if previous_answer:
            keywords = await extract_keywords(previous_answer)
            if keywords:
                follow_up = await generate_follow_up_question(keywords, previous_answer, "HR")
                if follow_up:
                    return follow_up

        # DB fallback
        question = await db.questions.find_one({"category": "HR", "order": question_index})
        return question["question"] if question else "What motivates you to perform well at work?"

    # --- TECHNICAL ROUND ---
    elif round.lower() == "technical":
        if session_id not in session_topics:
            session_topics[session_id] = random.sample(TECH_TOPICS, len(TECH_TOPICS))

        topics = session_topics[session_id]
        current_topic = topics[(question_index - 1) // 3 % len(topics)]  # rotate every 3 questions

        # Handle "I don't know"
        if previous_answer and any(phrase in previous_answer.lower() for phrase in DONT_KNOW_PHRASES):
            question = await db.questions.find_one({
                "category": "Technical",
                "topic": current_topic,
                "order": question_index
            })
            if question:
                return question["question"]

        # Try AI follow-up
        if previous_answer:
            keywords = await extract_keywords(previous_answer)
            if keywords:
                follow_up = await generate_follow_up_question(keywords, previous_answer, f"Technical ({current_topic})")
                if follow_up:
                    return follow_up

        # DB fallback
        question = await db.questions.find_one({
            "category": "Technical",
            "topic": current_topic,
            "order": question_index
        })
        if question:
            return question["question"]

        # Generic fallback
        return f"Can you explain a concept related to {current_topic} that you’ve worked with?"

    # --- MANAGEMENT ROUND ---
    elif round.lower() == "management":
        # Handle "I don't know"
        if previous_answer and any(phrase in previous_answer.lower() for phrase in DONT_KNOW_PHRASES):
            question = await db.questions.find_one({"category": "Management", "order": question_index})
            if question:
                return question["question"]

        # AI follow-up
        if previous_answer:
            keywords = await extract_keywords(previous_answer)
            if keywords:
                follow_up = await generate_follow_up_question(keywords, previous_answer, "Management")
                if follow_up:
                    return follow_up

        # DB fallback
        question = await db.questions.find_one({"category": "Management", "order": question_index})
        return question["question"] if question else "How do you handle conflicts within your team?"

    # --- DEFAULT ---
    return "Tell me more about your experience in this area."
