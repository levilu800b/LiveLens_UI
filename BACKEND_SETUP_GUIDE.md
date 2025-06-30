# Django Backend Setup Guide

## 🚨 Current Issue
The admin dashboard is currently using demo data because the Django backend is not running. Follow this guide to start the backend and see real data.

## Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Virtual environment (recommended)

## Setup Steps

### 1. Navigate to Backend Directory
```bash
cd /Users/levicharles/Documents/liveLens_backend
```

### 2. Create and Activate Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies
```bash
# Upgrade pip first
pip install --upgrade pip

# Install all required packages
pip install -r requirements.txt
```

### 4. Database Setup
```bash
# Run migrations to set up the database
python manage.py makemigrations
python manage.py migrate

# Create a superuser (admin account)
python manage.py createsuperuser
```

### 5. Start the Development Server
```bash
python manage.py runserver
```

The backend should now be running at `http://localhost:8000`

## Verification Steps

### 1. Test Basic Connectivity
```bash
curl http://localhost:8000/
```

### 2. Test Admin Dashboard Endpoint
```bash
# This should return authentication error (which is expected)
curl http://localhost:8000/api/admin-dashboard/stats/
```

### 3. Access Django Admin
Open `http://localhost:8000/admin/` in your browser and login with the superuser account you created.

## Frontend Integration

### 1. Refresh the Admin Dashboard
Once the backend is running:
1. Go to `http://localhost:5173/admin/dashboard`
2. The yellow demo banner should disappear
3. Real data from your Django backend will be displayed

### 2. Authentication
You'll need to:
1. Login through the frontend with an admin account
2. Or ensure your user has `is_staff=True` in the Django admin

## Troubleshooting

### Common Issues

#### 1. ModuleNotFoundError: No module named 'django'
**Solution**: Make sure you activated the virtual environment and installed requirements:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

#### 2. Database Connection Errors
**Solution**: The default SQLite database should work. If using MySQL/PostgreSQL, update `settings.py`:
```python
# Check DATABASES configuration in app/settings.py
```

#### 3. Migration Errors
**Solution**: Reset migrations if needed:
```bash
python manage.py makemigrations --empty admin_dashboard
python manage.py migrate
```

#### 4. Port Already in Use
**Solution**: Kill existing process or use different port:
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
python manage.py runserver 8001
# Then update frontend .env: VITE_API_BASE_URL=http://localhost:8001/api
```

#### 5. CORS Errors
**Solution**: Ensure CORS is configured in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]
```

### Environment Variables
Check if you need to set any environment variables in the backend. Look for `.env.example` file:
```bash
cp .env.example .env
# Edit .env with your settings
```

## Expected Behavior

### When Backend is Running
- ✅ Dashboard loads real data from Django
- ✅ No yellow demo banner
- ✅ All CRUD operations work
- ✅ Charts show actual content statistics

### When Backend is Not Running
- ⚠️ Dashboard shows demo data
- ⚠️ Yellow banner appears: "Demo Mode: Backend not available"
- ⚠️ Limited functionality (read-only demo data)

## Next Steps

1. **Start Backend**: Follow the setup steps above
2. **Create Test Data**: Add some users, stories, films, etc. through Django admin
3. **Test Admin Dashboard**: Verify all features work with real data
4. **Development**: Both frontend and backend should run simultaneously:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:8000`

## Production Deployment

For production deployment, you'll need to:
1. Set up a proper database (PostgreSQL recommended)
2. Configure environment variables
3. Set up static file serving
4. Configure proper CORS and security settings
5. Use a production WSGI server (gunicorn)

## Support

If you encounter issues:
1. Check the Django console output for error messages
2. Verify all dependencies are installed
3. Ensure database migrations are applied
4. Check CORS configuration
5. Verify authentication settings

The admin dashboard is designed to gracefully handle backend unavailability with demo data, but for full functionality, the Django backend must be running and properly configured.
