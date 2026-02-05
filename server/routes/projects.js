import express from 'express';
import { query, queryOne, run } from '../database.js';

const router = express.Router();

// GET /api/projects - List all projects
router.get('/', (req, res) => {
    try {
        const projects = query(`
      SELECT p.*,
        (SELECT COUNT(*) FROM comments WHERE project_id = p.id) as comment_count
      FROM projects p
      ORDER BY p.created_at DESC
    `);

        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/projects/:id - Get single project
router.get('/:id', (req, res) => {
    try {
        const project = queryOne(`
      SELECT p.*,
        (SELECT COUNT(*) FROM comments WHERE project_id = p.id) as comment_count
      FROM projects p
      WHERE p.id = ?
    `, [parseInt(req.params.id)]);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/projects - Create new project
router.post('/', (req, res) => {
    try {
        const { name, description, status = 'active' } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        const result = run(`
      INSERT INTO projects (name, description, status) 
      VALUES (?, ?, ?)
    `, [name, description || '', status]);

        const newProject = queryOne('SELECT * FROM projects WHERE id = ?', [result.lastInsertRowid]);

        res.status(201).json({ success: true, data: newProject });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/projects/:id - Update project
router.put('/:id', (req, res) => {
    try {
        const { name, description, status } = req.body;
        const id = parseInt(req.params.id);

        const existing = queryOne('SELECT * FROM projects WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        run(`
      UPDATE projects 
      SET name = ?,
          description = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name || existing.name, description ?? existing.description, status || existing.status, id]);

        const updated = queryOne('SELECT * FROM projects WHERE id = ?', [id]);

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = queryOne('SELECT * FROM projects WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        run('DELETE FROM projects WHERE id = ?', [id]);

        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
