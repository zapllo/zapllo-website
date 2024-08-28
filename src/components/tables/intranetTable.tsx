'use client'

// components/IntranetTable.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';

interface IntranetEntry {
    _id: string;
    linkUrl: string;
    description: string;
    linkName: string;
    category: {
        _id: string;
        name: string;
    };
}

const IntranetTable: React.FC = () => {
    const [entries, setEntries] = useState<IntranetEntry[]>([]);

    useEffect(() => {
        async function fetchEntries() {
            try {
                const response = await axios.get('/api/intranet');
                setEntries(response.data);
            } catch (error) {
                console.error('Failed to fetch intranet entries:', error);
            }
        }

        fetchEntries();
    }, []);

    return (
        <div className="mt-6">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Link Name</th>
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.length > 0 ? (
                        entries.map((entry) => (
                            <tr key={entry._id}>
                                <td className="border p-2">{entry.linkName}</td>
                                <td className="border p-2">{entry.category.name}</td>
                                <td className="border p-2">
                                    <a href={entry.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                        View
                                    </a>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} className="border p-2 text-center">No links available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default IntranetTable;
