"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    <div className="p-4 flex flex-col gap-3 justify-center items-center">
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
          disabled={loading}
          className="w-full h-12 p-2 bg-login border-login border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-login hover:text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Вход..." : "Войти"}
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
