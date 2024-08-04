'use client'


import React, { useState, useEffect } from 'react';
import { getData } from 'country-list';
import { Country, State } from 'country-state-city';
import Flag from 'react-world-flags';

const CustomDropdown = ({ options, selectedValue, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter options based on the search query
    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (value) => {
        onSelect(value);
        setSearchQuery(''); // Clear search input
        setIsOpen(false);   // Close dropdown
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="block bg-[#2F0932] w-full outline-none p-2 border rounded flex items-center justify-between"
            >
                {selectedValue ? (
                    <div className="flex items-center">
                        <Flag code={selectedValue.code} style={{ width: '24px', height: '16px', marginRight: '8px' }} />
                        {selectedValue.name}
                    </div>
                ) : (
                    'Select an option'
                )}
            </button>
            {isOpen && (
                <div className="absolute bg-black border rounded mt-1 w-full max-h-60 scrollbar-hide overflow-auto">
                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search country.."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full p-2 outline-none border-b bg-[#2F0932] text-white"
                    />
                    {/* List of options */}
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.code}
                                onClick={() => handleSelect(option)}
                                className="cursor-pointer p-2 hover:bg-[#201024] flex items-center"
                            >
                                <Flag code={option.code} style={{ width: '24px', height: '16px', marginRight: '8px' }} />
                                {option.name}
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-gray-500">No options found</div>
                    )}
                </div>
            )}
        </div>
    );
};


const CountryDropdown = () => {
    const [formData, setFormData] = useState({ country: '', state: '' });
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);

    useEffect(() => {
        // Fetch countries using country-list
        const countryData = getData();
        setCountries(countryData);
    }, []);

    useEffect(() => {
        if (formData.country) {
            // Fetch states using country-state-city
            const selectedCountry = Country.getCountryByCode(formData.country);
            const stateData = State.getStatesOfCountry(selectedCountry.isoCode);
            setStates(stateData);
            setSelectedCountry({ code: formData.country, name: selectedCountry.name });
        }
    }, [formData.country]);

    const handleCountrySelect = (country) => {
        setFormData({ ...formData, country: country.code });
    };

    const handleStateSelect = (e) => {
        const { value } = e.target;
        setFormData({ ...formData, state: value });
    };

    return (
        <div>
            <label className="block my-4">
                <span className="">Country:</span>
                <CustomDropdown
                    options={countries}
                    selectedValue={selectedCountry}
                    onSelect={handleCountrySelect}
                />
            </label>
            <label className="block my-4">
                <span className="">State:</span>
                <select
                    name="state"
                    value={formData.state}
                    onChange={handleStateSelect}
                    className="block bg-[#2F0932] w-full outline-none mt-1 p-2 border rounded"
                >
                    <option value="">Select State</option>
                    {states.map((state) => (
                        <option key={state.isoCode} value={state.name}>
                            {state.name}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
};
export default CountryDropdown;
