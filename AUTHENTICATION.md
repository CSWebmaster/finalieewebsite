# IEEE SOU SB Admin Authentication System

This document describes the implementation of the secure authentication system for the IEEE SOU SB admin panel.

## Overview

The authentication system provides secure access to the admin dashboard with the following features:

- **Firebase Authentication**: Email/password authentication using Firebase Auth
- **Protected Routes**: Admin routes are protected and require authentication
- **Role-Based Access**: Only authenticated admin users can access admin functionality
- **Security Rules**: Firestore security rules protect admin data
- **User-Friendly Interface**: Clean, modern login interface with proper error handling

## Components

### 1. Authentication Component (`src/components/Authentication.tsx`)

**Features:**
- Email/password login form
- Real-time form validation
- Comprehensive error handling for Firebase auth errors
- Loading states during authentication
- Beautiful glassmorphism design

**Error Handling:**
- `auth/invalid-email`: Invalid email format
- `auth/user-disabled`: Account disabled
- `auth/user-not-found`: No account found
- `auth/wrong-password`: Incorrect password
- `auth/too-many-requests`: Rate limiting
- `auth/network-request-failed`: Network issues

### 2. Protected Route Component (`src/components/ProtectedRoute.tsx`)

**Features:**
- Monitors Firebase authentication state
- Redirects unauthenticated users to login
- Shows loading state during authentication check
- Seamless integration with React Router

### 3. Admin Layout (`src/Admin/AdminLayout.tsx`)

**Features:**
- Logout functionality with confirmation
- Responsive design (mobile and desktop)
- Navigation between admin sections
- Proper error handling for logout

### 4. Firebase Configuration (`src/firebase.ts`)

**Configuration:**
- Environment variable-based configuration
- Firebase services initialization (Auth, Firestore)
- Analytics integration

## Security Implementation

### Firestore Security Rules (`firestore.rules`)

```javascript
// Public read access for frontend display
match /events/{eventId} {
  allow read: if true;
  allow write: if request.auth != null && isAdmin(request.auth.uid);
}

// Admin-only access for write operations
function isAdminDoc(email) {
  return exists(/databases/$(database)/documents/users/$(email)) &&
         get(/databases/$(database)/documents/users/$(email)).data.role == 'admin';
}
```

**Security Features:**
- Public read access for events, awards, and members
- Admin-only write access to all collections
- Role-based access control using Firestore admins collection
- Authentication required for all write operations

### Admin User Management

Admin users are managed through a dedicated `users` collection in Firestore:

```javascript
{
  email: "admin@ieeesousb.org",
  name: "Admin Name",
  role: "admin",
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

## Setup Instructions

### 1. Firebase Project Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Authentication (Email/Password provider)
3. Enable Cloud Firestore
4. Configure security rules using the provided `firestore.rules` file

### 2. Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 3. Admin User Setup

Use the provided setup script to manage admin users:

```bash
# Add a new admin user
node scripts/setup-admin.js add admin@ieeesousb.org "Admin Name"

# List all admin users
node scripts/setup-admin.js list

# Remove an admin user
node scripts/setup-admin.js remove admin@ieeesousb.org
```

**Note:** The setup script requires Firebase Admin SDK service account credentials.

### 4. Service Account Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Replace the placeholder in `scripts/setup-admin.js` with your service account credentials

## Usage

### Login Flow

1. User navigates to `/authentication` route
2. User enters email and password
3. System validates credentials with Firebase
4. On success, user is redirected to `/ieee-admin-portal-sou-2025`
5. Protected routes check authentication state on each visit

### Admin Dashboard Access

- **Route**: `/ieee-admin-portal-sou-2025`
- **Access**: Only authenticated admin users
- **Features**: Events, Awards, Members management
- **Navigation**: Sidebar with dashboard, events, awards, members sections

### Logout Flow

1. User clicks logout button in admin panel
2. Confirmation dialog appears
3. On confirmation, user is signed out
4. User is redirected to authentication page

## Security Best Practices

### Implemented Security Measures

1. **Authentication Required**: All admin routes require Firebase authentication
2. **Role-Based Access**: Only users with admin role can perform write operations
3. **Secure Passwords**: Firebase handles password hashing and security
4. **Rate Limiting**: Firebase provides built-in protection against brute force attacks
5. **Secure Rules**: Firestore rules prevent unauthorized access to admin data

### Additional Security Recommendations

1. **Strong Passwords**: Use strong, unique passwords for admin accounts
2. **Regular Rotation**: Periodically rotate admin passwords
3. **Monitor Access**: Monitor Firebase Authentication logs for suspicious activity
4. **Two-Factor Authentication**: Consider implementing 2FA for additional security
5. **Service Account Security**: Keep service account keys secure and limit their scope

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Firebase project configuration
   - Verify environment variables are set correctly
   - Ensure email/password provider is enabled

2. **Firestore Access Errors**
   - Verify security rules are deployed
   - Check that user has admin role in Firestore
   - Ensure user is authenticated before accessing protected data

3. **Setup Script Errors**
   - Verify service account credentials are correct
   - Check Firebase Admin SDK installation
   - Ensure proper permissions for the service account

### Debug Information

Enable debug logging in Firebase:

```javascript
// Add to src/firebase.ts
import { getAuth } from "firebase/auth";

const auth = getAuth(app);
auth.settings.appVerificationDisabledForTesting = true; // For testing only
```

## Testing

### Manual Testing

1. **Login Flow**: Test with valid and invalid credentials
2. **Protected Routes**: Verify unauthenticated users are redirected
3. **Logout Flow**: Test logout functionality and redirect
4. **Error Handling**: Test various error scenarios

### Automated Testing

Consider adding tests for:
- Authentication component
- Protected route behavior
- Error handling scenarios
- Admin user management

## Future Enhancements

1. **Two-Factor Authentication**: Add 2FA for additional security
2. **Password Reset**: Implement password reset functionality
3. **Session Management**: Add session timeout and refresh
4. **Audit Logging**: Log admin actions for security auditing
5. **User Management UI**: Add admin interface for managing other admins

## Support

For issues related to this authentication system:

1. Check the troubleshooting section above
2. Review Firebase documentation
3. Check browser console for error messages
4. Verify Firebase project configuration

## Security Contact

For security vulnerabilities or concerns, please contact the development team directly.