// pages/intranet.tsx
"use client";

import IntranetTable from "@/components/tables/intranetTable";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
}

interface IntranetEntry {
  _id: string;
  linkUrl: string;
  description: string;
  linkName: string;
  category: {
    _id: string;
    name: string;
  };
}

const IntranetPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [description, setDescription] = useState("");
  const [linkName, setLinkName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<IntranetEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // State for selected category
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query

  useEffect(() => {
    fetchEntries();
    fetchCategories();
  }, []);

  async function fetchEntries() {
    try {
      const response = await axios.get("/api/intranet");
      setEntries(response.data);
    } catch (error) {
      console.error("Failed to fetch intranet entries:", error);
    }
  }
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category/get");
      const result = await response.json();
      if (response.ok) {
        setCategories(result.data);
      } else {
        console.error("Error fetching categories:", result.error);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("/api/intranet", {
        linkUrl,
        description,
        linkName,
        category,
      });
      // Handle success (e.g., reset form, show message, etc.)
      setLinkName("");
      setLinkUrl("");
      setDescription("");
      setCategory("");
      setIsDialogOpen(false); // Close dialog
      fetchEntries();
    } catch (error) {
      console.error("Failed to create intranet entry:", error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="p-6 mt-12">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="w-full space-x-4 flex justify-center">
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-[#017A5B] text-xs text-white rounded hover:bg-[#017A5B]">
              New Link
            </button>
          </DialogTrigger>
          <select
            className="p-2 px-4 text-xs outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="text-xs">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="px-4 py-2 text-xs outline-none"
            placeholder="Search Link Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DialogContent className="">
          <div className="bg-[#1A1C20] z-[100] h-[320px] max-h-screen text-[#D0D3D3] w-[100%] rounded-lg p-4">
            <div className="flex justify-between w-full">
              <DialogTitle className="text-sm font-semibold">
                Add New Link
              </DialogTitle>
              <DialogClose className="text-sm font-semibold">
                {" "}
                <X className="cursor-pointer border -mt-1 rounded-full border-white h-5 hover:bg-white hover:text-black w-5" />
              </DialogClose>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                {/* <label htmlFor="linkUrl" className="block text-xs font-medium text-white -700">Link URL</label> */}
                <input
                  type="url"
                  placeholder="Link Url"
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  required
                  className="mt-1 block text-xs w-full  bg-transparent outline-none p-2 border rounded"
                />
              </div>

              <div>
                {/* <label htmlFor="description" className="block text-xs font-medium text-white -700">Description</label> */}
                <textarea
                  id="description"
                  value={description}
                  placeholder="Description"
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="mt-1 block text-xs bg-transparent outline-none w-full p-2 border rounded"
                />
              </div>

              <div>
                {/* <label htmlFor="linkName" className="block text-xs font-medium text-white -700">Link Name</label> */}
                <input
                  type="text"
                  id="linkName"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  required
                  placeholder="Link Name"
                  className="mt-1 bg-transparent text-xs outline-none block w-full p-2 border rounded"
                />
              </div>

              <div>
                {/* <label htmlFor="category" className="block text-xs font-medium text-white -700">Category</label> */}
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="mt-1 block text-xs  outline-none w-full p-2 border rounded"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#017A5B] w-full text-sm text-white rounded hover:bg-[#017A5B]"
              >
                Submit
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      <div className="w-full flex justify-center">
        <IntranetTable
          entries={entries}
          fetchEntries={fetchEntries}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default IntranetPage;
