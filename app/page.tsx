import { postItems } from "./components/post-items";
import Posts from "./components/posts";

export default function Home() {
  return (
  <div className="h-[200vh]">
    <Posts postsItems={postItems} />
  </div>
  );
}
