
import google.generativeai as genai
from app.core.config import settings
from typing import List, Dict

genai.configure(api_key=settings.google_api_key)
model = genai.GenerativeModel('gemini-2.5-flash')


async def generate_follow_up_question(keywords: List[str], previous_answer: str, round: str) -> str:
    """Generate a follow-up question based on keywords and context"""
    try:
        prompt = f"""
        Generate a follow-up interview question for a {round} round based on these keywords: {', '.join(keywords)}
        Previous answer: {previous_answer}
       
        Requirements:
        - Question should be relevant to {round} round
        - It should naturally follow from the candidate's previous answer
        - Keep it professional and appropriate for campus placement interviews
        - Question should be clear and concise
       
        Return only the question, nothing else.
        """
       
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating follow-up question: {e}")
        return None




async def generate_feedback(answers: List[Dict], mode: str) -> Dict:
    """Generate comprehensive feedback for the interview"""
   
    # Check if all answers are empty or skipped
    non_empty_answers = [a for a in answers if a.get('answer', '').strip()]
    total_questions = len(answers)
    answered_questions = len(non_empty_answers)
   
    # If no questions were answered, return zero scores
    if answered_questions == 0:
        return {
            "overall_score": 0,
            "clarity": {
                "score": 0,
                "feedback": "No responses provided to evaluate clarity."
            },
            "confidence": {
                "score": 0,
                "feedback": "Cannot assess confidence without any responses."
            },
            "relevance": {
                "score": 0,
                "feedback": "No answers given to evaluate relevance."
            },
            "technical_knowledge": {
                "score": 0,
                "feedback": "Technical knowledge cannot be assessed without responses."
            },
            "communication_skills": {
                "score": 0,
                "feedback": "Communication skills require actual responses to evaluate."
            },
            "strengths": [],
            "areas_for_improvement": [
                "Complete the interview by answering questions",
                "Prepare responses for common interview questions",
                "Practice time management to answer within given time",
                "Build confidence to attempt questions"
            ],
            "overall_feedback": f"You did not answer any of the {total_questions} questions in this interview. To improve, you need to attempt answering questions even if you're unsure. Practice is key to building confidence. Consider preparing basic responses for common interview questions and working on time management skills.",
            "completion_rate": f"{answered_questions}/{total_questions}",
            "questions_attempted": answered_questions,
            "questions_skipped": total_questions - answered_questions
        }
   
    # If only a few questions were answered, adjust scoring
    completion_percentage = (answered_questions / total_questions) * 100
   
    # Prepare the answers text for AI evaluation
    answers_text = "\n".join([
        f"Q: {a['question']}\nA: {a['answer'] if a['answer'].strip() else '[No answer provided]'}"
        for a in answers
    ])
   
    try:
        # Generate AI feedback only for answered questions
        if completion_percentage < 30:
            # Very low completion rate - give low scores
            prompt = f"""
            The candidate only answered {answered_questions} out of {total_questions} questions ({completion_percentage:.0f}% completion rate).
           
            Answered questions:
            {answers_text}
           
            Given the very low completion rate, provide feedback with appropriately low scores (0-2 range).
           
            Format the response as JSON with the following structure:
            {{
                "overall_score": <number between 0-2>,
                "clarity": {{"score": <number 0-2>, "feedback": "<text>"}},
                "confidence": {{"score": <number 0-2>, "feedback": "<text>"}},
                "relevance": {{"score": <number 0-2>, "feedback": "<text>"}},
                "technical_knowledge": {{"score": <number 0-2>, "feedback": "<text>"}},
                "communication_skills": {{"score": <number 0-2>, "feedback": "<text>"}},
                "strengths": ["<if any>"],
                "areas_for_improvement": ["<area1>", "<area2>", "<area3>"],
                "overall_feedback": "<detailed feedback mentioning the low completion rate>"
            }}
            """
        elif completion_percentage < 60:
            # Moderate completion rate
            prompt = f"""
            The candidate answered {answered_questions} out of {total_questions} questions ({completion_percentage:.0f}% completion rate).
           
            Interview transcript:
            {answers_text}
           
            Provide feedback considering the incomplete interview. Scores should reflect the partial completion (max 3/5).
           
            Format the response as JSON with the following structure:
            {{
                "overall_score": <number between 1-3>,
                "clarity": {{"score": <number 1-3>, "feedback": "<text>"}},
                "confidence": {{"score": <number 1-3>, "feedback": "<text>"}},
                "relevance": {{"score": <number 1-3>, "feedback": "<text>"}},
                "technical_knowledge": {{"score": <number 1-3>, "feedback": "<text>"}},
                "communication_skills": {{"score": <number 1-3>, "feedback": "<text>"}},
                "strengths": ["<strength1>"],
                "areas_for_improvement": ["<area1>", "<area2>", "<area3>"],
                "overall_feedback": "<feedback mentioning incomplete interview>"
            }}
            """
        else:
            # Good completion rate
            prompt = f"""
            Analyze this interview transcript where the candidate answered {answered_questions} out of {total_questions} questions:
           
            {answers_text}
           
            Provide detailed feedback in the following categories (rate 1-5):
            1. Clarity: How clear and articulate were the responses?
            2. Confidence: How confident did the candidate sound?
            3. Relevance: How relevant were the answers to the questions?
            4. Technical Knowledge: How strong was the technical understanding?
            5. Communication Skills: How well did the candidate communicate?
           
            Format the response as JSON with the following structure:
            {{
                "overall_score": <number 1-5>,
                "clarity": {{"score": <number 1-5>, "feedback": "<text>"}},
                "confidence": {{"score": <number 1-5>, "feedback": "<text>"}},
                "relevance": {{"score": <number 1-5>, "feedback": "<text>"}},
                "technical_knowledge": {{"score": <number 1-5>, "feedback": "<text>"}},
                "communication_skills": {{"score": <number 1-5>, "feedback": "<text>"}},
                "strengths": ["<strength1>", "<strength2>"],
                "areas_for_improvement": ["<area1>", "<area2>"],
                "overall_feedback": "<detailed overall feedback>"
            }}
            """
       
        response = model.generate_content(prompt)
       
        # Parse the JSON response
        import json
        feedback_text = response.text.strip()
        if feedback_text.startswith("```json"):
            feedback_text = feedback_text[7:]
        if feedback_text.endswith("```"):
            feedback_text = feedback_text[:-3]
       
        feedback = json.loads(feedback_text)
       
        # Add completion statistics
        feedback["completion_rate"] = f"{answered_questions}/{total_questions}"
        feedback["questions_attempted"] = answered_questions
        feedback["questions_skipped"] = total_questions - answered_questions
       
        # Ensure scores don't exceed limits based on completion
        if completion_percentage < 30:
            # Cap all scores at 2
            feedback["overall_score"] = min(feedback["overall_score"], 2)
            for category in ["clarity", "confidence", "relevance", "technical_knowledge", "communication_skills"]:
                if category in feedback and isinstance(feedback[category], dict):
                    feedback[category]["score"] = min(feedback[category]["score"], 2)
        elif completion_percentage < 60:
            # Cap all scores at 3
            feedback["overall_score"] = min(feedback["overall_score"], 3)
            for category in ["clarity", "confidence", "relevance", "technical_knowledge", "communication_skills"]:
                if category in feedback and isinstance(feedback[category], dict):
                    feedback[category]["score"] = min(feedback[category]["score"], 3)
       
        return feedback
       
    except Exception as e:
        print(f"Error generating feedback: {e}")
       
        # Fallback feedback based on completion rate
        if completion_percentage == 0:
            base_score = 0
        elif completion_percentage < 30:
            base_score = 1
        elif completion_percentage < 60:
            base_score = 2
        else:
            base_score = 3
       
        return {
            "overall_score": base_score,
            "clarity": {
                "score": base_score,
                "feedback": f"Based on {answered_questions} answered questions out of {total_questions}."
            },
            "confidence": {
                "score": base_score,
                "feedback": f"Confidence score reflects {completion_percentage:.0f}% completion rate."
            },
            "relevance": {
                "score": base_score,
                "feedback": f"Relevance assessed from {answered_questions} responses provided."
            },
            "technical_knowledge": {
                "score": base_score,
                "feedback": f"Technical knowledge evaluated from available responses."
            },
            "communication_skills": {
                "score": base_score,
                "feedback": f"Communication skills based on {completion_percentage:.0f}% interview completion."
            },
            "strengths": ["Attempted the interview"] if answered_questions > 0 else [],
            "areas_for_improvement": [
                "Complete all interview questions",
                "Manage time better",
                "Prepare responses in advance"
            ],
            "overall_feedback": f"You completed {completion_percentage:.0f}% of the interview ({answered_questions}/{total_questions} questions). Focus on attempting all questions to get a comprehensive evaluation.",
            "completion_rate": f"{answered_questions}/{total_questions}",
            "questions_attempted": answered_questions,
            "questions_skipped": total_questions - answered_questions
        }
