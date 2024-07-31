'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Edit, Edit2, Edit3, EditIcon, Trash, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Category {
    _id: string;
    name: string;
    organization: string;
}

const Categories: React.FC = () => {
    const [newCategory, setNewCategory] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editCategoryName, setEditCategoryName] = useState<string>('');
    const [role, setRole] = useState("role");
    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);


    useEffect(() => {
        // Fetch categories from the server
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/category/get');
                if (response.status === 200) {
                    setCategories(response.data.data);
                } else {
                    console.error('Error fetching categories:', response.data.error);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    console.log(categories, 'categories??????');

    const handleCreateCategory = async () => {
        if (!newCategory) return;

        setLoading(true);

        try {
            const response = await axios.post('/api/category/create', { name: newCategory });

            if (response.status === 200) {
                // Add the new category to the categories list
                setCategories([...categories, response.data.data]);
                // Clear the new category input
                setNewCategory('');
                setLoading(false);

            } else {
                console.error('Error creating category:', response.data.error);
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const handleEditCategory = async (categoryId: string) => {
        if (!editCategoryName) return;

        try {
            const response = await axios.patch('/api/category/edit', { categoryId, name: editCategoryName });

            if (response.status === 200) {
                // Update the category in the list
                setCategories(categories.map(cat => cat._id === categoryId ? response.data.data : cat));
                // Clear the editing state
                setEditingCategoryId(null);
                setEditCategoryName('');
            } else {
                console.error('Error updating category:', response.data.error);
            }
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            const response = await axios.delete('/api/category/delete', { data: { categoryId } });

            if (response.status === 200) {
                // Remove the category from the list
                setCategories(categories.filter(cat => cat._id !== categoryId));
            } else {
                console.error('Error deleting category:', response.data.error);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    useEffect(() => {
        const getUserDetails = async () => {
            const res = await axios.get('/api/users/me');
            const user = res.data.data;
            setRole(user.role);
            const trialStatusRes = await axios.get('/api/organization/trial-status');
            setIsTrialExpired(trialStatusRes.data.isExpired);
        };
        getUserDetails();
    }, []);

    if (isTrialExpired) {
        return (
            <div className='p-4 text-center mt-32'>
                <h1 className='text-xl font-bold text-red-500'>Your trial has expired!</h1>
                <p>Please purchase a subscription to continue using the Task Management features.</p>
                <Link href='/dashboard/billing'>
                    <Button className='h-10 bg-white text-black hover:text-white mt-4 text-lg '>👑 Upgrade to Pro</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className='p-4'>
            <h1 className='text-center text-2xl font-bold mb-8 bg-secondary py-2'>Task Categories</h1>
            <div className='flex justify-center bg- rounded '>
                {role === "orgAdmin" && (
                    <div className="flex justify-center">
                        <div className=''>
                            <Label>Add a New Category</Label>
                            <Input
                                type="text"
                                placeholder="New Category"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full text-black border rounded px-3 py-2"
                            />
                        </div>
                        <div className='mt-auto'>
                            <button
                                onClick={handleCreateCategory}
                                className="ml-2   px-3 py-2 bg-primary text-white rounded"
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>

                    </div>
                )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <div key={cat._id} className="border px-2 py-2">
                        {editingCategoryId === cat._id ? (
                            <div>
                                <Input
                                    type="text"
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    className="w-full text-black border rounded px-3 py-2"
                                />
                                <button
                                    onClick={() => handleEditCategory(cat._id)}
                                    className="ml-2 mt-2 px-3 py-2 bg-primary text-white rounded"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingCategoryId(null)}
                                    className="ml-2 px-3 py-2 bg-secondary text-white rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span>{cat.name}</span>
                                {role === "orgAdmin" && (
                                    <div>
                                        <button
                                            onClick={() => {
                                                setEditingCategoryId(cat._id);
                                                setEditCategoryName(cat.name);
                                            }}
                                            className="px-3 py-2 bg-warning text-white rounded"
                                        >
                                            <Edit3 />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat._id)}
                                            className="ml-2 px-3 py-2 bg-danger text-white rounded"
                                        >
                                            <Trash />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Categories;
