import axios from "axios";
import { env } from "env/server.mjs";

const tmdbAPI = axios.create({
  baseURL: env.TMDB_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.TMDB_API_READ_ACCESS_TOKEN}`,
  },
});

export default tmdbAPI;
