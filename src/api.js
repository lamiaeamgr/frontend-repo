import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

export async function getItems() {
  const response = await apiClient.get("/items");
  return response.data;
}

export async function createItem(payload) {
  const response = await apiClient.post("/items", payload);
  return response.data;
}
