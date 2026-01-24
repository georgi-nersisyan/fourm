"use client";

import { useEffect, useState } from "react";
import { IPost } from "../components/post-items";
import Posts from "../components/posts";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

export default function BookmarksPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/bookmarks', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Ошибка загрузки закладок');
        }
        
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        console.error('Ошибка загрузки закладок:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-400 text-xl">
            Необходимо войти в систему для просмотра закладок
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white text-xl">Загрузка закладок...</div>
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
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Назад на главную
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-8">⭐ Мои закладки</h1>

        {posts.length > 0 ? (
          <Posts postsItems={posts} />
        ) : (
          <div className="text-center text-gray-400 text-xl">
            У вас пока нет закладок. Добавьте интересные посты в закладки!
          </div>
        )}
      </div>
    </div>
  );
}
