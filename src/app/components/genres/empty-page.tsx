import { EmptyPageContainer } from '@/app/components/empty-container'
import ListWrapper from '@/app/components/list-wrapper'
import { EmptyWrapper } from '@/app/components/albums/empty-wrapper'
import { GenresHeader } from './header'
import { EmptyGenresInfo } from './empty-message'

export function EmptyGenres() {
  return (
    <EmptyPageContainer>
      <GenresHeader genreCount={0} />

      <ListWrapper className="h-full">
        <EmptyWrapper>
          <EmptyGenresInfo />
        </EmptyWrapper>
      </ListWrapper>
    </EmptyPageContainer>
  )
}
