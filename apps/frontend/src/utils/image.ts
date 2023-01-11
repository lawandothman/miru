const BASE_URL = 'https://image.tmdb.org/t/p/'

type PosterSizes =
  | 'w92'
  | 'w154'
  | 'w185'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'original'
export const getPoster = (path: string, size: PosterSizes = 'w500') => {
  return BASE_URL.concat(size, path)
}

type BackdropSizes = 'w300' | 'w780' | 'w1280' | 'original'
export const getBackdrop = (path: string, size: BackdropSizes = 'w780') => {
  return BASE_URL.concat(size, path)
}


type LogoSizes = 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w500' | 'original'
export const getLogo = (path: string, size: LogoSizes = 'w92') => {
  return BASE_URL.concat(size, path)
}