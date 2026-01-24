"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IPost } from "../components/post-items";
import Posts from "../components/posts";

export default function QuestionsPage() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/posts?type=question', {
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
        <div className="text-white text-xl">Загрузка вопросов...</div>
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
      <div className="p-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
        >
          ← Назад на главную
        </Link>
      </div>
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-4">Вопросы</h1>
        <p className="text-gray-400">Здесь будут отображаться вопросы пользователей</p>
      </div>
      {posts.length > 0 ? (
        <Posts postsItems={posts} />
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-400 text-xl">Вопросов пока нет</div>
        </div>
      )}
    </div>
  );
}
