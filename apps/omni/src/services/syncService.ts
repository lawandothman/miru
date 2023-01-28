import { captureException, startTransaction } from '@sentry/node'
import type { GenreRepo } from '../dataSources/genreRepo'
import type { WatchableRepo } from '../dataSources/watchableRepo'
import type { WatchProviderRepo } from '../dataSources/watchProviderRepo'
import type { MovieDbService } from './movieDbService'

const PAGE_SIZE = 20

export class SyncService {

  constructor(
    private readonly watchableRepo: WatchableRepo,
    private readonly genreRepo: GenreRepo,
    private readonly watchProviderRepo: WatchProviderRepo,
    private readonly movieDbService: MovieDbService,
    private readonly maxMovies: number = 10000) { }

  async start(): Promise<void> {
    let page = 1
    await this.syncGenres()
    await this.syncWatchProviders()
    while(true) {
      const transaction = startTransaction({
        op: 'Sync',
        name: 'sync',
        data: {
          page
        }
      })
      try {
        const [movies, series] = await Promise.all([
          this.getPopularMovieSummaries(page),
          this.getPopularSeries(page)
        ])
        console.log(series)

        // movies
        movies.forEach(async (movieLike) => {
          const [movie, watchProviders] = await Promise.all([
            this.getMovieDetails(movieLike),
            this.getWatchProvidersForMovie(movieLike),
          ])
          await this.watchableRepo.upsert(movie)
          await Promise.all(
            [
              ...watchProviders.stream.map((w) => this.watchProviderRepo.upsertStream(w.id, movie.id)),
              ...watchProviders.buy.map((w) => this.watchProviderRepo.upsertBuy(w.id, movie.id)),
              ...watchProviders.rent.map((w) => this.watchProviderRepo.upsertRent(w.id, movie.id)),
            ])
        })

        // series
        series.forEach(async (seriesLike) => {
          const [series] = await Promise.all([
            this.getSeriesDetails(seriesLike)
          ])

          await this.watchableRepo.upsert(series)

        })

        page = this.getNextPage(page)
      } catch(e) {
        if(e instanceof Error) {
          captureException(e)
          console.error('Failed to fetch page', e.message)
        }
      }
      transaction.finish()
      await this.sleep(10000)
    }
    return
  }

  async syncGenres(): Promise<void> {
    const genres = await this.movieDbService.getGenres()
    genres.forEach(g => (
      this.genreRepo.upsert(g)
    ))
  }

  async syncWatchProviders(): Promise<void> {
    const watchProviders = await this.movieDbService.getWatchProviders()
    watchProviders.forEach(watchProvider => (
      this.watchProviderRepo.upsert(watchProvider)
    ))
  }

  async getPopularMovieSummaries(page: number): Promise<{ id: string }[]> {
    return await this.movieDbService.getPopularMovies(page)
  }

  async getPopularSeries(page: number): Promise<{ id: string }[]> {
    return await this.movieDbService.getPopularSeries(page)
  }

  async getMovieDetails(movieLike: {id: string}) {
    const [movie, trailer] = await Promise.all([
      this.movieDbService.getMovieDetails(movieLike.id),
      this.movieDbService.getMovieTrailer(movieLike.id),
    ])
    return Object.assign({}, movie, trailer)
  }

  async getSeriesDetails(seriesLike: {id: string}) {
    const [series] = await Promise.all([
      this.movieDbService.getSeriesDetails(seriesLike.id),
    ])
    return Object.assign({}, series)
  }

  async getWatchProvidersForMovie(movieLike: {id: string}) {
    return this.movieDbService.getWatchProvidersForMovie(movieLike)
  }


  private getNextPage(currentPage: number) {
    const maxPages = Math.ceil(this.maxMovies / PAGE_SIZE)

    return (currentPage % maxPages) + 1
  }

  private sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
}