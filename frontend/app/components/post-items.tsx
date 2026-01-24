// Интерфейсы для постов
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

export interface IMedia {
    id: number;
    src: string;
    type: "image" | "video";
    name?: string;
    size?: number;
}

// Мок данные для разработки
export const postItems: IPost[] = [];
