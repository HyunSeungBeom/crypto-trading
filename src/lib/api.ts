import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.error || "오류가 발생했습니다";
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
