"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

const categories = [
    "All",
    "Task Delegation App",
    "Leave and Attendance App",
    "Zapllo WABA",
];

export default function Tutorials() {
    const [tutorials, setTutorials] = useState<any[]>([]);
    const [filteredTutorials, setFilteredTutorials] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("Task Delegation App");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchTutorials = async () => {
            try {
                const response = await axios.get("/api/tutorials");
                setTutorials(response.data.tutorials);
                setFilteredTutorials(response.data.tutorials);
            } catch (err) {
                console.error("Failed to fetch tutorials:", err);
                setError("Failed to load tutorials.");
            } finally {
                setLoading(false);
            }
        };

        fetchTutorials();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        const filtered = tutorials.filter((tutorial) =>
            tutorial.title.toLowerCase().includes(e.target.value.toLowerCase())
        );
        filterByCategory(selectedCategory, filtered);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value);
        filterByCategory(e.target.value, tutorials);
    };

    const filterByCategory = (category: string, tutorialList: any[]) => {
        if (category === "All") {
            setFilteredTutorials(
                tutorialList.filter((tutorial) =>
                    tutorial.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            const filtered = tutorialList.filter(
                (tutorial) =>
                    tutorial.category === category &&
                    tutorial.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTutorials(filtered);
        }
    };

    const handleTutorialClick = (id: string) => {
        router.push(`/help/tutorials/${id}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <DotLottieReact
                    src="/lottie/loading.lottie"
                    loop
                    autoplay
                    className="h-56"
                />
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="h-fit max-h-screen scrollbar-hide overflow-y-scroll">
            <div className="p-4">
                <div className="mb-6 flex flex-wrap justify-center items-center gap-4">
                    {/* Search Bar */}
                    <div className=" flex items-center w-full ml-24 px-4 focus-within:border-[#815bf5] rounded border py-2 gap-3 bg-[#0B0D29]">
                        <FaSearch className="text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Search Tutorials"
                            className="text-sm w-64 bg-transparent  text-white  focus:outline-none"
                        />
                    </div>
                    {/* Category Dropdown */}
                    <div className="flex items-center justify-between w-full">
                        <h1 className="ml-24 text-lg font-bold text-center">{selectedCategory}</h1>

                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="px-4 py-2 border border-gray-700 text-sm bg-[#0B0D29] text-white rounded focus:outline-none"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5 ml-24 gap-4">
                    {filteredTutorials.length > 0 ? (
                        filteredTutorials.map((tutorial) => (
                            <div
                                key={tutorial._id}
                                className="border hover:border-[#815BF5] rounded w-56 text-white cursor-pointer hover:shadow-lg transition"
                                onClick={() => handleTutorialClick(tutorial._id)}
                            >
                                <img
                                    src={tutorial.thumbnail}
                                    alt={tutorial.title}
                                    className="w-56 object-cover rounded rounded-b-none"
                                />
                                <h3 className="mt-2 p-2 text-sm rounded-2xl">{tutorial.title}</h3>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-white -500">
                            <DotLottieReact
                                src="/lottie/empty.lottie"
                                loop
                                className="h-56"
                                autoplay
                            />
No Tutorials Found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
