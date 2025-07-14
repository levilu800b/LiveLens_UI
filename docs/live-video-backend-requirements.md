# Live Video Backend API Endpoints

The frontend live video feature requires the following Django backend endpoints to be implemented:

## Required API Endpoints

### 1. Create Live Video
- **URL**: `/api/live-video/live-videos/`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Required (Bearer token)
- **Fields**:
  - `title` (string, required)
  - `description` (string, required)
  - `thumbnail` (file, optional)
  - `is_live` (boolean, required - set to true for immediate live)

**Response**:
```json
{
  "id": "string",
  "title": "string", 
  "description": "string",
  "thumbnail": "string|null",
  "is_live": true,
  "viewer_count": 0,
  "created_at": "ISO datetime",
  "start_time": "ISO datetime",
  "author": {
    "username": "string",
    "first_name": "string", 
    "last_name": "string"
  }
}
```

### 2. Get Current Live Video
- **URL**: `/api/live-video/live-videos/current/`
- **Method**: `GET`
- **Authentication**: Not required
- **Response**: Same as create response, or 404 if no live video

### 3. End Live Video
- **URL**: `/api/live-video/live-videos/{id}/end/`
- **Method**: `POST`
- **Authentication**: Required (Bearer token)
- **Response**: 200 OK

## Django Models Needed

```python
class LiveVideo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='live_videos/thumbnails/', null=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    is_live = models.BooleanField(default=False)
    viewer_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
```

## URL Configuration

Add to your main `urls.py`:
```python
path('api/live-video/', include('live_video.urls')),
```

## App Structure
Create a new Django app called `live_video` with:
- models.py (LiveVideo model)
- serializers.py (LiveVideoSerializer)
- views.py (LiveVideoViewSet with current action)
- urls.py (router configuration)
- permissions.py (IsOwnerOrReadOnly)

## Current Status
❌ Backend endpoints not implemented yet
✅ Frontend UI and service layer ready
✅ Homepage integration completed
✅ Demo mode active for testing

## Demo Mode
The frontend is currently running in demo mode to allow testing of the live video feature without backend implementation:

- **Demo videos** are stored in localStorage
- **Auto-expiry** after 30 minutes
- **Mock data** with realistic viewer counts
- **Full UI experience** including homepage integration
- **Easy testing** without backend setup

To disable demo mode, set `VITE_LIVE_VIDEO_DEMO=false` in your environment variables.
