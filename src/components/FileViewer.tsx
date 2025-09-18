import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FileText, Image, Download } from 'lucide-react';

interface FileViewerProps {
  fileId: string;
  fileName: string;
  fileType: string;
  className?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileId, fileName, fileType, className = '' }) => {
  const [fileData, setFileData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const fileDoc = await getDoc(doc(db, 'files', fileId));
        if (fileDoc.exists()) {
          const data = fileDoc.data();
          setFileData(data.data);
        } else {
          setError('File not found');
        }
      } catch (err) {
        console.error('Error fetching file:', err);
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      fetchFile();
    }
  }, [fileId]);

  const handleDownload = () => {
    if (fileData) {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        <span>Loading file...</span>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className={`flex items-center space-x-2 text-red-500 ${className}`}>
        <span>Error: {error || 'File not available'}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* File Link */}
      <div className="flex items-center space-x-2 mb-3">
        {fileType === 'application/pdf' ? (
          <FileText className="h-4 w-4 text-red-500" />
        ) : (
          <Image className="h-4 w-4 text-blue-500" />
        )}
        <a
          href={fileData}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {fileName}
        </a>
        <button
          onClick={handleDownload}
          className="text-gray-500 hover:text-gray-700"
          title="Download file"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* File Preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        {fileType === 'application/pdf' ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">PDF Preview</p>
            <iframe
              src={fileData}
              width="100%"
              height="400"
              className="border rounded"
              title={fileName}
            />
          </div>
        ) : (
          <div className="text-center">
            <img
              src={fileData}
              alt={fileName}
              className="max-w-full max-h-96 mx-auto rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;

