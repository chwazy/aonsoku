import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { subsonic } from '@/service/subsonic'
import { useAppData } from '@/store/app.store'

const SAMPLE_SIZE = 50
const MAX_CONCURRENT_REQUESTS = 4

type GenreCoverArtCache = {
  coverArtId?: string
  savedAt: number
}

let activeRequests = 0
const pendingQueue: Array<() => void> = []

async function runWithConcurrencyLimit<T>(fn: () => Promise<T>) {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise<void>((resolve) => pendingQueue.push(resolve))
  }

  activeRequests += 1
  try {
    return await fn()
  } finally {
    activeRequests -= 1
    const next = pendingQueue.shift()
    if (next) next()
  }
}

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function dayBucket(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function getCacheKey(serverKey: string, genre: string, bucket: string) {
  return `genre_cover_art:${serverKey}:${bucket}:${genre}`
}

function readCache(key: string): GenreCoverArtCache | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as GenreCoverArtCache
  } catch {
    return null
  }
}

function writeCache(key: string, value: GenreCoverArtCache) {
  localStorage.setItem(key, JSON.stringify(value))
}

async function fetchGenreCoverArtId(genre: string, seed: string) {
  const songs = await subsonic.songs.getSongsByGenre({
    genre,
    count: SAMPLE_SIZE,
    offset: 0,
  })

  if (!songs || songs.length === 0) return undefined

  const validSongs = songs.filter((song) => song.coverArt)
  if (validSongs.length === 0) return undefined

  const index = hashString(seed) % validSongs.length
  return validSongs[index]?.coverArt
}

export function useGenreCoverArt(
  genre: string,
  enabled = false,
  rotateDaily = true,
) {
  const { url, username } = useAppData()

  const serverKey = useMemo(() => `${url}:${username}`, [url, username])
  const bucket = useMemo(() => (rotateDaily ? dayBucket() : 'static'), [
    rotateDaily,
  ])
  const cacheKey = useMemo(
    () => getCacheKey(serverKey, genre, bucket),
    [serverKey, genre, bucket],
  )

  const cached = useMemo(() => readCache(cacheKey), [cacheKey])

  const query = useQuery({
    queryKey: ['genre-cover-art', serverKey, bucket, genre],
    queryFn: () =>
      runWithConcurrencyLimit(async () => {
        const seed = `${serverKey}:${bucket}:${genre}`
        const coverArtId = await fetchGenreCoverArtId(genre, seed)
        const value = { coverArtId, savedAt: Date.now() }
        writeCache(cacheKey, value)
        return value
      }),
    enabled: enabled && !cached,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

  return {
    coverArtId: cached?.coverArtId ?? query.data?.coverArtId,
    isLoading: query.isLoading,
    error: query.error,
  }
}
