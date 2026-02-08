import { subsonic } from '@/service/subsonic'

export function useSongList() {
  async function getArtistSongCount(id: string) {
    const response = await subsonic.artists.getOne(id)
    let count = 0

    if (!response || !response.album) return count

    response.album.forEach((item) => {
      count += item.songCount
    })

    return count
  }

  async function getArtistAllSongs(name: string) {
    const response = await subsonic.search.get({
      query: name,
      songCount: 9999999,
      albumCount: 0,
      artistCount: 0,
    })

    if (!response || !response.song) return undefined

    return response.song
  }

  async function getAlbumSongs(albumId: string) {
    const songs = await subsonic.albums.getOne(albumId)

    if (!songs || !songs.song) return undefined

    return songs.song
  }

  async function getGenreSongs(genre: string) {
    const songs = await subsonic.songs.getSongsByGenre({ genre })

    if (!songs || songs.length === 0) return undefined

    return songs
  }

  return {
    getArtistSongCount,
    getArtistAllSongs,
    getAlbumSongs,
    getGenreSongs,
  }
}
