'use client'
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogOverlay, DialogContent } from "@/components/ui/dialog";
import { CheckIcon, IndianRupee, WalletCards } from "lucide-react";

export default function Billing() {
    const [activeTab, setActiveTab] = useState('Active');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [userCount, setUserCount] = useState(5);
    const [rechargeAmount, setRechargeAmount] = useState(5000);
    const [isRechargeDialogOpen, setIsRechargeDialogOpen] = useState(false);



    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setUserCount(5); // reset user count when dialog is closed
    };

    const handleRechargeClick = () => {
        setIsRechargeDialogOpen(true);
    };

    const handleRechargeDialogClose = () => {
        setIsRechargeDialogOpen(false);
        setRechargeAmount(5000); // reset recharge amount when dialog is closed
    };

    const handleRecharge = () => {
        if (rechargeAmount >= 5000) {
            // Redirect to checkout page
            window.location.href = `/checkout?amount=${rechargeAmount}`;
        } else {
            alert('Recharge amount must be at least ₹5000.');
        }
    };

    const totalCost = userCount * 1000;

    const handleSubscribeClick = (plan) => {
        setSelectedPlan(plan);
        setIsDialogOpen(true);
        // Redirect to checkout page with the selected plan's price
    };
    const handleCheckoutClick = () => {
        window.location.href = `/checkout?amount=${totalCost}`;
    };

    return (
        <div className=" gap-8 p-4 sm:p-6 md:p-8 lg:p-10">
            <div className='mb-8 grid grid-cols-2 w-full gap-2'>
                <div className=''>
                    <Card className="grd gap-6">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Wallet</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-green-600"
                                        onClick={handleRechargeClick}
                                    >
                                        <IndianRupee className='h-5' /> Recharge Now
                                    </Button>
                                    <Button className='gap-2' variant="outline" size="sm">
                                        <WalletCards className='h-5 ' /> Wallet Logs
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div className="text-muted-foreground">Current Balance</div>
                                <div className="text-2xl font-bold">₹ 5000.00</div>
                            </div>
                            <Separator />
                        </CardContent>
                    </Card>
                </div>
                <div className=' mt-8'>
                    <Card className="gri gap-6">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Connect with Sales Team</CardTitle>
                                <div className="flex items-center gap-2">
                                    <img src='/whatsapp.png' className='h-7' />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-green-600"
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
            <div className="flex space-x-4 mb-8 justify-center">
                <Button variant={activeTab === 'Active' ? 'default' : 'outline'} className='w-1/4' onClick={() => setActiveTab('Active')}>Active</Button>
                <Button variant={activeTab === 'Plans' ? 'default' : 'outline'} className='w-1/4' onClick={() => setActiveTab('Plans')}>Plans</Button>
            </div>

            {activeTab === 'Active' ? (
                <div className='flex justify-center mt-24 '><h1 className='text-center rounded-lg bg-secondary px-4 py-2 w-fit '>No Active Plans <br />Subscribe for more task management features!</h1></div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Pro</CardTitle>
                            <CardDescription>Ideal for task management</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div className="text-4xl font-bold flex"><IndianRupee className='h-10' />1000</div>
                                <div className="text-muted-foreground">/user/month</div>
                            </div>
                            <ul className="grid gap-2 text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="h-4 w-4 fill-primary" />
                                    Unlimited tasks
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="h-4 w-4 fill-primary" />
                                    Priority support
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleSubscribeClick('Task Pro')}>Subscribe</Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Money Saver Bundle</CardTitle>
                            <CardDescription>Best value for your money</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between">
                            <div className="text-4xl font-bold flex"><IndianRupee className='h-10' />1000</div>
                                <div className="text-muted-foreground">/month</div>
                            </div>
                            <ul className="grid gap-2 text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="h-4 w-4 fill-primary" />
                                    All features included
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckIcon className="h-4 w-4 fill-primary" />
                                    Unlimited users
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleSubscribeClick('Money Saver Bundle')}>Subscribe</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {isDialogOpen && (
                <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog} >
                    <DialogOverlay />
                    <DialogContent>
                        <h2 className="text-xl font-bold">{selectedPlan}</h2>
                        <div className='flex justify-between'>
                            <h2 className="text-xs font-bold">Subscribed Users: 0</h2>
                            <h2 className="text-xs font-bold">Balance: ₹0.00</h2>
                        </div>
                        <div className='flex justify-start gap-2'>
                            <div>
                                <label className="block my-4">
                                    <span className="text-">Select number of Users:</span>
                                </label>
                            </div>
                            <div>
                                <select
                                    value={userCount}
                                    onChange={(e) => setUserCount(Number(e.target.value))}
                                    className="block w-full p-2 rounded mt-2"
                                >
                                    {[...Array(21).keys()].slice(5).map(num => (
                                        <option key={num} value={num}>{num} users</option>
                                    ))}
                                </select>
                            </div>

                        </div>
                        <div className=''>
                            <h2 className="text-sm font-bold">Total Subscribed Users = {userCount} (Adding {userCount} Users)</h2>
                            <h2 className="text-sm font-bold">Total Price = ₹ 1000 x {userCount} Users</h2>

                        </div>

                        <div className="my-4">
                            <span className="">Total Price:</span>
                            <span className="ml-2 text-2xl font-bold">₹ {totalCost}</span>
                        </div>
                        <div className="">

                            <Button className='w-full bg-green-600 hover:bg-primary' onClick={() => { handleCheckoutClick() }}>Subscribe</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {isRechargeDialogOpen && (
                <Dialog open={isRechargeDialogOpen} onOpenChange={handleRechargeDialogClose}>
                    <DialogOverlay />
                    <DialogContent>
                        <h2 className="text-xl font-bold">Recharge Wallet</h2>
                        <div className="mt-4">
                            <label className="block my-4">
                                <span className="text-">Enter amount to recharge:</span>
                            </label>
                            <div className='flex'>
                                <IndianRupee className='mt-3' />

                                <input
                                    type="number"
                                    value={rechargeAmount}
                                    onChange={(e) => setRechargeAmount(Number(e.target.value))}
                                    className="block w-full p-2 outline-none rounded-lg mt-2"
                                    min={5000}
                                />
                            </div>

                        </div>
                        <div className="my-4">
                            <Button
                                className='w-full bg-green-600 hover:bg-primary'
                                onClick={handleRecharge}
                            >
                                Recharge
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div >
    );
}
