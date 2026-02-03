import React from "react";
import { IPost } from "./post-items";
import Post from "./post";

interface PostsProps {
  postsItems: IPost[];
}

export default function Posts({ postsItems }: PostsProps) {
  // const 

  return (
    <div className="flex flex-col items-center gap-8 p-11">
      {postsItems.map((post: IPost) => (
        <Post key={`post-${post.id}`} post={post} />
      ))}
    </div>
  );
}
