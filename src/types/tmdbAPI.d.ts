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

interface ProductionCompany {
  name?: string;
  id?: number;
  logo_path?: string | null;
  origin_country?: string;
}
interface ProductionCountry {
  iso_3166_1?: string;
  name?: string;
}
interface SpokenLanguage {
  iso_639_1?: string;
  english_name?: string;
  name?: string;
}
enum Status {
  RUMORED = "Rumored",
  PLANNED = "Planned",
  IN_PRODUCTION = "In Production",
  POST_PRODUCTION = "Post Production",
  RELEASED = "Released",
  CANCELLED = "Cancelled",
}
interface Movie {
  adult?: boolean;
  backdrop_path?: string | null;
  belongs_to_collection?: object | null;
  budge?: number;
  genres?: Genre[];
  homepage?: string | null;
  id?: number;
  imdb_id?: string | null;
  original_language?: string;
  original_title?: string;
  overview?: string | null;
  popularity?: number;
  poster_path?: string | null;
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  release_date?: string;
  revenue?: number;
  runtime?: number | null;
  spoken_languages?: SpokenLanguage[];
  status?: Status;
  tagline?: string | null;
  title?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
}
interface Video {
  iso_639_1?: string;
  iso_3166_1?: string;
  name?: string;
  key?: string;
  site?: string;
  size?: number;
  type?: string;
  official?: boolean;
  published_at?: string;
  id?: string;
}

type MovieDetailResponseType = Movie & {
  videos?: {
    results?: Video[];
  };
};
