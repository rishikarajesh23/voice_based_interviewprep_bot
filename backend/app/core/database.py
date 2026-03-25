from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from typing import Optional
import certifi

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

db = Database()

async def connect_to_mongo():
    """Connect to MongoDB Atlas"""
    try:
        # For MongoDB Atlas, we need to specify TLS certificate
        db.client = AsyncIOMotorClient(
            settings.mongodb_url,
            tlsCAFile=certifi.where()  # This handles SSL certificates for Atlas
        )
        
        # Select database
        db.database = db.client[settings.database_name]
        
        # Test the connection
        await db.client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas!")
        
        # Create collections if they don't exist
        collections = await db.database.list_collection_names()
        
        if "users" not in collections:
            await db.database.create_collection("users")
            print("Created 'users' collection")
            
        if "interviews" not in collections:
            await db.database.create_collection("interviews")
            print("Created 'interviews' collection")
            
        if "questions" not in collections:
            await db.database.create_collection("questions")
            print("Created 'questions' collection")
            await seed_questions()
        
        print(f"Connected to MongoDB Atlas - Database: {settings.database_name}")
        
    except Exception as e:
        print(f"Error connecting to MongoDB Atlas: {e}")
        raise e

async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB Atlas")

async def seed_questions():
    """Seed the database with fallback questions"""
    # Check if questions already exist
    existing_count = await db.database.questions.count_documents({})
    if existing_count > 0:
        print(f"Questions already seeded ({existing_count} questions found)")
        return
    
    questions = [
        # HR Questions
        {"category": "HR", "question": "Tell me about yourself", "order": 1},
        {"category": "HR", "question": "Why do you want to work for our company?", "order": 2},
        {"category": "HR", "question": "What are your strengths and weaknesses?", "order": 3},
        {"category": "HR", "question": "Where do you see yourself in 5 years?", "order": 4},
        {"category": "HR", "question": "Why should we hire you?", "order": 5},
        {"category": "HR", "question": "Tell me about a challenge you faced and how you overcame it", "order": 6},
        {"category": "HR", "question": "What motivates you?", "order": 7},
        {"category": "HR", "question": "How do you handle stress and pressure?", "order": 8},
        {"category": "HR", "question": "Describe your ideal work environment", "order": 9},
        {"category": "HR", "question": "What are your salary expectations?", "order": 10},
        
        # Technical Questions
        {"category": "Technical", "question": "Explain object-oriented programming concepts", "order": 1},
        {"category": "Technical", "question": "What is the difference between SQL and NoSQL databases?", "order": 2},
        {"category": "Technical", "question": "Explain RESTful APIs", "order": 3},
        {"category": "Technical", "question": "What is your experience with version control systems?", "order": 4},
        {"category": "Technical", "question": "Explain the concept of microservices", "order": 5},
        {"category": "Technical", "question": "What is cloud computing and its benefits?", "order": 6},
        {"category": "Technical", "question": "Describe your experience with testing methodologies", "order": 7},
        {"category": "Technical", "question": "Explain data structures you commonly use", "order": 8},
        {"category": "Technical", "question": "What is your approach to debugging?", "order": 9},
        {"category": "Technical", "question": "Describe a technical project you're proud of", "order": 10},
        
        # Management Questions
        {"category": "Management", "question": "How do you prioritize tasks?", "order": 1},
        {"category": "Management", "question": "Describe your leadership style", "order": 2},
        {"category": "Management", "question": "How do you handle conflicts in a team?", "order": 3},
        {"category": "Management", "question": "Tell me about a time you led a project", "order": 4},
        {"category": "Management", "question": "How do you ensure project deadlines are met?", "order": 5},
        {"category": "Management", "question": "How do you motivate team members?", "order": 6},
        {"category": "Management", "question": "Describe your experience with agile methodologies", "order": 7},
        {"category": "Management", "question": "How do you handle feedback?", "order": 8},
        {"category": "Management", "question": "What's your approach to risk management?", "order": 9},
        {"category": "Management", "question": "How do you measure project success?", "order": 10},
    ]
    
    result = await db.database.questions.insert_many(questions)
    print(f"Seeded {len(result.inserted_ids)} fallback questions")

def get_database():
    """Get database instance"""
    # FIX: Use 'is None' instead of boolean check
    if db.database is None:
        raise Exception("Database not connected. Call connect_to_mongo() first.")
    return db.database