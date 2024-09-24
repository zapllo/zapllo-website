import React from 'react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet';
import { Label } from '../ui/label';
import { ArrowLeft, Clock, Calendar, MessageSquare, CheckCircle, Circle } from 'lucide-react';

interface Regularization {
    _id: string;
    userId: {
        firstName: string;
        lastName: string;
    };
    timestamp: string;
    loginTime: string;
    logoutTime: string;
    remarks: string;
    approvalStatus: 'Pending' | 'Approved' | 'Rejected';
    approvalRemarks?: string;
    approvedBy?: string;
    approvedAt?: string;
}

interface RegularizationDetailsProps {
    selectedRegularization: Regularization ;
    onClose: () => void;
}

const RegularizationDetails: React.FC<RegularizationDetailsProps> = ({ selectedRegularization, onClose }) => {
    if (!selectedRegularization) return null;

    return (
        <Sheet open={!!selectedRegularization} onOpenChange={onClose}>
            <SheetContent className="max-w-4xl w-full">
                <SheetHeader>
                    <div className="flex gap-2">
                        <ArrowLeft className="cursor-pointer h-7 w-7 bg-[#121212] border border-white rounded-full" onClick={onClose} />
                        <SheetTitle className="text-white mb-4">Regularization Details</SheetTitle>
                    </div>
                </SheetHeader>
                <div className="border overflow-y-scroll scrollbar-hide h-10/11 p-4 rounded-lg">
                    <h1 className="font-bold text-sm px-2">Login Entry Regularization</h1>

                    <div className="flex mt-4 justify-start space-x-12 text-start items-center gap-6 px-2">
                        {/* User Info */}
                        <div className="flex items-center gap-4">
                            <Label htmlFor="user" className="text-right text-xs">Requested By</Label>
                            {selectedRegularization.userId.firstName && (
                                <div className="flex gap-2 justify-start">
                                    <div className="h-6 w-6 rounded-full bg-primary">
                                        <h1 className="text-center uppercase text-xs mt-1">
                                            {selectedRegularization.userId.firstName[0]}{selectedRegularization.userId.lastName[0]}
                                        </h1>
                                    </div>
                                    <h1 id="userName" className="col-span-3 text-sm">{`${selectedRegularization.userId.firstName} ${selectedRegularization.userId.lastName}`}</h1>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Regularization Dates */}
                    <div className='flex gap-28 ml-1'>
                        <div className="flex items-center gap-1 mt-4">
                            <Calendar className="h-4 text-[#E94C4C]" />
                            <Label htmlFor="timestamp" className="text-right text-sm">Date</Label>
                            <div className="flex gap-2 ml-2 text-xs justify-start">
                                <h1 id="timestamp" className="col-span-3">{new Date(selectedRegularization.timestamp).toLocaleDateString()}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 mt-4">
                            <Clock className="h-4 text-[#E94C4C]" />
                            <Label htmlFor="loginTime" className="text-right text-sm">Login Time</Label>
                            <div className="flex gap-2 ml-5 justify-start">
                                <h1 id="loginTime" className="col-span-3 text-xs">{selectedRegularization.loginTime}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 mt-4">
                            <Clock className="h-4 text-[#E94C4C]" />
                            <Label htmlFor="logoutTime" className="text-right text-sm">Logout Time</Label>
                            <div className="flex gap-2 ml-5 justify-start">
                                <h1 id="logoutTime" className="col-span-3 text-xs">{selectedRegularization.logoutTime}</h1>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1 mt-4">
                        {selectedRegularization.approvalStatus === 'Pending' && <Circle className="h-4 text-red-500" />}
                        {selectedRegularization.approvalStatus === 'Approved' && <CheckCircle className="h-4 text-green-500" />}
                        <Label htmlFor="status" className="text-right text-sm">Status</Label>
                        <div className="flex gap-2 ml-12 justify-start">
                            <h1 id="status" className="col-span-3 text-xs ml-1">{selectedRegularization.approvalStatus}</h1>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="flex items-center gap-1 mt-4">
                        <MessageSquare className="h-4 text-[#C3AB1E]" />
                        <Label htmlFor="remarks" className="text-right text-sm">Remarks</Label>
                        <div className="flex ml-12 justify-start">
                            <h1 id="remarks" className="col-span-3 text-xs">{selectedRegularization.remarks || 'No remarks provided.'}</h1>
                        </div>
                    </div>

                    {/* Approval Remarks */}
                    {selectedRegularization.approvalRemarks && (
                        <div className="flex items-center gap-1 mt-4">
                            <MessageSquare className="h-4 text-[#C3AB1E]" />
                            <Label htmlFor="approvalRemarks" className="text-right text-sm">Approval Remarks</Label>
                            <div className="flex ml-12 justify-start">
                                <h1 id="approvalRemarks" className="col-span-3 text-xs">{selectedRegularization.approvalRemarks}</h1>
                            </div>
                        </div>
                    )}
                </div>
                <SheetFooter />
            </SheetContent>
        </Sheet>
    );
};

export default RegularizationDetails;
