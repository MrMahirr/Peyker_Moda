import { clearAuthStorage, getAccessToken } from "./authStorage";
import { API_BASE_URL } from "./config";
import { StoreUser } from "./types";

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
};

type ProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
};

export const authService = {
  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; user: StoreUser }> {
    const response = await fetch(`${API_BASE_URL}/store/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Giris basarisiz");
    return data.data || data;
  },

  async loginGoogle(
    idToken: string,
  ): Promise<{ accessToken: string; user: StoreUser }> {
    const response = await fetch(`${API_BASE_URL}/store/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Google giris basarisiz");
    return data.data || data;
  },

  async register(
    userData: RegisterPayload,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/store/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Kayit basarisiz");
    return data;
  },

  async logout(): Promise<void> {
    clearAuthStorage();
  },

  isLoggedIn(): boolean {
    return Boolean(getAccessToken());
  },

  getUser(): StoreUser | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    if (!user) return null;

    try {
      return JSON.parse(user) as StoreUser;
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<StoreUser | null> {
    if (typeof window === "undefined") return null;
    const token = getAccessToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/store/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.logout();
      return null;
    }

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Profil bilgileri alinamadi");

    const user = data.data || data.user || data;
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  },

  async updateProfile(profileData: ProfilePayload): Promise<StoreUser> {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadi");

    const response = await fetch(`${API_BASE_URL}/store/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Profil guncellenemedi");

    const user = data.data || data.user || data;
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  },
};
