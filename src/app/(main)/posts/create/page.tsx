"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import PostForm from "@/components/posts/PostForm";
import { revalidateDiscovery } from "@/actions/feed";

export default function CreatePostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSuccess = async () => {
    await revalidateDiscovery();
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    queryClient.invalidateQueries({ queryKey: ["gallery"] });
    router.push("/discovery");
    router.refresh();
  };

  return (
    <PostForm
      onClose={() => router.push("/discovery")}
      onPostSuccess={handleSuccess}
    />
  );
}
