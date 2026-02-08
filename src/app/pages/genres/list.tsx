import { useSearchParams } from 'react-router-dom'
import { AlbumsFallback } from '@/app/components/fallbacks/album-fallbacks'
import { GenreGridCard } from '@/app/components/genres/genre-grid-card'
import { EmptyGenres } from '@/app/components/genres/empty-page'
import { GenresHeader } from '@/app/components/genres/header'
import { GridViewWrapper } from '@/app/components/grid-view-wrapper'
import ListWrapper from '@/app/components/list-wrapper'
import { useGenres } from '@/app/hooks/use-genres'
import { AlbumsFilters, AlbumsSearchParams } from '@/utils/albumsFilter'
import { SearchParamsHandler } from '@/utils/searchParamsHandler'

export default function GenresList() {
  const { data: genres, isLoading } = useGenres()
  const [searchParams] = useSearchParams()
  const { getSearchParam } = new SearchParamsHandler(searchParams)

  const filter = getSearchParam<string>(AlbumsSearchParams.MainFilter, '')
  const query = getSearchParam<string>(AlbumsSearchParams.Query, '')
  const isSearchActive = filter === AlbumsFilters.Search && query !== ''

  const filteredGenres =
    genres?.filter(({ value }) =>
      isSearchActive
        ? value.toLowerCase().includes(query.toLowerCase())
        : true,
    ) ?? []

  if (isLoading) return <AlbumsFallback />
  if (!genres) return null
  if (filteredGenres.length === 0) return <EmptyGenres />

  return (
    <div className="w-full h-full">
      <GenresHeader genreCount={filteredGenres.length} />

      <ListWrapper className="px-0">
        <GridViewWrapper
          list={filteredGenres}
          data-testid="genres-grid"
          type="genres"
        >
          {(genre) => <GenreGridCard genre={genre} />}
        </GridViewWrapper>
      </ListWrapper>
    </div>
  )
}
