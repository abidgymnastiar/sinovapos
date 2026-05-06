import axios from "axios";

const isBrowser = typeof window !== "undefined";
const baseUrl = isBrowser
  ? "/api"
  : `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/u, "") ?? "http://localhost:3000"}/api`;

export const api = axios.create({
  baseURL: baseUrl,
});
