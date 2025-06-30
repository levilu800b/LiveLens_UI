# LiveLens Admin Dashboard

A comprehensive admin dashboard built with React, TypeScript, and D3.js for the LiveLens platform. This dashboard provides real-time analytics, content management, user management, and advanced data visualizations.

## Features

### 🎯 Dashboard Overview
- **Real-time Metrics**: Live platform statistics and KPIs
- **Interactive Charts**: D3.js powered visualizations
- **User Analytics**: Detailed user engagement metrics
- **Content Performance**: Track content performance across all types

### 📊 Advanced Analytics
- **Interactive D3.js Charts**:
  - Pie charts for content distribution
  - Bar charts for trending content
  - Line charts for user growth trends
  - Real-time data visualization

### 👥 User Management
- **User Administration**:
  - View all platform users
  - Grant/revoke admin privileges
  - User verification status
  - Account management actions

### 📝 Content Management
- **Content Operations**:
  - Manage all content types (Stories, Films, Podcasts, etc.)
  - Content moderation
  - Status management
  - Bulk operations

## Admin Dashboard Components

### Core Components

#### MetricCard
```tsx
import MetricCard from '../../components/Admin/MetricCard';

<MetricCard
  title="Total Users"
  value={stats.total_users}
  change="+12% this month"
  changeType="positive"
  icon={Users}
  color="blue"
/>
```

#### D3.js Charts

**PieChart**
```tsx
import PieChart from '../../components/Admin/charts/PieChart';

<PieChart
  data={[
    { label: 'Stories', value: 150, color: '#3b82f6' },
    { label: 'Films', value: 75, color: '#ef4444' }
  ]}
  title="Content Distribution"
  width={400}
  height={400}
/>
```

**BarChart**
```tsx
import BarChart from '../../components/Admin/charts/BarChart';

<BarChart
  data={topContent}
  title="Top Performing Content"
  xAxisLabel="Content"
  yAxisLabel="Views"
  width={600}
  height={400}
/>
```

**LineChart**
```tsx
import LineChart from '../../components/Admin/charts/LineChart';

<LineChart
  data={userGrowthData}
  title="User Growth Trend"
  xAxisLabel="Date"
  yAxisLabel="Users"
  color="#3b82f6"
/>
```

## API Integration

The dashboard integrates with real backend APIs to fetch live data:

### AdminService
```typescript
import adminService from '../../services/adminService';

// Get dashboard statistics
const stats = await adminService.getDashboardStats();

// Get content management data
const content = await adminService.getContentManagement({
  content_type: 'stories',
  status: 'published'
});

// Get user management data
const users = await adminService.getUserManagement({
  status: 'active'
});
```

### Available API Endpoints

- `GET /api/admin/stats/` - Dashboard statistics
- `GET /api/admin/content/` - Content management
- `GET /api/admin/users/` - User management
- `GET /api/admin/activities/` - Admin activity logs
- `GET /api/admin/moderation/` - Content moderation queue
- `POST /api/admin/users/{id}/make-admin/` - Grant admin privileges
- `DELETE /api/admin/users/{id}/delete/` - Delete user
- `DELETE /api/admin/content/{type}/{id}/delete/` - Delete content

## Routes

### Admin Routes
- `/admin` or `/admin/dashboard` - Main dashboard
- `/admin/content` - Content management
- `/admin/users` - User management
- `/admin/analytics` - Advanced analytics

### Navigation
The `AdminNavigation` component provides seamless navigation between admin sections with visual indicators for the active page.

## Data Visualization Features

### Interactive Charts
- **Hover Effects**: Detailed tooltips on chart elements
- **Smooth Animations**: Animated chart rendering and transitions
- **Responsive Design**: Charts adapt to different screen sizes
- **Real-time Updates**: Charts update automatically with new data

### Chart Types
1. **Pie Charts**: Content distribution, user status breakdown
2. **Bar Charts**: Top performing content, engagement metrics
3. **Line Charts**: Time-series data like user growth trends

## Security Features

### Authentication & Authorization
- **Admin Route Protection**: Only admin users can access the dashboard
- **JWT Token Management**: Automatic token refresh handling
- **Session Management**: Secure session handling

### Admin Permissions
- **Role-based Access**: Different permission levels for admin users
- **Activity Logging**: All admin actions are logged for audit purposes
- **Secure API Calls**: All API requests include proper authentication headers

## Real-time Data

The dashboard fetches real data from your Django backend:

### Data Sources
- **User Statistics**: From `authapp` models
- **Content Data**: From `stories`, `media_content`, `podcasts`, etc.
- **Engagement Metrics**: Views, likes, comments from interaction models
- **Admin Activities**: From `admin_dashboard.AdminActivity` model

### Auto-refresh
- Dashboard automatically refreshes data
- Manual refresh buttons available
- Error handling for failed requests

## Styling & Theme

### Design System
- **Tailwind CSS**: Utility-first CSS framework
- **Consistent Color Palette**: Blue, green, purple, red themes
- **Responsive Grid**: Mobile-first responsive design
- **Lucide Icons**: Modern icon library

### Visual Hierarchy
- **Card-based Layout**: Clean, organized information display
- **Typography Scale**: Consistent heading and text sizes
- **Spacing System**: Uniform padding and margins
- **Shadow & Borders**: Subtle depth and separation

## Usage Instructions

### 1. Access Admin Dashboard
Navigate to `/admin` while logged in as an admin user.

### 2. Dashboard Overview
- View key metrics and KPIs
- Monitor real-time platform activity
- Check recent admin activities

### 3. Content Management
- Filter and search content
- View engagement statistics
- Manage content status
- Delete inappropriate content

### 4. User Management
- Search and filter users
- Grant/revoke admin privileges
- View user verification status
- Manage user accounts

### 5. Analytics
- Explore detailed platform analytics
- View interactive charts and graphs
- Monitor trends and patterns
- Export data insights

## Development

### Adding New Charts
1. Create chart component in `src/components/Admin/charts/`
2. Import D3.js modules needed
3. Implement responsive design
4. Add hover interactions and tooltips

### Adding New Admin Features
1. Add API service methods in `adminService.ts`
2. Create new page component
3. Add route in `App.tsx`
4. Update `AdminNavigation` component

### Customizing Metrics
Modify the `MetricCard` components in each page to show different KPIs based on your platform's needs.

## Dependencies

### Core
- React 19.1.0
- TypeScript
- React Router Dom 7.0.2

### Visualization
- D3.js 7.9.0
- @types/d3 7.4.3

### UI & Styling
- Tailwind CSS
- Lucide React (icons)
- Framer Motion (animations)

### Data & HTTP
- Axios
- Moment.js

## Performance Considerations

### Optimizations
- **Lazy Loading**: Charts render only when needed
- **Memoization**: React.useMemo for expensive calculations
- **Efficient Re-renders**: Proper dependency arrays in useEffect
- **Data Caching**: Service layer caches API responses

### Best Practices
- **Error Boundaries**: Graceful error handling
- **Loading States**: User feedback during data fetching
- **Progressive Enhancement**: Works without JavaScript
- **Accessibility**: ARIA labels and keyboard navigation

This admin dashboard provides a powerful, real-time interface for managing your LiveLens platform with beautiful D3.js visualizations and comprehensive management tools.
