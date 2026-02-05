import express from 'express';
import { query, queryOne, run } from '../database.js';

const router = express.Router();

// GET /api/staff - List all staff
router.get('/', (req, res) => {
    try {
        const staff = query(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM comments WHERE staff_id = s.id) as comment_count
      FROM staff s
      ORDER BY s.name
    `);

        res.json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/staff/:id - Get single staff
router.get('/:id', (req, res) => {
    try {
        const person = queryOne('SELECT * FROM staff WHERE id = ?', [parseInt(req.params.id)]);

        if (!person) {
            return res.status(404).json({ success: false, error: 'Staff not found' });
        }

        res.json({ success: true, data: person });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/staff - Create new staff
router.post('/', (req, res) => {
    try {
        const { name, avatar_color = '#3B82F6', role = 'seeder' } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        const result = run(`
      INSERT INTO staff (name, avatar_color, role) 
      VALUES (?, ?, ?)
    `, [name, avatar_color, role]);

        const newStaff = queryOne('SELECT * FROM staff WHERE id = ?', [result.lastInsertRowid]);

        res.status(201).json({ success: true, data: newStaff });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/staff/:id - Update staff
router.put('/:id', (req, res) => {
    try {
        const { name, avatar_color, role } = req.body;
        const id = parseInt(req.params.id);

        const existing = queryOne('SELECT * FROM staff WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Staff not found' });
        }

        run(`
      UPDATE staff 
      SET name = ?,
          avatar_color = ?,
          role = ?
      WHERE id = ?
    `, [name || existing.name, avatar_color || existing.avatar_color, role || existing.role, id]);

        const updated = queryOne('SELECT * FROM staff WHERE id = ?', [id]);

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/staff/:id - Delete staff
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = queryOne('SELECT * FROM staff WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Staff not found' });
        }

        run('DELETE FROM staff WHERE id = ?', [id]);

        res.json({ success: true, message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
