'use client'

// components/IntranetDialog.tsx

import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
    _id: string;
    name: string;
}

const IntranetDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [linkUrl, setLinkUrl] = useState('');
    const [description, setDescription] = useState('');
    const [linkName, setLinkName] = useState('');
    const [category, setCategory] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        // Fetch categories from the server
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/category/get');
                const result = await response.json();
                if (response.ok) {
                    setCategories(result.data);
                } else {
                    console.error('Error fetching categories:', result.error);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axios.post('/api/intranet', {
                linkUrl,
                description,
                linkName,
                category,
            });
            // Handle success (e.g., reset form, show message, etc.)
            onClose(); // Close dialog
        } catch (error) {
            console.error('Failed to create intranet entry:', error);
            // Handle error (e.g., show error message)
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Trigger asChild>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    New Link
                </button>
            </Dialog.Trigger>
            <Dialog.Content className="fixed z-[100] inset-0 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <Dialog.Title className="text-lg font-semibold">Create New Link</Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700">Link URL</label>
                            <input
                                type="url"
                                id="linkUrl"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                required
                                className="mt-1 block w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="mt-1 block w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label htmlFor="linkName" className="block text-sm font-medium text-gray-700">Link Name</label>
                            <input
                                type="text"
                                id="linkName"
                                value={linkName}
                                onChange={(e) => setLinkName(e.target.value)}
                                required
                                className="mt-1 block w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="mt-1 block w-full p-2 border rounded"
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Submit
                        </button>
                        <Dialog.Close asChild>
                            <button className="ml-4 px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300">
                                Close
                            </button>
                        </Dialog.Close>
                    </form>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default IntranetDialog;
