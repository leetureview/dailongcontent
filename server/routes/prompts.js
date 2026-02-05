import express from 'express';
import { query, queryOne, run } from '../database.js';

const router = express.Router();

// GET /api/prompts - List prompts (with optional project_id filter)
router.get('/', (req, res) => {
    try {
        const { project_id } = req.query;

        let sql = 'SELECT * FROM prompts';
        const params = [];

        if (project_id) {
            sql += ' WHERE project_id = ?';
            params.push(parseInt(project_id));
        }

        sql += ' ORDER BY created_at DESC';

        const prompts = query(sql, params);

        res.json({ success: true, data: prompts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/prompts/:id - Get single prompt
router.get('/:id', (req, res) => {
    try {
        const prompt = queryOne('SELECT * FROM prompts WHERE id = ?', [parseInt(req.params.id)]);

        if (!prompt) {
            return res.status(404).json({ success: false, error: 'Prompt not found' });
        }

        res.json({ success: true, data: prompt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/prompts - Create new prompt
router.post('/', (req, res) => {
    try {
        const { project_id, name, template, type = 'comment', is_active = 1 } = req.body;

        if (!name || !template) {
            return res.status(400).json({
                success: false,
                error: 'name and template are required'
            });
        }

        const result = run(`
      INSERT INTO prompts (project_id, name, template, type, is_active) 
      VALUES (?, ?, ?, ?, ?)
    `, [project_id || null, name, template, type, is_active]);

        const newPrompt = queryOne('SELECT * FROM prompts WHERE id = ?', [result.lastInsertRowid]);

        res.status(201).json({ success: true, data: newPrompt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/prompts/:id - Update prompt
router.put('/:id', (req, res) => {
    try {
        const { name, template, type, is_active } = req.body;
        const id = parseInt(req.params.id);

        const existing = queryOne('SELECT * FROM prompts WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Prompt not found' });
        }

        run(`
      UPDATE prompts 
      SET name = ?,
          template = ?,
          type = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
            name || existing.name,
            template || existing.template,
            type || existing.type,
            is_active ?? existing.is_active,
            id
        ]);

        const updated = queryOne('SELECT * FROM prompts WHERE id = ?', [id]);

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/prompts/:id - Delete prompt
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = queryOne('SELECT * FROM prompts WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Prompt not found' });
        }

        run('DELETE FROM prompts WHERE id = ?', [id]);

        res.json({ success: true, message: 'Prompt deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
