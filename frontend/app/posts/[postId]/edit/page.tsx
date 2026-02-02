"use client";
import React, { useEffect, useState } from "react";
import { ImCross } from "react-icons/im";
import { IMedia } from "../../components/post-items";
import { useRouter } from "next/navigation";

interface EditProps {
  params: { postId: string | number };
}

export default function EditPage({ params }: EditProps) {
  const router = useRouter();

  const [files, setFiles] = useState<IMedia[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isTitleError, setIsTitleError] = useState<boolean>(false);
  const [isDescriptionError, setIsDescriptionError] = useState<boolean>(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const MAX_FILE_SIZE = 1024 * 1024 * 1;
  const MAX_FILES = 5;

  useEffect(() => {
    const loadPost = async () => {
      const res = await fetch(`http://localhost:5000/posts/${params.postId}`, {
        credentials: "include",
      });

      if (!res.ok) return;

      const post = await res.json();
      setTitle(post.title);
      setDescription(post.content || "");
      setFiles(post.media || []);
    };

    loadPost();
  }, [params.postId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = await Promise.all(
        Array.from(e.target.files)
          .slice(0, MAX_FILES - files.length)
          .map(
            async (file): Promise<IMedia> => ({
              id: Math.random(),
              src: await fileToBase64(file),
              type: file.type.startsWith("image/") ? "image" : "video",
              name: file.name,
              size: file.size,
            }),
          ),
      );

      const totalSize = [...files, ...newFiles].reduce(
        (sum, f) => sum + f.size,
        0,
      );
      if (totalSize > 1024 * 1024 * 4) {
        // максимум 4 МБ
        alert("Файлы слишком большие для LocalStorage!");
        return;
      }

      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDelete = (FileId: IMedia["id"]) => {
    setFiles(files.filter((file) => file.id !== FileId));
  };

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 300) {
      setTitle(e.target.value);
      setIsTitleError(false);
    }
  };

  const handleDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 1000) {
      setDescription(e.target.value);
      setIsDescriptionError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`http://localhost:5000/posts/${params.postId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, media: files }),
    });

    if (res.ok) router.push(`/posts/${params.postId}`);
  };
  return (
    <div className="w-full p-6 flex flex-col justify-center items-center">
      <form className="w-2xl flex flex-col gap-7 p-2.5" onSubmit={handleSubmit}>
        <h3 className="text-5xl text-start">Edit post</h3>

        <div className="w-full flex flex-col gap-2">
          <input
            type="text"
            placeholder="Title*"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl" +
              `${isTitleError ? " border-error" : " border-primary-border"}` +
              `${isTitleError ? " text-error" : " text-foreground"}`
            }
            onChange={(e) => handleTitle(e)}
            value={title}
          />
          <span>{title.length}/300</span>
        </div>

        <div className="w-full flex flex-col gap-2">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="block w-full p-2.5 rounded-2xl border-2 text-gray-300 border-primary-border hover:border-primary transition-colors cursor-pointer"
          />

          <span>{files.length}/5</span>

          <div>
            <ul>
              {files.map((file, index) => (
                <li
                  key={index}
                  className="text-gray-300 flex gap-2 items-center"
                >
                  {file.name} (
                  {file.size
                    ? (file.size / 1024).toFixed(2)
                    : "Not information"}{" "}
                  + KB)
                  <button
                    className="border-none bg-transparent text-error"
                    onClick={() => handleDelete(file.id)}
                  >
                    <ImCross />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <textarea
            placeholder="content"
            className={
              "w-full p-2.5 rounded-2xl border-2 text-xl resize-none" +
              `${
                isDescriptionError ? " border-error" : " border-primary-border"
              }` +
              `${isDescriptionError ? " text-error" : " text-foreground"}`
            }
            rows={7}
            onChange={handleDescription}
            value={description}
          ></textarea>
          <span>{description.length}/1000</span>
        </div>
        <input
          type="submit"
          value="Edit"
          className="w-full p-2 bg-yellow-500 text-white border-yellow-500 border-2 border-solid transition-all rounded-2xl cursor-pointer hover:bg-transparent hover:text-yellow-500"
        />
      </form>
    </div>
  );
}