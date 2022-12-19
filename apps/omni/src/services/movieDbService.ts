import axios from 'axios'
import { isDataView } from 'util/types'
import { Genre, Movie } from '../__generated__/resolvers-types'

export class MovieDbService {
  constructor(private readonly http = axios.create()) {

  }
  async search(query: string): Promise<Movie[]> {
    const res = await this.http.get<{results: ApiMovie[]}>(`${process.env.TMDB_API_BASE_URL}/3/search/movie`, {
      params: {
        query,
        page: 1
      },
      headers:
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
      }
    })
    return res.data.results.map(this.mapToDomain)
  }

  async getPopularMovies(page: number): Promise<Movie[]> {
    const res = await this.http.get<{results: ApiMovie[]}>(`${process.env.TMDB_API_BASE_URL}/3/movie/popular`, {
      params: {
        page,
      },
      headers:
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
      }
    })

    return res.data.results.map(this.mapToDomain)
  }

  async getGenres(): Promise<Genre[]> {
    const res = await this.http.get<{ genres: Genre[] }>(`${process.env.TMDB_API_BASE_URL}/3/genre/movie/list`, {
      headers:
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
      }
    })

    return res.data.genres.map((g) => ({ ...g, id: g.id.toString() }))
  }

  private mapToDomain(mov: ApiMovie): Movie {
    return {
      id: mov.id.toString(),
      adult: mov.adult,
      backdropUrl: mov.backdrop_path,
      originalTitle: mov.original_title,
      overview: mov.overview,
      popularity: mov.popularity,
      posterUrl: mov.poster_path,
      releaseDate: mov.release_date,
      title: mov.title, 
      // @ts-ignore
      genres: mov.genre_ids?.map(id => ({id: id.toString()} as Genre)) 
    }
  }

}

export interface ApiMovie {
  poster_path?: string | null;
  adult?: boolean;
  overview?: string;
  release_date?: string;
  genre_ids?: number[];
  id: number;
  original_title?: string;
  title: string;
  backdrop_path?: string | null;
  popularity?: number;
  vote_count?: number;
  video?: boolean;
  vote_average?: number;
}