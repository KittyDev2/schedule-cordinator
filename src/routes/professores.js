import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /professores - List all professors (coordenador only)
router.get('/', authenticateToken, requireRole(['coordenador']), async (req, res) => {
  try {
    const query = 'SELECT id, nome, email, perfil FROM professores ORDER BY nome';
    const result = await pool.query(query);

    /* Example JSON Response:
    {
      "success": true,
      "professores": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "nome": "Ana Costa",
          "email": "ana.costa@escola.com",
          "perfil": "coordenador"
        },
        {
          "id": "456e7890-e89b-12d3-a456-426614174001",
          "nome": "João Silva",
          "email": "joao.silva@escola.com",
          "perfil": "professor"
        },
        {
          "id": "789e0123-e89b-12d3-a456-426614174002",
          "nome": "Maria Santos",
          "email": "maria.santos@escola.com",
          "perfil": "professor"
        }
      ]
    }
    */

    res.json({
      success: true,
      professores: result.rows
    });
  } catch (error) {
    console.error('Error fetching professores:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /professores/me - Get current professor info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT id, nome, email, perfil FROM professores WHERE id = $1';
    const result = await pool.query(query, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Professor not found'
      });
    }

    /* Example JSON Response:
    {
      "success": true,
      "professor": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "nome": "João Silva",
        "email": "joao.silva@escola.com",
        "perfil": "professor"
      }
    }
    */

    /* Example JSON Response (Error):
    {
      "error": "Professor not found"
    }
    */

    res.json({
      success: true,
      professor: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching professor:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;