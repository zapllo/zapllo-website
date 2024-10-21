'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Edit, Edit3, Plus, Trash } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { businessCategories } from '@/lib/constants';
import { toast, Toaster } from 'sonner';
import Loader from '@/components/ui/loader';
import DeleteConfirmationDialog from '@/components/modals/deleteConfirmationDialog';

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
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

    useEffect(() => {
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
                setCategories([...categories, response.data.data]);
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
                setCategories(categories.map(cat => cat._id === categoryId ? response.data.data : cat));
                setEditingCategoryId(null);
                setEditCategoryName('');
            } else {
                console.error('Error updating category:', response.data.error);
            }
        } catch (error) {
            console.error('Error updating category:', error);
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

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const handleAddSuggestedCategories = async () => {
        setLoading(true);

        try {
            // Create categories in parallel
            const promises = businessCategories.map(category =>
                axios.post('/api/category/create', { name: category })
            );

            // Wait for all promises to resolve
            const responses = await Promise.all(promises);

            // Update state with new categories
            const newCategories = responses.map(response => response.data.data);
            setCategories([...categories, ...newCategories]);
            toast.success("Categories added successfully");
            setLoading(false);
        } catch (error) {
            console.error('Error creating suggested categories:', error);
            setLoading(false);
        }
    };
    const handleDeleteCategory = async () => {
        if (!deleteEntryId) return; // No ID to delete

        try {
            const response = await axios.delete('/api/category/delete', { data: { categoryId: deleteEntryId } });

            if (response.status === 200) {
                setCategories(categories.filter(cat => cat._id !== deleteEntryId));
                setIsDeleteDialogOpen(false);
                setDeleteEntryId(null); // Clear the ID after deletion
            } else {
                console.error('Error deleting category:', response.data.error);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };


    const handleDeleteClick = (id: string) => {
        setDeleteEntryId(id);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className='p-4'>
            {/* <h1 className='text- text-xl font-medium bg-[#0A0D28]   py-2 rounded px-2'>Category</h1> */}
            <Toaster />
            <div className='flex justify-start bg- rounded '>
                {role === "orgAdmin" && (
                    <div className="flex justify-center w-full">
                        <div className='mt-4  flex justify-center '>
                            {/* <Label>Add a New Category</Label> */}
                            <input
                                type="text"
                                placeholder="Add New Category"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full outline-none text-xs text-white bg-[#0A0D28] border rounded px-3 py-2"
                            />
                        </div>
                        <div className='mt-4'>
                            <button
                                onClick={handleCreateCategory}
                                className="ml-2 px-3 py-2  bg-[#815BF5] text-sm text-white rounded"
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>

                    </div>
                )}

            </div>
            <div className='flex gap-2 border rounded-lg w-fit hover:bg-[#815BF5]  mt-2 px-4 py-2 cursor-pointer' onClick={handleAddSuggestedCategories}>
                <h1 className='text-xs'>Add Suggested Categories</h1>
                <Plus className='h-4' />
            </div>
            <div className={`${loading ? "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" : ""}`}>
                {loading ? <Loader /> : ''}
            </div>

            <div className="flex justify-start bg-[#0A0D28] w-full mt-12">
                {/* <Label>Search Categories</Label> */}
                <h1 className='text-start text-sm font-medium  p-4'>Categories</h1>
                <div className='mt-1 ml-auto'>
                    <input
                        type="text"
                        placeholder="Search Categories"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className=" outline-none text-xs text-white bg-[#0B0D29] border rounded px-4 py-3 mx-4"
                    />
                </div>
            </div>


            <div className="mt-4 grid grid-cols-3 gap-4">
                {filteredCategories.map((cat) => (
                    <div key={cat._id} className="border px-2 py-1 text-sm">
                        {editingCategoryId === cat._id ? (
                            <div>
                                <input
                                    type="text"
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    className="w-full text-white outline-none bg-transparent border rounded px-3 py-2"
                                />
                                <button
                                    onClick={() => handleEditCategory(cat._id)}
                                    className="ml-2 bg-[#007A5A] hover:bg-[#007A5A] mt-2 px-3 py-2  text-white rounded"
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
                                {getCategoryIcon(cat.name) ? (
                                    <img
                                        src={getCategoryIcon(cat?.name) as string} // Type assertion
                                        alt={cat.name}
                                        className="w-4 h-4 ml-2 mt2"
                                    />
                                ) : (
                                    <FallbackImage name={cat.name} />
                                )}
                                <span className='text-sm'>{cat.name}</span>
                                {role === "orgAdmin" && (
                                    <div>
                                        <button
                                            onClick={() => {
                                                setEditingCategoryId(cat._id);
                                                setEditCategoryName(cat.name);
                                            }}
                                            className="px-3 py-2 bg-warning text-white rounded"
                                        >
                                            <Edit3 className='h-4 text-blue-400' />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(cat._id)}
                                            className="ml-2 px-3 py-2 bg-danger text-white rounded"
                                        >
                                            <Trash className='h-4 text-red-500' />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteCategory}
                title="Delete Task"
                description="Are you sure you want to delete this category? This action cannot be undone."
            />
        </div>
    );
};

export default Categories;


interface FallbackImageProps {
    name: string; // Define the type of 'name'
}

const FallbackImage: React.FC<FallbackImageProps> = ({ name }) => {
    const initial = name.charAt(0).toUpperCase(); // Get the first letter of the category name
    return (
        <div className="bg-[#282D32] rounded-full h-8 w-8 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{initial}</span>
        </div>
    );
};


const getCategoryIcon = (categoryName: String) => {
    switch (categoryName) {
        case 'Automation':
            return '/icons/intranet.png';
        case 'Customer Support':
            return '/icons/support.png';
        case 'Marketing':
            return '/icons/marketing.png';
        case 'Operations':
            return '/icons/operations.png';
        case 'Sales':
            return '/icons/sales.png';
        case 'HR':
            return '/icons/attendance.png';
        default:
            return null; // Or a default icon if you prefer
    }
};