'use client'

import { useEffect, useState } from "react";
import { Dialog } from "../ui/dialog";
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Loader from "../ui/loader";


interface Category {
    _id: string;
    name: string;
}

interface IntranetEntry {
    _id: string;
    linkUrl: string;
    description: string;
    linkName: string;
    category: Category;
}

interface EditIntranetDialogProps {
    entry: IntranetEntry;
    onClose: () => void;
    onSave: (updatedEntry: IntranetEntry) => void;
}

const EditIntranetDialog: React.FC<EditIntranetDialogProps> = ({ entry, onClose, onSave }) => {

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState(entry.linkUrl);
    const [description, setDescription] = useState(entry.description);
    const [linkName, setLinkName] = useState(entry.linkName);
    const [category, setCategory] = useState<Category>(entry.category);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<Boolean>(false);

    const controls = useAnimation();

    const modalVariants = {
        hidden: {
            opacity: 0,
            y: '100%',
        },
        visible: {
            opacity: 1,
            y: '0%',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 40,
            },
        },
    };

    // Trigger the animation when the component mounts
    useEffect(() => {
        controls.start('visible');
    }, [controls]);


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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(false);
        onSave({
            ...entry,
            linkUrl,
            description,
            linkName,
            category,
        });
    };

    return (
        <div className="absolute  z-[100]  inset-0 bg-black -900  bg-opacity-60 rounded-xl flex justify-center items-center">

            <motion.div
                className="bg-[#0B0D29] z-[100] h-[450px] max-h-screen text-[#D0D3D3] w-[50%] rounded-lg p-8"
                variants={modalVariants}
                initial="hidden"
                animate={controls}
            >
                <div className="flex justify-between w-full">
                    <h2 className="text-sm mb-4">Edit Link</h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm text-white px-4  rounded"
                    >
                        X
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-xs">Link URL:</label>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            required
                            className="block w-full outline-none text-xs p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-xs">Description:</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="block w-full outline-none text-xs p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-xs">Link Name:</label>
                        <input
                            type="text"
                            value={linkName}
                            onChange={(e) => setLinkName(e.target.value)}
                            required
                            className="block text-xs outline-none w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-xs">Category:</label>
                        <select
                            value={category._id}
                            onChange={(e) =>
                                setCategory(categories.find(cat => cat._id === e.target.value) || category)
                            }
                            required
                            className="block w-full outline-none text-xs p-2 border rounded"
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2">

                        <button
                            type="submit"
                            className="bg-[#017A5B] w-full text-sm text-white px-4 py-2 rounded"
                        >
                           {loading?<Loader/>:"Save"} 
                        </button>
                    </div>
                </form>
            </motion.div>
        </div >
    );
};

export default EditIntranetDialog;
