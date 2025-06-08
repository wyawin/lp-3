# Credit AI Backend

Node.js backend for AI-powered credit analysis using Ollama.

## Features

- Document upload handling (PDF, Excel, Word, CSV)
- PDF to image conversion using pdf2pic
- Encrypted PDF handling
- Integration with Ollama qwen2.5vl:7b model
- Real-time analysis progress via Server-Sent Events
- Comprehensive credit analysis and recommendations

## Requirements

- Node.js 18+
- Ollama installed and running
- qwen2.5vl:7b model (will be auto-downloaded)

## Installation

```bash
cd backend
npm install
```

## Usage

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### POST /api/upload
Upload multiple documents for analysis.

### POST /api/analyze
Analyze uploaded documents and get credit recommendations.

### GET /health
Health check endpoint.

## Environment Variables

- `PORT` - Server port (default: 3001)
- `OLLAMA_URL` - Ollama API URL (default: http://localhost:11434)

## Document Types Supported

- Legal documents (PDF, DOC, DOCX)
- Profit & Loss statements (PDF, Excel, CSV)
- Balance sheets (PDF, Excel, CSV)
- Bank statements (PDF, CSV, Excel)
- Other financial documents

## Ollama Setup

1. Install Ollama: https://ollama.ai
2. The qwen2.5vl:7b model will be automatically downloaded on first use
3. Ensure Ollama is running on localhost:11434