#!/bin/bash

echo "🚀 Starting MVT Analytics Development Environment"
echo "==============================================="

# Function to kill background processes on exit
cleanup() {
    echo "Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting Backend Server..."
cd backend
source venv/bin/activate
DATABASE_URL="sqlite:///mvt_analytics.db" python main.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Show status
echo ""
echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:8000"
echo "🌐 Railway:  https://mvt-analytics-production.up.railway.app"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait 