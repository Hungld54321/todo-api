# Todo App REST API

A simple and robust Todo REST API built with Node.js, Express.js, and SQLite.

## Features

- ✅ Full CRUD operations for todos
- ✅ SQLite database for data persistence
- ✅ CORS enabled for frontend integration
- ✅ Input validation and error handling
- ✅ Proper HTTP status codes
- ✅ ISO date formatting
- ✅ Graceful shutdown handling

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite3
- **CORS**: Enabled for localhost:3000

## API Endpoints

| Method | Endpoint         | Description           |
|--------|------------------|-----------------------|
| GET    | `/api/todos`     | Get all todos         |
| POST   | `/api/todos`     | Create a new todo     |
| PUT    | `/api/todos/:id` | Update todo by ID     |
| DELETE | `/api/todos/:id` | Delete todo by ID     |
| GET    | `/health`        | Health check          |

## Todo Model

```json
{
  "id": 1,
  "text": "Learn React",
  "completed": false,
  "createdAt": "2025-01-31T10:30:45.123Z"
}
```

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project files**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Or production mode
   npm start
   ```

4. **The API will be running at:** `http://localhost:3001`

## Usage Examples

### Get All Todos
```bash
curl http://localhost:3001/api/todos
```

### Create a New Todo
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "Learn React"}'
```

### Update a Todo
```bash
# Mark as completed
curl -X PUT http://localhost:3001/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Update text
curl -X PUT http://localhost:3001/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Learn React and Redux"}'

# Update both text and status
curl -X PUT http://localhost:3001/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Learn React and Redux", "completed": true}'
```

### Delete a Todo
```bash
curl -X DELETE http://localhost:3001/api/todos/1
```

## API Response Examples

### POST /api/todos
**Request:**
```json
{
  "text": "Learn React"
}
```
**Response (201):**
```json
{
  "id": 1,
  "text": "Learn React",
  "completed": false,
  "createdAt": "2025-01-31T10:30:45.123Z"
}
```

### PUT /api/todos/1
**Request:**
```json
{
  "completed": true
}
```
**Response (200):**
```json
{
  "id": 1,
  "text": "Learn React",
  "completed": true,
  "createdAt": "2025-01-31T10:30:45.123Z"
}
```

### GET /api/todos
**Response (200):**
```json
[
  {
    "id": 1,
    "text": "Learn React",
    "completed": true,
    "createdAt": "2025-01-31T10:30:45.123Z"
  }
]
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

### 400 Bad Request
- Invalid or missing todo text
- Invalid todo ID format
- Invalid data types for fields

### 404 Not Found
- Todo with specified ID doesn't exist
- Invalid endpoint

### 500 Internal Server Error
- Database errors
- Unexpected server errors

## Database

The API uses SQLite for data persistence. The database file (`todos.db`) is automatically created when the server starts. The todos table schema:

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## CORS Configuration

CORS is configured to allow requests from `http://localhost:3000` (typical React development server). To modify this, update the CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: 'http://localhost:3000',  // Change this for your frontend URL
  credentials: true
}));
```

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload (requires nodemon)

### Project Structure

```
todo-api/
├── package.json          # Project dependencies and scripts
├── server.js             # Main server file with all routes
├── todos.db              # SQLite database (auto-generated)
└── README.md             # This file
```

## Testing the API

You can test the API using:

1. **curl** (examples provided above)
2. **Postman** or **Insomnia**
3. **Your frontend application** (configured for localhost:3000)

### Test Sequence Example

```bash
# 1. Create a todo
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "Test todo"}'

# 2. Get all todos
curl http://localhost:3001/api/todos

# 3. Update the todo
curl -X PUT http://localhost:3001/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 4. Delete the todo
curl -X DELETE http://localhost:3001/api/todos/1
```

## Production Considerations

For production deployment, consider:

- Using environment variables for configuration
- Adding authentication/authorization
- Implementing rate limiting
- Using a more robust database (PostgreSQL, MySQL)
- Adding logging middleware
- Implementing request validation schemas
- Adding API documentation (Swagger/OpenAPI)

## License

MIT License