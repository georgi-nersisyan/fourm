"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Posts from "../components/posts";
import { useSearch } from "../contexts/SearchContext";

const LIMIT = 5;

export default function PostsPage() {
  const { searchResults, isSearchSubmitted } = useSearch();

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore || isSearchSubmitted) return;

    setLoading(true);

    const res = await fetch(
      `http://localhost:5000/posts?limit=${LIMIT}&offset=${offset}`,
      { credentials: "include" }
    );

    const data = await res.json();

    setPosts(prev => [...prev, ...data.posts]);
    setOffset(prev => prev + LIMIT);
    setHasMore(data.hasMore);
    setLoading(false);
  }, [loading, hasMore, offset, isSearchSubmitted]);

  useEffect(() => {
    if (isSearchSubmitted) return;
    if (!hasMore) return;
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          fetchPosts();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [fetchPosts, hasMore, isSearchSubmitted, loading]);

  useEffect(() => {
    if (isSearchSubmitted) {
      setPosts(searchResults);
      setHasMore(false);
      return;
    }

    setPosts([]);
    setOffset(0);
    setHasMore(true);
  }, [isSearchSubmitted, searchResults]);

  if (loading && posts.length === 0) {
    return <p className="text-center mt-10">Загрузка...</p>;
  }

  if (isSearchSubmitted && posts.length === 0) {
    return <p className="text-center mt-10">Ничего не найдено</p>;
  }

  return (
    <>
      <Posts postsItems={posts} />

      {!isSearchSubmitted && hasMore && (
        <div ref={loaderRef} className="h-10" />
      )}

      {loading && <p className="text-center my-4">Загрузка...</p>}
    </>
  );
}