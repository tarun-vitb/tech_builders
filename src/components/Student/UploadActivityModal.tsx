import React, { useState } from 'react';
import { X, Upload, FileText, Image, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
// import { getSupabase } from '../../config/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface UploadActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Academic Achievement',
  'Sports & Athletics',
  'Cultural Activity',
  'Community Service',
  'Leadership',
  'Technical Skills',
  'Research Project',
  'Competition',
  'Workshop/Training',
  'Internship',
  'Other'
];

const UploadActivityModal: React.FC<UploadActivityModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    stipend: '',
    companyWorked: '',
    city: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        setError('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF, JPEG, and PNG files are allowed');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !file) {
      setError('User not authenticated or no file selected');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    // Basic validation: if dates provided, endDate should not be before startDate
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        setError('Ending date cannot be before starting date');
        return;
      }
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      console.log('Starting upload process...', { user: user.uid, fileName: file.name, fileSize: file.size });
      
      // Convert file to base64 for storage in Firestore
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      setUploadProgress(50);
      console.log('File converted to base64');

      // Save file metadata and data to Firestore files collection
      try {
        const fileDoc = await addDoc(collection(db, 'files'), {
          uid: user.uid,
          name: file.name,
          size: file.size,
          contentType: file.type,
          data: fileData, // Store base64 data
          createdAt: serverTimestamp()
        });
        console.log('File metadata saved successfully to Firestore');
        setUploadProgress(75);

        // Save activity to Firestore with file reference
        const activityData = {
          studentId: user.uid,
          studentName: user.name || user.email || '',
          studentDepartment: user.department || null, // Include student's department
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          stipend: formData.category === 'Internship' && formData.stipend ? formData.stipend : null,
          companyWorked: formData.category === 'Internship' && formData.companyWorked ? formData.companyWorked : null,
          city: formData.category === 'Internship' && formData.city ? formData.city : null,
          fileId: fileDoc.id, // Reference to the file document
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          status: 'pending',
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'activities'), activityData);
        console.log('Activity saved successfully');
        setUploadProgress(100);

        // Reset form and close modal
        setFormData({ title: '', description: '', category: '', startDate: '', endDate: '', stipend: '', companyWorked: '', city: '' });
        setFile(null);
        setIsUploading(false);
        onClose();
        
        setTimeout(() => setUploadProgress(0), 500);
      } catch (metaErr) {
        console.error('Error saving to Firestore:', metaErr);
        setError('Failed to save activity. Please try again.');
        setIsUploading(false);
        return;
      }
    } catch (outerError) {
      console.error('Unexpected error during upload:', outerError);
      setIsUploading(false);
      setError('Unexpected error during upload. Please try again.');
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setError('');
    
    try {
      // Test Firestore connection by trying to write a test document
      const testDoc = await addDoc(collection(db, 'test'), {
        test: true,
        timestamp: serverTimestamp()
      });
      
      // Clean up the test document
      await deleteDoc(doc(db, 'test', testDoc.id));
      
      setError('Firestore connection test passed! You can now try uploading.');
    } catch (error) {
      console.error('Connection test failed:', error);
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          setError('Firestore access denied. Please check your Firebase rules.');
        } else if (error.message.includes('network')) {
          setError('Network error. Please check your internet connection.');
        } else {
          setError(`Connection test failed: ${error.message}`);
        }
      } else {
        setError('Connection test failed. Please check your Firebase configuration.');
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFormData({ title: '', description: '', category: '', startDate: '', endDate: '', stipend: '', companyWorked: '', city: '' });
      setFile(null);
      setError('');
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 backdrop-blur-md shadow-xl rounded-2xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Upload New Activity</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isUploading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-blue-700">Uploading your activity...</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">{uploadProgress}% complete</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Ending Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {formData.category === 'Internship' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="stipend" className="block text-sm font-medium text-gray-700 mb-2">
                  Stipend
                </label>
                <input
                  type="text"
                  id="stipend"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleInputChange}
                  placeholder="e.g., 15000/month"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label htmlFor="companyWorked" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Worked
                </label>
                <input
                  type="text"
                  id="companyWorked"
                  name="companyWorked"
                  value={formData.companyWorked}
                  onChange={handleInputChange}
                  placeholder="e.g., Tech Builders Ltd."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Bengaluru"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          )}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Activity Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter activity title"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Describe your activity, achievements, and impact"
                required
              />
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                Upload File (PDF, JPG, PNG) *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  {file ? (
                    <div className="flex items-center space-x-2">
                      {file.type === 'application/pdf' ? (
                        <FileText className="h-8 w-8 text-red-500" />
                      ) : (
                        <Image className="h-8 w-8 text-blue-500" />
                      )}
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>
                    </>
                  )}
                  <input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="sr-only"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isUploading || isTestingConnection}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isTestingConnection ? (
                  <>
                    <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <span>Test Connection</span>
                )}
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isUploading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !file}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload Activity</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadActivityModal;