"use client";

import { useEffect, useState } from "react";
import { postItems } from "./components/post-items";
import Posts from "./components/posts";

export default function Home() {
  const [posts, setPosts] = useState(postItems);

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    setPosts([...postItems, ...savedPosts]);
  }, []);

  return (
    <div className="h-[200vh]">
      <Posts postsItems={posts} />
    </div>
  );
}