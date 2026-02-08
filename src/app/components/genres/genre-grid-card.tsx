import { TagIcon } from 'lucide-react'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageLoader } from '@/app/components/image-loader'
import { PreviewCard } from '@/app/components/preview-card/card'
import { useGenreCoverArt } from '@/app/hooks/use-genre-cover-art'
import { useInView } from '@/app/hooks/use-in-view'
import { useSongList } from '@/app/hooks/use-song-list'
import { ROUTES } from '@/routes/routesList'
import { usePlayerActions } from '@/store/player.store'
import { Genre } from '@/types/responses/genre'

type GenreCardProps = {
  genre: Genre
}

function GenreCard({ genre }: GenreCardProps) {
  const { t } = useTranslation()
  const { getGenreSongs } = useSongList()
  const { setSongList } = usePlayerActions()
  const { ref, isInView } = useInView<HTMLDivElement>()
  const { coverArtId } = useGenreCoverArt(genre.value, isInView, true)

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
    <PreviewCard.Root className="flex flex-col w-full h-full">
      <PreviewCard.ImageWrapper link={ROUTES.GENRE.PAGE(genre.value)}>
        <div ref={ref} className="absolute inset-0">
          {coverArtId ? (
            <ImageLoader id={coverArtId} type="album" size={300}>
              {(src) => (
                <PreviewCard.Image src={src} alt={genre.value} />
              )}
            </ImageLoader>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-muted/60 to-muted" />
              <div className="absolute inset-0 flex items-center justify-center">
                <TagIcon className="size-10 text-muted-foreground/70" />
              </div>
            </>
          )}
        </div>
        <PreviewCard.PlayButton onClick={handlePlayGenre} />
      </PreviewCard.ImageWrapper>
      <PreviewCard.InfoWrapper>
        <PreviewCard.Title link={ROUTES.GENRE.PAGE(genre.value)}>
          {genre.value}
        </PreviewCard.Title>
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
