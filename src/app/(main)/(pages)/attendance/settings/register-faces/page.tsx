'use client';
import React, { useState, useEffect } from 'react';
import Loader from '@/components/ui/loader'; // Assuming you have a Loader component

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function RegisterFace() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false); // For showing the loader
  const [error, setError] = useState<string | null>(null);

  // Fetch the users from the organization
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/organization');
        const data = await response.json();
        if (response.ok) {
          setUsers(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const selectedFiles = Array.from(files);
      if (selectedFiles.length > 3) {
        setError('You can only upload up to 3 images');
      } else {
        setError(null); // Clear error if within limits
        setImageFiles(selectedFiles);
      }
    }
  };

  const registerFaces = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (imageFiles.length !== 3) {
      setError('Please upload exactly 3 images');
      return;
    }

    setUploading(true); // Show loader

    try {
      // Step 1: Upload images to S3
      const formData = new FormData();
      imageFiles.forEach((file) => formData.append('files', file));

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadResponse.ok) {
        const imageUrls = uploadData.fileUrls;

        // Step 2: Send the image URLs and user ID to the register API

        const registerResponse = await fetch('/api/register-faces', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUser,
            imageUrls, // Send image URLs to the backend to save to MongoDB
          }),
        });

        const registerData = await registerResponse.json();

        if (registerResponse.ok) {
          console.log('Face details registered successfully:', registerData);
        } else {
          console.error('Error registering face details:', registerData.error);
        }
      } else {
        console.error('Error uploading images:', uploadData.error);
      }
    } catch (err) {
      console.error('Error during registration process:', err);
    } finally {
      setUploading(false); // Hide loader
    }
  };

  return (
    <div className="flex justify-center items-center  bg-transparent p-4">
      <div className="bg-[#1A1C20] mt-24 bg-opacity-90 shadow-xl rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg  text-white mb-4">Register Faces - Upload 3 Images of Employee</h3>

        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="mb-4">
            <select
              className="w-full  border  text-white -700 py-2 px-4 rounded focus:outline-none "
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full  text-white py-2 px-4 rounded focus:outline-none focus:ring focus:border-blue-300"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {imageFiles.length > 0 &&
            imageFiles.map((file, index) => (
              <div key={index} className="relative">
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-auto rounded" />
              </div>
            ))}
        </div>

        {uploading ? (
          <Loader /> // Show loader when uploading
        ) : (
          <button
            onClick={registerFaces}
            className="bg-[#017A5B] text-white font-bold py-2 px-4 rounded w-full"
          >
            Register Face
          </button>
        )}
      </div>
    </div>
  );
}
