"use client";

import { useState } from "react";

export default function SignPage() {
  const [username, setUsername] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, lastName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setIsError(false);
      } else {
        setMessage(data.error || "Ошибка регистрации");
        setIsError(true);
      }
    } catch (err) {
      setMessage("Сервер недоступен");
      setIsError(true);
    }

    setUsername("");
    setLastName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="p-4 flex flex-col gap-3 justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="w-xl flex flex-col gap-7 p-2.5"
      >
        <h1 className="text-5xl font-bold">Sign in</h1>
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
          type="text"
          placeholder="Last name"
          className={
            "w-full p-2.5 rounded-2xl border-2 text-xl border-primary-border"
          }
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email*"
          className={
            "w-full p-2.5 rounded-2xl border-2 text-xl" +
            `${isError ? " border-error" : " border-primary-border"} ${
              isError ? " text-error" : " text-foreground"
            }`
          }
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
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
          className="w-full p-2 bg-submit border-submit border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-submit hover:text-xl"
        >
          Зарегистрироваться
        </button>
      </form>
      {message && (
        <p
          className={"mt-2 text-lg " + `${isError ? "text-error " : "text-foreground"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
