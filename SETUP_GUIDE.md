# Setup Guide for Student Activity Record System

## Issues Fixed

### 1. Supabase Storage RLS Policy Error
**Problem**: The upload was failing due to missing Row Level Security (RLS) policies in Supabase Storage.

**Solution**: Modified the upload functionality to use Firebase Firestore for file storage instead of Supabase Storage. Files are now stored as base64 data in Firestore, eliminating the need for Supabase configuration.

### 2. Firebase Firestore Index Error
**Problem**: Queries using both `where` and `orderBy` clauses required composite indexes.

**Solution**: Modified queries to fetch data first, then sort in memory to avoid index requirements.

## Current Configuration

### Firebase Setup
The application is already configured with Firebase:
- Project ID: `team-builders-9e6f1`
- Authentication: Google Sign-In enabled
- Firestore: Database for storing activities and files

### File Storage
- Files are now stored as base64 data in Firestore's `files` collection
- Each activity references a file document via `fileId`
- File preview and download functionality is handled by the `FileViewer` component

## How to Test

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Test the upload functionality**:
   - Sign in with Google
   - Click "Upload New Activity"
   - Fill in the form and select a file (PDF, JPG, PNG)
   - Click "Upload Activity"

3. **Verify the upload**:
   - Check that the activity appears in the dashboard
   - Verify that files can be viewed and downloaded
   - Test the faculty review functionality

## Features Working

✅ **File Upload**: Files are stored in Firestore as base64 data
✅ **Activity Management**: Create, view, and manage activities
✅ **Faculty Review**: Approve/reject activities with remarks
✅ **File Preview**: View PDFs and images inline
✅ **File Download**: Download files directly from the interface
✅ **Real-time Updates**: Changes reflect immediately across all dashboards

## Optional: Supabase Setup (Not Required)

If you want to use Supabase Storage in the future, you would need to:

1. Create a Supabase project
2. Set up environment variables:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Create an `uploads` bucket in Supabase Storage
4. Configure RLS policies for the bucket
5. Revert the upload functionality to use Supabase

## Troubleshooting

- **Upload fails**: Check browser console for errors
- **Files not displaying**: Verify Firestore rules allow read access
- **Authentication issues**: Ensure Google Sign-In is properly configured in Firebase

The application should now work without any Supabase dependencies and handle file uploads properly through Firebase Firestore.

