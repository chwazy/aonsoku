import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import ImageHeader from '@/app/components/album/image-header'
import { Actions } from '@/app/components/actions'
import { PlaylistFallback } from '@/app/components/fallbacks/playlist-fallbacks'
import { BadgesData } from '@/app/components/header-info'
import ListWrapper from '@/app/components/list-wrapper'
import { DataTableList } from '@/app/components/ui/data-table-list'
import ErrorPage from '@/app/pages/error-page'
import { songsColumns } from '@/app/tables/songs-columns'
import { getGenreSongsPage } from '@/queries/songs'
import { usePlayerActions } from '@/store/player.store'
import { ColumnFilter } from '@/types/columnFilter'
import { convertSecondsToHumanRead } from '@/utils/convertSecondsToTime'
import { queryKeys } from '@/utils/queryKeys'

const DEFAULT_OFFSET = 200

export default function Genre() {
  const { genre } = useParams() as { genre: string }
  const decodedGenre = decodeURIComponent(genre)
  const { t } = useTranslation()
  const { setSongList } = usePlayerActions()
  const [isFetchingAll, setIsFetchingAll] = useState(false)

  const columns = songsColumns()

  async function fetchGenreSongs({ pageParam = 0 }) {
    return getGenreSongsPage({
      genre: decodedGenre,
      songCount: DEFAULT_OFFSET,
      songOffset: pageParam,
    })
  }

  const {
    data,
    isLoading,
    isFetched,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [queryKeys.song.all, 'genre', decodedGenre],
    queryFn: fetchGenreSongs,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: decodedGenre.length > 0,
  })

  if (isLoading) return <PlaylistFallback />
  if (isFetched && !data) {
    return <ErrorPage status={404} statusText="Not Found" />
  }
  if (!data) return <PlaylistFallback />

  const songList = data.pages.flatMap((page) => page.songs) ?? []

  const totalDuration =
    songList.length > 0
      ? convertSecondsToHumanRead(
          songList.reduce((sum, song) => sum + (song.duration ?? 0), 0),
        )
      : null

  const badges: BadgesData = [
    {
      content:
        songList.length > 0
          ? t('playlist.songCount', { count: songList.length })
          : null,
      type: 'text',
    },
    {
      content: totalDuration
        ? t('playlist.duration', { duration: totalDuration })
        : null,
      type: 'text',
    },
  ]

  const columnsToShow: ColumnFilter[] = [
    'index',
    'title',
    // 'artist',
    'album',
    'duration',
    'playCount',
    'played',
    'bitRate',
    'contentType',
    'select',
  ]

  const buttonsTooltips = {
    play: t('playlist.buttons.play', { name: decodedGenre }),
    shuffle: t('playlist.buttons.shuffle', { name: decodedGenre }),
  }

  async function getAllSongsForPlayback() {
    if (!hasNextPage) return songList

    let offset = data.pages[data.pages.length - 1]?.nextOffset
    if (offset === null || offset === undefined) return songList

    const allSongs = [...songList]

    while (offset !== null) {
      const page = await getGenreSongsPage({
        genre: decodedGenre,
        songCount: DEFAULT_OFFSET,
        songOffset: offset,
      })

      allSongs.push(...page.songs)
      offset = page.nextOffset
    }

    return allSongs
  }

  async function handlePlayAll(shuffle = false) {
    if (songList.length === 0) return

    setIsFetchingAll(true)
    try {
      const allSongs = await getAllSongsForPlayback()
      setSongList(allSongs, 0, shuffle)
    } finally {
      setIsFetchingAll(false)
    }
  }

  return (
    <div className="w-full" key={decodedGenre}>
      <ImageHeader
        type={t('genre.headline')}
        title={decodedGenre}
        coverArtId={undefined}
        coverArtType="album"
        coverArtSize="700"
        coverArtAlt={decodedGenre}
        badges={badges}
      />

      <ListWrapper>
        <Actions.Container>
          <Actions.Button
            tooltip={buttonsTooltips.play}
            buttonStyle="primary"
            onClick={() => handlePlayAll(false)}
            disabled={songList.length === 0 || isFetchingAll}
          >
            <Actions.PlayIcon />
          </Actions.Button>

          {songList.length > 1 && (
            <Actions.Button
              tooltip={buttonsTooltips.shuffle}
              onClick={() => handlePlayAll(true)}
              disabled={isFetchingAll}
            >
              <Actions.ShuffleIcon />
            </Actions.Button>
          )}
        </Actions.Container>

        <div className="w-full h-[calc(var(--content-height)-320px)] min-h-[360px]">
        <DataTableList
          columns={columns}
          data={songList}
          handlePlaySong={(row) => setSongList(songList, row.index)}
          columnFilter={columnsToShow}
          noRowsMessage={t('genre.details.noSongList')}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
        />
        </div>
        {isFetchingNextPage && (
          <div className="mt-3 text-sm text-muted-foreground">
            {t('generic.loading')}
          </div>
        )}
      </ListWrapper>
    </div>
  )
}
