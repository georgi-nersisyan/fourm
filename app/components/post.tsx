import React from 'react'
import { IPost } from './post-items'
import PostSwiper from './post-swiper'

interface PostProps{
  post: IPost
}

export default function Post({post}:PostProps) {
  return (
    <div className='w-3xl p-4 rounded-lg shadow-md bg-post-bg flex flex-col justify-center gap-3'>
        <h4 className='text-3xl'>{post.title}</h4>
        <span className='text-gray-300'>{post.content}</span>

        {post.media ? <PostSwiper media={post.media} /> : null}
    </div>
  )
}