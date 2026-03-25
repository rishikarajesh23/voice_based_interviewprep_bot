import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from dotenv import load_dotenv
import os

load_dotenv()

async def test_connection():
    # Get connection string from .env
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME", "preptalk")
    
    print(f"Connecting to MongoDB Atlas...")
    print(f"Database: {database_name}")
    
    try:
        # Connect with SSL certificate
        client = AsyncIOMotorClient(mongodb_url, tlsCAFile=certifi.where())
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        
        # List databases
        db_list = await client.list_database_names()
        print(f"Available databases: {db_list}")
        
        # Select database
        db = client[database_name]
        
        # List collections
        collections = await db.list_collection_names()
        print(f"Collections in {database_name}: {collections}")
        
        # Count documents
        if "questions" in collections:
            count = await db.questions.count_documents({})
            print(f"Questions count: {count}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())