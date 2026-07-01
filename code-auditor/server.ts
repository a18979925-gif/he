import express from 'express';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { analyses, runAnalysis, activeConnections, broadcastEvent, discussIssueWithAI } from './server/analyzer';

const app = express();
const PORT = 3000;

// Configure file upload with memory storage (max 15MB ZIPs)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

app.use(express.json());

/**
 * API: Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Code Auditor API' });
});

/**
 * API: Upload ZIP Archive for Analysis
 */
app.post('/api/analysis/upload', upload.single('file'), (req, res) => {
  if (!(req as any).file) {
    return res.status(400).json({ error: 'Please upload a valid ZIP archive file.' });
  }

  const file = (req as any).file;
  if (file.mimetype !== 'application/zip' && !file.originalname.endsWith('.zip')) {
    return res.status(400).json({ error: 'Unsupported file type. Please upload a .zip file containing source code.' });
  }

  const analysisId = crypto.randomUUID();
  const fileName = file.originalname;
  const plan = req.body.plan === 'super' ? 'super' : 'basic';

  console.log(`Starting analysis run ${analysisId} for file ${fileName} with plan: ${plan}`);

  // Kickoff analysis asynchronously so response returns immediately
  runAnalysis(analysisId, file.buffer, fileName, plan);

  res.status(202).json({
    analysisId,
    message: 'ZIP uploaded and analysis initiated. Connect to the stream endpoint for real-time progress.',
  });
});

/**
 * API: Get List of Historical / Cached Analyses
 */
app.get('/api/analysis/list', (req, res) => {
  const summaries = Array.from(analyses.values()).map((report) => report.summary);
  res.json(summaries);
});

/**
 * API: Get Analysis Details
 */
app.get('/api/analysis/:id', (req, res) => {
  const report = analyses.get(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Analysis report not found.' });
  }
  res.json(report);
});

/**
 * API: Live Server-Sent Events (SSE) Stream for analysis updates
 */
app.get('/api/analysis/:id/stream', (req, res) => {
  const id = req.params.id;

  // Set response headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Register connection
  const connections = activeConnections.get(id) || [];
  connections.push(res);
  activeConnections.set(id, connections);

  console.log(`Client subscribed to SSE stream for analysis ${id}`);

  // Send initial connected ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', analysisId: id })}\n\n`);

  // If analysis is already stored, stream current state
  const report = analyses.get(id);
  if (report) {
    res.write(`data: ${JSON.stringify({ type: 'STAGE_CHANGED', status: report.summary.status, progress: report.summary.progress, message: 'Syncing current analysis report state...' })}\n\n`);
    if (report.summary.status === 'completed') {
      res.write(`data: ${JSON.stringify({ type: 'ANALYSIS_DONE', report })}\n\n`);
    }
  }

  // Handle client disconnects
  req.on('close', () => {
    console.log(`Client unsubscribed from SSE stream ${id}`);
    const updated = activeConnections.get(id) || [];
    const index = updated.indexOf(res);
    if (index !== -1) {
      updated.splice(index, 1);
    }
    if (updated.length === 0) {
      activeConnections.delete(id);
    } else {
      activeConnections.set(id, updated);
    }
  });
});

/**
 * API: Discuss a specific AuditIssue with AI Remediation Assistant
 */
app.post('/api/analysis/chat', async (req, res) => {
  const { issue, history, userMessage } = req.body;
  if (!issue || !userMessage) {
    return res.status(400).json({ error: 'Please supply a valid AuditIssue and userMessage.' });
  }

  try {
    const reply = await discussIssueWithAI(issue, history || [], userMessage);
    res.json({ reply });
  } catch (err: any) {
    console.error('Failed to run AI discussion endpoint:', err);
    res.status(500).json({ error: err?.message || 'Failed to conduct AI discussion.' });
  }
});

/**
 * Start Server & Handle Vite Routing
 */
async function startServer() {
  // Vite dev middleware / static client handler
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
