# Creating Admin Users for IEEE SOU SB Authentication

## Quick Setup for Testing

Since you're getting authentication failed errors, here's how to quickly set up admin users:

### Method 1: Using Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `sbversion-07march`

2. **Enable Authentication**
   - In the left sidebar, click on "Authentication"
   - Go to the "Sign-in method" tab
   - Enable "Email/Password" provider
   - Click "Save"

3. **Create Admin User**
   - Go to the "Users" tab
   - Click "Add user"
   - Enter:
     - **Email**: `admin@ieeesousb.org`
     - **Password**: `admin123`
   - Click "Add user"

4. **Create Users Collection in Firestore**
   - In the left sidebar, click on "Firestore Database"
   - Click "Create database"
   - Set security rules to "Start in test mode" (for now)
   - Click "Next" → "Enable"

5. **Add User Document**
   - In Firestore, click "Create collection"
   - Collection ID: `users`
   - Document ID: (auto-generated or use the user's UID)
   - Add these fields:
     ```
     email: "admin@ieeesousb.org"
     name: "Admin User"
     role: "admin"
     createdAt: [Server Timestamp]
     ```

### Method 2: Using the Setup Script (Advanced)

If you want to use the setup script:

1. **Get Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Update the Script**
   - Replace the placeholder values in `scripts/setup-admin.js` with your service account credentials
   - Run: `node scripts/setup-admin.js add admin@ieeesousb.org "Admin User"`

## Test Credentials

Once you've set up the admin user, use these credentials:

- **Email**: `admin@ieeesousb.org`
- **Password**: `admin123`

## Accessing the Admin Panel

1. Navigate to: `http://localhost:8080/authentication`
2. Enter the credentials above
3. You should be redirected to: `/ieee-admin-portal-sou-2025`

## Troubleshooting

### If you still get "Authentication failed":

1. **Check Firebase Project**
   - Make sure you're using the correct Firebase project (`sbversion-07march`)
   - Verify the Firebase config in `src/firebase.ts` matches your project

2. **Check Authentication Provider**
   - Ensure "Email/Password" is enabled in Firebase Authentication
   - Check that your user is verified (not disabled)

3. **Check Firestore Rules**
   - For testing, set Firestore rules to allow all reads/writes:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

4. **Clear Browser Cache**
   - Clear your browser cache and cookies
   - Try incognito mode

### If you get "No admin role found":

1. **Check Admins Collection**
   - Verify the `admins` collection exists in Firestore
   - Check that your user's UID matches a document in the admins collection
   - Ensure the document has `role: "admin"`

## Security Note

For production:
- Change the default password (`admin123`)
- Implement proper Firestore security rules
- Consider adding two-factor authentication
- Regularly audit admin access

## Next Steps

Once authentication is working:
1. Test all admin functionality (Events, Awards, Members)
2. Set up proper Firestore security rules
3. Add more admin users as needed
4. Implement password reset functionality