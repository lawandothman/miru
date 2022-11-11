import axios from "axios";

const tmdbAPI = axios.create({
  baseURL: process.env.TMDB_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
  },
});

export default tmdbAPI;
