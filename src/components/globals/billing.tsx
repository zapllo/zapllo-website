// pages/billing.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogContent, DialogClose } from "@/components/ui/dialog";
import BillingSidebar from '../sidebar/billingSidebar';
import { Wallet } from "lucide-react";
import axios from 'axios';

type PlanKeys = 'Task Pro' | 'Money Saver Bundle';

export default function Billing() {
    const [activeTab, setActiveTab] = useState('Active');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanKeys | null>(null);
    const [userCount, setUserCount] = useState(5);
    const [rechargeAmount, setRechargeAmount] = useState(5000);
    const [isRechargeDialogOpen, setIsRechargeDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>();
    const [displayedPlan, setDisplayedPlan] = useState('');
    const [modalStep, setModalStep] = useState(1);
    const [rechargeModalStep, setRechargeModalStep] = useState(1);
    const [gstNumber, setGstNumber] = useState('');
    const [rechargeGstNumber, setRechargeGstNumber] = useState('');

    useEffect(() => {
        if (currentUser?.subscribedPlan) {
            setDisplayedPlan(currentUser?.subscribedPlan);
        } else {
            setDisplayedPlan('No Plan');
        }
    }, [currentUser?.subscribedPlan]);

    useEffect(() => {
        const getUserDetails = async () => {
            const res = await axios.get('/api/users/me')
            setCurrentUser(res.data.data);
        }
        getUserDetails();
    }, [])

    const plans = {
        'Task Pro': 1999,
        'Money Saver Bundle': 3000,
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setUserCount(5);
        setModalStep(1);
        setGstNumber('');
    };

    const handleRechargeClick = () => {
        setIsRechargeDialogOpen(true);
    };

    const handleRechargeDialogClose = () => {
        setIsRechargeDialogOpen(false);
        setRechargeAmount(5000);
        setRechargeModalStep(1);
        setRechargeGstNumber('');
    };

    const handleSubscribeClick = (plan: any) => {
        setSelectedPlan(plan);
        setIsDialogOpen(true);
    };

    const isValidPlan = (plan: string | null): plan is keyof typeof plans => {
        return plan !== null && Object.keys(plans).includes(plan);
    };

    useEffect(() => {
        const loadRazorpayScript = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        };
        loadRazorpayScript();
    }, []);

    const handlePayment = async () => {
        if (!selectedPlan || !(selectedPlan in plans)) {
            console.error("Selected plan is invalid.");
            return;
        }
        const plan = selectedPlan as PlanKeys;
        const planCost = plans[plan];
        const amountExclGST = userCount * planCost;
        const gstAmount = amountExclGST * 0.18;
        const totalAmount = amountExclGST + gstAmount;
        const orderData = {
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: 'receipt_order_123456',
            notes: {
                email: currentUser?.email,
                whatsappNo: currentUser?.whatsappNo,
                planName: plan,
                gstNumber: gstNumber,
            },
        };
        try {
            const { data } = await axios.post('/api/create-order', orderData);
            if (!data.orderId) {
                throw new Error('Order ID not found in the response');
            }
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
                amount: orderData.amount,
                currency: orderData.currency,
                name: plan,
                description: `Payment for ${plan}`,
                image: '/logo.png',
                order_id: data.orderId,
                handler: async (response: any) => {
                    const paymentResult = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        planName: plan
                    };
                    try {
                        const { data: verificationResult } = await axios.post('/api/payment-success', {
                            ...paymentResult,
                            userId: currentUser?._id,
                            amount: orderData.amount / 100,
                            gstNumber: gstNumber,
                        });
                        if (verificationResult.success) {
                            alert('Payment successful!');
                            setIsDialogOpen(false);
                            setModalStep(1);
                            setGstNumber('');
                        } else {
                            alert('Payment verification failed. Please contact support.');
                        }
                    } catch (error) {
                        console.error('Error verifying payment: ', error);
                        alert('Error verifying payment. Please try again.');
                    }
                },
                prefill: {
                    name: `${currentUser?.firstName} ${currentUser?.lastName}`,
                    email: currentUser?.email,
                    contact: currentUser?.whatsappNo,
                },
                notes: {
                    address: 'Corporate Office',
                },
                theme: {
                    color: '#007A5A',
                },
            };
            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error('Error creating order: ', error);
            alert('Error creating order. Please try again.');
        }
    };

    const handleRechargePayment = async () => {
        if (rechargeAmount >= 5000) {
            const amountExclGST = rechargeAmount;
            const gstAmount = amountExclGST * 0.18;
            const totalAmount = amountExclGST + gstAmount;
            const orderData = {
                amount: totalAmount * 100,
                currency: 'INR',
                receipt: 'receipt_order_123456',
                notes: {
                    email: currentUser?.email,
                    whatsappNo: currentUser?.whatsappNo,
                    planName: 'Recharge',
                    gstNumber: rechargeGstNumber,
                },
            };
            try {
                const { data } = await axios.post('/api/create-order', orderData);
                if (!data.orderId) {
                    throw new Error('Order ID not found in the response');
                }
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'Recharge',
                    description: `Payment for Wallet Recharge`,
                    image: '/logo.png',
                    order_id: data.orderId,
                    handler: async (response: any) => {
                        const paymentResult = {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            planName: 'Recharge'
                        };
                        try {
                            const { data: verificationResult } = await axios.post('/api/payment-success', {
                                ...paymentResult,
                                userId: currentUser?._id,
                                amount: orderData.amount / 100,
                                gstNumber: rechargeGstNumber,
                            });
                            if (verificationResult.success) {
                                alert('Recharge successful!');
                                setIsRechargeDialogOpen(false);
                                setRechargeModalStep(1);
                                setRechargeGstNumber('');
                            } else {
                                alert('Payment verification failed. Please contact support.');
                            }
                        } catch (error) {
                            console.error('Error verifying payment: ', error);
                            alert('Error verifying payment. Please try again.');
                        }
                    },
                    prefill: {
                        name: `${currentUser?.firstName} ${currentUser?.lastName}`,
                        email: currentUser?.email,
                        contact: currentUser?.whatsappNo,
                    },
                    notes: {
                        address: 'Corporate Office',
                    },
                    theme: {
                        color: '#007A5A',
                    },
                };
                const rzp1 = new (window as any).Razorpay(options);
                rzp1.open();
            } catch (error) {
                console.error('Error creating order: ', error);
                alert('Error creating order. Please try again.');
            }
        } else {
            alert('Recharge amount must be at least ₹5000.');
        }
    };

    return (
        <div className="flex w-full ">
            <BillingSidebar />
            {currentUser?.role === "orgAdmin" ? (
                <div className="flex-1 overflow-y-scroll h-screen  p-4">
                    <div className="w-full flex justify-center   max-w-5xl mx-auto">
                        <div className="gap-2 flex  mb-6 w-full">
                            <div className="-mt-2">
                                <div className="p-4">
                                    <Card className="gap-6 bg-[#] border py-4 border-[#E0E0E066] w-full">
                                        <CardHeader>
                                            <div className="flex justify-between w-[420px]">
                                                <div className="flex gap-2">
                                                    <div className="h-12 w-12 rounded-full border items-center justify-center flex border-white">
                                                        <Wallet />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg font-medium">Current Balance</CardTitle>
                                                        <h1>₹{currentUser?.credits}</h1>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-[#7C3886] hover:bg-[#7C3886]"
                                                        onClick={handleRechargeClick}
                                                    >
                                                        Recharge Now
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </div>
                            </div>
                            <div className="-mt-2">
                                <div className="p-4">
                                    <Card className="gap-6 bg-[#] border py-4 border-[#E0E0E066] w-full">
                                        <CardHeader>
                                            <div className="flex justify-between w-[380px]">
                                                <div className="flex gap-2">
                                                    <div className="h-12 w-12 rounded-full border items-center justify-center flex border-white">
                                                        <img src='/icons/whatsapp.png' className='h-6' />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">Sales</CardTitle>
                                                        <CardDescription>Connect with team</CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-[#7C3886] hover:bg-[#7C3886]"
                                                        onClick={() => window.open('https://wa.me/+918910748670?text=Hello, I would like to connect.', '_blank')}
                                                    >
                                                        Connect Now
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        {isDialogOpen && isValidPlan(selectedPlan) && (
                            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                                <DialogOverlay />
                                <DialogContent>
                                    {modalStep === 1 && (
                                        <>
                                            <h2 className="text-xl font-bold">{selectedPlan} Plan</h2>
                                            <p className="mt-2">This plan costs ₹{plans[selectedPlan]} per user per year.</p>
                                            <div className="mt-4 flex gap-4">
                                                <label htmlFor="userCount" className="block mb-2">Select Number of Users To Add:</label>
                                                <select
                                                    id="userCount"
                                                    className="border outline-none bg-[#282D32] px-2 py-1 -mt-1 rounded "
                                                    value={userCount}
                                                    onChange={(e) => setUserCount(parseInt(e.target.value))}
                                                >
                                                    {[...Array(20)].map((_, i) => {
                                                        const count = (i + 1) * 5;
                                                        return (
                                                            <option key={count} value={count}>
                                                                {count}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                            <div className='flex gap-4'>
                                                <h1>Total Subscribed Users = </h1>
                                                {userCount} (Adding {userCount} users)
                                            </div>
                                            <div className="mt-4">
                                                <Button className="bg-[#007A5A] hover:bg-[#007A5A] w-full" onClick={() => setModalStep(2)}>
                                                    Next
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                    {modalStep === 2 && (
                                        <>
                                            <h2 className="text-xl font-bold">Payment Details</h2>
                                            <div className='flex gap-4 mt-4'>
                                                <h1>Amount (excluding GST) = </h1>
                                                INR {userCount * plans[selectedPlan]}
                                            </div>
                                            <div className='flex gap-4'>
                                                <h1>GST (18%) = </h1>
                                                INR {(userCount * plans[selectedPlan] * 0.18).toFixed(2)}
                                            </div>
                                            <div className='flex gap-4'>
                                                <h1>Total Amount (including GST) = </h1>
                                                INR {(userCount * plans[selectedPlan] * 1.18).toFixed(2)}
                                            </div>
                                            <div className="mt-4">
                                                <label htmlFor="gstNumber" className="block mb-2">Enter GST Number (Optional):</label>
                                                <input
                                                    id="gstNumber"
                                                    type="text"
                                                    className="border p-2 rounded outline-none w-full"
                                                    value={gstNumber}
                                                    onChange={(e) => setGstNumber(e.target.value)}
                                                />
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Button className="bg-gray-500 hover:bg-gray-600 w-full" onClick={() => setModalStep(1)}>
                                                    Back
                                                </Button>
                                                <Button className="bg-[#007A5A] hover:bg-[#007A5A] w-full" onClick={handlePayment}>
                                                    Proceed to Payment
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>
                        )}

                        {isRechargeDialogOpen && (
                            <Dialog open={isRechargeDialogOpen} onOpenChange={handleRechargeDialogClose}>
                                <DialogOverlay />
                                <DialogContent>
                                    {rechargeModalStep === 1 && (
                                        <>
                                            <div className='flex justify-between'>
                                                <h2 className="text-md font-bold">Recharge Wallet</h2>
                                                <DialogClose><img src='/icons/cross.png' className='h-6 hover:bg-[#121212] rounded-full' /></DialogClose>
                                            </div>
                                            <div className="mt-4">
                                                <label htmlFor="rechargeAmount" className="block mb-2">Recharge Amount (minimum ₹5000):</label>
                                                <input
                                                    id="rechargeAmount"
                                                    type="number"
                                                    className="border p-2 rounded outline-none w-full"
                                                    value={rechargeAmount}
                                                    onChange={(e) => setRechargeAmount(parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <Button className="bg-[#7C3886] hover:bg-[#7C3886] w-full" onClick={() => setRechargeModalStep(2)}>
                                                    Next
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                    {rechargeModalStep === 2 && (
                                        <>
                                            <h2 className="text-xl font-bold">Payment Details</h2>
                                            <div className='flex gap-4 mt-4'>
                                                <h1>Amount (excluding GST) = </h1>
                                                INR {rechargeAmount}
                                            </div>
                                            <div className='flex gap-4'>
                                                <h1>GST (18%) = </h1>
                                                INR {(rechargeAmount * 0.18).toFixed(2)}
                                            </div>
                                            <div className='flex gap-4'>
                                                <h1>Total Amount (including GST) = </h1>
                                                INR {(rechargeAmount * 1.18).toFixed(2)}
                                            </div>
                                            <div className="mt-4">
                                                <label htmlFor="rechargeGstNumber" className="block mb-2">Enter GST Number (Optional):</label>
                                                <input
                                                    id="rechargeGstNumber"
                                                    type="text"
                                                    className="border p-2 rounded outline-none w-full"
                                                    value={rechargeGstNumber}
                                                    onChange={(e) => setRechargeGstNumber(e.target.value)}
                                                />
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Button className="bg-gray-500 hover:bg-gray-600 w-full" onClick={() => setRechargeModalStep(1)}>
                                                    Back
                                                </Button>
                                                <Button className="bg-[#7C3886] hover:bg-[#7C3886] w-full" onClick={handleRechargePayment}>
                                                    Proceed to Payment
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                    <div className='flex w-full justify-center max-w-8xl '>
                        <div className="w-1/2  ">
                            <div className="flex space-x-4 mb-8  justify-center">
                                <Button variant={activeTab === 'Active' ? 'default' : 'outline'}
                                    className={activeTab === 'Active' ? 'bg-[#75517B] hover:bg-[#75517B] w-full' : 'bg-[#2F0932] hover:bg-[#2F0932] w-full'}
                                    onClick={() => setActiveTab('Active')}>Active</Button>
                                <Button variant={activeTab === 'Plans' ? 'default' : 'outline'}
                                    className={activeTab === 'Plans' ? 'bg-[#75517B] hover:bg-[#75517B] w-full' : 'bg-[#2F0932] hover:bg-[#2F0932] w-full'}
                                    onClick={() => setActiveTab('Plans')}>Plans</Button>
                            </div>
                        </div>
                    </div>
                    {activeTab === 'Active' ? (
                        <div className="flex justify-center w-full mb-24 h-screen mt-12">
                            {displayedPlan === 'Money Saver Bundle' ? (
                                <Card key="Money Saver Bundle" className="w-[400px] border h-fit rounded bg-transparent">
                                    <CardHeader className="bg-[#2F0932] rounded border-b text-center">
                                        <CardTitle className="text-2xl">Money Saver Bundle</CardTitle>
                                        <CardDescription className="text-center text-white text-sm px-2">
                                            <span className="text-[#007A5A]">INR </span>
                                            {plans['Money Saver Bundle']}
                                            <h1 className="text-xs italic">(Per User Per Year)</h1>
                                        </CardDescription>
                                        <div className="flex justify-center py-2 w-full">
                                            <Button disabled className="bg-[#007A5A] cursor-not-allowed hover:bg-[#007A5A] w-fit px-6">Subscribed</Button>
                                        </div>
                                    </CardHeader>
                                    <div className='p-4'>
                                    <CardContent className="  bg-transparent">
                                            <h1 className="mt-2 px-2 text-sm text-[#3281F6]">Task Delegation App</h1>
                                            <ul className="list-disc text-sm">
                                                <li>Delegate <span className="text-[#3281F6]">Unlimited Tasks</span></li>
                                                <li>Team Performance report</li>
                                                <li>Links Management for your Team</li>
                                                <li>Email Notification</li>
                                                <li>WhatsApp Notification</li>
                                                <li>Repeated Tasks</li>
                                                <li>File Uploads</li>
                                                <li>Delegate Tasks with Voice Notes</li>
                                                <li>Task Wise Reminders</li>
                                                <li>Save more than <span className="text-[#3281F6]">5 hours per day per employee</span></li>
                                                <h1 className="mt-2 p-2 text-md text-[#3281F6]">Leave & Attendance App - <span className="text-[#007A5A]">Coming Soon</span></h1>
                                                <li>Easy Attendance Marking using Geo-Location & face recognition feature</li>
                                                <li>Easy leave application</li>
                                                <li>Attendance & leave Tracking</li>
                                                <li>WhatsApp & Email notification</li>
                                                <li>Approval Process</li>
                                                <li>Regularization Process (Apply for past date attendance)</li>
                                                <li>Define your own leave types</li>
                                                <li>Reports/Dashboards</li>
                                            </ul>
                                        </CardContent>
                                    </div>
                                    <CardFooter />
                                </Card>
                            ) : displayedPlan === 'Task Pro' ? (
                                <Card key="Task Pro" className="w-[400px] rounded border bg-transparent">
                                    <CardHeader className="bg-[#2F0932] rounded border-b text-center">
                                        <CardTitle className="text-2xl">Task Pro</CardTitle>
                                        <CardDescription className="text-center text-white text-sm px-2">
                                            <span className="text-[#007A5A]">INR </span>
                                            {plans['Task Pro']}
                                            <h1 className="text-xs italic">(Per User Per Year)</h1>
                                        </CardDescription>
                                        <div className="flex justify-center py-2 w-full">
                                            <Button disabled className="bg-[#007A5A] cursor-not-allowed hover:bg-[#007A5A] w-fit px-6">Subscribed</Button>
                                        </div>
                                    </CardHeader>
                                    <div className='p-4'>
                                    <CardContent className=" bg-transparent">
                                            <h1 className="mt-2 px-2 text-sm text-[#3281F6]">Task Delegation App</h1>
                                            <ul className="list-disc text-sm">
                                                <li>Delegate <span className="text-[#3281F6]">Unlimited Tasks</span></li>
                                                <li>Team Performance report</li>
                                                <li>Links Management for your Team</li>
                                                <li>Email Notification</li>
                                                <li>WhatsApp Notification</li>
                                                <li>Repeated Tasks</li>
                                                <li>File Uploads</li>
                                                <li>Delegate Tasks with Voice Notes</li>
                                                <li>Task Wise Reminders</li>
                                                <li>Save more than <span className="text-[#3281F6]">5 hours per day per employee</span></li>
                                            </ul>
                                        </CardContent>
                                    </div>
                                    <CardFooter />
                                </Card>
                            ) : (
                                <div className='w-full flex justify-center max-w-5xl'>
                                    <h1 className="text rounded-lg bg-transparent border text-muted-foreground p-4 h-fit w-fit">
                                        <span className="text-lg font-bold text-white">
                                            No Current Active Plan
                                        </span>
                                        <br />Subscribe to avail all the Task Delegation Features
                                    </h1>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full flex justify-center">
                            <div className="w-full flex justify-center max-w-5xl mx-auto mb-24 h-screen gap-12">
                                {Object.keys(plans).map((plan, index) => {
                                    const planKey = plan as keyof typeof plans;
                                    return (
                                        <Card key={index} className="w-[400px] h-[690px] rounded border bg-transparent">
                                            <CardHeader className="bg-[#2F0932] rounded border-b text-center">
                                                <CardTitle className="text-2xl">{plan}</CardTitle>
                                                <CardDescription className="text-center text-white text-sm px-2">
                                                    <span className="text-[#007A5A]">INR </span>
                                                    {plans[planKey]}
                                                    <h1 className="text-xs italic">(Per User Per Year)</h1>
                                                </CardDescription>
                                                <div className="flex justify-center py-2 w-full">
                                                    <Button className="bg-[#7C3886] hover:bg-[#75517B] w-fit px-6" onClick={() => handleSubscribeClick(plan)}>Subscribe</Button>
                                                </div>
                                            </CardHeader>
                                            <div className='p-4'>
                                            <CardContent className=" bg-transparent">
                                                    <h1 className="mt-2 px-2 text-sm text-[#3281F6]">Task Delegation App</h1>
                                                    <ul className="list-disc text-sm">
                                                        <li>Delegate <span className="text-[#3281F6]">Unlimited Tasks</span></li>
                                                        <li>Team Performance report</li>
                                                        <li>Links Management for your Team</li>
                                                        <li>Email Notification</li>
                                                        <li>WhatsApp Notification</li>
                                                        <li>Repeated Tasks</li>
                                                        <li>File Uploads</li>
                                                        <li>Delegate Tasks with Voice Notes</li>
                                                        <li>Task Wise Reminders</li>
                                                        <li>Save more than <span className="text-[#3281F6]">5 hours per day per employee</span></li>
                                                        {plan === 'Money Saver Bundle' && (
                                                            <div>
                                                                <h1 className=" p-2 text-sm text-[#3281F6]">Leave & Attendance App</h1>
                                                                <li className=''>Easy Attendance Marking using Geo-Location & face recognition feature</li>
                                                                <li>Easy leave application</li>
                                                                <li>Attendance & leave Tracking</li>
                                                                <li>WhatsApp & Email notification</li>
                                                                <li>Approval Process</li>
                                                                <li>Regularization Process (Apply for past date attendance)</li>
                                                                <li>Define your own leave types</li>
                                                                <li>Reports/Dashboards</li>
                                                            </div>
                                                        )}
                                                    </ul>
                                                </CardContent>
                                            </div>
                                            <CardFooter />
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) :
                <div className='flex w-full justify-center mt-24'>
                    <div>
                        <div className='w-full flex justify-center'>
                            <img src='/icons/danger.png' className='h-8' />
                        </div>
                        <h1 className='text-center m'>You are not authorized to view this page!</h1>
                    </div>
                </div>
            }
        </div>
    );
}
