"use client";

import React, { useEffect, useState } from "react";
import Posts from "../components/posts";
import { useSearch } from "../contexts/SearchContext";

export default function PostsPage() {
  const { searchText, searchResults, isSearchSubmitted } = useSearch();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      if (!searchText || !isSearchSubmitted) {
        const res = await fetch("http://localhost:5000/posts", {
          credentials: "include",
        });
        const data = await res.json();
        setPosts(data);
      } else {
        setPosts(searchResults);
      }

      setLoading(false);
    };

    fetchPosts();
  }, [searchText, searchResults, isSearchSubmitted]);

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;

  if (searchText && posts.length === 0) {
    return <p className="text-center mt-10">Ничего не найдено</p>;
  }

  return <Posts postsItems={posts} />;
}
