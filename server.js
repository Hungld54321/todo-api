const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://claude.ai',
  'https://www.claude.ai',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'todos.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Validation middleware
const validateTodoText = (req, res, next) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      error: 'Text is required and cannot be empty'
    });
  }
  req.body.text = text.trim();
  next();
};

// Helper function to convert SQLite row to Todo object
const formatTodo = (row) => ({
  id: row.id,
  text: row.text,
  completed: Boolean(row.completed),
  createdAt: new Date(row.createdAt).toISOString()
});

// Routes

// GET /api/todos - Get all todos
app.get('/api/todos', (req, res) => {
  db.all('SELECT * FROM todos ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const todos = rows.map(formatTodo);
    res.json(todos);
  });
});

// POST /api/todos - Create new todo
app.post('/api/todos', validateTodoText, (req, res) => {
  const { text } = req.body;
  
  db.run(
    'INSERT INTO todos (text) VALUES (?)',
    [text],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      // Get the created todo
      db.get(
        'SELECT * FROM todos WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          res.status(201).json(formatTodo(row));
        }
      );
    }
  );
});

// PUT /api/todos/:id - Update todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  
  // Validate ID
  const todoId = parseInt(id);
  if (isNaN(todoId)) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }
  
  // Validate input
  if (text !== undefined && (typeof text !== 'string' || text.trim().length === 0)) {
    return res.status(400).json({ error: 'Text cannot be empty' });
  }
  
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }
  
  // Check if todo exists
  db.get('SELECT * FROM todos WHERE id = ?', [todoId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    // Prepare update data
    const updates = {};
    if (text !== undefined) updates.text = text.trim();
    if (completed !== undefined) updates.completed = completed ? 1 : 0;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Build dynamic SQL
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(todoId);
    
    db.run(
      `UPDATE todos SET ${setClause} WHERE id = ?`,
      values,
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        // Get updated todo
        db.get('SELECT * FROM todos WHERE id = ?', [todoId], (err, updatedRow) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          res.json(formatTodo(updatedRow));
        });
      }
    );
  });
});

// DELETE /api/todos/:id - Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  
  // Validate ID
  const todoId = parseInt(id);
  if (isNaN(todoId)) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }
  
  // Check if todo exists
  db.get('SELECT * FROM todos WHERE id = ?', [todoId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    // Delete todo
    db.run('DELETE FROM todos WHERE id = ?', [todoId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.status(204).send();
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Todo API is running' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Todo API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('CORS enabled for:', allowedOrigins);
  console.log('Available endpoints:');
  console.log('  GET    /api/todos');
  console.log('  POST   /api/todos');
  console.log('  PUT    /api/todos/:id');
  console.log('  DELETE /api/todos/:id');
  console.log('  GET    /health');
});