"use client";

import { useEffect, useState } from "react";
import { IPost } from "./components/post-items";
import Posts from "./components/posts";

export default function Home() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'post' | 'question'>('all');

  const fetchPosts = async (type?: string) => {
    try {
      setLoading(true);
      const url = type ? `http://localhost:5000/posts?type=${type}` : 'http://localhost:5000/posts';
      const response = await fetch(url, {
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

  const searchPosts = async () => {
    if (!searchQuery.trim()) {
      fetchPosts();
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        q: searchQuery.trim()
      });
      
      if (searchType !== 'all') {
        params.append('type', searchType);
      }
      
      const response = await fetch(`http://localhost:5000/posts/search?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Ошибка поиска');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
      console.error('Ошибка поиска:', err);
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
      {/* Поиск */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Поиск постов</h1>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по заголовку или содержимому..."
              className="flex-1 min-w-64 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && searchPosts()}
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'all' | 'post' | 'question')}
              className="p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Все типы</option>
              <option value="post">Только посты</option>
              <option value="question">Только вопросы</option>
            </select>
            <button
              onClick={searchPosts}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔍 Поиск
            </button>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchType('all');
                  fetchPosts();
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ✕ Очистить
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Результаты */}
      {posts.length > 0 ? (
        <Posts postsItems={posts} />
      ) : !loading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="text-gray-400 text-xl">
            {searchQuery ? 'По вашему запросу ничего не найдено' : 'Постов пока нет. Создайте первый пост!'}
          </div>
        </div>
      ) : null}
    </div>
  );
}
