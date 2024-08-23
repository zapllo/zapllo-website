'use client'

import BillingSidebar from '@/components/sidebar/billingSidebar';
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
    return <div className='text-center p-10'>Loading...</div>;
  }

  if (!orderLogs.length) {
    return (
      <div className="flex">
        <BillingSidebar />
        <div className="flex-1 p-4">
          <div className="w-full -ml-2 max-w-8xl mx-auto">
            <div className="gap-2 flex mb-6 w-full">
              <div className="-mt-2">
                <div className="p-4">
                  <div className="overflow-x-auto  ">
                    <h1>No Wallet Logs Foundd</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <BillingSidebar />
      <div className="flex-1 p-4">
        <div className="w-full -ml-2 max-w-8xl mx-auto">
          <div className="gap-2 flex mb-6 w-full">
            <div className="-mt-2">
              <div className="p-4">
                <div className="overflow-x-auto  ">
                  <h2 className="text-lg font-semibold mb-4">Wallet Logs</h2>
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr className="bg-[#75517B] -100">
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
                          <td className="px-6 py-4 text-sm text-gray-700">{order.orderId}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{order.paymentId}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{order.planName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">₹{order.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">₹{order.creditedAmount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{new Date(order.createdAt).toLocaleString()}</td>
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
    </div>
  );
}
