"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
<<<<<<< HEAD
import Link from "next/link";
=======
>>>>>>> 3879534 (extend profile and add validation)
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
=======
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const {isLoggedIn, setIsLoggedIn} = useAuth();
>>>>>>> 3879534 (extend profile and add validation)
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

<<<<<<< HEAD
    if (!username || !password) {
      setMessage("Заполните все поля");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      await login(username, password);
      setIsError(false);
      router.push("/profile");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка входа");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3 justify-center items-center min-h-screen">
      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Назад на главную
        </Link>
      </div>
=======
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🔥 обязательно для cookie
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setIsError(false);
        setIsLoggedIn(true)
        router.push("/profile");
      } else {
        setMessage(data.error || "Ошибка входа");
        setIsLoggedIn(false);
        setIsError(true);
      }
    } catch (err) {
      setMessage("Сервер недоступен");
      setIsError(true);
    }

    setUsername("");
    setPassword("");
  };

  return (
    <div className="p-4 flex flex-col gap-3 justify-center items-center">
>>>>>>> 3879534 (extend profile and add validation)
      <form onSubmit={handleSubmit} className="w-xl flex flex-col gap-7 p-2.5">
        <h1 className="text-5xl font-bold">Login</h1>

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

        <button
          type="submit"
<<<<<<< HEAD
          disabled={loading}
          className="w-full h-12 p-2 bg-login border-login border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-login hover:text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Вход..." : "Войти"}
=======
          className="w-full h-12 p-2 bg-login border-login border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-login hover:text-xl"
        >
          Войти
>>>>>>> 3879534 (extend profile and add validation)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 3879534 (extend profile and add validation)
