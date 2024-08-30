'use client'

// components/IntranetTable.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Copy, Edit, Globe, Trash } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import EditIntranetDialog from '../modals/editIntranetDialog';
import DeleteConfirmationDialog from '../modals/deleteConfirmationDialog';

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

// Define the props for the IntranetTable component
interface IntranetTableProps {
    entries: IntranetEntry[];
    fetchEntries: () => Promise<void>;
    selectedCategory: string; // Prop for selected category
    searchQuery: string; // Prop for search query
}

const IntranetTable: React.FC<IntranetTableProps> = ({ entries, fetchEntries, selectedCategory, searchQuery }) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editEntry, setEditEntry] = useState<IntranetEntry | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);


    const handleGoToLink = (url: string) => {
        window.open(url, '_blank');
    };

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Link Copied Successfuly!")
    };

    const handleEdit = (entry: IntranetEntry) => {
        setEditEntry(entry);
        setIsEditDialogOpen(true);
    };


    const handleDeleteClick = (id: string) => {
        setDeleteEntryId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deleteEntryId) {
            try {
                await axios.delete('/api/intranet', { data: { id: deleteEntryId } });
                toast.success('Entry deleted successfully');
                setIsDeleteDialogOpen(false);
                setDeleteEntryId(null);
                await fetchEntries(); // Refresh entries after delete
            } catch (error) {
                console.error('Failed to delete entry:', error);
            }
        }
    };

    // Filter entries based on selected category and search query
    const filteredEntries = entries.filter(entry => {
        const matchesCategory = selectedCategory ? entry.category._id === selectedCategory : true;
        const matchesSearch = entry.linkName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="mt-6">
            <Toaster />

            <table className="w-fit border-collapse">
                <thead className='bg-[#017A5B]'>
                    <tr>
                        <th className=" text-sm font-medium text-start p-2 w-96 px-4">Link Name</th>
                        <th className=" text-sm text-start font-medium w-96 p-2 px-4">Category</th>
                        <th className=" text-sm w-96 text-start font-medium  p-2 px-4">Action</th>
                    </tr>
                </thead>
                <tbody className=''>
                    {filteredEntries.map(entry => (
                        <tr key={entry._id}>
                            {/* <td className="border px-4 py-2">{entry.linkName}</td> */}
                            <td className=" px-4 py-2 text-xs">{entry.linkName}</td>
                            <td className=" px-4 py-2 text-xs">{entry.category.name}</td>
                            <td className=" px-4 py-2 flex mt-1 text-xs space-x-2">
                                <button onClick={() => handleGoToLink(entry.linkUrl)}><Globe className='h-4' /></button>
                                <button onClick={() => handleCopyLink(entry.linkUrl)}><Copy className='h-4' /></button>
                                <button onClick={() => handleEdit(entry)}><Edit className='h-4' /></button>
                                <button onClick={() => handleDeleteClick(entry._id)}><Trash className='h-4' /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isEditDialogOpen && editEntry && (
                // Implement your edit dialog component
                <EditIntranetDialog
                    entry={editEntry}
                    onClose={() => setIsEditDialogOpen(false)}
                    onSave={async (updatedEntry) => {
                        try {
                            await axios.patch('/api/intranet', {
                                id: updatedEntry._id,  // Ensure id is passed correctly
                                linkUrl: updatedEntry.linkUrl,
                                description: updatedEntry.description,
                                linkName: updatedEntry.linkName,
                                category: updatedEntry.category._id,  // Correctly passing the category ID);
                            });
                            setIsEditDialogOpen(false);
                            toast.success("Link Updated Successfully!");
                            await fetchEntries(); // Refresh entries after update
                        } catch (error) {
                            console.error('Failed to update entry:', error);
                        }
                    }}
                />
            )}
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Entry"
                description="Are you sure you want to delete this entry? This action cannot be undone."
            />
        </div>
    );
};

export default IntranetTable;
