# Professor API - Request & Response Examples

Complete JSON examples for all API endpoints.

## Authentication Endpoints

### POST /api/auth/login
**Description:** Authenticate professor and get JWT token

**Request:**
```json
{
  "email": "professor@escola.com",
  "password": "minhasenha123"
}
```

**Response (Success):**
```json
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
```

**Response (Error):**
```json
{
  "error": "Invalid email or password"
}
```

### POST /api/auth/register
**Description:** Register new professor (coordenador only)

**Request:**
```json
{
  "nome": "Maria Santos",
  "email": "maria.santos@escola.com",
  "password": "senhaSegura456",
  "perfil": "professor"
}
```

**Response (Success):**
```json
{
  "success": true,
  "professor": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "nome": "Maria Santos",
    "email": "maria.santos@escola.com",
    "perfil": "professor"
  }
}
```

**Response (Error - Duplicate):**
```json
{
  "error": "Professor with this email already exists"
}
```

## Professor Endpoints

### GET /api/professores
**Description:** List all professors (coordenador only)

**Request:** No body required

**Response:**
```json
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
```

### GET /api/professores/me
**Description:** Get current professor information

**Request:** No body required

**Response (Success):**
```json
{
  "success": true,
  "professor": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "nome": "João Silva",
    "email": "joao.silva@escola.com",
    "perfil": "professor"
  }
}
```

**Response (Error):**
```json
{
  "error": "Professor not found"
}
```

## Classes (Aulas) Endpoints

### GET /api/aulas
**Description:** List classes with optional professor filter

**Request URLs:**
- `GET /api/aulas` (all classes for coordenador, own classes for professor)
- `GET /api/aulas?professor_id=123e4567-e89b-12d3-a456-426614174000`

**Response:**
```json
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
```

### GET /api/aulas/:id
**Description:** Get specific class details

**Request URL:** `GET /api/aulas/345e6789-e89b-12d3-a456-426614174004`

**Response (Success):**
```json
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
```

**Response (Error):**
```json
{
  "error": "Aula not found"
}
```

### POST /api/aulas
**Description:** Create new class (coordenador only)

**Request:**
```json
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
```

**Response (Success):**
```json
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
```

**Response (Error - Missing Fields):**
```json
{
  "error": "All fields are required: professor_id, turma_id, disciplina_id, sala_id, data, horario_inicio, horario_fim"
}
```

**Response (Error - Invalid Foreign Key):**
```json
{
  "error": "Professor not found"
}
```

### PUT /api/aulas/:id
**Description:** Update existing class (coordenador only)

**Request (Full Update):**
```json
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
```

**Request (Partial Update - Only Substitute):**
```json
{
  "substituto_id": "678e9012-e89b-12d3-a456-426614174005",
  "observacoes": "Professor João será substituído por Maria"
}
```

**Request (Remove Substitute):**
```json
{
  "substituto_id": null,
  "observacoes": "Professor original retornou"
}
```

**Response (Success with Notification):**
```json
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
```

**Response (Success without Notification):**
```json
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
```

**Response (Error - Not Found):**
```json
{
  "error": "Aula not found"
}
```

**Response (Error - No Fields):**
```json
{
  "error": "No fields to update"
}
```

## Notifications (Notificações) Endpoints

### GET /api/notificacoes
**Description:** Get notifications for professor

**Request URLs:**
- `GET /api/notificacoes` (current user's notifications)
- `GET /api/notificacoes?professor_id=123e4567-e89b-12d3-a456-426614174000` (coordenador only)

**Response:**
```json
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
```

**Response (Empty):**
```json
{
  "success": true,
  "notificacoes": []
}
```

**Response (Error - Permission):**
```json
{
  "error": "Insufficient permissions to view other professors notifications"
}
```

### POST /api/notificacoes
**Description:** Create new notification (coordenador only)

**Request (with custom date):**
```json
{
  "professor_id": "123e4567-e89b-12d3-a456-426614174000",
  "mensagem": "Sua aula de Física foi cancelada devido a manutenção da sala",
  "data_envio": "2024-01-15T09:00:00.000Z"
}
```

**Request (auto date):**
```json
{
  "professor_id": "456e7890-e89b-12d3-a456-426614174001",
  "mensagem": "Reunião de pais marcada para próxima terça-feira às 19:00"
}
```

**Response (Success):**
```json
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
```

**Response (Error - Missing Fields):**
```json
{
  "error": "professor_id and mensagem are required"
}
```

**Response (Error - Professor Not Found):**
```json
{
  "error": "Professor not found"
}
```

### PUT /api/notificacoes/:id/read
**Description:** Mark notification as read

**Request URL:** `PUT /api/notificacoes/123e4567-e89b-12d3-a456-426614174000/read`

**Request:** No body required

**Response (Success):**
```json
{
  "success": true,
  "notificacao": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "mensagem": "Você foi designado como substituto para a aula de Matemática da turma 9º A na sala Sala 101 no dia 2024-01-21 das 10:00:00 às 11:30:00. Professor original: João Silva.",
    "data_envio": "2024-01-15T10:30:00.000Z",
    "lida": true
  }
}
```

**Response (Error):**
```json
{
  "error": "Notification not found"
}
```

## Authentication Headers

All endpoints except `/api/auth/login` require JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Common Error Responses

**401 Unauthorized:**
```json
{
  "error": "Access token required"
}
```

**403 Forbidden:**
```json
{
  "error": "Invalid or expired token"
}
```

**403 Insufficient Permissions:**
```json
{
  "error": "Insufficient permissions"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```