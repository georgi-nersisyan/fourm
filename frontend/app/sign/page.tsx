"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setMessage("Заполните обязательные поля");
      setIsError(true);
      return;
    }

    setLoading(true);
    setIsError(false);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (bio) formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar);

      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setIsError(false);
        router.push("/profile");
      } else {
        setIsError(true);
        setMessage(data.error || "Ошибка регистрации");
      }
    } catch (err) {
      setIsError(true);
      setMessage("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3 justify-center items-center">
      <form onSubmit={handleSubmit} className="w-xl flex flex-col gap-7 p-2.5">
        <h1 className="text-5xl font-bold">Sign up</h1>

        <input
          type="text"
          placeholder="Username*"
          className={
            "w-full p-2.5 rounded-2xl border-2 text-xl " +
            (isError
              ? "border-error text-error"
              : "border-primary-border text-foreground")
          }
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email*"
          className={
            "w-full p-2.5 rounded-2xl border-2 text-xl " +
            (isError
              ? "border-error text-error"
              : "border-primary-border text-foreground")
          }
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password*"
          className={
            "w-full p-2.5 rounded-2xl border-2 text-xl" +
            `${isError ? " border-error" : " border-primary-border"} ${
              isError ? " text-error" : " text-foreground"
            }`
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <textarea
          placeholder="Bio (до 500 символов)"
          maxLength={500}
          className="w-full p-2.5 rounded-2xl border-2 text-xl border-primary-border resize-none"
          rows={6}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          className="block w-full p-2.5 rounded-2xl border-2 text-gray-300 border-primary-border hover:border-primary transition-colors cursor-pointer"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 p-2 bg-submit border-submit border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-submit hover:text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </form>

      {message && (
        <p
          className={
            "mt-2 text-lg " + `${isError ? "text-error " : "text-foreground"}`
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
