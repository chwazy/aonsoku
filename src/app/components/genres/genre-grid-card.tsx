import { TagIcon } from 'lucide-react'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PreviewCard } from '@/app/components/preview-card/card'
import { useSongList } from '@/app/hooks/use-song-list'
import { usePlayerActions } from '@/store/player.store'
import { Genre } from '@/types/responses/genre'

type GenreCardProps = {
  genre: Genre
}

function GenreCard({ genre }: GenreCardProps) {
  const { t } = useTranslation()
  const { getGenreSongs } = useSongList()
  const { setSongList } = usePlayerActions()

  const handlePlayGenre = useCallback(async () => {
    const songList = await getGenreSongs(genre.value)

    if (songList) {
      setSongList(songList, 0)
    }
  }, [genre.value, getGenreSongs, setSongList])

  const countParts: string[] = []
  if (genre.songCount !== undefined) {
    countParts.push(t('server.songCount', { count: genre.songCount }))
  }
  if (genre.albumCount !== undefined) {
    countParts.push(t('artist.info.albumsCount', { count: genre.albumCount }))
  }

  const countsLabel = countParts.join(' • ')

  return (
    <PreviewCard.Root
      className="flex flex-col w-full h-full"
      role="button"
      tabIndex={0}
      onClick={handlePlayGenre}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handlePlayGenre()
        }
      }}
    >
      <div className="group flex-1 aspect-square rounded bg-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/60 to-muted" />
        <div className="absolute inset-0 flex items-center justify-center">
          <TagIcon className="size-10 text-muted-foreground/70" />
        </div>
        <PreviewCard.PlayButton onClick={handlePlayGenre} />
      </div>
      <PreviewCard.InfoWrapper>
        <div className="w-full truncate" data-testid="card-title">
          <span className="max-w-full truncate leading-7 text-sm font-semibold">
            {genre.value}
          </span>
        </div>
        {countsLabel && (
          <PreviewCard.Subtitle enableLink={false}>
            {countsLabel}
          </PreviewCard.Subtitle>
        )}
      </PreviewCard.InfoWrapper>
    </PreviewCard.Root>
  )
}

export const GenreGridCard = memo(GenreCard)
