"use client";

import React, { useState } from "react";
<<<<<<< HEAD
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
=======
import { ImCross } from "react-icons/im";
import { IMedia } from "../components/post-items";
import { useRouter } from "next/navigation";

export default function CreatePost() {
  const router = useRouter();

  const [files, setFiles] = useState<IMedia[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isTitleError, setIsTitleError] = useState<boolean>(false);
  const [isDescriptionError, setIsDescriptionError] = useState<boolean>(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const MAX_FILE_SIZE = 1024 * 1024 * 1;
  const MAX_FILES = 5;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = await Promise.all(
        Array.from(e.target.files)
          .slice(0, MAX_FILES - files.length)
          .map(
            async (file): Promise<IMedia> => ({
              id: Math.random(),
              src: await fileToBase64(file),
              type: file.type.startsWith("image/") ? "image" : "video",
              name: file.name,
              size: file.size,
            })
          )
      );

      const totalSize = [...files, ...newFiles].reduce(
        (sum, f) => sum + f.size,
        0
      );
      if (totalSize > 1024 * 1024 * 4) {
        // максимум 4 МБ
        alert("Файлы слишком большие для LocalStorage!");
        return;
      }

      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDelete = (FileId: IMedia["id"]) => {
    setFiles(files.filter((file) => file.id !== FileId));
  };

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 300) {
      setTitle(e.target.value);
      setIsTitleError(false);
    }
  };

  const handleDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 1000) {
      setDescription(e.target.value);
      setIsDescriptionError(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.length) {
      setIsTitleError(true);
      return;
    }

    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    const newPost = {
      id: Date.now(),
      title,
      content: description,
      media: files.map((file) => ({
        id: file.id,
        type: file.type,
        name: file.name,
        size: file.size,
        src: file.src,
      })),
    };

    localStorage.setItem("posts", JSON.stringify([...savedPosts, newPost]));

    setTitle("");
    setDescription("");
    setFiles([]);
    setIsTitleError(false);

    router.push("/");
  };

  return (
    <div className="w-full p-6 flex flex-col justify-center items-center">
      <form
        className="w-2xl flex flex-col gap-7 p-2.5"
        onSubmit={handleSubmit}
      >
        <h3 className="text-5xl text-start">Create post</h3>

        <div className="w-full flex flex-col gap-2">
          <input
            type="text"
            placeholder="Title*"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl" +
              `${isTitleError ? " border-error" : " border-primary-border"}` +
              `${isTitleError ? " text-error" : " text-foreground"}`
            }
            onChange={(e)=>handleTitle(e)}
            value={title}
          />
          <span>{title.length}/300</span>
        </div>

        <div className="w-full flex flex-col gap-2">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="block w-full p-2.5 rounded-2xl border-2 text-gray-300 border-primary-border hover:border-primary transition-colors cursor-pointer"
          />

          <span>{files.length}/5</span>

          <div>
            <ul>
              {files.map((file, index) => (
                <li
                  key={index}
                  className="text-gray-300 flex gap-2 items-center"
                >
                  {file.name} (
                  {file.size
                    ? (file.size / 1024).toFixed(2)
                    : "Not information"}{" "}
                  + KB)
                  <button
                    className="border-none bg-transparent text-error"
                    onClick={() => handleDelete(file.id)}
                  >
                    <ImCross />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <textarea
            placeholder="content"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl resize-none" +
              `${
                isDescriptionError ? " border-error" : " border-primary-border"
              }` +
              `${isDescriptionError ? " text-error" : " text-foreground"}`
            }
            rows={7}
            onChange={handleDescription}
            value={description}
          ></textarea>
          <span>{description.length}/1000</span>
        </div>
        <input
          type="submit"
          value="Create"
          className="w-full p-2 bg-submit border-submit border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-submit"
        />
      </form>
>>>>>>> 3879534 (extend profile and add validation)
    </div>
  );
}