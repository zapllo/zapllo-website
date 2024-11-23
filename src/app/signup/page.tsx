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
import Loader from "@/components/ui/loader";
import { AsYouType, CountryCode, getCountryCallingCode } from 'libphonenumber-js';
import { getData as getCountryData } from 'country-list';
import Flag from "react-world-flags";

interface Country {
  code: CountryCode;
  name: string;
}

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
    country: "IN", // Initialize country
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState<string>("");
  const [countryCode, setCountryCode] = useState('+91'); // Default country code for India
  const [selectedCountry, setSelectedCountry] = useState(organization?.country || "IN");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);


  useEffect(() => {
    const countryList = getCountryData()
      .map(country => ({
        code: country.code as CountryCode,
        name: country.name,
      }))
      .filter(country => {
        try {
          return getCountryCallingCode(country.code);
        } catch {
          return false;
        }
      });
    setCountries(countryList);
  }, []);

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
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleCountryChange = (code: CountryCode) => {
    const phoneCode = getCountryCallingCode(code);
    setCountryCode(`+${phoneCode}`);
    setSelectedCountry(code);
    setOrganization(prevOrg => ({
      ...prevOrg,
      country: code,
    }));
    setIsDropdownOpen(false);
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
      if (
        error.response?.status === 400 &&
        error.response?.data?.error.includes("email")
      ) {
        setEmailError(error.response.data.error);
        toast.error("This Email is already registered");
      } else {
        toast.error("Signup failed, Please Fill out all Fields ");
      }
      console.error("Signup failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      onSignup();
    }
  };

  return (
    <>
      <div
        
        className="relative flex bg-[#04071F] items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl">
        <div className="z-10 bg-[#04071F]">
          <Meteors number={30} />
        </div>
        {/* <Toaster /> */} {/* Sonner toaster for notifications */}
        <div
        onKeyDown={handleKeyDown} // Listen for keydown events here
        tabIndex={0} // Ensure the div is focusable for key events
        className="max-w-md w-full mt-4 z-[100] mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
          {showOrganizationForm ? (
            <ArrowLeft
              onClick={() => setShowOrganizationForm(false)}
              className="cursor-pointer border rounded-full border-white h-7 hover:bg-white hover:text-black w-7"
            />
          ) : (
            <h1></h1>
          )}
          <div className="flex justify-center">
            <img src="/logo.png" className="h-7" alt="Logo" />
          </div>
          <p className="text-neutral-600 text-sm font-bold text-center max-w-sm mt-2 dark:text-neutral-300">
            Let’s get started by filling up the form below
          </p>
          {showOrganizationForm ? (
            <div className="my-8">
              {/* Organization Form */}
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                <LabelInputContainer>
                  <h1 className="text-xs absolute ml-2 bg-[#000101]  text-[#D4D4D4]">
                    Company Name
                  </h1>
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
                  className="input py-3 px-2 text-white text-sm outline-none rounded-md border"
                >
                  <option value="" className=" text-[#787CA5]" disabled>
                    Select Industry
                  </option>
                  <option value="Retail/E-Commerce">Retail/E-Commerce</option>
                  <option value="Technology">Technology</option>
                  <option value="Service Provider">Service Provider</option>
                  <option value="Healthcare(Doctors/Clinics/Physicians/Hospital)">
                    Healthcare(Doctors/Clinics/Physicians/Hospital)
                  </option>
                  <option value="Logistics">Logistics</option>
                  <option value="Financial Consultants">
                    Financial Consultants
                  </option>
                  <option value="Trading">Trading</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Real Estate/Construction/Interior/Architects">
                    Real Estate/Construction/Interior/Architects
                  </option>
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
                  <option value="1-10">1-10</option>
                  <option value="11-20">11-20</option>
                  <option value="21-30">21-30</option>
                  <option value="31-50">31-50</option>
                  <option value="51+">51+</option>
                </select>
              </LabelInputContainer>
              <LabelInputContainer className="mb-8">
                <h1 className="text-xs absolute ml-2 bg-[#000101] text-[#D4D4D4]">
                  Company Description
                </h1>
                <Textarea
                  id="description"
                  value={organization.description}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      description: e.target.value,
                    })
                  }
                  // placeholder="Describe your company..."
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
                      className={`px-1 text-sm py-1 text-center text-white font-medium cursor-pointer rounded-xl bg-[#] border ${organization.categories.includes(category)
                        ? "bg-[#815BF5] text-white"
                        : "text-gray-600"
                        }`}
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <span className="text-sm pt-5">
                  Don&apos;t worry, you can add and change these categories
                  later
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
                  ? <Loader />
                  : showOrganizationForm
                    ? "Sign up →"
                    : "Sign up →"}
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
                  <h1 className="hover:underline cursor-pointer">
                    Back to Home
                  </h1>
                </Link>
              </div>
            </div>
          ) : (
            <div className="my-8">
              {/* User Signup Form */}
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                <LabelInputContainer>
                  <h1 className="text-xs absolute ml-2 bg-[#000101] text-[#D4D4D4]">
                    First name
                  </h1>
                  <Input
                    id="firstName"
                    type="text"
                    className="text-white"
                    value={user.firstName}
                    onChange={(e) =>
                      setUser({ ...user, firstName: e.target.value })
                    }
                    placeholder="Ben"
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <h1 className="text-xs absolute ml-2 bg-[#000101] text-[#D4D4D4]">
                    Last name
                  </h1>
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
                <h1 className="text-xs absolute ml-2 bg-[#000101] text-[#D4D4D4]">
                  Email address
                </h1>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="example@gmail.com"
                />
              </LabelInputContainer>
              <LabelInputContainer className="relative mb-4">
                <h1 className="text-xs absolute ml-2 bg-[#000101] text-[#D4D4D4]">Password</h1>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={user.password}
                  onChange={(e) =>
                    setUser({ ...user, password: e.target.value })
                  }
                // placeholder="••••••••"
                />
                <div
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <Eye className=" text-[#D4D4D4]" size={18} /> : <EyeOff className="  text-[#D4D4D4]" size={18} />}
                </div>
              </LabelInputContainer>
              <LabelInputContainer className="relative mb-4">
                <h1 className="text-xs absolute ml-2 bg-[#000101] text-[#D4D4D4]">
                  Confirm Password
                </h1>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={user.confirmPassword}
                  onChange={(e) =>
                    setUser({ ...user, confirmPassword: e.target.value })
                  }
                // placeholder="••••••••"
                />
                <div
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <Eye size={18} className=" text-[#D4D4D4]" />
                  ) : (
                    <EyeOff size={18} className=" text-[#D4D4D4]" />
                  )}
                </div>
              </LabelInputContainer>
              <div className="flex  relative mb-2">
                <div onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex w-full  items-center cursor-pointer bg-[#04071f]  border rounded  p-3 relative"

                >
                  <Flag code={selectedCountry} className="w-6 h-4 mr-2" />
                  <button className="bg-[#04071f] text-white w-full text-left text-sm focus:outline-none">
                    {countries.find(country => country.code === selectedCountry)?.name || "Select Country"}
                  </button>
                </div>

                {isDropdownOpen && (
                  <div className="absolute left-0 top-full  w-full max-h-60 overflow-y-auto bg-black p-2 border  rounded z-50">
                    <input
                      type="text"
                      placeholder="Search Country"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="p-2 mb-2 w-full text-sm text-white outline-none border rounded"
                    />
                    {filteredCountries.map(country => (
                      <div
                        key={country.code}
                        className="flex items-center p-2 text-sm cursor-pointer hover:bg-[#04061E] text-white"
                        onClick={() => handleCountryChange(country.code)}
                      >
                        <Flag code={country.code} className="w-6 h-4 mr-2" />
                        {country.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <LabelInputContainer className="mb-8">
                <h1 className="text-xs absolute ml-2 bg-[#000101] text-[#D4D4D4]">
                  Whatsapp No
                </h1>
                <div className="flex  ">
                  <span className="py-3 h-10 px-2  bg-[#0A0D28] text-[#D4D4D4] rounded-l   text-xs">{countryCode}</span>
                  <Input
                    id="whatsappNo"
                    type="text"
                    className="w-[350px] -ml-1"
                    value={user.whatsappNo}
                    onChange={(e) =>
                      setUser({ ...user, whatsappNo: e.target.value })
                    }
                  />
                </div>
              </LabelInputContainer>

              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="button"
                onClick={onSignup}
                disabled={loading}
              >
                {loading
                  ? <Loader />
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
