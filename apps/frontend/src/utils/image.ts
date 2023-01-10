export const getImage = (path: string, size: 'w500' | 'w1280' | 'original' = 'w500') => {
  return `https://image.tmdb.org/t/p/${size}${path}`
}
