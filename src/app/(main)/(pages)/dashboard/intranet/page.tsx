// pages/intranet.tsx
'use client'

import IntranetDialog from '@/components/modals/intranetModal';
import IntranetTable from '@/components/tables/intranetTable';
import { useState } from 'react';


const IntranetPage: React.FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="p-6 mt-12">
            <IntranetDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
            <IntranetTable />
        </div>
    );
};

export default IntranetPage;
