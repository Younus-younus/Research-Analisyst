"# Research Web Application

A modern research sharing platform built with React, TypeScript, Firebase, and Cloudinary.

## Features

- 🔐 **Authentication**: User registration and login with Firebase Auth
- 📝 **Research Management**: Create, view, and manage research posts
- 📸 **Profile Photos**: Upload profile pictures during registration
- 📄 **Document Upload**: Attach documents to research posts
- 🗂️ **Category Filtering**: Browse research by categories
- 👤 **User Dashboard**: View your own research vs all research
- ⚡ **Professional UI**: Skeleton loading states for better UX
- 💸 **Free Storage**: Cloudinary integration for cost-free file storage

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **File Storage**: Cloudinary (Free Tier)
- **Deployment**: Ready for Vercel/Netlify

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or use existing
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your config values to `.env`

3. Configure Cloudinary (Free Tier):
   - Sign up at [Cloudinary](https://cloudinary.com)
   - Get your cloud name, API key, and API secret
   - Add to `.env` file

4. Optional: Add Gemini API key for AI features

### 4. Firebase Security Rules

Set up Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Research posts are readable by authenticated users
    // Only the author can write/update their posts
    match /research/{researchId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.authorId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
  }
}
```

### 5. Required Firestore Indexes

Create a composite index in Firestore Console:
- Collection: `research`
- Fields: `authorId` (Ascending), `createdAt` (Descending)

### 6. Run the Application

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx
│   └── Skeleton.tsx          # Loading components
├── context/
│   └── AuthContext.tsx       # Authentication state
├── lib/
│   └── supabase.ts          # Firebase configuration
├── pages/
│   ├── CreatePost.tsx
│   ├── DisplayPosts.tsx
│   ├── Home.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── services/
│   └── firebase.ts          # Firebase operations
└── utils/
    └── freeStorage.ts       # Cloudinary integration
```

## Features Overview

### Authentication
- Email/password registration with profile photo upload
- Secure login/logout functionality
- Protected routes and user context

### Research Management
- Create research posts with documents
- Category-based organization
- User-specific and public research views
- Real-time data synchronization

### File Storage
- Cloudinary free tier integration (25GB storage, 25GB bandwidth)
- Automatic file validation and compression
- Secure upload with fallback mechanisms

### User Experience
- Professional skeleton loading states
- Responsive design with Tailwind CSS
- Error handling and user feedback
- Clean, modern interface

## Security Considerations

✅ **Implemented**:
- Environment variables for sensitive data
- Firestore security rules
- Input validation and sanitization
- Secure file upload handling

⚠️ **Important**:
- Never commit `.env` file to repository
- Regularly rotate API keys
- Monitor Cloudinary usage limits
- Review Firebase security rules periodically

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify Deployment
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce bugs

---

**Note**: This project uses free tiers of Firebase and Cloudinary. Monitor usage to avoid unexpected charges." 
