import db from "@/lib/db";
import PostEditor from "@/components/admin/PostEditor";
import { notFound } from "next/navigation";

interface Params { id: string }

export default async function EditPost({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const post = db
    .prepare("SELECT * FROM posts WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;

  if (!post) notFound();

  return <PostEditor initial={post as Parameters<typeof PostEditor>[0]["initial"]} />;
}
