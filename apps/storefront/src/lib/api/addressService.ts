import { getAccessToken, getAuthHeaders } from "./authStorage";
import { API_BASE_URL } from "./config";
import { AddressPayload, AddressResponse } from "./types";

export const addressService = {
  async getAddresses(): Promise<AddressResponse[]> {
    const token = getAccessToken();
    if (!token) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/store/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      return [];
    }
  },

  async addAddress(addressData: AddressPayload): Promise<AddressResponse> {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_BASE_URL}/store/addresses`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(addressData),
    });
    return response.json();
  },

  async updateAddress(
    id: string,
    addressData: AddressPayload,
  ): Promise<AddressResponse> {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_BASE_URL}/store/addresses/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: JSON.stringify(addressData),
    });
    return response.json();
  },

  async deleteAddress(id: string): Promise<boolean> {
    const token = getAccessToken();
    if (!token) return false;

    const response = await fetch(`${API_BASE_URL}/store/addresses/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.ok;
  },

  async setDefaultAddress(id: string): Promise<boolean> {
    const token = getAccessToken();
    if (!token) return false;

    const response = await fetch(
      `${API_BASE_URL}/store/addresses/${id}/default`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      },
    );
    return response.ok;
  },
};
