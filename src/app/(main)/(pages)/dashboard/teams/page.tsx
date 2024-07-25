'use client'

import TeamTabs from '@/components/globals/tabstabs'
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

export default function Teams() {
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>();


  useEffect(() => {
    const getUserDetails = async () => {
      const res = await axios.get('/api/users/me')
      setCurrentUser(res.data.data);
      const trialStatusRes = await axios.get('/api/organization/trial-status');
      setIsTrialExpired(trialStatusRes.data.isExpired);
    }
    getUserDetails();
  }, []);

  if (isTrialExpired) {
    return (
      <div className='p-4 text-center mt-32'>
        <h1 className='text-xl font-bold text-red-500'>Your trial has expired!</h1>
        <p>Please purchase a subscription to continue using the Task Management features.</p>
        <Link href='/dashboard/billing'>
          <Button className='h-10 bg-white text-black hover:text-white mt-4 text-lg '>👑 Upgrade to Pro</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className='text-center font-bold text-xl p-4'>Teams</h1>
      <TeamTabs />
    </div>
  )
}
