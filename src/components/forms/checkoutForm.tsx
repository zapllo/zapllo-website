import React, { useState, useEffect } from 'react';
import axios from 'axios';

type PlanKeys = 'Task Pro' | 'Money Saver Bundle';

const MultiStepForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        industry: '',
        email: '',
        countryCode: '+91',
        whatsappNo: '',
        selectedPlan: 'Money Saver Bundle' as PlanKeys,
        subscribedUserCount: 1, // Changed from quantity to subscribedUserCount
        discountCode: '',
    });

    const plans: Record<PlanKeys, number> = {
        'Task Pro': 1999,
        'Money Saver Bundle': 3000,
    };

    const [payableAmount, setPayableAmount] = useState(plans[formData.selectedPlan] * formData.subscribedUserCount);

    useEffect(() => {
        // Load Razorpay script
        const loadRazorpayScript = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        };
        loadRazorpayScript();
    }, []);

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const updatePayableAmount = (selectedPlan: PlanKeys, subscribedUserCount: number) => {
        const pricePerUser = plans[selectedPlan];
        setPayableAmount(pricePerUser * subscribedUserCount);
    };

    const handlePlanChange = (plan: PlanKeys) => {
        setFormData({ ...formData, selectedPlan: plan });
        updatePayableAmount(plan, formData.subscribedUserCount);
    };

    const handleSubscribedUserCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subscribedUserCount = parseInt(e.target.value, 10) || 1;
        setFormData({ ...formData, subscribedUserCount });
        updatePayableAmount(formData.selectedPlan, subscribedUserCount);
    };

    const handlePayment = async () => {
        try {
            const { data } = await axios.post('/api/create-order', {
                amount: payableAmount * 100,
                currency: 'INR',
                planName: formData.selectedPlan,
                subscribedUserCount: formData.subscribedUserCount,
                email: formData.email,
            });

            const { orderId } = data;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: payableAmount * 100,
                currency: 'INR',
                name: formData.selectedPlan,
                description: `Payment for ${formData.selectedPlan}`,
                image: '/logo.png',
                order_id: orderId,
                handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }) => {
                    const paymentResult = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        companyName: formData.companyName,
                        industry: formData.industry,
                        email: formData.email,
                        whatsappNo: formData.whatsappNo,
                        amount: payableAmount,
                        planName: formData.selectedPlan,
                        subscribedUserCount: formData.subscribedUserCount,
                    };

                    try {
                        const verification = await axios.post('/api/onboardingSuccess', paymentResult);
                        if (verification.data.success) {
                            alert('Payment successful!');
                        } else {
                            alert('Payment verification failed.');
                        }
                    } catch (error) {
                        console.error('Error verifying payment:', error);
                    }
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.whatsappNo,
                },
                theme: {
                    color: '#007A5A',
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Something went wrong. Please try again.');
        }
    };


    return (
        <div className="bg-[#0a0c29] border text-white p-8 rounded-lg w-full max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Contact Form</h1>

            {/* Step Progress Bar */}
            <div className="flex items-center mb-8">
                <div className="flex w-1/2 items-center">
                    <div className={`w-4 h-4 rounded-full ${step >= 1 ? 'border-2 border-white' : 'bg-gray-600'}`}></div>
                    <div className={`flex-1 h-[1px]  ${step >= 2 ? 'border  border-gray-600' : 'bg-gray-600'}`}></div>
                    <div className={`w-4 h-4 rounded-full ${step === 2 ? 'border-2 border-white' : 'bg-gray-600'}`}></div>
                </div>
            </div>
            <div className="flex justify-between w-1/2 mb-1">
                <p className="text-sm font-semibold text-gray-400">Step 1</p>
                <p className="text-sm font-semibold text-gray-400">Step 2</p>
            </div>
            <div className='flex justify-between w-[55%]'>
                <h2 className={`text-lg font-semibold mb-4 ${step === 1 ? "text-white" : "text-gray-400"}  `}>Contact Details</h2>
                <h2 className={`text-lg font-semibold mb-4  ${step === 2 ? "text-white" : "text-gray-400"}  `}>Checkout</h2>
            </div>
            {/* Step 1: Contact Details */}
            {
                step === 1 && (
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {/* Input fields for Contact Details */}
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="p-3 bg-[#0F1224] border border-gray-600 rounded-md focus:outline-none text-gray-200"
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="p-3 bg-[#0F1224] border border-gray-600 rounded-md focus:outline-none text-gray-200"
                            />
                            <input
                                type="text"
                                name="companyName"
                                placeholder="Company Name"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="p-3 bg-[#0F1224] border border-gray-600 rounded-md focus:outline-none text-gray-200"
                            />
                            <select
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className="p-3 bg-[#0F1224] border border-gray-600 rounded-md focus:outline-none text-gray-200"
                            >
                                <option value="" disabled>Industry</option>
                                <option value="IT">IT</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                            </select>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email ID"
                                value={formData.email}
                                onChange={handleChange}
                                className="p-3 bg-[#0F1224] border border-gray-600 rounded-md focus:outline-none text-gray-200"
                            />
                            <div className="flex">
                                <span className="flex items-center justify-center w-16 bg-gray-700 rounded-l-md text-gray-300">
                                    <img src="/path-to-country-flag.png" alt="Country Flag" className="w-6 h-4 mr-1" />
                                    {formData.countryCode}
                                </span>
                                <input
                                    type="text"
                                    name="whatsappNo"
                                    placeholder="WhatsApp Number"
                                    value={formData.whatsappNo}
                                    onChange={handleChange}
                                    className="p-3 bg-[#0F1224] border border-gray-600 rounded-r-md focus:outline-none w-full text-gray-200"
                                />
                            </div>
                        </div>
                        <button
                            onClick={nextStep}
                            className="bg-gradient-to-r from-[#815BF5] to-[#FC8929] mt-6 w-full py-2 rounded-full text-white font-semibold"
                        >
                            Next
                        </button>
                    </div>
                )
            }

            {/* Step 2: Checkout */}
            {
                step === 2 && (
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {Object.keys(plans).map((plan) => (
                                <label
                                    key={plan}
                                    className={`flex flex-col items-start p-4 border rounded-md cursor-pointer ${formData.selectedPlan === plan ? 'border-[#FC8929] bg-[#1A1D2F]' : 'border-gray-500 bg-[#0F1224]'
                                        }`}
                                    onClick={() => handlePlanChange(plan as PlanKeys)}
                                >
                                    <input
                                        type="radio"
                                        name="selectedPlan"
                                        value={plan}
                                        checked={formData.selectedPlan === plan}
                                        onChange={() => handlePlanChange(plan as PlanKeys)}
                                        className="hidden"
                                    />
                                    <span className="text-lg font-semibold text-gray-200">{plan}</span>
                                    <span className="text-sm text-gray-400">
                                        {plan === 'Money Saver Bundle' ? (
                                            <>
                                                ₹{plans[plan]} / per user per year
                                                <br />
                                                Includes Task Delegation, CRM, Leave & Attendance
                                            </>
                                        ) : (
                                            <>
                                                ₹{plans[plan as PlanKeys]} / per user per year
                                                <br />
                                                Task Delegation Only
                                            </>
                                        )}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <select
                                name="subscribedUserCount"
                                value={formData.subscribedUserCount}
                                onChange={handleSubscribedUserCountChange}
                                className="p-3 bg-[#1A1D2F] border border-gray-600 rounded-md text-sm focus:outline-none text-gray-200"
                            >
                                {[...Array(100).keys()].map((num) => (
                                    <option key={num + 1} value={num + 1}>{num + 1}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                name="discountCode"
                                placeholder="Discount Code"
                                value={formData.discountCode}
                                onChange={handleChange}
                                className="p-3 bg-[#1A1D2F] border border-gray-600 rounded-md text-sm focus:outline-none text-gray-200"
                            />
                        </div>
                        <button onClick={handlePayment} className="bg-gradient-to-r from-[#815BF5] to-[#FC8929] mt-4 w-full py-3 rounded-full text-white font-semibold">
                            Pay ₹{payableAmount.toLocaleString()}
                        </button>
                        <button onClick={prevStep} className="bg-gray-600 w-full py-2 rounded-full text-white font-semibold mt-4">
                            Back
                        </button>
                    </div>
                )
            }
        </div>
    );
};

export default MultiStepForm;
