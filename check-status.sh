#!/bin/bash

# LiveLens System Status Check
echo "🔍 LiveLens System Status Check"
echo "================================="

# Check if frontend is running
echo "📱 Frontend Status:"
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running at http://localhost:5173"
else
    echo "❌ Frontend is not running"
    echo "   Run: npm run dev (in livelens_frontend directory)"
fi

echo ""

# Check if backend is running
echo "🖥️  Backend Status:"
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Backend is running at http://localhost:8000"
    
    # Test admin endpoint
    echo "🔐 Admin Dashboard Endpoint:"
    response=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8000/api/admin-dashboard/stats/)
    if [ "$response" = "401" ]; then
        echo "✅ Admin dashboard endpoint is accessible (401 = auth required, which is correct)"
    elif [ "$response" = "200" ]; then
        echo "✅ Admin dashboard endpoint is accessible and returning data"
    else
        echo "⚠️  Admin dashboard endpoint returned HTTP $response"
    fi
else
    echo "❌ Backend is not running"
    echo "   Run: python manage.py runserver (in liveLens_backend directory)"
    echo "   See BACKEND_SETUP_GUIDE.md for detailed setup instructions"
fi

echo ""

# Check admin dashboard
echo "🎛️  Admin Dashboard:"
echo "   URL: http://localhost:5173/admin/dashboard"
if curl -s http://localhost:8000 > /dev/null; then
    echo "   Status: Will show real data from backend"
else
    echo "   Status: Will show demo data (backend not available)"
fi

echo ""
echo "📋 Summary:"
echo "- If both frontend and backend are running: Full functionality"
echo "- If only frontend is running: Demo mode with sample data"
echo "- Admin dashboard gracefully handles both scenarios"

echo ""
echo "🚀 Quick Start:"
echo "1. Frontend: cd livelens_frontend && npm run dev"
echo "2. Backend: cd liveLens_backend && python manage.py runserver"
echo "3. Open: http://localhost:5173/admin/dashboard"
