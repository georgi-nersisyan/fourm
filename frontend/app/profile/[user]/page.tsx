import Link from "next/link";

interface Props {
  params: {
    user: string;
  };
}

interface Post {
  id: number;
  title: string;
  content: string;
  media: any[];
  author: {
    id: number;
    username: string;
    avatar: string | null;
  };
}

async function getUser(username: string) {
  const res = await fetch(`http://localhost:5000/users/${username}`, { cache: "no-store" });
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

async function getUserPosts(username: string) {
  const res = await fetch(`http://localhost:5000/users/${username}/posts`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function UserProfilePage({ params }: Props) {
  const user = await getUser(params.user);
  const posts: Post[] = await getUserPosts(params.user);

  return (
    <div className="p-4 flex flex-col gap-3 justify-center items-center">
      <div className="w-xl flex flex-col gap-4 items-center bg-profile p-4 rounded-2xl">
        <div className="w-full flex gap-5 items-center">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt=""
            className="w-20 h-20 object-cover rounded-sm"
          />
          <div>
            <h3 className="text-6xl">{user.username}</h3>
            <p className="font-bold">{user.last_name}</p>
          </div>
        </div>

        <span className="text-gray-500 break-words break-all min-w-0">
          {user.bio}
        </span>

        <div className="w-full mt-6">
          <h4 className="text-2xl mb-2">{user.username}'s posts</h4>
          {posts.length ? (
            <ul className="flex flex-col gap-3">
              {posts.map((p) => (
                <div
                  key={p.id}
                    className="p-3 border border-primary-border rounded-lg flex flex-col gap-2"
                >
                  <Link href={`/posts/${p.id}`}><h2 className="text-xl">{p.title}</h2></Link>
                  <p>{p.content}</p>
                </div>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No posts yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
