import { GenreRepo } from "../repositories/genreRepo"
import { MovieRepo } from "../repositories/movieRepo"
import { MovieDbService } from "./movieDbService"

const PAGE_SIZE = 20

export class SyncService {

  constructor(
    private readonly movieRepo: MovieRepo,
    private readonly genreRepo: GenreRepo,
    private readonly movieDbService: MovieDbService,
    private readonly maxMovies: number = 10000) { }

  async start(): Promise<void> {
    let page = 1 
    await this.syncGenres()
    while(true) {
      try {
        const movies = await this.getPopularMovies(page)
        movies.forEach((movie) => this.movieRepo.upsert(movie))
        page = this.getNextPage(page)
      } catch(e) {
        if(e instanceof Error) {
          console.error('Failed to fetch page', e.message)
        }
      }
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

  async getPopularMovies(page: number) {
    return this.movieDbService.getPopularMovies(page)
  }

  private getNextPage(currentPage: number) {
    const maxPages = Math.ceil(this.maxMovies / PAGE_SIZE)

    return (currentPage % maxPages) + 1 
  }

  private sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    })
  }
}