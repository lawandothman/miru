interface Genre {
  id?: number;
  name?: string;
}
export type GenreResponseType = {
  genres: Genre[];
};

export interface Movie {
  poster_path?: string | null;
  adult?: boolean;
  overview?: string;
  release_date?: string;
  genre_ids?: number[];
  id?: number;
  original_title?: string;
  title?: string;
  backdrop_path?: string | null;
  popularity?: number;
  vote_count?: number;
  video?: boolean;
  vote_average?: number;
}
export type PaginatedMoviesResponseType = {
  page?: number;
  results?: Movie[];
  total_results?: number;
  total_pages?: number;
};
