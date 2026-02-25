import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import PostEditor from "@/components/admin/PostEditor";
import { notFound } from "next/navigation";

interface Params { id: string }

export default async function EditPost({ params }: { params: Promise<Params> }) {
  const { id } = await params;

  await connectDB();
  const post = await Post.findById(id).lean() as Record<string, unknown> | null;
  if (!post) notFound();

  return <PostEditor initial={post as Parameters<typeof PostEditor>[0]["initial"]} />;
}
