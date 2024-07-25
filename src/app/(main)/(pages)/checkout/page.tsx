'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from 'next/navigation';
import { TestimonialCards } from '@/components/globals/testimonialscards';
import Testimonials2 from '@/components/globals/testimonials2';
import TestimonialsCopy from '@/components/globals/testimonialscopy';
import axios from 'axios';

export default function Checkout() {
    const searchParams = useSearchParams();
    const amount = searchParams.get('amount');
    const [rechargeAmount, setRechargeAmount] = useState(Number(amount) || 5000);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [whatsappNo, setWhatsappNo] = useState("");
    const [email, setEmail] = useState("");
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        whatsappNo: '',
        organizationName: "",
        country: '',
        state: '',
        gstin: '',
        paymentMethod: ''
    });


    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const totalAmount = rechargeAmount + (rechargeAmount * 0.18);

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const userRes = await axios.get('/api/users/me');
                const userData = userRes.data.data;

                // Fetch trial status
                const response = await axios.get('/api/organization/getById');
                const organizationName = response.data.data.companyName;
                console.log(organizationName, 'okay?')
                setFormData({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    whatsappNo: userData.whatsappNo,
                    organizationName: organizationName || '',
                    country: '',
                    state: '',
                    gstin: '',
                    paymentMethod: ''
                });
            } catch (error) {
                console.error('Error fetching user details ', error);
            }
        };

        getUserDetails();
    }, []);
    console.log(firstName, lastName, email, whatsappNo)
    return (
        <>
            <h1 className='text-center font-bold mt-4 text-xl'>Task Management App</h1>

            <div className="grid grid-cols-1  text-sm md:grid-cols-2 gap-8 p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recharge</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='border p-4 rounded'>
                                <label className="block my-4">
                                    <span className="">Recharge Amount (exclu. GST):</span>
                                    <input
                                        type="number"
                                        value={rechargeAmount}
                                        onChange={(e) => setRechargeAmount(Math.max(5000, Number(e.target.value)))}
                                        className="block w-full mt-2 p-2 border rounded"
                                        min="5000"
                                    />
                                </label>
                            </div>

                            {/* <Separator /> */}
                            <div className='grid grid-cols-2 gap-4'>
                                <label className="block my-4">
                                    {/* <span className="">First Name:</span> */}
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder='First Name'
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="block w-full mt-1 p-2 border rounded"
                                    />
                                </label>
                                <label className="block my-4">
                                    {/* <span className="">Last Name:</span> */}
                                    <input
                                        type="text"
                                        placeholder='Last Name'
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="block w-full mt-1 p-2 border rounded"
                                    />
                                </label>
                            </div>

                            <label className="block my-4">

                                <input
                                    type="email"
                                    name="email"
                                    placeholder='Email'
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="block w-full mt-1 p-2 border rounded"
                                />
                            </label>
                            <label className="block my-4">
                                {/* <span className="">Organ:</span> */}
                                <input
                                    type="organizationName"
                                    name="organizationName"
                                    placeholder='OrganizationName'
                                    value={formData.organizationName}
                                    onChange={handleInputChange}
                                    className="block w-full mt-1 p-2 border rounded"
                                />
                            </label>
                            <label className="block my-4">
                                {/* <span className="">Mobile Number:</span> */}
                                <input
                                    type="text"
                                    name="whatsappNo"
                                    value={formData.whatsappNo}
                                    placeholder='WhatsApp No'
                                    onChange={handleInputChange}
                                    className="block w-full mt-1 p-2 border rounded"
                                />
                            </label>
                            {/* <Separator /> */}
                            <label className="block my-4">
                                <span className="">Country:</span>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="block w-full mt-1 p-2 border rounded"
                                >
                                    <option value="">Select Country</option>
                                    <option>India</option>
                                </select>
                            </label>
                            <label className="block my-4">
                                <span className="">State:</span>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="block w-full mt-1 p-2 border rounded"
                                >
                                    <option value="">Select State</option>
                                    <option value="">Maharashtra</option>
                                    <option value="">West Bengal</option>
                                    <option value="">Karnataka</option>
                                    <option value="">Madhya Pradesh</option>
                                    <option value="">Uttar Pradesh</option>
                                    <option value="">Telangana</option>
                                    <option value="">Delhi</option>
                                    {/* Add state options here */}
                                </select>
                            </label>
                            <label className="block my-4">
                                <span className="">GSTIN (optional):</span>
                                <input
                                    type="text"
                                    name="gstin"
                                    value={formData.gstin}
                                    onChange={handleInputChange}
                                    className="block w-full mt-1 p-2 border rounded"
                                />
                            </label>
                            <Separator />
                            <label className="block my-4">
                                <span className="">Payment Method:</span>
                                <select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleInputChange}
                                    className="block w-full mt-1 p-2 border rounded"
                                >
                                    <option value="">Select Payment Method</option>
                                    {/* Add payment method options here */}
                                </select>
                            </label>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-green-600 hover:bg-primary" onClick={() => { /* Add your checkout logic here */ }}>
                                Checkout Now
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between my-2">
                                <span className="">Recharge Amount:</span>
                                <span className="text-xl font-bold">₹ {rechargeAmount}</span>
                            </div>
                            <div className="flex justify-between my-2">
                                <span className="">GST (18%):</span>
                                <span className="text-xl font-bold">₹ {(rechargeAmount * 0.18).toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between my-2">
                                <span className="">Total Amount:</span>
                                <span className="text-2xl font-bold">₹ {totalAmount.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <div className='py-4'>
                                <h2 className="text-lg font-bold">Information</h2>
                                <p className="mt-4"> Information about the checkout process and policies:
                                </p>
                                <p className='mt-4'>
                                    The Funds in the wallet have an expiry date, please read about the terms and policies to know more.
                                </p>
                            </div>

                        </CardContent>
                    </Card>
                    <Card className='w-full'>
                        <CardContent>
                            <h1 className='py-4 font-bold text-xl text-center'>5000+ Satisfied Customers!</h1>
                            <div className='grid grid-cols-1 -mt-8 gap-4 p-8'>
                                <div className="radial-gradient md:flex scale-75 gap-4 border rounded-lg ">
                                    <div className='p-4  w-full'>
                                        <img src='testimonial1.svg' className='rounded-lg' />
                                    </div>
                                    <div className='p-4  w-full'>
                                        <div className='flex justify-center md:block'>
                                            <img src='star.png' className='' />

                                        </div>
                                        <h1 className='mt-4  mx-4 md:mx-0 font-semibold md:font-bold'>Helped TTA with Product Management and Internal Workflow</h1>
                                    </div>

                                </div>
                                <div className="radial-gradient md:flex scale-90 border  -mt-16 gap-4 rounded-lg ">
                                    <div className='p-4  w-full'>
                                        <img src='bald.png' className='rounded-lg' />
                                    </div>
                                    <div className='p-4  w-full'>
                                        <div className='flex justify-center md:block'>
                                            <img src='star.png' className='' />

                                        </div>
                                        <h1 className='mt-4  mx-4 md:mx-0 font-semibold md:font-bold'>Helped TTA with Product Management and Internal Workflow</h1>
                                    </div>

                                </div>
                                <div className="radial-gradient -mt-16 border rounded-lg z-[100] md:flex gap-4 ">
                                    <div className='p-4  w-full'>
                                        <img src='Ben.png' className='' />
                                    </div>
                                    <div className='p-4  w-full'>
                                        <div className='flex justify-center md:block'>
                                            <img src='star.png' className='' />

                                        </div>
                                        <h1 className='mt-4  mx-4 md:mx-0 font-semibold md:font-bold'>How BeSpokeMedia saved hours daily on Content Creation</h1>

                                    </div>

                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
