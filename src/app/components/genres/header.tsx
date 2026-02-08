import { useTranslation } from 'react-i18next'
import { ShadowHeader } from '@/app/components/album/shadow-header'
import { HeaderTitle } from '@/app/components/header-title'
import { ExpandableSearchInput } from '@/app/components/search/expandable-input'

interface GenresHeaderProps {
  genreCount: number
}

export function GenresHeader({ genreCount }: GenresHeaderProps) {
  const { t } = useTranslation()

  return (
    <ShadowHeader
      showGlassEffect={false}
      fixed={false}
      className="relative w-full justify-between items-center"
    >
      <HeaderTitle title={t('sidebar.genres')} count={genreCount} />

      <div className="flex gap-2 flex-1 justify-end">
        <ExpandableSearchInput
          placeholder={t('album.list.genre.search')}
        />
      </div>
    </ShadowHeader>
  )
}
