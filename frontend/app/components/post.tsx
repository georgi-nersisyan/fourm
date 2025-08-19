import React from 'react';
import { IPost } from './post-items';
import Image from 'next/image';

interface PostProps {
  post: IPost;
}

export default function Post({ post }: PostProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-2xl p-6 rounded-lg shadow-lg bg-gray-800 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-white">@{post.author.username}</h4>
        <p className="text-gray-400 text-sm">{formatDate(post.created_at)}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">{post.title}</h2>

      <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

      {post.image && (
        <div className="relative w-full rounded-lg overflow-hidden">
          <Image
            src={`http://localhost:5000/uploads/${post.image}`}
            alt={post.title}
            width={800}
            height={400}
            className="object-cover w-full h-auto"
          />
        </div>
      )}
    </div>
  );
}