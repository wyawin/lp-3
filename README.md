# AI-Powered Credit Analysis Platform

A modern web application that uses AI to analyze financial documents and provide credit recommendations.

## 🚀 Features

- **Document Upload**: Support for PDF, Excel, Word, and CSV files
- **AI Analysis**: Powered by Ollama qwen2.5vl:7b model for intelligent document analysis
- **Real-time Progress**: Live updates during document processing
- **Credit Scoring**: Comprehensive credit analysis with detailed recommendations
- **Responsive Design**: Beautiful, production-ready interface

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **Ollama** for AI document analysis
- **Multer** for file uploads
- **pdf2pic** for PDF processing

## 📋 Prerequisites

- Node.js 18+
- Ollama installed and running
- qwen2.5vl:7b model (auto-downloaded on first use)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Copy backend environment file
cp backend/.env.example backend/.env
```

### 3. Start Ollama

Make sure Ollama is running:
```bash
ollama serve
```

### 4. Run the Application

**Option 1: Run both frontend and backend concurrently (Recommended)**
```bash
npm run dev:all
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev
```

## 📱 Usage

1. **Upload Documents**: Drag and drop or select financial documents
2. **AI Analysis**: The system automatically identifies document types and analyzes content
3. **View Results**: Get comprehensive credit recommendations with scores and insights

## 🔧 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:backend` - Start backend development server
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🌐 API Endpoints

- `GET /health` - Backend health check
- `POST /api/upload` - Upload documents
- `POST /api/analyze` - Analyze documents (Server-Sent Events)

## 📁 Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── hooks/             # Custom React hooks
├── backend/               # Backend source code
│   ├── services/          # Business logic services
│   ├── uploads/           # File upload directory
│   └── temp/              # Temporary files
└── public/                # Static assets
```

## 🔒 Security

- Files are processed securely and automatically cleaned up
- No permanent storage of sensitive documents
- Environment-based configuration for different deployments

## 🚀 Deployment

1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Deploy the backend to your Node.js hosting service
4. Update environment variables for production URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.