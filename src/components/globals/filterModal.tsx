'use client'

import React, { useState } from 'react';

interface FilterModalProps {
    isOpen: boolean;
    closeModal: () => void;
    categories: { _id: string; name: string }[];
    users: { _id: string; firstName: string; lastName: string }[];
    applyFilters: (filters: any) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, closeModal, categories, users, applyFilters }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [selectedFrequency, setSelectedFrequency] = useState<string[]>([]);
    const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
    const [activeSection, setActiveSection] = useState<string>('Category');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const toggleSelection = (selectedItems: string[], setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
        if (selectedItems.includes(item)) {
            setSelectedItems(selectedItems.filter(i => i !== item));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleApplyFilters = () => {
        applyFilters({
            categories: selectedCategories,
            users: selectedUsers,
            frequency: selectedFrequency,
            priority: selectedPriority,
        });
        closeModal();
    };

    const renderContent = () => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        switch (activeSection) {
            case 'Category':
                return (
                    <div>
                        <input
                            type="text"
                            placeholder="Search categories"
                            className="w-1/2 px-2 py-1 mb-4 border rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="grid grid-cols-1 max-h-48 h-full overflow-y-scroll gap-2">
                            {categories.filter(category => category.name.toLowerCase().includes(lowercasedSearchTerm)).map(category => (
                                <button
                                    key={category._id}
                                    onClick={() => toggleSelection(selectedCategories, setSelectedCategories, category._id)}
                                    className={`px-2 py-1 w-1/2 border rounded-md ${selectedCategories.includes(category._id) ? 'bg-primary -500 text-white' : 'bg-gray-800 '}`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'Assigned By':
                return (
                    <div>
                        <input
                            type="text"
                            placeholder="Search users"
                            className="w-1/2 px-2 py-1 mb-4 border rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="grid grid-cols-3 gap-2">
                            {users.filter(user => (`${user.firstName} ${user.lastName}`).toLowerCase().includes(lowercasedSearchTerm)).map(user => (
                                <button
                                    key={user._id}
                                    onClick={() => toggleSelection(selectedUsers, setSelectedUsers, user._id)}
                                    className={`px-2 py-1 border rounded-md ${selectedUsers.includes(user._id) ? 'bg-primary -500 text-white' : 'bg-gray-800'}`}
                                >
                                    {user.firstName} {user.lastName}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'Frequency':
                return (
                    <div>
                        <input
                            type="text"
                            placeholder="Search frequency"
                            className="w-1/2 px-2 py-1 mb-4 border rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                            {['Daily', 'Weekly', 'Monthly', 'Once'].filter(frequency => frequency.toLowerCase().includes(lowercasedSearchTerm)).map(frequency => (
                                <button
                                    key={frequency}
                                    onClick={() => toggleSelection(selectedFrequency, setSelectedFrequency, frequency)}
                                    className={`px-2 py-1 border rounded-md ${selectedFrequency.includes(frequency) ? 'bg-primary -500 text-white' : 'bg-gray-800'}`}
                                >
                                    {frequency}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'Priority':
                return (
                    <div>
                        <input
                            type="text"
                            placeholder="Search priority"
                            className="w-1/2  px-2 py-1 mb-4 border rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                            {['High', 'Medium', 'Low'].filter(priority => priority.toLowerCase().includes(lowercasedSearchTerm)).map(priority => (
                                <button
                                    key={priority}
                                    onClick={() => toggleSelection(selectedPriority, setSelectedPriority, priority)}
                                    className={`px-2 py-1 border rounded-md ${selectedPriority.includes(priority) ? 'bg-primary -500 text-white' : 'bg-gray-800'}`}
                                >
                                    {priority}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity">
                    <div className="absolute inset-0 bg-black opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                &#8203;
                <div className="inline-block align-bottom bg-black border rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
                    <div className="flex">
                        <div className="w-1/4 border-r">
                            <h3 className="text-lg leading-6 font-medium text-white mb-4">Filter Tasks</h3>
                            <ul>
                                {['Category', 'Assigned By', 'Frequency', 'Priority'].map(section => (
                                    <li
                                        key={section}
                                        className={`cursor-pointer p-2 ${activeSection === section ? 'bg-gray-800' : ''}`}
                                        onClick={() => {
                                            setActiveSection(section);
                                            setSearchTerm('');
                                        }}
                                    >
                                        {section}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-3/4 p-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
                            {renderContent()}
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:flex gap-6 sm:flex-row-reverse">
                        <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-green-700 text-base leading-6 font-medium text-white shadow-sm hover:bg-green-400 focus:outline-none focus:border-green-700 focus:shadow-outline-green transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                            onClick={handleApplyFilters}
                        >
                            Apply Filters
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:mt-0 sm:text-sm sm:leading-5"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
