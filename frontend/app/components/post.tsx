"use client";

import React, { useState } from "react";
import { IPost } from "./post-items";
import PostSwiper from "./post-swiper";
import Link from "next/link";
import { AiFillLike } from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

interface PostProps {
  post: IPost;
}

export default function Post({ post }: PostProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(
    user ? post.likes.some((like) => like.id === user?.id) : false,
  );

  const [comments, setComments] = useState(post.comments);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isComment, setIsComment] = useState(
    user ? post.comments.some((comment) => comment.id === user?.id) : false,
  );

  const onWrite = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  const [commentText, setCommentText] = useState("");

  const handleComment = async () => {
    if (!user || !commentText.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/posts/${post.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: commentText }),
        },
      );

      if (!res.ok) throw new Error("Failed to add comment");

      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  const onLike = async () => {
    if (!user) return;

    if (isLiked) {
      setLikes((prev) => prev.filter((like) => like.id !== user.id));
      setIsLiked(false);
    } else {
      setLikes((prev) => [
        ...prev,
        { id: user.id, username: user.username, avatar: user.avatar },
      ]);
      setIsLiked(true);
    }

    try {
      const res = await fetch(`http://localhost:5000/posts/${post.id}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Like failed");
    } catch (err) {
      setLikes(post.likes);
      setIsLiked(post.likes.some((like) => like.id === user.id));
    }
  };

  return (
    <div className="w-3xl p-4 rounded-lg shadow-md bg-post-bg flex flex-col justify-center gap-3">
      <div className="flex gap-3 p-2 items-center">
        <Link href={`/profile/${post.author.username}`}>
          <img
            src={post.author.avatar}
            alt=""
            className="w-10 h-10 object-cover rounded-full"
          />
        </Link>

        <Link href={`/profile/${post.author.username}`}>
          <h4 className="text-xl">{post.author.username}</h4>
        </Link>
      </div>

      <Link href={`/posts/${post.id}`}>
        <h4 className="text-3xl break-words whitespace-pre-wrap">
          {post.title.length >= 20
            ? post.title.slice(0, 20) + "..."
            : post.title}
        </h4>
      </Link>
      <span className="text-gray-300 break-words whitespace-pre-wrap">
        {post.content.length >= 100
          ? post.content.slice(0, 100) + "..."
          : post.content}
      </span>

      {post.media ? <PostSwiper media={post.media} /> : null}

      <div className="flex gap-4 items-center">
        <button
          className="flex items-center gap-2 cursor-pointer"
          onClick={onLike}
        >
          <AiFillLike
            className={`transition-colors ${isLiked ? "text-red-500" : "text-white"}`}
            size={30}
          />
          <span>{likes.length}</span>
        </button>

        <button
          className="flex items-center gap-2 cursor-pointer"
          onClick={onWrite}
        >
          <FaRegCommentDots color="white" size={30} />
          <span>{comments.length}</span>
        </button>
      </div>

      <div className={`flex gap-2 ${isCommentsOpen ? "mt-4" : " hidden"}`}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full border-2 border-primary-border border-solid rounded-lg p-2"
          placeholder="Write a comment..."
        />
        <button
          onClick={handleComment}
          className="px-4 py-2 bg-submit rounded-lg"
        >
          Send
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {comments.map((comment) => {
          return (
            <li key={comment.post_id} className="flex gap-2">
              <Link href={`/profile/${comment.author.username}`}>
                <img
                  src={comment.author.avatar}
                  alt=""
                  className="w-8 h-8 object-cover rounded-full"
                />
              </Link>
              <div className="flex flex-col">
                <Link href={`/profile/${comment.author.username}`}>
                  <span className="font-bold">{comment.author.username}</span>
                </Link>
                <span className="text-sm text-gray-500">{comment.text}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
