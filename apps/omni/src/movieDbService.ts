import axios from 'axios'
import { Movie } from './__generated__/resolvers-types'

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
    console.log(
      res.data.results.map(this.mapToDomain)
    )

    return res.data.results.map(this.mapToDomain)
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
      title: mov.title
    }
  }

}

export interface ApiMovie {
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