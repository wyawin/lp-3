import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { DocumentProcessor } from './services/documentProcessor.js';
import { OllamaService } from './services/ollamaService.js';
import { CreditAnalyzer } from './services/creditAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create necessary directories
const uploadsDir = path.join(__dirname, 'uploads');
const tempDir = path.join(__dirname, 'temp');
await fs.ensureDir(uploadsDir);
await fs.ensureDir(tempDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Initialize services
const documentProcessor = new DocumentProcessor(tempDir);
const ollamaService = new OllamaService();
const creditAnalyzer = new CreditAnalyzer(ollamaService);

// Test Ollama connection on startup
async function initializeServices() {
  try {
    console.log('Initializing services...');
    await ollamaService.checkConnection();
    console.log('✅ Ollama connection successful');
    
    const modelAvailable = await ollamaService.isModelAvailable();
    if (!modelAvailable) {
      console.log('⚠️  Model qwen2.5vl:7b not found. It will be downloaded on first analysis.');
    } else {
      console.log('✅ Model qwen2.5vl:7b is available');
    }
  } catch (error) {
    console.error('❌ Service initialization failed:', error.message);
    console.log('Please ensure Ollama is running and accessible at the configured URL');
  }
}

// Routes
app.get('/health', async (req, res) => {
  try {
    // Check Ollama connection
    await ollamaService.checkConnection();
    const modelAvailable = await ollamaService.isModelAvailable();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      ollama: {
        connected: true,
        url: ollamaService.baseUrl,
        modelAvailable: modelAvailable
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      ollama: {
        connected: false,
        url: ollamaService.baseUrl,
        error: error.message
      }
    });
  }
});

app.post('/api/upload', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      type: req.body.type || 'other'
    }));

    console.log(`Successfully uploaded ${uploadedFiles.length} files`);

    res.json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} files`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { files } = req.body;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for analysis' });
    }

    console.log(`Starting analysis of ${files.length} files`);

    // Set up SSE for real-time progress updates
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const sendProgress = (step, progress, message) => {
      const data = JSON.stringify({ step, progress, message });
      res.write(`data: ${data}\n\n`);
      console.log(`Progress: ${step} - ${progress}% - ${message}`);
    };

    try {
      // Check Ollama connection first
      sendProgress('initialization', 5, 'Checking AI service connection...');
      await ollamaService.checkConnection();

      sendProgress('processing', 10, 'Starting document processing...');

      // Process all documents
      const processedDocuments = [];
      let fileIndex = 0;

      for (const file of files) {
        fileIndex++;
        const progressBase = (fileIndex - 1) / files.length * 60; // 60% for processing
        
        sendProgress('processing', progressBase + 5, `Processing ${file.originalName}...`);

        const filePath = path.join(uploadsDir, file.filename);
        
        if (!await fs.pathExists(filePath)) {
          console.error(`File not found: ${filePath}`);
          sendProgress('processing', progressBase + (60 / files.length), `File not found: ${file.originalName}`);
          continue;
        }

        try {
          const processed = await documentProcessor.processDocument(filePath, file);
          processedDocuments.push(processed);
          
          sendProgress('processing', progressBase + (60 / files.length), `Completed processing ${file.originalName}`);
        } catch (error) {
          console.error(`Error processing ${file.originalName}:`, error);
          sendProgress('processing', progressBase + (60 / files.length), `Error processing ${file.originalName}: ${error.message}`);
        }
      }

      if (processedDocuments.length === 0) {
        throw new Error('No documents could be processed successfully');
      }

      sendProgress('analysis', 70, 'Analyzing documents with AI...');

      // Analyze with Ollama
      const analysis = await creditAnalyzer.analyzeDocuments(processedDocuments, sendProgress);

      sendProgress('complete', 100, 'Analysis complete!');

      // Send final result
      res.write(`data: ${JSON.stringify({ 
        step: 'result', 
        progress: 100, 
        result: analysis 
      })}\n\n`);

      res.end();

      // Cleanup temporary files
      setTimeout(async () => {
        try {
          console.log('Starting cleanup...');
          for (const file of files) {
            const filePath = path.join(uploadsDir, file.filename);
            await fs.remove(filePath).catch(() => {});
          }
          
          for (const doc of processedDocuments) {
            if (doc.images) {
              for (const imagePath of doc.images) {
                await fs.remove(imagePath).catch(() => {});
              }
            }
            // Cleanup document-specific temp directory
            await documentProcessor.cleanup(doc.id);
          }
          console.log('Cleanup completed');
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }, 5000);

    } catch (error) {
      console.error('Analysis error:', error);
      res.write(`data: ${JSON.stringify({ 
        step: 'error', 
        progress: 0, 
        error: error.message 
      })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Failed to process analysis request' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`🤖 Analysis endpoint: http://localhost:${PORT}/api/analyze`);
  
  // Initialize services
  await initializeServices();
});