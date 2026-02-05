import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import database
import { initDatabase, query, queryOne, run } from './database.js';

// Import routes
import projectsRouter from './routes/projects.js';
import commentsRouter from './routes/comments.js';
import staffRouter from './routes/staff.js';
import promptsRouter from './routes/prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/prompts', promptsRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════╗
║  🚀 Marketing Dashboard API Server                     ║
║  ────────────────────────────────────────────────────  ║
║  📡 Running on: http://localhost:${PORT}                  ║
║  📊 Database: SQLite (sql.js)                          ║
║  ────────────────────────────────────────────────────  ║
║  API Endpoints:                                        ║
║    GET  /api/health          - Health check            ║
║    GET  /api/projects        - List projects           ║
║    GET  /api/comments        - List comments           ║
║    GET  /api/staff           - List staff              ║
║    GET  /api/prompts         - List prompts            ║
╚════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;
