"use client";

import { useEffect, useState } from "react";
import { IPost } from "./components/post-items";
import Posts from "./components/posts";

export default function Home() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/posts", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="h-[200vh]">
      <Posts postsItems={posts} />
    </div>
  );
}