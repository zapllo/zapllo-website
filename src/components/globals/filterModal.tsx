'use client'

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CrossCircledIcon } from '@radix-ui/react-icons';

interface FilterModalProps {
    isOpen: boolean;
    closeModal: () => void;
    categories: { _id: string; name: string; imgSrc: string }[];
    users: { _id: string; firstName: string; lastName: string; email: string; }[];
    applyFilters: (filters: any) => void;
    initialSelectedCategories: string[]; // New
    initialSelectedUsers: string[]; // New
    initialSelectedFrequency: string[]; // New
    initialSelectedPriority: string[]; // New
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, closeModal, categories, users, applyFilters, initialSelectedCategories, initialSelectedFrequency, initialSelectedPriority, initialSelectedUsers }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelectedCategories);
    const [selectedUsers, setSelectedUsers] = useState<string[]>(initialSelectedUsers);
    const [selectedFrequency, setSelectedFrequency] = useState<string[]>(initialSelectedFrequency);
    const [selectedPriority, setSelectedPriority] = useState<string[]>(initialSelectedPriority);
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

    const handleClearFilters = () => {
        setSelectedCategories([]);
        setSelectedUsers([]);
        setSelectedFrequency([]);
        setSelectedPriority([]);
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
                            className="w-full px-2 py-2 text-[#787CA5] bg-transparent border outline-none  mb-4 rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="grid grid-cols-1 px-2 py-1 max-h-48 h-full overflow-y-scroll scrollbar-hide gap-2">
                            {categories.filter(category => category.name.toLowerCase().includes(lowercasedSearchTerm)).map(category => (
                                <div key={category._id} className="flex gap-2 items-center">
                                    <Avatar className="h-9 w-9 rounded-full flex border-[#815BF5] items-center">
                                        {/* <AvatarImage className='h-6 w-6 ml-1 ' src={`/icons/${category.name.toLowerCase()}.png`} /> */}
                                        <AvatarFallback className="">
                                            <h1 className="text-sm">
                                                {`${category.name}`.slice(0, 1)}
                                                {/* {`${user.lastName}`.slice(0, 1)} */}
                                            </h1>
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* <img src={`/icons/${category.name.toLowerCase()}.png`} /> */}
                                    <div className='flex justify-between w-full p-2'>
                                        <label className="flex items-center justify-between w-full cursor-pointer">
                                            {category.name}
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category._id)}
                                                onChange={() => toggleSelection(selectedCategories, setSelectedCategories, category._id)}
                                                className="mr-2 rounded-full"
                                            />
                                        </label>
                                    </div>
                                </div>
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
                            className="w-full px-2 py-2 bg-transparent outline-none text-[#787CA5]  border mb-4 rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="grid grid-cols-1 gap-2">
                            {users.filter(user => (`${user.firstName} ${user.lastName}`).toLowerCase().includes(lowercasedSearchTerm)).map(user => (
                                <label key={user._id} className='flex justify-between cursor-pointer'>
                                    <div className='flex items-center'>
                                        <div className='h-8 w-8 bg-[#815BF5] text-center text-lg rounded-full'>
                                            <h1 className='mt-[1.5px]'>
                                                {`${user.firstName}`.slice(0, 1)}{`${user.lastName}`.slice(0, 1)}
                                            </h1>
                                        </div>
                                        <div className='ml-2 '>
                                            <div className='flex items-center'>
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <h1 className=' text-xs '>
                                                {user.email}
                                            </h1>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => toggleSelection(selectedUsers, setSelectedUsers, user._id)}
                                        className="mr-2 rounded-full"
                                    />
                                </label>

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
                            className="w-full px-2 py-2 bg-transparent border outline-none text-[#787CA5] mb-4 rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="grid grid-cols-1 gap-2 space-y-4">
                            {['Daily', 'Weekly', 'Monthly', 'Once'].filter(frequency => frequency.toLowerCase().includes(lowercasedSearchTerm)).map(frequency => (
                                <label key={frequency} className="flex justify-between w-full cursor-pointer">
                                    <div className='flex'>
                                        <img src={`/icons/${frequency.toLowerCase()}.png`} alt={frequency} className="mr-2 h-6" />
                                        {frequency}
                                    </div>


                                    {/* <input
                                        type="radio"
                                        checked={selectedFrequency.includes(frequency)}
                                        onChange={() => toggleSelection(selectedFrequency, setSelectedFrequency, frequency)}
                                        className="mr-2"
                                    /> */}
                                    <input
                                        type="checkbox"
                                        checked={selectedFrequency.includes(frequency)}
                                        onChange={() => toggleSelection(selectedFrequency, setSelectedFrequency, frequency)}
                                        className="mr-2 rounded-full"
                                    />
                                </label>
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
                            className="w-full px-2 py-2 bg-transparent outline-none border text-[#787CA5] mb-4 rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="grid grid-cols-1 gap-2 space-y-2">
                            {['High', 'Medium', 'Low'].filter(priority => priority.toLowerCase().includes(lowercasedSearchTerm)).map(priority => (
                                <label key={priority} className="flex justify-between cursor-pointer">
                                    <div className='flex'>
                                        <img src={`/icons/${priority.toLowerCase()}.png`} alt={priority} className="mr-2 h-6" />
                                        {priority}

                                    </div>


                                    <input
                                        type="checkbox"
                                        checked={selectedPriority.includes(priority)}
                                        onChange={() => toggleSelection(selectedPriority, setSelectedPriority, priority)}
                                        className="mr-2 rounded-full"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    const sections = [
        { name: 'Category', imgSrc: '/icons/grid.png' },
        { name: 'Assigned By', imgSrc: '/icons/assigned.png' },
        { name: 'Frequency', imgSrc: '/icons/frequency.png' },
        { name: 'Priority', imgSrc: '/icons/priority.png' },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity">
                    <div className="absolute inset-0 bg-black opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                &#8203;
                <div className="inline-block align-bottom  z-[60] h-[450px] bg-[#0B0D29]  rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-xl sm:w-full ">
                    <div className='flex border-b items-center  py-4  w-full justify-between px-6'>
                        <div>
                            <h3 className="text-lg leading-6  font-medium  text-white ">Filter Tasks</h3>

                        </div>
                        <CrossCircledIcon
                            onClick={closeModal}
                            className="scale-150  cursor-pointer hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]"
                        />
                    </div>
                    <div>

                        <div className="flex">

                            <div className=" border-r h-[400px]  ">
                                <ul className='space-y-2 mt-2  '>
                                    {sections.map((section) => (
                                        <li
                                            key={section.name}
                                            className={`cursor-pointer text-sm px-12 p-3 w-full flex items-center ${activeSection === section.name ? 'bg-[#282D32] ' : ''}`}
                                            onClick={() => {
                                                setActiveSection(section.name);
                                                setSearchTerm('');
                                            }}
                                        >
                                            <img src={section.imgSrc} alt={section.name} className="mr-2 h-4" />
                                            {section.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="w-[60%] p-6  overflow-y-auto scrollbar-hide" style={{ maxHeight: '400px' }}>
                                {renderContent()}

                            </div>


                        </div>
                        <div className=" -mt-24 sm:flex px-6 gap-6 sm:flex-row-reverse">
                            <button
                                type="button"
                                className="inline-flex justify-center  rounded-md border border-transparent px-4 py-2 bg-[#017a5b] text-base leading-6 font-medium text-white shadow-sm hover:bg-[#017a5b] focus:outline-none focus:border-[#017a5b] focus:shadow-outline-green transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                                onClick={handleApplyFilters}
                            >
                                Apply Filters
                            </button>
                            <button
                                type="button"
                                className="inline-flex justify-center w- gap-2  rounded-md border border- px-4 py-2 bg-transparent  text-base leading-6 font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                                onClick={handleClearFilters}
                            >
                                <img src='/icons/clear.png' />    Clear
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FilterModal;
