import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /aulas - List classes with optional professor_id filter
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { professor_id } = req.query;

    /* Example Request URLs:
    GET /api/aulas
    GET /api/aulas?professor_id=123e4567-e89b-12d3-a456-426614174000
    */

    let query = `
      SELECT 
        a.id,
        a.data,
        a.horario_inicio,
        a.horario_fim,
        a.observacoes,
        d.nome as disciplina_nome,
        t.nome as turma_nome,
        s.nome as sala_nome,
        p.nome as professor_nome,
        t.ano_letivo,
        sub.nome as substituto_nome
      FROM aulas a
      JOIN professores p ON a.professor_id = p.id
      JOIN turmas t ON a.turma_id = t.id
      JOIN disciplinas d ON a.disciplina_id = d.id
      JOIN salas s ON a.sala_id = s.id
      LEFT JOIN professores sub ON a.substituto_id = sub.id
    `;

    let params = [];
    let whereConditions = [];

    // If professor_id is provided in query params, filter by it
    if (professor_id) {
      whereConditions.push('a.professor_id = $' + (params.length + 1));
      params.push(professor_id);
    }
    // If not coordenador and no professor_id specified, filter by current user's id
    else if (req.user.perfil !== 'coordenador') {
      whereConditions.push('a.professor_id = $' + (params.length + 1));
      params.push(req.user.id);
    }

    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY a.data DESC, a.horario_inicio';

    const result = await pool.query(query, params);

    /* Example JSON Response:
    {
      "success": true,
      "aulas": [
        {
          "id": "345e6789-e89b-12d3-a456-426614174004",
          "data": "2024-01-20T00:00:00.000Z",
          "horario_inicio": "08:00:00",
          "horario_fim": "09:30:00",
          "observacoes": "Aula sobre equações do segundo grau",
          "disciplina_nome": "Matemática",
          "turma_nome": "9º A",
          "sala_nome": "Sala 101",
          "professor_nome": "João Silva",
          "ano_letivo": "2024",
          "substituto_nome": null
        },
        {
          "id": "678e9012-e89b-12d3-a456-426614174005",
          "data": "2024-01-19T00:00:00.000Z",
          "horario_inicio": "14:00:00",
          "horario_fim": "15:30:00",
          "observacoes": "Revisão para prova",
          "disciplina_nome": "Física",
          "turma_nome": "1º B",
          "sala_nome": "Laboratório",
          "professor_nome": "Maria Santos",
          "ano_letivo": "2024",
          "substituto_nome": "Carlos Oliveira"
        }
      ]
    }
    */

    res.json({
      success: true,
      aulas: result.rows
    });
  } catch (error) {
    console.error('Error fetching aulas:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /aulas/:id - Get specific class
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    /* Example Request URL:
    GET /api/aulas/345e6789-e89b-12d3-a456-426614174004
    */

    let query = `
      SELECT 
        a.id,
        a.data,
        a.horario_inicio,
        a.horario_fim,
        a.observacoes,
        a.professor_id,
        d.nome as disciplina_nome,
        t.nome as turma_nome,
        s.nome as sala_nome,
        p.nome as professor_nome,
        t.ano_letivo,
        sub.nome as substituto_nome
      FROM aulas a
      JOIN professores p ON a.professor_id = p.id
      JOIN turmas t ON a.turma_id = t.id
      JOIN disciplinas d ON a.disciplina_id = d.id
      JOIN salas s ON a.sala_id = s.id
      LEFT JOIN professores sub ON a.substituto_id = sub.id
      WHERE a.id = $1
    `;

    let params = [id];

    // If not coordenador, also filter by professor_id
    if (req.user.perfil !== 'coordenador') {
      query += ' AND a.professor_id = $2';
      params.push(req.user.id);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Aula not found'
      });
    }

    /* Example JSON Response:
    {
      "success": true,
      "aula": {
        "id": "345e6789-e89b-12d3-a456-426614174004",
        "data": "2024-01-20T00:00:00.000Z",
        "horario_inicio": "08:00:00",
        "horario_fim": "09:30:00",
        "observacoes": "Aula sobre equações do segundo grau",
        "professor_id": "123e4567-e89b-12d3-a456-426614174000",
        "disciplina_nome": "Matemática",
        "turma_nome": "9º A",
        "sala_nome": "Sala 101",
        "professor_nome": "João Silva",
        "ano_letivo": "2024",
        "substituto_nome": null
      }
    }
    */

    /* Example JSON Response (Error):
    {
      "error": "Aula not found"
    }
    */

    res.json({
      success: true,
      aula: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching aula:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /aulas - Create a new class (coordenador only)
router.post('/', authenticateToken, requireRole(['coordenador']), async (req, res) => {
  try {
    const { 
      professor_id, 
      turma_id, 
      disciplina_id, 
      sala_id, 
      data, 
      horario_inicio, 
      horario_fim, 
      observacoes 
    } = req.body;

    /* Example JSON Request Body:
    {
      "professor_id": "123e4567-e89b-12d3-a456-426614174000",
      "turma_id": "456e7890-e89b-12d3-a456-426614174001",
      "disciplina_id": "789e0123-e89b-12d3-a456-426614174002",
      "sala_id": "012e3456-e89b-12d3-a456-426614174003",
      "data": "2024-01-20",
      "horario_inicio": "08:00:00",
      "horario_fim": "09:30:00",
      "observacoes": "Aula sobre equações do segundo grau"
    }
    */

    // Validate required fields
    if (!professor_id || !turma_id || !disciplina_id || !sala_id || !data || !horario_inicio || !horario_fim) {
      return res.status(400).json({
        error: 'All fields are required: professor_id, turma_id, disciplina_id, sala_id, data, horario_inicio, horario_fim'
      });
    }

    // Verify all foreign keys exist
    const validationQueries = [
      { table: 'professores', id: professor_id, name: 'Professor' },
      { table: 'turmas', id: turma_id, name: 'Turma' },
      { table: 'disciplinas', id: disciplina_id, name: 'Disciplina' },
      { table: 'salas', id: sala_id, name: 'Sala' }
    ];

    for (const validation of validationQueries) {
      const result = await pool.query(`SELECT id FROM ${validation.table} WHERE id = $1`, [validation.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: `${validation.name} not found`
        });
      }
    }

    // Insert new aula
    const insertQuery = `
      INSERT INTO aulas (professor_id, turma_id, disciplina_id, sala_id, data, horario_inicio, horario_fim, observacoes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id, professor_id, turma_id, disciplina_id, sala_id, data, horario_inicio, horario_fim, observacoes
    `;

    const result = await pool.query(insertQuery, [
      professor_id, turma_id, disciplina_id, sala_id, data, horario_inicio, horario_fim, observacoes
    ]);

    /* Example JSON Response (Success):
    {
      "success": true,
      "aula": {
        "id": "345e6789-e89b-12d3-a456-426614174004",
        "professor_id": "123e4567-e89b-12d3-a456-426614174000",
        "turma_id": "456e7890-e89b-12d3-a456-426614174001",
        "disciplina_id": "789e0123-e89b-12d3-a456-426614174002",
        "sala_id": "012e3456-e89b-12d3-a456-426614174003",
        "data": "2024-01-20T00:00:00.000Z",
        "horario_inicio": "08:00:00",
        "horario_fim": "09:30:00",
        "observacoes": "Aula sobre equações do segundo grau"
      }
    }
    */

    /* Example JSON Response (Error - Missing Fields):
    {
      "error": "All fields are required: professor_id, turma_id, disciplina_id, sala_id, data, horario_inicio, horario_fim"
    }
    */

    /* Example JSON Response (Error - Invalid Foreign Key):
    {
      "error": "Professor not found"
    }
    */

    res.status(201).json({
      success: true,
      aula: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating aula:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /aulas/:id - Update an existing class (coordenador only)
router.put('/:id', authenticateToken, requireRole(['coordenador']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      professor_id, 
      turma_id, 
      disciplina_id, 
      sala_id, 
      data, 
      horario_inicio, 
      horario_fim, 
      substituto_id,
      observacoes 
    } = req.body;

    /* Example JSON Request Body (Full Update):
    {
      "professor_id": "123e4567-e89b-12d3-a456-426614174000",
      "turma_id": "456e7890-e89b-12d3-a456-426614174001",
      "disciplina_id": "789e0123-e89b-12d3-a456-426614174002",
      "sala_id": "012e3456-e89b-12d3-a456-426614174003",
      "data": "2024-01-21",
      "horario_inicio": "10:00:00",
      "horario_fim": "11:30:00",
      "substituto_id": "678e9012-e89b-12d3-a456-426614174005",
      "observacoes": "Aula reagendada - Professor substituto"
    }
    */

    /* Example JSON Request Body (Partial Update - Only Substitute):
    {
      "substituto_id": "678e9012-e89b-12d3-a456-426614174005",
      "observacoes": "Professor João será substituído por Maria"
    }
    */

    /* Example JSON Request Body (Remove Substitute):
    {
      "substituto_id": null,
      "observacoes": "Professor original retornou"
    }
    */

    // Check if aula exists
    const existingAula = await pool.query('SELECT * FROM aulas WHERE id = $1', [id]);
    if (existingAula.rows.length === 0) {
      return res.status(404).json({
        error: 'Aula not found'
      });
    }

    const currentAula = existingAula.rows[0];

    // Validate foreign keys if provided
    const validationQueries = [];
    if (professor_id) validationQueries.push({ table: 'professores', id: professor_id, name: 'Professor' });
    if (turma_id) validationQueries.push({ table: 'turmas', id: turma_id, name: 'Turma' });
    if (disciplina_id) validationQueries.push({ table: 'disciplinas', id: disciplina_id, name: 'Disciplina' });
    if (sala_id) validationQueries.push({ table: 'salas', id: sala_id, name: 'Sala' });
    if (substituto_id) validationQueries.push({ table: 'professores', id: substituto_id, name: 'Substituto' });

    for (const validation of validationQueries) {
      const result = await pool.query(`SELECT id FROM ${validation.table} WHERE id = $1`, [validation.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: `${validation.name} not found`
        });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (professor_id !== undefined) {
      updateFields.push(`professor_id = $${paramCount++}`);
      updateValues.push(professor_id);
    }
    if (turma_id !== undefined) {
      updateFields.push(`turma_id = $${paramCount++}`);
      updateValues.push(turma_id);
    }
    if (disciplina_id !== undefined) {
      updateFields.push(`disciplina_id = $${paramCount++}`);
      updateValues.push(disciplina_id);
    }
    if (sala_id !== undefined) {
      updateFields.push(`sala_id = $${paramCount++}`);
      updateValues.push(sala_id);
    }
    if (data !== undefined) {
      updateFields.push(`data = $${paramCount++}`);
      updateValues.push(data);
    }
    if (horario_inicio !== undefined) {
      updateFields.push(`horario_inicio = $${paramCount++}`);
      updateValues.push(horario_inicio);
    }
    if (horario_fim !== undefined) {
      updateFields.push(`horario_fim = $${paramCount++}`);
      updateValues.push(horario_fim);
    }
    if (substituto_id !== undefined) {
      updateFields.push(`substituto_id = $${paramCount++}`);
      updateValues.push(substituto_id);
    }
    if (observacoes !== undefined) {
      updateFields.push(`observacoes = $${paramCount++}`);
      updateValues.push(observacoes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No fields to update'
      });
    }

    // Add the ID parameter for WHERE clause
    updateValues.push(id);

    const updateQuery = `
      UPDATE aulas 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);
    const updatedAula = result.rows[0];

    // Check if substituto_id was set or changed
    const newSubstitutoId = substituto_id !== undefined ? substituto_id : updatedAula.substituto_id;
    const oldSubstitutoId = currentAula.substituto_id;

    if (newSubstitutoId && newSubstitutoId !== oldSubstitutoId) {
      // Get class details for notification
      const classDetailsQuery = `
        SELECT 
          d.nome as disciplina_nome,
          t.nome as turma_nome,
          s.nome as sala_nome,
          p.nome as professor_original_nome
        FROM aulas a
        JOIN disciplinas d ON a.disciplina_id = d.id
        JOIN turmas t ON a.turma_id = t.id
        JOIN salas s ON a.sala_id = s.id
        JOIN professores p ON a.professor_id = p.id
        WHERE a.id = $1
      `;
      
      const classDetails = await pool.query(classDetailsQuery, [id]);
      const details = classDetails.rows[0];

      // Create notification for substitute professor
      const notificationMessage = `Você foi designado como substituto para a aula de ${details.disciplina_nome} da turma ${details.turma_nome} na sala ${details.sala_nome} no dia ${updatedAula.data} das ${updatedAula.horario_inicio} às ${updatedAula.horario_fim}. Professor original: ${details.professor_original_nome}.`;

      await pool.query(
        'INSERT INTO notificacoes (professor_id, mensagem, data_envio, lida) VALUES ($1, $2, $3, false)',
        [newSubstitutoId, notificationMessage, new Date().toISOString()]
      );
    }

    /* Example JSON Response (Success with Notification):
    {
      "success": true,
      "aula": {
        "id": "345e6789-e89b-12d3-a456-426614174004",
        "professor_id": "123e4567-e89b-12d3-a456-426614174000",
        "turma_id": "456e7890-e89b-12d3-a456-426614174001",
        "disciplina_id": "789e0123-e89b-12d3-a456-426614174002",
        "sala_id": "012e3456-e89b-12d3-a456-426614174003",
        "data": "2024-01-21T00:00:00.000Z",
        "horario_inicio": "10:00:00",
        "horario_fim": "11:30:00",
        "substituto_id": "678e9012-e89b-12d3-a456-426614174005",
        "observacoes": "Aula reagendada - Professor substituto"
      },
      "notification_sent": true
    }
    */

    /* Example JSON Response (Success without Notification):
    {
      "success": true,
      "aula": {
        "id": "345e6789-e89b-12d3-a456-426614174004",
        "professor_id": "123e4567-e89b-12d3-a456-426614174000",
        "turma_id": "456e7890-e89b-12d3-a456-426614174001",
        "disciplina_id": "789e0123-e89b-12d3-a456-426614174002",
        "sala_id": "012e3456-e89b-12d3-a456-426614174003",
        "data": "2024-01-22T00:00:00.000Z",
        "horario_inicio": "08:00:00",
        "horario_fim": "09:30:00",
        "substituto_id": null,
        "observacoes": "Horário alterado"
      },
      "notification_sent": false
    }
    */

    /* Example JSON Response (Error - Not Found):
    {
      "error": "Aula not found"
    }
    */

    /* Example JSON Response (Error - No Fields):
    {
      "error": "No fields to update"
    }
    */

    res.json({
      success: true,
      aula: updatedAula,
      notification_sent: newSubstitutoId && newSubstitutoId !== oldSubstitutoId
    });

  } catch (error) {
    console.error('Error updating aula:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;