# Firebase Setup Guide for CampusBuddy

## Firebase Configuration

1. **Update `src/firebase.js`** with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
    apiKey: "AIzaSyBv7wI1mr4P9Ln19b4jTohdPXJ5RRT6Fj0",
  authDomain: "campusbuddycom.firebaseapp.com",
  projectId: "campusbuddycom",
  storageBucket: "campusbuddycom.firebasestorage.app",
  messagingSenderId: "1081054745392",
  appId: "1:1081054745392:web:37900ca1f6a0996b866ef5",
   };
   ```

2. **Enable Firestore Database** in Firebase Console:
   - Go to Firebase Console → Firestore Database
   - Create database in **Test mode** (for development)
   - Set your security rules later for production

## User Data Structure

Users are stored in the `users` collection in Firestore with the following structure:

### Student User Example:
```json
{
  "username": "CS01A001",
  "password": "student123",
  "name": "John Doe",
  "email": "john.doe@college.edu",
  "role": "student",
  "rollNumber": "CS01A001",
  "department": "CSE",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Faculty User Example:
```json
{
  "username": "FAC001",
  "password": "faculty123",
  "name": "Dr. Jane Smith",
  "email": "jane.smith@college.edu",
  "role": "faculty",
  "facultyId": "FAC001",
  "department": "CSE",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### HOD User Example:
```json
{
  "username": "HOD001",
  "password": "hod123",
  "name": "Dr. Robert Johnson",
  "email": "robert.johnson@college.edu",
  "role": "hod",
  "facultyId": "HOD001",
  "department": "CSE",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Admin User Example:
```json
{
  "username": "admin",
  "password": "admin123",
  "name": "Admin User",
  "email": "admin@college.edu",
  "role": "admin",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Adding Users

### Method 1: Using Admin Dashboard (Recommended)
1. Login as admin (username: `admin`, password: `admin123`)
2. Go to Admin Dashboard
3. Click "+ Add New User"
4. Fill in the form and submit

### Method 2: Using Firebase Console
1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `users`
4. Add documents with the structure above

### Method 3: Bulk Import (Using Firebase Console)
1. Go to Firestore Database
2. Click "Import" button
3. Upload a JSON file with user data

## Field Descriptions

- **username** (required): Login ID (Roll Number for students, Faculty ID for faculty/HOD)
- **password** (required): User's password
- **name** (required): Full name of the user
- **email** (optional): Email address
- **role** (required): One of: `student`, `faculty`, `hod`, `admin`
- **rollNumber** (for students): Student roll number
- **facultyId** (for faculty/HOD): Faculty ID
- **department** (optional): Department name (e.g., "CSE", "ECE")
- **createdAt**: Timestamp (automatically added)

## Security Rules (For Production)

Update your Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read, only admins can write
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Other collections
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Testing

1. Add a test user through Admin Dashboard
2. Logout and try logging in with the new credentials
3. Verify the user is redirected to the correct dashboard based on role

## Notes

- Passwords are stored in plain text in Firestore (for simplicity)
- For production, consider using Firebase Authentication with custom claims for roles
- The login system falls back to hardcoded users if Firebase is not configured

