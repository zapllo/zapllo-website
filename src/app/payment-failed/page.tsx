'use client';

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const PaymentFailed = () => {
  const router = useRouter();

  const handleRetryPayment = () => {
    router.push('/billing'); // Redirect back to the billing page or payment initiation page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#201024]">
      <div className="text-center">
        <div className="flex flex-col items-center mb-8">
          {/* <Image
            src="/images/payment-failed.svg" // Ensure this path points to your illustration
            alt="Payment Failed"
            width={200}
            height={200}
            className="mb-4"
          /> */}
          <h1 className="text-3xl font-bold text-red-500">
            Oops! Payment Failed.
          </h1>
        </div>
        <Card className="bg-[#2A2A2A] p-8 rounded-lg shadow-lg">
          <CardTitle className="text-2xl font-bold text-white">
            Transaction Unsuccessful
          </CardTitle>
          <p className="text-gray-300 mt-4">
            Unfortunately, we couldn't process your payment. Please try again or contact support if the issue persists.
          </p>
          <Button
            className="mt-6 bg-[#007A5A] hover:bg-[#006148] text-white transition-colors duration-200 px-6 py-3 text-lg rounded-md"
            onClick={handleRetryPayment}
          >
            Retry Payment
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailed;
