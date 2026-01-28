interface PostProps {
  params: { postId: number | string };
}

async function getPost(id: string | number) {
  const res = await fetch(`http://localhost:5000/posts/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Пост не найден");

  return res.json();
}

export default async function PostPage({ params }: PostProps) {
  const post = await getPost(params.postId);

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>

      {post.media?.map((m: any, i: number) => (
        <img key={i} src={m.src} alt="" />
      ))}
    </div>
  );
}
