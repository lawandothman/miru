import axios from 'axios'
import axiosRetry from 'axios-retry'
import { Genre, Movie, Series, VideoProvider, Watchable, WatchableType, WatchProvider } from '../__generated__/resolvers-types'

export class MovieDbService {
  constructor(private readonly http = axios.create()) {
    axiosRetry(this.http)
  }

  async search(query: string): Promise<Movie[]> {
    const res = await this.http.get<{ results: ApiMovie[] }>(
      `${process.env.TMDB_API_BASE_URL}/3/search/movie`,
      {
        params: {
          query,
          page: 1,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
      }
    )
    return res.data.results.map(this.mapMovieToDomain)
  }

  async getPopularMovies(page: number): Promise<Movie[]> {
    const res = await this.http.get<{ results: ApiMovie[] }>(
      `${process.env.TMDB_API_BASE_URL}/3/movie/popular`,
      {
        params: {
          page,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
      }
    )

    return res.data.results.map(this.mapMovieToDomain)
  }

  async getPopularSeries(page: number): Promise<Series[]> {
    const res = await this.http.get<{ results: ApiSeries[] }>(
      `${process.env.TMDB_API_BASE_URL}/3/tv/popular`,
      {
        params: {
          page,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
      }
    )

    return res.data.results.map(this.mapSeriesToDomain)
  }

  async getMovieDetails(movieId: string): Promise<Movie> {
    const res = await this.http.get<ApiMovie>(
      `${process.env.TMDB_API_BASE_URL}/3/movie/${movieId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
      }
    )

    return this.mapMovieToDomain(res.data)
  }

  async getSeriesDetails(seriesId: string): Promise<Series> {
    const res = await this.http.get<ApiSeries>(
      `${process.env.TMDB_API_BASE_URL}/3/tv/${seriesId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
      }
    )

    return this.mapSeriesToDomain(res.data)

  }

  async getMovieTrailer(movieId: string): Promise<TrailerKeys> {
    const res = await this.http.get<{results: ApiTrailer[]}>(
      `${process.env.TMDB_API_BASE_URL}/3/movie/${movieId}/videos`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
      }
    )

    const trailers = res.data.results
      .filter(t => t.site === 'YouTube')
      .filter(t => t.type === 'Trailer')

    return {
      trailerProvider: trailers[0]?.site ?? null,
      trailerKey: trailers[0]?.key ?? null,
    }
  }

  async getGenres(): Promise<Genre[]> {
    const res = await this.http.get<{ genres: Genre[] }>(
      `${process.env.TMDB_API_BASE_URL}/3/genre/movie/list`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
      }
    )

    return res.data.genres.map((g) => ({ ...g, id: g.id.toString() }))
  }

  async getWatchProvidersForMovie(movieLike: {id: string}): Promise<{
    stream: WatchProvider[]
    buy: WatchProvider[]
    rent: WatchProvider[]
  }> {
    const res = await this.http.get<{
      results: {
        GB?: {
          flatrate?: ApiWatchProvider[]
          buy?: ApiWatchProvider[]
          rent?: ApiWatchProvider[]
        }
      }
    }>(
      `${process.env.TMDB_API_BASE_URL}/3/movie/${movieLike.id}/watch/providers`,
      {
        params: {
          watch_region: 'GB',
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
      }
    )
    return {
      stream: res.data.results.GB?.flatrate?.map(this.mapWatchProvider) ?? [],
      buy: res.data.results.GB?.buy?.map(this.mapWatchProvider) ?? [],
      rent: res.data.results.GB?.rent?.map(this.mapWatchProvider) ?? []
    }
  }

  async getWatchProviders(): Promise<WatchProvider[]> {
    const res = await this.http.get<{ results: ApiWatchProvider[] }>(
      `${process.env.TMDB_API_BASE_URL}/3/watch/providers/movie`,
      {
        params: {
          watch_region: 'GB',
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
      }
    )

    return res.data.results.map(this.mapWatchProvider)
  }

  private mapWatchProvider(raw: ApiWatchProvider): WatchProvider {
    return {
      id: raw.provider_id.toString(),
      displayPriority: raw.display_priority,
      name: raw.provider_name,
      logoPath: raw.logo_path,
    }
  }

  private mapSeriesToDomain(series: ApiSeries): Series {
    return {
      id: series.id.toString(),
      backdropUrl: series.backdrop_path,
      overview: series.overview,
      popularity: series.popularity,
      posterUrl: series.poster_path,
      title: series.name,
      genres: series.genres,
      tmdbVoteAverage: series.vote_average,
      tmdbVoteCount: series.vote_count,
      type: WatchableType.Series,
    }
  }

  private mapMovieToDomain(mov: ApiMovie): Movie {
    return {
      id: mov.id.toString(),
      type: WatchableType.Movie,
      adult: mov.adult,
      backdropUrl: mov.backdrop_path,
      originalTitle: mov.original_title,
      overview: mov.overview,
      popularity: mov.popularity,
      posterUrl: mov.poster_path,
      releaseDate: mov.release_date,
      title: mov.title,
      budget: mov.budget,
      revenue: mov.revenue,
      runtime: mov.runtime,
      tagline: mov.tagline,
      homepage: mov.homepage,
      imdbId: mov.imdb_id,
      genres: mov.genres,
      tmdbVoteAverage: mov.vote_average,
      tmdbVoteCount: mov.vote_count
    }
  }
}

export interface ApiWatchProvider {
  display_priority: number
  logo_path: string
  provider_name: string
  provider_id: number
}

export interface ApiWatchable {
  type: 'MOVIE' | 'SERIES'
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  backdrop_path?: string | null;
  poster_path?: string | null;
  overview?: string;
  genres?: Genre[];
  tagline?: string
  id: number;
}

export interface ApiSeries extends ApiWatchable {
  type: 'SERIES'
  first_air_date?: string;
  name: string
  original_name: string
}

export interface ApiMovie extends ApiWatchable {
  type: 'MOVIE'
  adult?: boolean;
  release_date?: string;
  original_title?: string;
  title: string;
  video?: boolean;
  budget?: number
  revenue?: number
  runtime?: number
  imdb_id?: string
  homepage?: string
}

type VideoTypes = 'Trailer' | 'Featurette' | 'Teaser' | 'Behind the Scenes' | 'Clip'

export interface TrailerKeys {
  trailerKey?: string
  trailerProvider?: VideoProvider
}

export interface ApiTrailer {
  iso_639_1: 'en' | 'unsupported',
  iso_3166_1: 'US' | 'unsupported',
  name: string,
  key: string,
  site: VideoProvider
  type: VideoTypes,
  size: number
  official: boolean
  published_at: string
  id: string
}