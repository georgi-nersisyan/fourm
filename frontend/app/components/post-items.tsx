<<<<<<< HEAD
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

=======
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
>>>>>>> c80ee0c (add-posts)
export interface IMedia {
    id: number;
    src: string;
    type: "image" | "video";
<<<<<<< HEAD
    name?:string,
    size?:number
}

export interface IPost {
    id: number,
    title: string,
    content: string,
    media?: IMedia[],
}
=======
    name?: string;
    size?: number;
}

// Мок данные для разработки
export const postItems: IPost[] = [];
>>>>>>> c80ee0c (add-posts)
