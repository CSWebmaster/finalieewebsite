// Firebase Admin Setup Script
// This script helps set up initial admin users in Firebase
// Run this script using: node scripts/setup-admin.js

const admin = require('firebase-admin');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Replace with your Firebase service account key
const serviceAccount = {
  "type": "service_account",
  "project_id": "sbversion-07march",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@sbversion-07march.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40sbversion-07march.iam.gserviceaccount.com"
};

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function setupAdminUser(email, name) {
  try {
    // Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      emailVerified: false,
      password: 'admin123', // Default password - should be changed
      displayName: name,
      disabled: false
    });

    console.log('Successfully created new user:', userRecord.uid);

    // Add user to admins collection in Firestore
    await db.collection('admins').doc(userRecord.uid).set({
      email: email,
      name: name,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null
    });

    console.log('Successfully added user to admins collection');

    return userRecord.uid;
  } catch (error) {
    console.log('Error creating new user:', error);
    throw error;
  }
}

async function listAdminUsers() {
  try {
    const snapshot = await db.collection('admins').get();
    console.log('Current admin users:');
    snapshot.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.data().email} (${doc.data().name})`);
    });
  } catch (error) {
    console.log('Error listing admin users:', error);
  }
}

async function removeAdminUser(email) {
  try {
    // Find user by email in admins collection
    const snapshot = await db.collection('admins').where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('No admin user found with email:', email);
      return;
    }

    // Remove from Firestore
    snapshot.forEach(async (doc) => {
      await db.collection('admins').doc(doc.id).delete();
      console.log('Removed from admins collection:', doc.id);
      
      // Remove from Firebase Authentication
      try {
        await admin.auth().deleteUser(doc.id);
        console.log('Removed from Firebase Authentication:', doc.id);
      } catch (error) {
        console.log('Error removing from Firebase Authentication:', error);
      }
    });
  } catch (error) {
    console.log('Error removing admin user:', error);
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'add':
    if (args.length < 3) {
      console.log('Usage: node setup-admin.js add <email> <name>');
      process.exit(1);
    }
    setupAdminUser(args[1], args[2]).then(() => {
      console.log('Admin user setup complete!');
      process.exit(0);
    }).catch(() => {
      process.exit(1);
    });
    break;

  case 'list':
    listAdminUsers().then(() => {
      process.exit(0);
    });
    break;

  case 'remove':
    if (args.length < 2) {
      console.log('Usage: node setup-admin.js remove <email>');
      process.exit(1);
    }
    removeAdminUser(args[1]).then(() => {
      console.log('Admin user removal complete!');
      process.exit(0);
    });
    break;

  default:
    console.log('Usage:');
    console.log('  node setup-admin.js add <email> <name>    - Add new admin user');
    console.log('  node setup-admin.js list                   - List all admin users');
    console.log('  node setup-admin.js remove <email>         - Remove admin user');
    process.exit(1);
}