import { SearchQueryOptions } from '@/service/search'
import { subsonic } from '@/service/subsonic'

const emptyResponse = { songs: [], nextOffset: null }

type SongSearchParams = Required<
  Pick<SearchQueryOptions, 'query' | 'songCount' | 'songOffset'>
>

type GenreSongsParams = {
  genre: string
  songCount: number
  songOffset: number
}

export async function songsSearch(params: SongSearchParams) {
  const response = await subsonic.search.get({
    artistCount: 0,
    albumCount: 0,
    ...params,
  })

  if (!response) return emptyResponse
  if (!response.song) return emptyResponse

  let nextOffset: number | null = null
  if (response.song.length >= params.songCount) {
    nextOffset = params.songOffset + params.songCount
  }

  return {
    songs: response.song,
    nextOffset,
  }
}

export async function getGenreSongsPage(params: GenreSongsParams) {
  const response = await subsonic.songs.getSongsByGenre({
    genre: params.genre,
    count: params.songCount,
    offset: params.songOffset,
  })

  if (!response || response.length === 0) return emptyResponse

  let nextOffset: number | null = null
  if (response.length >= params.songCount) {
    nextOffset = params.songOffset + params.songCount
  }

  return {
    songs: response,
    nextOffset,
  }
}

export async function getArtistAllSongs(artistId: string) {
  const artist = await subsonic.artists.getOne(artistId)

  if (!artist || !artist.album) return emptyResponse

  const results = await Promise.all(
    artist.album.map(({ id }) => subsonic.albums.getOne(id)),
  )

  const songs = results.flatMap((result) => {
    if (!result) return []

    return result.song
  })

  return {
    songs,
    nextOffset: null,
  }
}

export async function getFavoriteSongs() {
  const response = await subsonic.songs.getFavoriteSongs()

  if (!response || !response.song) return { songs: [] }

  return { songs: response.song }
}
