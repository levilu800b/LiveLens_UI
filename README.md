# LiveLens Frontend 🎬

A comprehensive React-based frontend for the LiveLens content management and streaming platform. LiveLens is a full-featured content platform that supports multiple media types including stories, films, podcasts, animations, live videos, and sneak peeks.

## 🚀 Overview

LiveLens Frontend is a modern React application built with TypeScript that provides a complete user interface for content consumption and administrative management. The platform supports both regular users and administrators with distinct interfaces and capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [User Types & Permissions](#user-types--permissions)
- [Content Types](#content-types)
- [Admin Dashboard](#admin-dashboard)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Authentication](#authentication)
- [Testing](#testing)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- **Multi-Media Content Platform**: Support for stories, films, podcasts, animations, live videos, and sneak peeks
- **Responsive Design**: Mobile-first approach with full desktop support
- **Real-time Updates**: Live content streaming and real-time analytics
- **Advanced Search & Filtering**: Content discovery with multiple filter options
- **User Management**: Complete user registration, authentication, and profile management
- **Content Interaction**: Like, comment, share, and favorite content
- **Progressive Web App**: Offline support and app-like experience

### User Experience
- **Personalized Dashboard**: Customized content recommendations
- **Library Management**: Personal content library with favorites and history
- **Responsive Media Players**: Custom video, audio, and story readers
- **Dark/Light Theme**: User preference-based theming
- **Social Features**: User interactions and engagement tracking

### Admin Features
- **Comprehensive Admin Dashboard**: Real-time analytics and platform insights
- **Content Management**: Create, edit, and manage all content types
- **User Administration**: User management with role-based permissions
- **Analytics & Reporting**: Advanced analytics with data export capabilities
- **Bulk Operations**: Efficient content and user management tools
- **Moderation Tools**: Comment and content moderation system

## 🛠 Tech Stack

### Frontend Framework
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript**: Type-safe development with strict typing
- **Vite**: Fast build tool and development server
- **React Router DOM**: Client-side routing with protected routes

### UI/UX Libraries
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Modern icon library with consistent design
- **Framer Motion**: Animation library for smooth interactions
- **Material Tailwind**: Component library for enhanced UI elements

### State Management
- **Redux Toolkit**: Predictable state container with modern Redux patterns
- **React Redux**: React bindings for Redux
- **Unified Auth System**: Custom authentication state management

### Data Visualization
- **D3.js**: Custom charts and data visualization
- **Recharts**: React charting library for admin analytics
- **Custom Chart Components**: Pie charts, bar charts, and line graphs

### Media & Content
- **Custom Media Players**: Video, audio, and story readers
- **Image Optimization**: Responsive image handling
- **File Upload**: Drag-and-drop file upload with progress tracking

### Development Tools
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Cypress**: End-to-end testing framework
- **TypeScript Strict Mode**: Enhanced type checking

## 📁 Project Structure

```
livelens_frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Admin/          # Admin-specific components
│   │   │   ├── charts/     # Data visualization components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   └── BulkActionsBar.tsx
│   │   ├── Auth/           # Authentication components
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AdminRoute.tsx
│   │   ├── Common/         # Shared components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── ToastContainer.tsx
│   │   ├── Content/        # Content-specific components
│   │   ├── Header/         # Navigation components
│   │   ├── Footer/         # Footer components
│   │   └── MainLayout/     # Main application layout
│   ├── pages/              # Page components
│   │   ├── Admin/          # Admin dashboard pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── ContentManagement.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   └── Add*/Edit* Pages
│   │   ├── Auth/           # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── PasswordReset.tsx
│   │   ├── Home/           # Homepage
│   │   ├── Media/          # Media content pages
│   │   ├── User/           # User profile pages
│   │   └── [ContentType]/  # Content-specific pages
│   ├── services/           # API service layer
│   │   ├── adminService.ts
│   │   ├── authService.ts
│   │   ├── mediaService.ts
│   │   └── api.ts
│   ├── store/              # Redux store configuration
│   │   ├── index.ts
│   │   └── reducers/
│   ├── utils/              # Utility functions
│   │   ├── unifiedAuth.ts
│   │   └── secureAuth.ts
│   ├── types/              # TypeScript type definitions
│   ├── hooks/              # Custom React hooks
│   ├── constants/          # Application constants
│   └── config/             # Configuration files
├── public/                 # Static assets
├── cypress/                # E2E tests
├── docs/                   # Documentation
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🔧 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Setup Steps

1. **Clone the repository**
```bash
git clone [repository-url]
cd livelens_frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment configuration**
```bash
cp .env.example .env.local
```

4. **Configure environment variables**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_MEDIA_BASE_URL=http://localhost:8000/media

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Feature Flags
VITE_ENABLE_LIVE_STREAMING=true
VITE_ENABLE_ANALYTICS=true
```

5. **Start development server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## ⚙️ Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Backend API endpoint
- `VITE_MEDIA_BASE_URL`: Media files base URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_ENABLE_LIVE_STREAMING`: Enable live streaming features
- `VITE_ENABLE_ANALYTICS`: Enable analytics features

### Build Configuration
The project uses Vite for fast development and optimized production builds:
- Hot Module Replacement (HMR)
- TypeScript compilation
- Asset optimization
- Code splitting

## 🎯 Usage

### For End Users

1. **Registration & Authentication**
   - Sign up with email/password or Google OAuth
   - Email verification process
   - Password reset functionality

2. **Content Consumption**
   - Browse content by category
   - Search and filter content
   - Watch videos, read stories, listen to podcasts
   - Interact with content (like, comment, share)

3. **Personal Management**
   - Manage personal library
   - Update profile settings
   - View favorites and history

### For Administrators

1. **Access Admin Dashboard**
   - Navigate to `/admin` after logging in as admin
   - View real-time platform analytics
   - Monitor user engagement and content performance

2. **Content Management**
   - Create and edit all content types
   - Bulk operations for efficiency
   - Content moderation and approval

3. **User Administration**
   - Manage user accounts
   - Set user permissions
   - Monitor user activity

## 👥 User Types & Permissions

### Regular Users
- **Capabilities**: View content, interact with content, manage personal library
- **Restrictions**: Cannot create content, cannot access admin features
- **Authentication**: Email/password or Google OAuth

### Content Creators
- **Capabilities**: All user capabilities + create and manage own content
- **Restrictions**: Limited to own content management
- **Authentication**: Verified account required

### Administrators
- **Capabilities**: Full platform access, user management, content moderation
- **Restrictions**: None
- **Authentication**: Admin account with elevated permissions

## 📺 Content Types

### Stories
- **Format**: Text-based content with pagination
- **Features**: Reading time estimation, bookmarks, comments
- **Categories**: Fiction, non-fiction, tech, lifestyle, etc.

### Films
- **Format**: Video content with streaming capabilities
- **Features**: Multiple quality options, subtitles, series support
- **Metadata**: Director, cast, ratings, runtime

### Podcasts
- **Format**: Audio content with episode management
- **Features**: Playlist support, download options, transcripts
- **Series**: Episode numbering, season management

### Animations
- **Format**: Video content with animation-specific metadata
- **Features**: Frame rate options, production details, voice actors
- **Types**: 2D, 3D, motion graphics, stop motion

### Live Videos
- **Format**: Real-time streaming content
- **Features**: Live chat, viewer count, recording options
- **Scheduling**: Advance scheduling, automatic notifications

### Sneak Peeks
- **Format**: Preview content for upcoming releases
- **Features**: Teasers, trailers, behind-the-scenes content
- **Marketing**: Engagement tracking, release date management

## 📊 Admin Dashboard

### Dashboard Overview
- **Real-time Metrics**: User count, content statistics, engagement data
- **Visual Analytics**: Charts and graphs for data visualization
- **Quick Actions**: Common administrative tasks
- **Activity Monitor**: Recent platform activity

### Analytics Features
- **Content Performance**: Views, likes, comments, shares
- **User Engagement**: Active users, session duration, retention
- **Export Capabilities**: CSV, PDF export for reports
- **Date Range Filtering**: Custom date range analysis

### Content Management
- **Bulk Operations**: Mass content operations
- **Status Management**: Draft, published, archived states
- **Moderation Queue**: Pending content review
- **Search & Filter**: Advanced content discovery

## 🔌 API Integration

### Service Layer Architecture
The application uses a service layer pattern for API communication:

```typescript
// Example API service
class AdminService {
  async getDashboardStats(): Promise<DashboardStats> {
    return this.makeRequest<DashboardStats>('stats/');
  }

  async createContent(data: ContentData): Promise<Content> {
    return this.makeRequest<Content>('content/', 'POST', data);
  }
}
```

### Error Handling
- Centralized error handling
- User-friendly error messages
- Retry mechanisms for failed requests
- Loading states and progress indicators

## 🗄️ State Management

### Redux Store Structure
```typescript
interface RootState {
  user: UserState;
  ui: UIState;
  content: ContentState;
  admin: AdminState;
}
```

### Key Reducers
- **User**: Authentication, profile, preferences
- **UI**: Theme, notifications, modal states
- **Content**: Content cache, favorites, history
- **Admin**: Dashboard data, management states

## 🔐 Authentication

### Authentication Flow
1. User submits credentials
2. Backend validates and returns JWT tokens
3. Tokens stored securely in localStorage
4. Automatic token refresh
5. Protected routes enforce authentication

### Security Features
- JWT token-based authentication
- Automatic token refresh
- Route protection
- Role-based access control
- Secure logout with token cleanup

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API integration and user flow tests
- **E2E Tests**: Complete user journey testing with Cypress

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run cypress:open

# Test coverage
npm run test:coverage
```

## 🔨 Development

### Development Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Code Quality
- ESLint configuration for TypeScript
- Prettier for consistent formatting
- Pre-commit hooks for code quality
- TypeScript strict mode enabled

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Build outputs to dist/ directory
# Assets are optimized and minified
# Source maps generated for debugging
```

### Deployment Options
- **Vercel**: Zero-configuration deployment
- **Netlify**: Continuous deployment from Git
- **AWS S3 + CloudFront**: Scalable static hosting
- **Docker**: Containerized deployment

### Environment-Specific Builds
- Development: Full source maps, debugging enabled
- Staging: Optimized build with debugging
- Production: Fully optimized, minified build

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run quality checks
6. Submit a pull request

### Code Standards
- TypeScript strict mode
- Consistent component structure
- Proper error handling
- Comprehensive documentation
- Test coverage for new features

### Pull Request Process
1. Ensure CI passes
2. Update documentation
3. Add changeset entry
4. Request review from maintainers
5. Address feedback
6. Merge after approval

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` directory
- Review the FAQ section
- Contact the development team

---

**LiveLens Frontend** - Built with ❤️ using React, TypeScript, and modern web technologies.
