# Multimodal AI Assistant

A local, privacy-first, free-to-run multimodal AI assistant powered by FastAPI, Next.js, LangChain/LangGraph, Ollama, ChromaDB, and local Whisper.

This application runs 100% locally with **zero paid external API dependencies**.

---

## 1. Project Overview

The **Multimodal AI Assistant** is designed as a complete, self-contained AI system capable of:
- General-purpose conversational reasoning.
- Vision processing (understanding uploaded images and answering visual queries).
- Local speech recognition (voice transcription with Whisper).
- Document retrieval (RAG on uploaded PDFs using embeddings and ChromaDB).
- Autonomous workflow orchestration using LangGraph with tool usage (calculator, router, RAG, vision).

---

## 2. Key Features

- 💬 **Local Text Chat**: Real-time conversational AI powered by Ollama (`qwen3.5:9b`).
- 🖼️ **Vision Understanding**: Image upload and analysis (`qwen3-vl:8b`) supporting PNG, JPG, JPEG, and WEBP.
- 🎙️ **Speech to Text**: High-accuracy local audio transcription using Whisper (WAV, MP3, M4A).
- 📄 **Document RAG**: PDF text extraction, chunking, local vector embeddings (`nomic-embed-text`), and similarity search via ChromaDB.
- 🤖 **LangGraph Workflow Agent**: Intelligent modality routing and multi-step reasoning with tools.
- ⚡ **Modern Interface**: Next.js App Router, TypeScript, and Tailwind CSS.
- 🔒 **Privacy & Cost Guarantee**: Zero external cloud API calls, zero usage fees, and no data leaving your machine.

---

## 3. Architecture

```
User
  ↓
Next.js Frontend (TypeScript + Tailwind CSS)
  ↓ HTTP / REST
FastAPI Backend (Python 3.11)
  ↓
LangChain / LangGraph Agent & Modality Router
  ├── Text Pipeline       ──> Ollama (qwen3.5:9b)
  ├── Vision Pipeline     ──> Ollama (qwen3-vl:8b)
  ├── Audio Transcription ──> Local Whisper
  └── RAG Pipeline        ──> ChromaDB + nomic-embed-text
  ↓
Final Structured Response
  ↓
Frontend UI Display
```

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | FastAPI, Uvicorn, Pydantic v2 |
| **Agent / Workflows**| LangChain, LangGraph |
| **Local LLMs** | Ollama (`qwen3.5:9b`, `qwen3-vl:8b`) |
| **Embeddings** | Ollama (`nomic-embed-text`) |
| **Vector Store** | ChromaDB (local persistence) |
| **Audio Transcription** | OpenAI-Whisper (running locally) |

---

## 5. Prerequisites & Ollama Setup

### 5.1 Install Ollama
Download and install Ollama from [https://ollama.com/download](https://ollama.com/download).

Verify Ollama is active:
```bash
ollama --version
```

### 5.2 Pull Required Models
Run the following commands in your terminal:
```bash
# Primary text model
ollama pull qwen3.5:9b

# Vision-language model
ollama pull qwen3-vl:8b

# Embedding model for RAG
ollama pull nomic-embed-text
```

---

## 6. Installation & Setup

### 6.1 Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python 3.11 virtual environment:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # Linux/macOS:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment:
   ```bash
   cp .env.example .env
   ```
5. Start the backend:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   API Docs available at: `http://localhost:8000/docs`  
   Health status at: `http://localhost:8000/health`

### 6.2 Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the assistant at `http://localhost:3000`.

---

## 7. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check and version info |
| `POST`| `/api/chat` | Standard text chat completions |
| `POST`| `/api/multimodal` | Vision image analysis with user prompt |
| `POST`| `/api/upload` | File upload handler (Images, PDFs, Audio) |
| `POST`| `/api/rag` | Query knowledge base indexed from PDFs |
| `POST`| `/api/transcribe` | Audio file transcription via local Whisper |

---

## 8. Multimodal & RAG Flow

### Image Flow
1. User uploads an image (`.png`, `.jpg`, `.jpeg`, `.webp`).
2. Backend image processor validates dimensions, format, and encodes to base64.
3. LangChain vision chain invokes `qwen3-vl:8b` via Ollama.
4. Response streamed/returned to frontend.

### PDF & RAG Flow
1. User uploads document to `/api/upload`.
2. PDF processor extracts text pages and chunks into recursive tokens with overlap.
3. Embeddings generated using `nomic-embed-text`.
4. Vector vectors stored in local persistent ChromaDB collection.
5. User queries retrieved with top-k similarity and injected into prompt context for `qwen3.5:9b`.

---

## 9. Troubleshooting

- **Ollama Connection Refused**:
  Ensure Ollama is running (`ollama serve`). If running on a remote machine, adjust `OLLAMA_BASE_URL` in `backend/.env`.
- **Port 8000 / 3000 In Use**:
  Change `BACKEND_PORT` in `.env` or run Next.js with `npm run dev -- -p 3001`.
- **Model Out of Memory**:
  For systems with limited VRAM, lower model quantizations or ensure GPU acceleration is enabled in Ollama.

---

## 10. Development Roadmap

- [x] **Phase 1**: Foundation & Scaffolding (FastAPI, Next.js, Health check, Configuration)
- [ ] **Phase 2**: Text AI (Ollama + LangChain + Qwen3.5)
- [ ] **Phase 3**: Image AI (Qwen3-VL multimodal vision)
- [ ] **Phase 4**: Audio AI (Local Whisper speech-to-text)
- [ ] **Phase 5**: PDF & Document RAG (ChromaDB + nomic-embed-text)
- [ ] **Phase 6**: LangGraph Workflow Agent & Tools
- [ ] **Phase 7**: UI Polish & Dark Mode / History
- [ ] **Phase 8**: Full End-to-End Testing & Verification
