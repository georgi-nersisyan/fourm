"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextType {
  searchText: string;
  setSearchText: (v: string) => void;
  searchResults: any[];
  setSearchResults: (v: any[]) => void;
  isSearchSubmitted: boolean;
  setIsSearchSubmitted: (v: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
};

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);
  
  return (
    <SearchContext.Provider value={{
        searchText,
        setSearchText,
        searchResults,
        setSearchResults,
        isSearchSubmitted,
        setIsSearchSubmitted,
      }}>
      {children}
    </SearchContext.Provider>
  );
};