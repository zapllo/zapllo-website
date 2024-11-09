"use client";

import InfoBar from "@/components/infobar";
import MenuOptions from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { formatDistanceToNow, intervalToDuration } from "date-fns";
import { XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [trialExpires, setTrialExpires] = useState<Date | null>(null);
  const [timeMessage, setTimeMessage] = useState("");
  const [userLoading, setUserLoading] = useState<boolean | null>(false);

  const handleClose = () => setIsVisible(false);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        setUserLoading(true);
        const userRes = await axios.get("/api/users/me");
        const response = await axios.get("/api/organization/getById");

        const organization = response.data.data;
        const trialEnd = new Date(organization.trialExpires);
        const expired = trialEnd <= new Date();

        setTrialExpires(trialEnd);
        setIsTrialExpired(expired);
        setUserLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    getUserDetails();
  }, []);

  useEffect(() => {
    if (trialExpires) {
      const updateTimeMessage = () => {
        const now = new Date();
        const trialEnd = new Date(trialExpires);

        if (isTrialExpired) {
          // Calculate elapsed time since expiration
          const duration = intervalToDuration({ start: trialEnd, end: now });
          const message =
            (duration.days || 0) > 0
              ? `${duration.days} days ago`
              : `${duration.hours || 0}h ${duration.minutes || 0}m since trial expired`;
          setTimeMessage(message);
        } else {
          // Calculate remaining time until expiration
          const remaining = formatDistanceToNow(trialEnd, { addSuffix: true });
          setTimeMessage(remaining);
        }
      };

      updateTimeMessage(); // Initial call
      const intervalId = setInterval(updateTimeMessage, 1000 * 60); // Update every minute

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [isTrialExpired, trialExpires]);


  const isDynamicRoute = pathname.match(/^\/dashboard\/tickets\/[^/]+$/);

  if (
    isTrialExpired &&
    pathname !== "/dashboard/billing" &&
    pathname !== "/tutorials" &&
    pathname !== "/dashboard/tickets" &&
    !isDynamicRoute
  ) {
    return (
      <div className="text-center pt-48 h-screen">
        <div className="justify-center flex items-center w-full">
          <div>
            <div className="flex justify-center w-full">
              <img src="/icons/danger.png" alt="Danger icon" />
            </div>
            <h1 className="text-xl font-bold text-red-500">
              Your trial has expired!
            </h1>
            <p>{timeMessage}</p>
            <p>
              Please purchase a subscription to continue using the Task
              Management features.
            </p>
          </div>
        </div>
        <Link href="/dashboard/billing">
          <Button className="h-8 bg-[#822B90] hover:bg-[#822B90] text-white hover:text-white mt-4 text-sm">
            Upgrade to Pro
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {isVisible && (
        <div className="p-2 flex fixed top-0 w-full justify-center z-[100] gap-2 bg-[#37384B] border">
          <div className="flex gap-2 justify-center w-full">
            <h1 className="text-center mt-1 flex text-white text-xs">
              {isTrialExpired ? (
                <>Your trial period expired </>
              ) : (
                <>Your Trial Period will expire </>
              )}
              <strong className="text-yellow-500 ml-1">{timeMessage}</strong>,
              Upgrade now for uninterrupted access
            </h1>
            <Link href="/dashboard/billing">
              <Button className="h-5 rounded dark:bg-[#017a5b] w-fit px-2 py-3 text-xs text-white">
                Upgrade Now
              </Button>
            </Link>
          </div>
          <button onClick={handleClose} className="ml-auto text-white">
            <CrossCircledIcon className="scale-150  hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
          </button>
        </div>
      )}
      <div
        className={`flex overflow-hidden ${isVisible ? "mt-10" : ""
          } dark:bg-[#04061E] scrollbar-hide h-full w-full`}
      >
        <MenuOptions />
        <div className="w-full overflow-hidden h-screen">
          <InfoBar />
          <div className="ml-16">{props.children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
