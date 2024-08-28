import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

interface DaysSelectModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    selectedDays: number[];
    setSelectedDays: React.Dispatch<React.SetStateAction<number[]>>;
}

const DaysSelectModal: React.FC<DaysSelectModalProps> = ({ isOpen, onOpenChange, selectedDays, setSelectedDays }) => {
    const toggleDaySelection = (day: number) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed z-[50] inset-0 bg-black bg-opacity-50" />
                <Dialog.Content className="fixed top-1/2 z-[100] bg left-1/2  transform -translate-x-1/2 -translate-y-1/2 bg-[#1A1C20] p-6 rounded-lg shadow-lg">
                    <Dialog.Title className="text-xl font-bold">Select Days</Dialog.Title>
                    <Dialog.Description className="mt-2 mb-4">
                        Select the days of the month for your repeat setting.
                    </Dialog.Description>
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <button
                                key={day}
                                className={`w-10 h-10 flex items-center justify-center border rounded ${selectedDays.includes(day) ? 'bg-[#017A5B] text-white' : 'bg-transparent'
                                    }`}
                                onClick={() => toggleDaySelection(day)}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Dialog.Close asChild>
                            <button className="bg-[#017A5B] text-white p-2 rounded">Confirm</button>
                        </Dialog.Close>
                    </div>
                    <Dialog.Close asChild>
                        <button className="absolute top-2 right-5">
                            <Cross2Icon className='scale-125 mt-5' />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default DaysSelectModal;
