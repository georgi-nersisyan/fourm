"use client";

import React from "react";
import { IoSearch } from "react-icons/io5";
import { useSearch } from "../contexts/SearchContext";

export default function FindBlock() {
  const { searchText, setSearchText, setSearchResults, setIsSearchSubmitted } =
    useSearch();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchText.trim()) {
      setSearchResults([]);
      setIsSearchSubmitted(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/posts/search?q=${encodeURIComponent(searchText)}`,
        { credentials: "include" },
      );

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setIsSearchSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-3xl border-2 p-2"
    >
      <button type="submit" className="cursor-pointer">
        <IoSearch size={28} />
      </button>

      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setIsSearchSubmitted(false);
        }}
        className="w-lg outline-none px-2 py-1"
      />
    </form>
  );
}