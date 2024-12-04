import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { parseZip } from './parser';
import { config } from './config';
import { chunkConfig } from './config/chunk';

const app = express();

// Add at the top level
let currentProcessing: { abort?: () => void } = {};
let currentResponse: any = null;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.match(/http:\/\/localhost:(5173|5174)/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  maxAge: 7200 // Cache CORS preflight for 2 hours
}));
app.use(fileUpload({
  limits: { fileSize: config.maxFileSize },
  abortOnLimit: true,
  limitHandler: (req, res) => {
    res.status(413).send({
      error: 'File too large',
      maxSize: `${config.maxFileSize / (1024 * 1024)}MB`
    });
  }
}));

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    message: 'Notion Parser API',
    endpoints: {
      '/': 'GET - API information',
      '/upload': 'POST - Upload and parse ZIP file'
    },
    version: '1.0.0'
  });
});

// Add helper function to sanitize content
const sanitizeContent = (content: string) => {
  return content
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/"/g, '\\"')    // Escape quotes
    .slice(0, 50000);        // Limit content size
};

// Add after the existing upload route handler setup (around line 60)
const sendLogMessage = (res: any, message: string) => {
  res.write(`data: ${JSON.stringify({ type: 'log', data: message })}\n\n`);
  console.log(message); // Mirror to console
};

const sendProgressUpdate = (res: any, progress: any) => {
  res.write(`data: ${JSON.stringify({ type: 'progress', data: progress })}\n\n`);
  console.log(`Processing: ${progress.current}/${progress.total} files (${progress.percentage.toFixed(1)}%)`);
  if (progress.currentDocument) {
    console.log(`Current document: ${progress.currentDocument.title}`);
  }
};

const sendLogToClient = (res: any, message: string) => {
  res.write(`data: ${JSON.stringify({ type: 'log', data: message })}\n\n`);
  console.log(message); // Keep console logging
};

// Modify the existing log function to use sendLogToClient
const log = (message: string) => {
  console.log(message);
  if (currentResponse && !currentResponse.writableEnded) {
    sendLogToClient(currentResponse, message);
  }
};

// Upload route handler
app.post('/upload', async (req, res) => {
  currentResponse = res;  // Set current response
  
  // Enable streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const abortController = new AbortController();
  
  // Add abort handler to currentProcessing
  currentProcessing.abort = () => {
    abortController.abort();
    console.log('Processing aborted by client');
    res.write(`data: ${JSON.stringify({ type: 'aborted' })}\n\n`);
    res.end();
  };

  // Handle client disconnection
  req.on('close', () => {
    if (currentProcessing.abort) {
      currentProcessing.abort();
    }
    console.log('Client disconnected');
    res.end();
  });

  const sendLog = (message: string) => {
    if (!res.writableEnded) {
      console.log(message);
      res.write(`data: ${JSON.stringify({ type: 'log', message })}\n\n`);
    }
  };

  const sendProgress = (data: any) => {
    if (!res.writableEnded) {
      const progressData = {
        type: 'progress',
        data: {
          progress: {
            current: data.current,
            total: data.total,
            percentage: Math.round((data.current / data.total) * 100)
          }
        }
      };
      res.write(`data: ${JSON.stringify(progressData)}\n\n`);
    }
  };

  const sendError = (message: string) => {
    console.error(message);
    res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
  };

  const sendTokenUpdate = (data: any) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'tokenUpdate', usage: data })}\n\n`);
    }
  };

  sendLog('Starting upload request processing...');

  if (!req.files || !('zipFile' in req.files)) {
    sendLog('No file found in request');
    res.end();
    return;
  }

  try {
    const zipFile = req.files.zipFile as fileUpload.UploadedFile;
    sendLog(`Received file: ${zipFile.name} (${(zipFile.size / 1024).toFixed(2)} KB)`);

    const result = await parseZip(
      zipFile.data, 
      sendLog, 
      (progress) => sendProgress(progress),
      (usage) => sendTokenUpdate(usage),
      abortController.signal
    );

    // Calculate total chunks before sending any data
    const chunkSize = chunkConfig.getChunkSize(result.documents.length);
    const totalChunks = Math.ceil(result.documents.length / chunkSize);
    let sentChunks = 0;

    // Send metadata first
    res.write(`data: ${JSON.stringify({
      type: 'metadata',
      count: result.documents.length,
      totalChunks
    })}\n\n`);

    // Send chunks with progress updates
    for (let i = 0; i < result.documents.length; i += chunkSize) {
      const chunk = result.documents.slice(i, i + chunkSize);
      const chunkIndex = Math.floor(i / chunkSize);
      
      // Send progress update
      const progressData = {
        type: 'progress',
        progress: {
          current: i + chunk.length,
          total: result.documents.length
        }
      };
      res.write(`data: ${JSON.stringify(progressData)}\n\n`);
      
      // Send chunk data
      const chunkData = {
        type: 'documents_chunk',
        chunk,
        chunkIndex,
        totalChunks,
        documentsInChunk: chunk.length,
        total: result.documents.length
      };
      res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
      
      // Add small delay for large datasets
      if (result.documents.length > 100) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      sentChunks++;
      console.log(`Sent chunk ${sentChunks}/${totalChunks}`);
    }

    // Send completion confirmation
    console.log('Processing complete, sending final data:', {
      documentsCount: result.documents.length,
      tokenUsage: result.tokenUsage
    });
    res.write(`data: ${JSON.stringify({
      type: 'chunks_complete',
      sentChunks,
      totalChunks,
      total: result.documents.length
    })}\n\n`);

    // End the response properly
    res.end();
  } catch (error) {
    // Only send error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error && error.message.includes('Notion ID') ?
          'Please ensure you are uploading a valid Notion export ZIP file.' :
          undefined
      });
    } else {
      console.error('Error after headers sent:', error);
    }
  } finally {
    currentResponse = null;  // Clear current response
  }
});

// Add streaming endpoint
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const clientId = Date.now();
  console.log(`Client connected: ${clientId}`);
  
  req.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
  });
});

// Add cleanup function
const cleanup = () => {
  if (currentProcessing.abort) {
    currentProcessing.abort = undefined;
  }
};

// Update the server start section
const startServer = async (initialPort: number) => {
  const findAvailablePort = async (port: number): Promise<number> => {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port, '0.0.0.0', () => {
          server.close();
          resolve(port);
        });
        server.on('error', reject);
      });
      return port;
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying ${port + 1}...`);
        return findAvailablePort(port + 1);
      }
      throw err;
    }
  };

  try {
    const port = await findAvailablePort(initialPort);
    const server = app.listen(port, '0.0.0.0', () => {
      console.clear();
      console.log('\n=== Notion Parser API Server ===');
      console.log(` Server running on http://localhost:${port}`);
      console.log('\n=== Server Status ===');
      console.log(` API URL: http://localhost:${port}`);
      console.log(`📡 CORS: Enabled for http://localhost:5173, :5174`);
      console.log(`🔑 OpenAI API: ${config.openaiApiKey ? 'Configured' : 'Missing'}`);
    });

    server.keepAliveTimeout = 120000;
    server.headersTimeout = 125000;

    return { port, server };
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer(3001); 