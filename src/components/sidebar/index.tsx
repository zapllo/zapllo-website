'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { menuOptions } from '@/lib/constants'
import clsx from 'clsx'
import { Separator } from '@/components/ui/separator'
import { Database, GitBranch, LucideMousePointerClick, LogOut } from 'lucide-react'
import axios from 'axios'
import { IconLogout2 } from '@tabler/icons-react'

type Props = {}

const MenuOptions = (props: Props) => {
  const pathName = usePathname();
  const [role, setRole] = useState("");
  const router = useRouter();

  const logout = async () => {
    try {
      await axios.get('/api/users/logout');
      router.push('/login')
    } catch (error: any) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    const getUserDetails = async () => {
      const res = await axios.get('/api/users/me');
      const user = res.data.data;
      setRole(user.role);
    };
    getUserDetails();
  }, []);

  const filteredMenuOptions = menuOptions.filter(menuItem => {
    return role !== 'member' && role !== 'manager' || menuItem.name !== 'Billing';
  });

  return (
    <nav className="dark:bg-[#380E3D] h-screen border-r border-[#4F2F51] overflow-hidden scrollbar-hide justify-between flex items-center flex-col gap-10 py-4 px-2 w-20">

      <div className="flex items-center justify-center flex-col gap-8">
        <Link className="flex font-bold p-4 w-full flex-row" href="/">
          <img src='/icons/zapllo.png' className='h-full scale-125 ' />
        </Link>
        {/* <img src='/icons/ellipse.png' className='absolute h-[80%] z-[100] -mt-80 opacity-40 ' /> */}

        <TooltipProvider>
          {filteredMenuOptions.map((menuItem) => (
            <ul key={menuItem.name}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <li className="cursor-pointer">
                    <Link
                      href={menuItem.href}
                      className={clsx(
                        'group h-8 w-8 flex items-center justify-center scale-[1.5] rounded-lg p-[3px] cursor-pointer',
                        {
                          'dark:bg-transparent border-[#6b6276] border bg-[#EEE0FF] ':
                            pathName === menuItem.href,
                        }
                      )}
                    >
                      <menuItem.Component selected={pathName === menuItem.href} />
                    </Link>
                  </li>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-black/10 backdrop-blur-xl"
                >
                  <p>{menuItem.name}</p>
                </TooltipContent>
              </Tooltip>
            </ul>
          ))}
        </TooltipProvider>

      </div>
      <div className="flex items-center justify-center  flex-col mt-8">
        {/* Add logout icon here */}
        <TooltipProvider>
          <ul>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <li className="cursor-pointer h-8 w-8" onClick={logout}>

                  <IconLogout2 className='text-[#FD8829] text-3xl' />

                </li>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-black/10 backdrop-blur-xl"
              >
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </ul>
        </TooltipProvider>
      </div>
    </nav>
  )
}

export default MenuOptions
