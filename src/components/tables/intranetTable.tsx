'use client'

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

interface IntranetTableProps {
    entries: IntranetEntry[];
    fetchEntries: () => Promise<void>;
    selectedCategory: string;
    searchQuery: string;
}

const IntranetTable: React.FC<IntranetTableProps> = ({ entries, fetchEntries, selectedCategory, searchQuery }) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editEntry, setEditEntry] = useState<IntranetEntry | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5); // Default to 5 rows per page

    // Filter entries based on selected category and search query
    const filteredEntries = entries.filter(entry => {
        const matchesCategory = selectedCategory ? entry.category._id === selectedCategory : true;
        const matchesSearch = entry.linkName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredEntries.length / rowsPerPage);
    const indexOfLastEntry = currentPage * rowsPerPage;
    const indexOfFirstEntry = indexOfLastEntry - rowsPerPage;
    const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(event.target.value));
        setCurrentPage(1); // Reset to first page when changing rows per page
    };

    const handleGoToLink = (url: string) => {
        window.open(url, '_blank');
    };

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Link Copied Successfully!");
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
                await fetchEntries();
            } catch (error) {
                console.error('Failed to delete entry:', error);
            }
        }
    };

    return (
        <div className="mt-6">
            <Toaster />

            <table className="w-full border-collapse">
                <thead className='bg-[#017A5B]'>
                    <tr>
                        <th className="rounded-l text-sm font-medium text-start p-2 w-96 px-4">Link Name</th>
                        <th className="text-sm text-start font-medium w-96 p-2 px-4">Category</th>
                        <th className="text-sm w-96 text-start rounded-r font-medium p-2 px-4">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentEntries.map(entry => (
                        <tr key={entry._id}>
                            <td className="px-4 py-2 text-xs">{entry.linkName}</td>
                            <td className="px-4 py-2 text-xs">{entry.category.name}</td>
                            <td className="px-4 py-2 flex mt-1 text-xs space-x-2">
                                <button onClick={() => handleGoToLink(entry.linkUrl)}><Globe className='h-4' /></button>
                                <button onClick={() => handleCopyLink(entry.linkUrl)}><Copy className='h-4' /></button>
                                <button onClick={() => handleEdit(entry)}><Edit className='h-4' /></button>
                                <button onClick={() => handleDeleteClick(entry._id)}><Trash className='h-4' /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                    <span className="mr-2 text-sm">Rows per page:</span>
                    <select
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                        className="px-2 py-1 border rounded"
                    >
                        {[5, 10, 15, 20].map((rows) => (
                            <option key={rows} value={rows}>{rows}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1 mx-1  rounded h"
                    >
                        &lt; 
                    </button>
                    <span className="text-sm">{`Page ${currentPage} of ${totalPages}`}</span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 mx-1 "
                    >
                         &gt;
                    </button>
                </div>
            </div>

            {isEditDialogOpen && editEntry && (
                <EditIntranetDialog
                    entry={editEntry}
                    onClose={() => setIsEditDialogOpen(false)}
                    onSave={async (updatedEntry) => {
                        try {
                            await axios.patch('/api/intranet', {
                                id: updatedEntry._id,
                                linkUrl: updatedEntry.linkUrl,
                                description: updatedEntry.description,
                                linkName: updatedEntry.linkName,
                                category: updatedEntry.category._id,
                            });
                            setIsEditDialogOpen(false);
                            toast.success("Link Updated Successfully!");
                            await fetchEntries();
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
