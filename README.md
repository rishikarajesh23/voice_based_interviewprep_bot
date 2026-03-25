# PREPTALK: Voice-Based Interview Preparation Bot

## Overview

**PREPTALK** is an AI-powered voice-based interview preparation system designed specifically for college students preparing for campus placements. The platform simulates a real interview environment using voice and text interactions, helping users practice and improve their communication, technical knowledge, and confidence.

---

## Key Features

### 1. Multi-Mode Interview System

* Voice-to-Voice
* Voice-to-Text
* Text-to-Text

### 2. Structured Interview Flow

* 3 Rounds:

  * HR
  * Technical
  * Management
* Each round contains **10 questions**
* First question is always: *“Tell me about yourself”*

### 3. AI-Driven Question Generation

* Questions dynamically generated using AI
* Follow-up questions based on **keyword extraction from user responses**
* Fallback questions from database if keywords are not detected

### 4. Real-Time Interaction

* 10-second response window per question
* Automatically moves to next question if no response
* AI does not interrupt while the user is answering

### 5. Voice Simulation

* Text-to-Speech (TTS) for interviewer voice
* Speech-to-Text (STT) for capturing user responses
* Animated avatar to simulate a real interviewer

### 6. Feedback System

* AI-generated feedback based on:

  * Clarity
  * Confidence
  * Fluency
  * Relevance
  * Domain Knowledge
* Final report includes:

  * Strengths
  * Weaknesses
  * Suggestions for improvement

### 7. User Management

* User Authentication (Login/Signup)
* Session tracking for interviews
* Interview history stored per user

---

## Tech Stack

### Frontend

* React + Vite
* TypeScript

### Backend

* Python (FastAPI)

### AI & NLP

* Google Gemini Pro 2.5 Flash (Question generation & feedback)
* spaCy (Keyword extraction)

### Speech Processing

* gTTS (Text-to-Speech)
* SpeechRecognition (Speech-to-Text)

### Database

* MongoDB (Questions, user data, responses, feedback)

### Authentication

* Firebase Authentication

---

## Workflow

1. User signs up / logs in
2. Navigates to home page
3. Selects interview mode
4. Interview begins:

   * Starts with “Tell me about yourself”
   * Proceeds through HR → Technical → Management
5. AI generates questions dynamically
6. Responses are recorded and analyzed
7. Feedback is generated after completion
8. User can view past interview history

---

## Core Modules

* **Interview Flow Controller**
* **AI Question Generator**
* **Keyword Extraction Engine**
* **Speech Processing Module**
* **Feedback Evaluation System**
* **User & Session Manager**

---

## Project Setup

### Clone the Repository

```bash
git clone https://github.com/your-username/voice_based_interviewprep_bot.git
cd voice_based_interviewprep_bot
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file and add:

```
GEMINI_API_KEY=your_api_key
MONGODB_URI=your_mongo_uri
FIREBASE_CONFIG=your_firebase_config
```
---

## Acknowledgment

This project is developed as part of our academic mini project to enhance interview readiness using AI-driven technologies.

---
