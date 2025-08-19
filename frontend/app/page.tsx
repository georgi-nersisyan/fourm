"use client";

import { useEffect, useState } from "react";
import { IPost } from "./components/post-items";
import Posts from "./components/posts";

export default function Home() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/posts', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки постов');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      console.error('Ошибка загрузки постов:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white text-xl">Загрузка постов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {posts.length > 0 ? (
        <Posts postsItems={posts} />
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-400 text-xl">Постов пока нет. Создайте первый пост!</div>
        </div>
      )}
    </div>
  );
}