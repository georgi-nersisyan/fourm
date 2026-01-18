"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";

export default function CreatePost() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<'post' | 'question'>('post');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Файл слишком большой! Максимум 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("Можно загружать только изображения!");
        return;
      }

      setImageFile(file);
      setError("");
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Заполните заголовок и содержимое поста");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('post_type', postType);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('http://localhost:5000/posts', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка создания поста');
      }

      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка создания поста');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Назад на главную
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-8">Создать пост</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Тип поста *
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as 'post' | 'question')}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="post">Обычный пост</option>
              <option value="question">Вопрос</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Заголовок *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder={postType === 'question' ? "Введите вопрос" : "Введите заголовок поста"}
              maxLength={200}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {title.length}/200
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Изображение (необязательно)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-3 relative">
                <Image 
                  src={imagePreview} 
                  alt="Превью изображения" 
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg max-w-full h-auto"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Содержимое *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Введите содержимое поста"
              rows={8}
              maxLength={2000}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {content.length}/2000
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900 border border-red-700 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Создание..." : "Создать пост"}
          </button>
        </form>
      </div>
    </div>
  );
}