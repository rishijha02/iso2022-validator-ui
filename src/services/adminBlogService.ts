import { API_BASE_URL } from "../config/api";
import type { Blog } from "./blogService";

export interface BlogRequest {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  published: boolean;
  coverImageUrl : string;
}

async function parseError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body.message || body.error || fallback;
  } catch {
    return fallback;
  }
}

async function adminFetch(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Admin request failed"));
  }

  return response;
}

export async function createBlog(token: string, request: BlogRequest): Promise<Blog> {
  const response = await adminFetch("/v1/api/admin/blogs", token, {
    method: "POST",
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function updateBlog(token: string, id: number, request: BlogRequest): Promise<Blog> {
  const response = await adminFetch(`/v1/api/admin/blogs/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function deleteBlog(token: string, id: number): Promise<void> {
  await adminFetch(`/v1/api/admin/blogs/${id}`, token, { method: "DELETE" });
}
