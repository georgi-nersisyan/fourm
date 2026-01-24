<<<<<<< HEAD
// Простые интерфейсы для постов
export interface IAuthor {
    id: number;
    username: string;
    avatar: string;
}

export interface IPost {
    id: number;
    title: string;
    content: string;
    image?: string;
    post_type: 'post' | 'question';
    likes_count: number;
    dislikes_count: number;
    created_at: string;
    author: IAuthor;
}

export interface IComment {
    id: number;
    content: string;
    created_at: string;
    author: IAuthor;
}

export interface IUserStats {
    posts_count: number;
    questions_count: number;
    total_likes: number;
    total_dislikes: number;
    comments_count: number;
    reputation: number;
}

export interface ITag {
    id: number;
    name: string;
    color: string;
    posts_count?: number;
}

export interface INotification {
    id: number;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    related_post_id?: number;
    created_at: string;
}

export interface IAchievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    condition_type: string;
    condition_value: number;
    earned_at?: string;
}

export interface IChatMessage {
    id: number;
    content: string;
    sender_id: number;
    receiver_id: number;
    is_read: boolean;
    created_at: string;
}

export interface IChatRoom {
    room_id: number;
    other_user: {
        id: number;
        username: string;
        avatar: string;
    };
    last_message: {
        content: string;
        created_at: string;
        is_from_me: boolean;
    };
    unread_count: number;
}

// Для обратной совместимости со старыми постами
=======
export const postItems:IPost[] = [
    {
        id: 1,
        title: "First Post",
        content: "This is the content of the first post.",
        media: [{id:Math.random(),src:"https://platinumlist.net/guide/wp-content/uploads/2023/03/IMG-worlds-of-adventure.webp", type: "image"},{id:Math.random(),src:"https://platinumlist.net/guide/wp-content/uploads/2023/03/IMG-worlds-of-adventure.webp", type: "image"},{id:Math.random(), src:"https://www.youtube.com/watch?v=dQw4w9WgXcQ", type:"video"}],
    },
    {
        id: 2,
        title: "Second Post",
        content: "This is the content of the second post.",
        media: [{id:Math.random(),src:"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/d9/fa/1b/lost-valley.jpg?w=900&h=500&s=1", type:"image"}],
    },
    {
        id: 3,
        title: "Third Post",
        content: "This is the content of the third post.",
    }
]

>>>>>>> 3879534 (extend profile and add validation)
export interface IMedia {
    id: number;
    src: string;
    type: "image" | "video";
<<<<<<< HEAD
    name?: string;
    size?: number;
}

// Мок данные для разработки
export const postItems: IPost[] = [];
=======
    name?:string,
    size?:number
}

export interface IPost {
    id: number,
    title: string,
    content: string,
    media?: IMedia[],
}
>>>>>>> 3879534 (extend profile and add validation)
