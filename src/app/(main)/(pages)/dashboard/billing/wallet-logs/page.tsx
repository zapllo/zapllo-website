'use client'

import BillingSidebar from '@/components/sidebar/billingSidebar';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

type Props = {}

interface OrderLog {
  orderId: string;
  paymentId: string;
  amount: number;
  planName: string;
  creditedAmount: number;
  createdAt: string;
}

export default function WalletLogs({ }: Props) {

  const [orderLogs, setOrderLogs] = useState<OrderLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>();


  useEffect(() => {
    const getUserDetails = async () => {
      const res = await axios.get('/api/users/me')
      setCurrentUser(res.data.data);
    }
    getUserDetails();
  }, [])

  useEffect(() => {
    async function fetchOrderLogs() {
      setLoading(true);
      try {
        const response = await fetch('/api/wallet-logs/get');
        const data = await response.json();
        setOrderLogs(data.orders);
      } catch (error) {
        console.error('Error fetching order logs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderLogs();
  }, []);

  if (loading) {
    return <div className='text-center mt-12 p-10'>Loading...</div>;
  }

  if (!orderLogs.length) {
    return (
      <>
        <div className="flex   mt-12">
          <BillingSidebar />
          <div className='flex  justify-center w-full'>
            <div className=' w-full mt-12  justify-center '>
              <div className='flex justify-center'>
                <img src='/animations/emptylist.gif' className='h-40  ' />
              </div>
              <div className='text-center w-full'>
                <h1 className=' text-lg font-semibold text-  '>No Wallet Logs Found</h1>
                <p className='text-sm p-2 '>It seems like you don't have any active plans yet</p>
              </div>
            </div>

          </div>

        </div>

      </>
    )
  }



  return (
    <div className="flex mt-12">
      <BillingSidebar />
      {currentUser?.role === "orgAdmin" ? (
        <div className="flex-1 p-4">
          <div className="w-full -ml-2 max-w-8xl mx-auto">
            <div className="gap-2 flex mb-6 w-full">
              <div className="-mt-2">
                <div className="p-4">
                  <div className="overflow-x-auto  ">
                    <h2 className="text-lg font-semibold mb-4">Wallet Logs</h2>
                    <table className="min-w-full  border">
                      <thead>
                        <tr className="bg-[#815BF5] -100">
                          <th className="px-6 py-3 border-b text-left text-sm font-medium text-white -700">Order ID</th>
                          <th className="px-6 py-3 border-b text-left text-sm font-medium text-white -700">Payment ID</th>
                          <th className="px-6 py-3 border-b text-left text-sm font-medium text-white -700">Plan</th>
                          <th className="px-6 py-3 border-b text-left text-sm font-medium text-white -700">Amount</th>
                          <th className="px-6 py-3 border-b text-left text-sm font-medium text-white -700">Credited</th>
                          <th className="px-6 py-3 border-b text-left text-sm font-medium text-white -700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderLogs.map((order, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-6 py-4 text-sm text-white">{order.orderId}</td>
                            <td className="px-6 py-4 text-sm text-white">{order.paymentId}</td>
                            <td className="px-6 py-4 text-sm text-white">{order.planName}</td>
                            <td className="px-6 py-4 text-sm text-white">₹{order.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-white">₹{order.creditedAmount.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-white">{new Date(order.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
