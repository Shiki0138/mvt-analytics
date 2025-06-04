#!/bin/bash

echo "🚀 MVT Analytics - Local Development Setup"
echo "========================================"

# Backend setup
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create local database
echo "Setting up local database..."
export DATABASE_URL="sqlite:///mvt_analytics.db"
python -c "
import sqlite3
conn = sqlite3.connect('mvt_analytics.db')
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS sales_simulations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id)
)
''')

# Insert sample data
cursor.execute('''
INSERT OR IGNORE INTO projects (id, name, description) VALUES 
(1, 'サンプル美容室', 'サンプルプロジェクトの説明')
''')

conn.commit()
conn.close()
print('Database setup completed!')
"

echo "✅ Backend setup completed!"
cd ..

# Frontend setup
echo "📦 Setting up Frontend..."
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Clear cache
echo "Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf dist

echo "✅ Frontend setup completed!"
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start development:"
echo "1. Backend: cd backend && source venv/bin/activate && DATABASE_URL=\"sqlite:///mvt_analytics.db\" python main.py"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Backend will run on: http://localhost:8000"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Railway Deployment URL: https://mvt-analytics-production.up.railway.app" 