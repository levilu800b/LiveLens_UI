# Admin Dashboard Testing Guide

## Overview
This guide outlines how to test the comprehensive admin dashboard for the LiveLens platform.

## Prerequisites
1. **Backend Running**: Ensure the Django backend is running on `http://localhost:8000`
2. **Frontend Running**: Ensure the React frontend is running on `http://localhost:5173`
3. **Admin User**: You need an admin user account to access the dashboard

## Testing Steps

### 1. Access the Admin Dashboard
- Navigate to `http://localhost:5173/admin/dashboard`
- If not authenticated, you'll be redirected to login
- Login with an admin account

### 2. Dashboard Main Page Tests

#### 2.1 Metrics Cards
The dashboard should display:
- **Total Users**: Current user count with new users today
- **Total Content**: All content across all types
- **Total Engagement**: Combined views, likes, and comments
- **Active Users Today**: Users active in the last 24 hours

#### 2.2 Secondary Metrics
- Total Views, Likes, Comments
- Verified Users count
- Pending Moderation items

#### 2.3 Content Type Breakdown
Individual cards for:
- Stories
- Films  
- Content
- Podcasts
- Animations
- Sneak Peeks
- Live Videos

#### 2.4 D3.js Charts
- **Content Distribution Pie Chart**: Shows breakdown of content types
- **Engagement Breakdown Pie Chart**: Shows distribution of views, likes, comments
- **Top Performing Content Bar Chart**: Shows highest performing content

#### 2.5 Platform Statistics
- **Session Metrics**: Average session duration and bounce rate
- **Email Notifications**: Subscriber stats and email delivery metrics
- **Recent Admin Activities**: Last 5 admin actions with timestamps

#### 2.6 Most Active Content Creators
Table showing users with highest content creation activity

### 3. Navigation Tests

#### 3.1 Admin Navigation Menu
Test navigation to:
- Dashboard (main page)
- Content Management
- User Management  
- Analytics

#### 3.2 Protected Routes
Verify all admin routes are protected and require admin privileges

### 4. Content Management Page Tests

#### 4.1 Content Listing
- View all content across different types
- Filter by content type (Stories, Films, etc.)
- Search functionality
- Status filtering (published, draft, etc.)

#### 4.2 Content Actions
- View content details
- Delete content (with confirmation)
- Feature/unfeature content
- Mark as trending

### 5. User Management Page Tests

#### 5.1 User Listing
- View all users with pagination
- Search users by username/email
- Filter by user status (active, inactive, admin)

#### 5.2 User Actions
- Make user admin
- Remove admin privileges
- Deactivate/activate users
- Delete users (with confirmation)

### 6. Analytics Page Tests

#### 6.1 Extended Analytics
- More detailed D3.js charts
- Time-based analytics
- Content performance metrics
- User engagement trends

#### 6.2 Data Export
- Export analytics data
- Generate reports

### 7. Error Handling Tests

#### 7.1 Network Errors
- Test with backend offline
- Should show appropriate error messages
- Retry functionality should work

#### 7.2 Authentication Errors
- Test with expired tokens
- Should handle token refresh automatically
- Should redirect to login when needed

#### 7.3 Permission Errors
- Test with non-admin user
- Should show access denied messages

### 8. Performance Tests

#### 8.1 Loading States
- Dashboard should show loading indicators
- Charts should render smoothly
- Data refresh should be responsive

#### 8.2 Real-time Updates
- Data should be fetched from live backend
- No mock data should be used
- Refresh button should update all data

### 9. API Integration Tests

#### 9.1 Endpoint Testing
Test these admin endpoints:
- `GET /api/admin-dashboard/stats/` - Dashboard statistics
- `GET /api/admin-dashboard/content/` - Content management
- `GET /api/admin-dashboard/users/` - User management
- `POST /api/admin-dashboard/users/{id}/make-admin/` - Make admin
- `DELETE /api/admin-dashboard/content/{type}/{id}/delete/` - Delete content

#### 9.2 Data Validation
- Verify all data is real from backend
- Check data formatting and types
- Ensure charts render with actual data

### 10. UI/UX Tests

#### 10.1 Responsive Design
- Test on different screen sizes
- Mobile compatibility
- Tablet compatibility

#### 10.2 Accessibility
- Keyboard navigation
- Screen reader compatibility
- Color contrast compliance

#### 10.3 Visual Design
- Charts are visually appealing
- Icons display correctly
- Layout is professional and clean

## Known Issues & Fixes

### 1. Authentication
- Ensure `.env` file has correct `VITE_API_BASE_URL=http://localhost:8000/api`
- Backend must be running on port 8000
- Admin user must be logged in

### 2. CORS
- Backend must allow frontend domain in CORS settings
- Check Django `CORS_ALLOWED_ORIGINS` setting

### 3. Permissions
- User must have `is_staff=True` or admin permissions
- Check backend admin permissions in `admin_dashboard/permissions.py`

## Success Criteria

The admin dashboard is fully functional when:
1. ✅ All pages load without errors
2. ✅ Real data is displayed (not mock data)
3. ✅ D3.js charts render correctly with data
4. ✅ All CRUD operations work
5. ✅ Authentication and authorization work
6. ✅ Error handling is graceful
7. ✅ Performance is acceptable
8. ✅ UI is professional and responsive

## Debugging Tips

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: Verify API calls are made correctly
3. **Check Backend Logs**: Look for Django errors
4. **Verify Authentication**: Ensure token is valid and user is admin
5. **Check Environment**: Verify `.env` variables are loaded

## Additional Features to Test

### Advanced Analytics
- Time-based filtering
- Export functionality
- Real-time data updates

### Content Moderation
- Bulk actions
- Content approval workflow
- Automated moderation rules

### User Analytics
- User activity tracking
- Engagement metrics
- Retention analysis

This comprehensive testing guide ensures that all aspects of the admin dashboard are working correctly with real backend data and provides a professional admin experience for the LiveLens platform.
