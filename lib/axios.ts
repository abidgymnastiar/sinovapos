import axios from "axios";

export const api = axios.create({
  baseURL: process.env.BaseURL || "http://localhost:3000/api",
});
