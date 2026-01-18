import React, { useState, useEffect } from 'react';
import { IPost, IComment, ITag } from './post-items';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

interface PostProps {
  post: IPost;
}

export default function Post({ post }: PostProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [comments, setComments] = useState<IComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [tags, setTags] = useState<ITag[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5000/posts/${post.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Перезагружаем страницу для обновления списка постов
        window.location.reload();
      } else {
        alert('Ошибка при удалении поста');
      }
    } catch (error) {
      console.error('Ошибка удаления поста:', error);
      alert('Ошибка при удалении поста');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5000/posts/${post.id}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reaction_type: reactionType })
      });

      if (response.ok) {
        const data = await response.json();
        // Обновляем счетчики в родительском компоненте
        window.location.reload();
      }
    } catch (error) {
      console.error('Ошибка реакции:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsAddingComment(true);
    try {
      const response = await fetch(`http://localhost:5000/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Удалить комментарий?')) return;

    try {
      const response = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (error) {
      console.error('Ошибка удаления комментария:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5000/posts/${post.id}/bookmark`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (error) {
      console.error('Ошибка закладки:', error);
    }
  };

  const handleExport = () => {
    window.open(`http://localhost:5000/posts/${post.id}/export`, '_blank');
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  return (
    <div className="w-full max-w-2xl p-6 rounded-lg shadow-lg bg-gray-800 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href={`/user/${post.author.id}`} className="font-semibold text-white hover:underline">@{post.author.username}</Link>
          <p className="text-gray-400 text-sm">{formatDate(post.created_at)}</p>
        </div>
        {user && user.id === post.author.id && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          post.post_type === 'question' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-600 text-gray-200'
        }`}>
          {post.post_type === 'question' ? 'Вопрос' : 'Пост'}
        </span>
        <h2 className="text-2xl font-bold text-white">{post.title}</h2>
      </div>

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

      {/* Кнопки лайков/дизлайков */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReaction('like')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              userReaction === 'like' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            👍 {post.likes_count}
          </button>
          <button
            onClick={() => handleReaction('dislike')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              userReaction === 'dislike' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            👎 {post.dislikes_count}
          </button>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors"
        >
          💬 {comments.length}
        </button>

        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
            isBookmarked 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {isBookmarked ? '⭐' : '☆'} Закладка
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors"
        >
          📄 Экспорт
        </button>

        {user && user.id !== post.author.id && (
          <Link
            href={`/chat/${post.author.id}`}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 transition-colors"
          >
            💬 Написать
          </Link>
        )}
      </div>

      {/* Комментарии */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Комментарии</h3>
          
          {/* Форма добавления комментария */}
          {user && (
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-400">{newComment.length}/500</span>
                <button
                  onClick={handleAddComment}
                  disabled={isAddingComment || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAddingComment ? 'Добавление...' : 'Добавить'}
                </button>
              </div>
            </div>
          )}

          {/* Список комментариев */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/user/${comment.author.id}`} className="font-semibold text-blue-400 hover:underline">
                      @{comment.author.username}
                    </Link>
                    <span className="text-gray-400 text-sm">{formatDate(comment.created_at)}</span>
                  </div>
                  {user && user.id === comment.author.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}