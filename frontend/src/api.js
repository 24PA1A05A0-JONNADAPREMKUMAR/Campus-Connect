import axios from "axios";

const api = axios.create({
  baseURL: "https://campusconnect-backend-y09c.onrender.com",
  withCredentials: true,
});

export default api;