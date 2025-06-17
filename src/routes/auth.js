import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// POST /login - Authenticate professor
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    /* Example JSON Request Body:
    {
      "email": "professor@escola.com",
      "password": "minhasenha123"
    }
    */

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Check if professor exists
    const query = 'SELECT id, nome, email, senha_hash, perfil FROM professores WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const professor = result.rows[0];

    // Validate password
    const isValidPassword = await bcrypt.compare(password, professor.senha_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: professor.id,
        email: professor.email,
        perfil: professor.perfil
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    /* Example JSON Response (Success):
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "nome": "João Silva",
        "email": "professor@escola.com",
        "perfil": "professor"
      }
    }
    */

    /* Example JSON Response (Error):
    {
      "error": "Invalid email or password"
    }
    */

    // Return success response
    res.json({
      success: true,
      token,
      user: {
        id: professor.id,
        nome: professor.nome,
        email: professor.email,
        perfil: professor.perfil
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /register - Register new professor (protected, coordenador only)
router.post('/register', async (req, res) => {
  try {
    const { nome, email, password, perfil = 'professor' } = req.body;

    /* Example JSON Request Body:
    {
      "nome": "Maria Santos",
      "email": "maria.santos@escola.com",
      "password": "senhaSegura456",
      "perfil": "professor"
    }
    */

    // Validate input
    if (!nome || !email || !password) {
      return res.status(400).json({
        error: 'Nome, email and password are required'
      });
    }

    // Check if professor already exists
    const existingQuery = 'SELECT id FROM professores WHERE email = $1';
    const existingResult = await pool.query(existingQuery, [email]);

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        error: 'Professor with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(password, saltRounds);

    // Insert new professor
    const insertQuery = `
      INSERT INTO professores (nome, email, senha_hash, perfil) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, nome, email, perfil
    `;
    const insertResult = await pool.query(insertQuery, [nome, email, senha_hash, perfil]);

    const newProfessor = insertResult.rows[0];

    /* Example JSON Response (Success):
    {
      "success": true,
      "professor": {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "nome": "Maria Santos",
        "email": "maria.santos@escola.com",
        "perfil": "professor"
      }
    }
    */

    /* Example JSON Response (Error - Duplicate):
    {
      "error": "Professor with this email already exists"
    }
    */

    res.status(201).json({
      success: true,
      professor: newProfessor
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;