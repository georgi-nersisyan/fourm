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
    created_at: string;
    author: IAuthor;
}

// Для обратной совместимости со старыми постами
export interface IMedia {
    id: number;
    src: string;
    type: "image" | "video";
    name?: string;
    size?: number;
}

// Мок данные для разработки
export const postItems: IPost[] = [];
