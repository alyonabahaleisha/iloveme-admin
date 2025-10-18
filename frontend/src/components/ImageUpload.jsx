import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../config/api';

const ImageUpload = ({ onImageProcessed }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const file = acceptedFiles[0];
      const result = await api.uploadImage(file);

      if (result.success) {
        onImageProcessed({
          originalUrl: result.originalUrl,
          processedUrl: result.processedUrl,
          fileName: result.fileName,
          productLink: '',
          productName: '',
          category: 'top',
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <p>Processing image...</p>
            <p className="sub-text">Removing background...</p>
          </div>
        ) : isDragActive ? (
          <p>Drop the image here...</p>
        ) : (
          <div className="upload-prompt">
            <p>Drag & drop product image here</p>
            <p className="sub-text">or click to select file</p>
            <p className="sub-text">Supports: JPEG, PNG, WebP</p>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
