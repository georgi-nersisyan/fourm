import React from "react";
import { IPost } from "./post-items";
import Post from "./post";

interface PostsProps {
  postsItems: IPost[];
}

export default function Posts({ postsItems }: PostsProps) {
  return (
    <div className="flex flex-col items-center gap-8 p-11">
<<<<<<< HEAD
      {postsItems.map((post: IPost) => (
        <Post key={`post-${post.id}`} post={post} />
      ))}
=======
      {postsItems.map((post: IPost) => {
        return <Post key={"post-" + post.id} post={post} />;
      })}
>>>>>>> 3879534 (extend profile and add validation)
    </div>
  );
}
