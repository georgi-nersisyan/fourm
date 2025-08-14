"use client"

import React, { useState } from "react";

export default function CreatePost() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isTitleError, setIsTitleError] = useState<boolean>(false);
  const [isDescriptionError, setIsDescriptionError] = useState<boolean>(false);
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
    if (title.length > 0) {

      const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");

      const newPost = {
        id: Date.now(),
        title,
        content: description,
      };
      setTitle("");
      setDescription("");

      localStorage.setItem("posts", JSON.stringify([...savedPosts, newPost]));
      setIsTitleError(false);
    } else {
      setIsTitleError(true);
    }
  };

  return (
    <div className="w-full p-6 flex flex-col justify-center items-center">
      <form className="w-2xl flex flex-col gap-7 p-2.5" onSubmit={handleSubmit}>
        <h3 className="text-5xl text-start">Create post</h3>

        <div className="w-full flex flex-col gap-2">
          <input
            type="text"
            placeholder="Title*"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl" +
              `${isTitleError ? " border-error" : "border-primary-border"}` +
              `${isTitleError ? " text-error" : "text-foreground"}`
            }
            onChange={handleTitle}
            value={title}
          />
          <span>{title.length}/300</span>
        </div>

        <div className="w-full flex flex-col gap-2">
          <textarea
            placeholder="content"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl resize-none" +
              `${isDescriptionError ? " border-error" : "border-primary"}` +
              `${isDescriptionError ? " text-error" : "text-foreground"}`
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
          className="w-full p-2 bg-submit border-submit border-2 border-solid transition-all rounded-2xl hover:bg-transparent hover:text-submit"
        />
      </form>
    </div>
  );
}
