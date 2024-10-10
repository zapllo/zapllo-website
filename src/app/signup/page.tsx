"use client";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import Home from "@/components/icons/home";
import { businessCategories } from "@/lib/constants";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import CountryDrop from "@/components/globals/countrydropdown";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Meteors from "@/components/magicui/meteors";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    whatsappNo: "",
  });
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);
  const [organization, setOrganization] = useState<{
    companyName: string;
    industry: string;
    teamSize: string;
    description: string;
    categories: string[];
    country: string; // Added country field
  }>({
    companyName: "",
    industry: "",
    teamSize: "",
    description: "",
    categories: [],
    country: "", // Initialize country
  });

  const [showPassword, setShowPassword] = useState(false);

  // Handle category selection
  const handlenOnCategorySelect = (category: string) => {
    if (organization.categories.includes(category)) {
      setOrganization({
        ...organization,
        categories: organization.categories.filter((c) => c !== category),
      });
    } else {
      setOrganization({
        ...organization,
        categories: [...organization.categories, category],
      });
    }
  };

  // Toggle show/hide password
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Handler to receive selected country from CountryDrop
  // Handle country selection from CountryDrop
  const handleCountrySelect = (countryCode: string) => {
    setOrganization({ ...organization, country: countryCode });
  };

  const onSignup = async () => {
    setLoading(true);

    // Password validation
    if (user.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      if (!showOrganizationForm) {
        // If organization form is not shown, show it
        setShowOrganizationForm(true);
      } else {
        // Ensure country is selected
        if (!organization.country) {
          toast.error("Please select a country.");
          setLoading(false);
          return;
        }

        // Otherwise, submit both user and organization data
        await axios.post("/api/users/signup", {
          ...user,
          ...organization,
        });
        toast.success("Signup successful! Redirecting to login...");
        router.push("/login"); // Redirect after signup
      }
    } catch (error: any) {
      toast.error("Signup failed: " + (error.response?.data?.error || error.message)); // Display error toast
      console.error("Signup failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex bg-[#04071F] items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl">
        <div className="z-10 bg-[#04071F]">
          <Meteors number={30} />
        </div>
        <Toaster /> {/* Sonner toaster for notifications */}
        <div className="max-w-md w-full mt-4 z-[100] mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
          {showOrganizationForm ? (
            <ArrowLeft
              onClick={() => setShowOrganizationForm(false)}
              className="cursor-pointer"
            />
          ) : (
            <h1></h1>
          )}
          <div className="flex justify-center">
            <img src="/logo.png" className="h-7" alt="Logo" />
          </div>
          <p className="text-neutral-600 text-sm font-bold text-center max-w-sm mt-2 dark:text-neutral-300">
            Get Started
          </p>
          {showOrganizationForm ? (
            <div className="my-8">
              {/* Organization Form */}
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                <LabelInputContainer>
                  <h1 className="text-xs absolute ml-2 bg-[#000101]">Company Name</h1>
                  <Input
                    id="companyName"
                    type="text"
                    value={organization.companyName}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Company Name"
                  />
                </LabelInputContainer>
              </div>
              <LabelInputContainer className="mb-4">
                <select
                  id="industry"
                  value={organization.industry}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      industry: e.target.value,
                    })
                  }
                  className="input py-3 px-2 text-sm outline-none rounded-md border"
                >
                  <option value="" disabled>
                    Select Industry
                  </option>
                  <option value="Retail">Retail</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </LabelInputContainer>
              <LabelInputContainer className="mb-4">
                <select
                  id="teamSize"
                  value={organization.teamSize}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      teamSize: e.target.value,
                    })
                  }
                  className="input py-3 px-2 border outline-none rounded-md text-sm"
                >
                  <option value="" disabled>
                    Select Team Size
                  </option>
                  <option value="1-5">1-5</option>
                  <option value="5-10">5-10</option>
                  <option value="10-15">10-15</option>
                  <option value="15-20">15-20</option>
                  <option value="20-25">20-25</option>
                  <option value="25+">25+</option>
                </select>
              </LabelInputContainer>
              <LabelInputContainer className="mb-8">
                <h1 className="text-xs absolute ml-2 bg-[#000101]">Company Description</h1>
                <Textarea
                  id="description"
                  value={organization.description}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your company..."
                  className="w-full h-24 p-2 border rounded-md"
                />
              </LabelInputContainer>
              <LabelInputContainer className="mb-8">
                <Label htmlFor="categories">
                  Select the categories that are relevant to your business
                </Label>
                <div className="grid grid-cols-4 pt-2 flex-row gap-2">
                  {businessCategories.map((category) => (
                    <span
                      onClick={() => handlenOnCategorySelect(category)}
                      key={category}
                      className={`px-1 text-sm py-1 text-center text-white font-medium cursor-pointer rounded-xl bg-[#28152E] ${organization.categories.includes(category)
                        ? "bg-[#7C3987] text-white"
                        : "text-gray-600"
                        }`}
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <span className="text-sm pt-5">
                  Don&apos;t worry, you can change these later
                </span>
              </LabelInputContainer>

              {/* Country Dropdown
              <LabelInputContainer className="mb-8">
                <CountryDrop
                  selectedCountry={organization.country}
                  onCountrySelect={handleCountrySelect}
                />
              </LabelInputContainer> */}

              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="button"
                onClick={onSignup}
                disabled={loading}
              >
                {loading
                  ? "Signing up..."
                  : showOrganizationForm
                    ? "Sign up →"
                    : "Sign up →"}
                <BottomGradient />
              </button>
              <div className="p-4 flex justify-center">
                <Link href="/login" className="text-center hover:underline mt-2">
                  Already a{" "}
                  <span className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold">
                    Zapllonian
                  </span>
                  ? Login Here
                </Link>
              </div>
              <p className="text-xs text-center">
                By clicking continue, you agree to our{" "}
                <a href="/terms" className="underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacypolicy" className="underline">
                  Privacy Policy
                </a>
                .
              </p>
              <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

              <div className="flex justify-center gap-2">
                <div className="mt-[6px] scale-125">
                  <Home selected />
                </div>
                <Link href="/">
                  <h1 className="hover:underline cursor-pointer">Back to Home</h1>
                </Link>
              </div>
            </div>
          ) : (
            <div className="my-8">
              {/* User Signup Form */}
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                <LabelInputContainer>
                  <h1 className="text-xs absolute ml-2 bg-[#000101]">First name</h1>
                  <Input
                    id="firstName"
                    type="text"
                    value={user.firstName}
                    onChange={(e) =>
                      setUser({ ...user, firstName: e.target.value })
                    }
                    placeholder="Ben"
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <h1 className="text-xs absolute ml-2 bg-[#000101]">Last name</h1>
                  <Input
                    id="lastName"
                    type="text"
                    value={user.lastName}
                    onChange={(e) =>
                      setUser({ ...user, lastName: e.target.value })
                    }
                    placeholder="Richards"
                  />
                </LabelInputContainer>
              </div>
              <LabelInputContainer className="mb-4">
                <h1 className="text-xs absolute ml-2 bg-[#000101]">Email address</h1>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="example@gmail.com"
                />
              </LabelInputContainer>
              <LabelInputContainer className="relative mb-4">
                <h1 className="text-xs absolute ml-2 bg-[#000101]">Password</h1>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={user.password}
                  onChange={(e) =>
                    setUser({ ...user, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
                <div
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </LabelInputContainer>
              <LabelInputContainer className="relative mb-4">
                <h1 className="text-xs absolute ml-2 bg-[#000101]">Confirm Password</h1>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={user.confirmPassword}
                  onChange={(e) =>
                    setUser({ ...user, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
                <div
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </LabelInputContainer>
              <CountryDrop
                selectedCountry={organization.country}
                onCountrySelect={handleCountrySelect}
              />
              <LabelInputContainer className="mb-8">
                <h1 className="text-xs absolute ml-2 bg-[#000101]">Whatsapp No</h1>
                <Input
                  id="whatsappNo"
                  type="number"
                  value={user.whatsappNo}
                  onChange={(e) =>
                    setUser({ ...user, whatsappNo: e.target.value })
                  }
                />
              </LabelInputContainer>

              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="button"
                onClick={onSignup}
                disabled={loading}
              >
                {loading
                  ? "Signing up..."
                  : showOrganizationForm
                    ? "Sign up →"
                    : "Next →"}
                <BottomGradient />
              </button>
              <div className="p-4 flex justify-center">
                <Link
                  href="/login"
                  className="text-center hover:underline mt-2"
                >
                  Already a{" "}
                  <span className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold">
                    Zapllonian
                  </span>
                  ? Login Here
                </Link>
              </div>
              <p className="text-xs text-center">
                By clicking continue, you agree to our{" "}
                <a href="/terms" className="underline text-blue-400">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacypolicy" className="underline text-blue-400">
                  Privacy Policy
                </a>
                .
              </p>
              <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

              <div className="flex justify-center gap-2">
                <div className="mt-[6px] scale-125">
                  <Home selected />
                </div>
                <Link href="/">
                  <h1 className="hover:underline cursor-pointer">
                    Back to Home
                  </h1>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
