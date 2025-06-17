import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /notificacoes?professor_id= - Get notifications for a specific professor
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { professor_id } = req.query;
    let targetProfessorId;

    /* Example Request URLs:
    GET /api/notificacoes
    GET /api/notificacoes?professor_id=123e4567-e89b-12d3-a456-426614174000
    */

    // If professor_id is provided in query params
    if (professor_id) {
      // Only coordenadores can query other professors' notifications
      if (req.user.perfil !== 'coordenador' && professor_id !== req.user.id) {
        return res.status(403).json({
          error: 'Insufficient permissions to view other professors notifications'
        });
      }
      targetProfessorId = professor_id;
    } else {
      // Default to current user's notifications
      targetProfessorId = req.user.id;
    }

    const query = `
      SELECT id, mensagem, data_envio, lida 
      FROM notificacoes 
      WHERE professor_id = $1 
      ORDER BY data_envio DESC
    `;
    const result = await pool.query(query, [targetProfessorId]);

    /* Example JSON Response:
    {
      "success": true,
      "notificacoes": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "mensagem": "Você foi designado como substituto para a aula de Matemática da turma 9º A na sala Sala 101 no dia 2024-01-21 das 10:00:00 às 11:30:00. Professor original: João Silva.",
          "data_envio": "2024-01-15T10:30:00.000Z",
          "lida": false
        },
        {
          "id": "456e7890-e89b-12d3-a456-426614174001",
          "mensagem": "Sua aula de Física foi reagendada para 14:00",
          "data_envio": "2024-01-14T08:15:00.000Z",
          "lida": true
        },
        {
          "id": "789e0123-e89b-12d3-a456-426614174002",
          "mensagem": "Reunião pedagógica marcada para sexta-feira às 16:00",
          "data_envio": "2024-01-13T12:00:00.000Z",
          "lida": true
        }
      ]
    }
    */

    /* Example JSON Response (Empty):
    {
      "success": true,
      "notificacoes": []
    }
    */

    /* Example JSON Response (Error - Permission):
    {
      "error": "Insufficient permissions to view other professors notifications"
    }
    */

    res.json({
      success: true,
      notificacoes: result.rows
    });
  } catch (error) {
    console.error('Error fetching notificacoes:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /notificacoes - Create a new notification
router.post('/', authenticateToken, requireRole(['coordenador']), async (req, res) => {
  try {
    const { professor_id, mensagem, data_envio } = req.body;

    /* Example JSON Request Body (with custom date):
    {
      "professor_id": "123e4567-e89b-12d3-a456-426614174000",
      "mensagem": "Sua aula de Física foi cancelada devido a manutenção da sala",
      "data_envio": "2024-01-15T09:00:00.000Z"
    }
    */

    /* Example JSON Request Body (auto date):
    {
      "professor_id": "456e7890-e89b-12d3-a456-426614174001",
      "mensagem": "Reunião de pais marcada para próxima terça-feira às 19:00"
    }
    */

    // Validate required fields
    if (!professor_id || !mensagem) {
      return res.status(400).json({
        error: 'professor_id and mensagem are required'
      });
    }

    // Verify professor exists
    const professorCheck = await pool.query(
      'SELECT id FROM professores WHERE id = $1',
      [professor_id]
    );

    if (professorCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Professor not found'
      });
    }

    // Insert notification
    const insertQuery = `
      INSERT INTO notificacoes (professor_id, mensagem, data_envio, lida) 
      VALUES ($1, $2, $3, false) 
      RETURNING id, professor_id, mensagem, data_envio, lida
    `;

    const finalDataEnvio = data_envio || new Date().toISOString();
    const result = await pool.query(insertQuery, [professor_id, mensagem, finalDataEnvio]);

    /* Example JSON Response (Success):
    {
      "success": true,
      "notificacao": {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "professor_id": "123e4567-e89b-12d3-a456-426614174000",
        "mensagem": "Sua aula de Física foi cancelada devido a manutenção da sala",
        "data_envio": "2024-01-15T09:00:00.000Z",
        "lida": false
      }
    }
    */

    /* Example JSON Response (Error - Missing Fields):
    {
      "error": "professor_id and mensagem are required"
    }
    */

    /* Example JSON Response (Error - Professor Not Found):
    {
      "error": "Professor not found"
    }
    */

    res.status(201).json({
      success: true,
      notificacao: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /notificacoes/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    /* Example Request URL:
    PUT /api/notificacoes/123e4567-e89b-12d3-a456-426614174000/read
    */

    const query = `
      UPDATE notificacoes 
      SET lida = true 
      WHERE id = $1 AND professor_id = $2
      RETURNING id, mensagem, data_envio, lida
    `;
    const result = await pool.query(query, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Notification not found'
      });
    }

    /* Example JSON Response (Success):
    {
      "success": true,
      "notificacao": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "mensagem": "Você foi designado como substituto para a aula de Matemática da turma 9º A na sala Sala 101 no dia 2024-01-21 das 10:00:00 às 11:30:00. Professor original: João Silva.",
        "data_envio": "2024-01-15T10:30:00.000Z",
        "lida": true
      }
    }
    */

    /* Example JSON Response (Error):
    {
      "error": "Notification not found"
    }
    */

    res.json({
      success: true,
      notificacao: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;