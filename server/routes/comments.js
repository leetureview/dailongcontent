import express from 'express';
import { query, queryOne, run } from '../database.js';

const router = express.Router();

// GET /api/comments - List comments (with optional project_id filter)
router.get('/', (req, res) => {
    try {
        const { project_id, search } = req.query;

        let sql = `
      SELECT c.*, 
        s.name as staff_name, 
        s.avatar_color as staff_color,
        c.reply_to_id,
        (SELECT name FROM staff WHERE id = (SELECT staff_id FROM comments WHERE id = c.reply_to_id)) as reply_to_name
      FROM comments c
      LEFT JOIN staff s ON c.staff_id = s.id
    `;

        const conditions = [];
        const params = [];

        if (project_id) {
            conditions.push('c.project_id = ?');
            params.push(parseInt(project_id));
        }

        if (search) {
            conditions.push('(c.content LIKE ? OR s.name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY c.id ASC';

        const comments = query(sql, params);

        // Format response
        const formattedComments = comments.map(c => ({
            id: c.id,
            project_id: c.project_id,
            content: c.content,
            type: c.type,
            condition: c.condition,
            created_at: c.created_at,
            person: {
                id: c.staff_id,
                name: c.staff_name,
                color: c.staff_color
            },
            replyTo: c.reply_to_id ? {
                id: c.reply_to_id,
                name: c.reply_to_name
            } : null
        }));

        res.json({ success: true, data: formattedComments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/comments/:id - Get single comment
router.get('/:id', (req, res) => {
    try {
        const comment = queryOne(`
      SELECT c.*, s.name as staff_name, s.avatar_color as staff_color
      FROM comments c
      LEFT JOIN staff s ON c.staff_id = s.id
      WHERE c.id = ?
    `, [parseInt(req.params.id)]);

        if (!comment) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }

        res.json({ success: true, data: comment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/comments - Create new comment
router.post('/', (req, res) => {
    try {
        const { project_id, staff_id, content, type = 'Khen ngợi', condition = 'Đạt', reply_to_id = null } = req.body;

        if (!project_id || !staff_id || !content) {
            return res.status(400).json({
                success: false,
                error: 'project_id, staff_id, and content are required'
            });
        }

        const result = run(`
      INSERT INTO comments (project_id, staff_id, content, type, condition, reply_to_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [project_id, staff_id, content, type, condition, reply_to_id]);

        const newComment = queryOne(`
      SELECT c.*, s.name as staff_name, s.avatar_color as staff_color
      FROM comments c
      LEFT JOIN staff s ON c.staff_id = s.id
      WHERE c.id = ?
    `, [result.lastInsertRowid]);

        res.status(201).json({ success: true, data: newComment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/comments/bulk - Bulk create comments
router.post('/bulk', (req, res) => {
    try {
        const { comments: commentsData } = req.body;

        if (!Array.isArray(commentsData) || commentsData.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'comments array is required'
            });
        }

        const insertedIds = [];
        for (const item of commentsData) {
            const result = run(`
        INSERT INTO comments (project_id, staff_id, content, type, condition, reply_to_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
                item.project_id,
                item.staff_id,
                item.content,
                item.type || 'Khen ngợi',
                item.condition || 'Đạt',
                item.reply_to_id || null
            ]);
            insertedIds.push(result.lastInsertRowid);
        }

        res.status(201).json({
            success: true,
            message: `${insertedIds.length} comments created`,
            data: { insertedIds }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/comments/:id - Update comment
router.put('/:id', (req, res) => {
    try {
        const { content, type, condition } = req.body;
        const id = parseInt(req.params.id);

        const existing = queryOne('SELECT * FROM comments WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }

        run(`
      UPDATE comments 
      SET content = ?,
          type = ?,
          condition = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [content || existing.content, type || existing.type, condition || existing.condition, id]);

        const updated = queryOne(`
      SELECT c.*, s.name as staff_name, s.avatar_color as staff_color
      FROM comments c
      LEFT JOIN staff s ON c.staff_id = s.id
      WHERE c.id = ?
    `, [id]);

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = queryOne('SELECT * FROM comments WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }

        run('DELETE FROM comments WHERE id = ?', [id]);

        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/comments/export/:project_id - Export comments
router.get('/export/:project_id', (req, res) => {
    try {
        const comments = query(`
      SELECT c.id, s.name as person, c.content, c.type, c.condition, c.created_at
      FROM comments c
      LEFT JOIN staff s ON c.staff_id = s.id
      WHERE c.project_id = ?
      ORDER BY c.id
    `, [parseInt(req.params.project_id)]);

        res.json({ success: true, data: comments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
