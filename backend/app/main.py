from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, interview, feedback
from app.core.database import connect_to_mongo, close_mongo_connection
import uvicorn

app = FastAPI(title="PrepTalk API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "PrepTalk API is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)