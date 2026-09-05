import { API_BASE_URL } from "../config/api";

export interface Blog {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  published: boolean;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getBlogs(): Promise<Blog[]> {
  const response = await fetch(`${API_BASE_URL}/v1/api/blogs`);

  if (!response.ok) {
    throw new Error("Failed to load blogs");
  }

  return response.json();
}

export async function getBlogBySlug(slug: string): Promise<Blog> {
  const response = await fetch(
    `${API_BASE_URL}/v1/api/blogs/${encodeURIComponent(slug)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load blog");
  }

  return response.json();
}
