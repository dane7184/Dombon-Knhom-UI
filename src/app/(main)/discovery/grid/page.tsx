import React from "react";
import GridPostCard from "@/components/discovery/GridPostCard";
import { getGalleryAction } from "@/actions/feed";

export default async function page() {
  const initialData = await getGalleryAction(null).catch(() => null);

  return (
      <GridPostCard initialData={initialData} />
  )
}
