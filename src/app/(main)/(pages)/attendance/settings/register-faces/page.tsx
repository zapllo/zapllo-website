'use client';
import React, { useState, useEffect } from 'react';
import Loader from '@/components/ui/loader'; // Assuming you have a Loader component
import * as Dialog from '@radix-ui/react-dialog';

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
}

interface IFaceRegistrationRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  imageUrls: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export default function RegisterFace() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false); // For showing the loader
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<IFaceRegistrationRequest[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

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

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/face-registration-request');
        const data = await response.json();
        if (response.ok) {
          setRequests(data.requests);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch face registration requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleStatusChange = async (requestId: string, status: 'approved' | 'rejected') => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/approve-face-registration/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }), // Send the appropriate status
      });

      const data = await response.json();
      if (response.ok) {
        setRequests((prevRequests) =>
          prevRequests.filter((request) => request._id !== requestId)
        );
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update request status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  const countRequests = (status: 'pending' | 'approved' | 'rejected') =>
    requests.filter((request) => request.status === status).length;

  return (
    <div className="container mx-auto p-6">
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <div className="flex justify-center w-full">
            <button className="bg-[#017A5B] text-white text-sm py-2 px-4 rounded w-fit mt-2 ml-2">
              Register Faces
            </button>
          </div>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
          <Dialog.Content className="fixed inset-0 flex justify-center items-center">
            <div className="flex justify-center items-center bg-transparent p-4">
              <div className="bg-[#1A1C20] mt-24 bg-opacity-90 shadow-xl rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg text-white mb-4">
                  Register Faces - Upload 3 Images of Employee
                </h3>

                {loading ? (
                  <p>Loading users...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <div className="mb-4">
                    <select
                      className="w-full border text-white py-2 px-4 rounded focus:outline-none"
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
                    className="w-full text-white py-2 px-4 rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {imageFiles.length > 0 &&
                    imageFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-auto rounded"
                        />
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Status Tabs */}
      <div className="tabs mb-6 flex justify-center mt-4 space-x-4">
        <button
          className={`px-4 py-1 h-8 text-xs rounded ${activeTab === 'all' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e]'}`}
          onClick={() => setActiveTab('all')}
        >
          All ({requests.length})
        </button>
        <button
          className={`px-4 py-1 h-8 text-xs rounded  ${activeTab === 'pending' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e]'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({countRequests('pending')})
        </button>
        <button
          className={`px-4 py-1 h-8 text-xs rounded  ${activeTab === 'approved' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e]'}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved ({countRequests('approved')})
        </button>
        <button
          className={`px-4 py-1 h-8 text-xs rounded  ${activeTab === 'rejected' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e]'}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected ({countRequests('rejected')})
        </button>
      </div>

      {/* Request Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-center text-gray-600">No requests found</p>
        ) : (
          <table className="min-w-full table-auto border  text-white">
            <thead>
              <tr className="border text-xs text-left bg-[#1A1C20]">
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Images</th>
                <th className="px-4 py-2 ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request._id} className="border-t text-sm border-gray-600">
                  <td className="px-4 py-2">{request.userId.firstName} {request.userId.lastName}</td>
                  <td className="px-4 py-2">{request.status}</td>
                  <td className="px-4 py-2">
                    <div className="grid grid-cols-3 ">
                      {request.imageUrls.map((url, index) => (
                        <img key={index} src={url} alt="Face" className="w-32 h-24 object-cover rounded" />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {request.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleStatusChange(request._id, 'approved')}
                          className="bg-green-500 text-white py-2 px-4 rounded"
                          disabled={updating}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(request._id, 'rejected')}
                          className="bg-red-500 text-white py-2 px-4 rounded"
                          disabled={updating}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
