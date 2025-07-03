# Blog Dashboard - Professional Blog Management System

A modern, professional blog management dashboard built with Next.js 15, React 19, and Tailwind CSS. This dashboard provides a complete solution for managing blogs with authentication, user management, and a clean, responsive interface.

## Features

### 🔐 Authentication System
- User registration and login
- JWT-based authentication
- Protected routes and role-based access
- Secure password handling

### 📝 Blog Management
- Create, edit, and delete blog posts
- Rich text content editing
- Featured image upload support
- Draft, published, and archived status
- Category and tag management
- SEO-friendly content structure

### 👥 User Management (Admin Only)
- View all registered users
- User role management (Admin/User)
- User account status control
- Search and filter users

### 📊 Dashboard Analytics
- Blog statistics overview
- View counts and engagement metrics
- Recent activity tracking
- Quick action shortcuts

### ⚙️ Settings & Preferences
- Profile management
- Password change functionality
- Notification preferences
- Theme and language settings

## Tech Stack

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running (see ../server directory)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── dashboard/         # Dashboard pages
│   │   ├── blogs/         # Blog management
│   │   ├── users/         # User management (admin)
│   │   └── settings/      # Settings page
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page (redirects)
├── components/            # Reusable components
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── Header.js      # Dashboard header
│   │   └── Sidebar.js     # Navigation sidebar
│   └── ui/                # UI components
│       └── LoadingSpinner.js
├── contexts/              # React contexts
│   └── AuthContext.js     # Authentication context
└── lib/                   # Utility libraries
    ├── api.js             # API client configuration
    └── utils.js           # Helper functions
```

## API Integration

The dashboard connects to a Node.js/Express backend with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Blogs
- `GET /api/blogs` - Get blogs with pagination/filtering
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

### Users (Admin only)
- `GET /api/users` - Get users with pagination/filtering
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Features in Detail

### Authentication Flow
1. Users can register with email, username, and personal details
2. Login with email and password
3. JWT tokens stored in localStorage
4. Automatic token refresh and logout on expiry
5. Protected routes redirect to login if not authenticated

### Blog Management
1. **Create Blog**: Rich form with title, content, category, tags, and featured image
2. **Edit Blog**: Update existing blogs with full editing capabilities
3. **Status Management**: Draft, Published, and Archived states
4. **Media Upload**: Featured image upload with preview
5. **SEO Support**: Meta descriptions and URL-friendly slugs

### User Roles
- **User**: Can manage their own blogs and profile
- **Admin**: Full access to all blogs, user management, and system settings

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly interface
- Optimized for tablets and desktops

## Customization

### Styling
The dashboard uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Global styles in `src/app/globals.css`
- Component-specific styles inline

### Adding New Features
1. Create new pages in `src/app/dashboard/`
2. Add navigation items in `src/components/dashboard/Sidebar.js`
3. Create API endpoints in `src/lib/api.js`
4. Add new contexts in `src/contexts/` if needed

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Security Features

- JWT token-based authentication
- Protected API routes
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure password handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation
- Review the backend API documentation
- Create an issue in the repository

---

**Note**: This dashboard is designed to work with the accompanying Node.js backend. Make sure the backend server is running and properly configured before using the dashboard.