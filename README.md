# Task Manager API

A RESTful API for managing tasks with Node.js and Express.js.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Start the Server
```bash
npm start
```
Server runs on `http://localhost:3000`

### Run Tests
```bash
npm test
```
✅ All 19 tests passing

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks` | Create a new task |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get a specific task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

---

## Request/Response Examples

### Create a Task (POST)
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false
  }'
```

**Response (201):**
```json
{
  "id": 9,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false
}
```

### Get All Tasks (GET)
```bash
curl http://localhost:3000/tasks
```

**Response (200):** Array of all tasks

### Get Single Task (GET)
```bash
curl http://localhost:3000/tasks/1
```

### Update Task (PUT)
```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Updated description",
    "completed": true
  }'
```

### Delete Task (DELETE)
```bash
curl -X DELETE http://localhost:3000/tasks/1
```

---

## Input Validation

### POST /tasks
- `title` - Required string
- `description` - Required string
- `completed` - Optional boolean (default: false)

### PUT /tasks/:id
- `title` - Required string
- `description` - Required string
- `completed` - Optional boolean

**Invalid requests return 400 Bad Request**

---

## Error Handling

| Status | Meaning |
|--------|---------|
| 201 | Task created |
| 200 | Success |
| 400 | Invalid input |
| 404 | Task not found |
| 500 | Server error |

---

## Testing with Postman

1. **Start server:** `npm start`
2. **Open Postman**
3. Create requests:
   - POST to `http://localhost:3000/tasks` (add JSON body)
   - GET to `http://localhost:3000/tasks`
   - GET to `http://localhost:3000/tasks/1`
   - PUT to `http://localhost:3000/tasks/1` (add JSON body)
   - DELETE to `http://localhost:3000/tasks/1`

---

## Project Structure

```
├── app.js              # Express API with all endpoints
├── task.json           # Initial task data
├── package.json        # Dependencies
├── test/
│   └── server.test.js  # Test suite (19 tests)
└── README.md           # This file
```
