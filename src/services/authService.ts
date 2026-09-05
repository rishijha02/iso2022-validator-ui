import { API_BASE_URL } from "../config/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username?: string;
  role?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: "ADMIN" | "USER";
}

export interface UserResponse {
  id: number;
  username: string;
  role: string;
  enabled: boolean;
}

async function parseError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body.message || body.error || fallback;
  } catch {
    return fallback;
  }
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Invalid username or password"));
  }

  return response.json();
}

export async function createUser(
  request: CreateUserRequest,
  token: string
): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/api/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Unable to create user"));
  }

  return response.json();
}

export function saveSession(response: LoginResponse) {
  localStorage.setItem("iso_auth_token", response.token);
  localStorage.setItem("iso_auth_username", response.username ?? "");
  localStorage.setItem("iso_auth_role", response.role ?? "");
}

export function clearSession() {
  localStorage.removeItem("iso_auth_token");
  localStorage.removeItem("iso_auth_username");
  localStorage.removeItem("iso_auth_role");
}

export function getToken() {
  return localStorage.getItem("iso_auth_token");
}

export function getUsername() {
  return localStorage.getItem("iso_auth_username") || "";
}

export function getRole() {
  return localStorage.getItem("iso_auth_role") || "";
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function isAdmin() {
  return getRole().toUpperCase() === "ADMIN";
}
