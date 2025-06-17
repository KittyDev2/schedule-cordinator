# Professor API - Node.js Express Server

A REST API server for managing professors, classes, and notifications with JWT authentication.

## Features

- **Authentication**: JWT-based login system with bcrypt password hashing
- **Role-based Access**: Different permissions for professors and coordinators
- **PostgreSQL Integration**: Connects to existing database schema
- **RESTful API**: Clean, organized endpoints for all operations
- **Security**: Protected routes with JWT middleware

## Database Schema

The API works with these existing tables:
- `professores` - Professor information and credentials
- `turmas` - Classes/groups
- `salas` - Classrooms
- `disciplinas` - Subjects
- `aulas` - Class sessions
- `notificacoes` - Notifications for professors

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   - Copy `.env` file and update database credentials
   - Set JWT_SECRET to a secure random string
   - Configure PostgreSQL connection details

3. **Start the server**:
   ```bash
   npm run dev    # Development with auto-reload
   npm start      # Production
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new professor (coordenador only)

### Professors
- `GET /api/professores` - List all professors (coordenador only)
- `GET /api/professores/me` - Get current professor info

### Classes
- `GET /api/aulas` - List classes (filtered by role)
- `GET /api/aulas/:id` - Get specific class

### Notifications
- `GET /api/notificacoes` - Get notifications for current professor
- `PUT /api/notificacoes/:id/read` - Mark notification as read

## Authentication

All endpoints except `/api/auth/login` require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Usage Example

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "professor@email.com", "password": "password123"}'

# Get classes (with token)
curl http://localhost:3000/api/aulas \
  -H "Authorization: Bearer <your_token>"
```