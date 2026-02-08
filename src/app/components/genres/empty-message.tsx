import { useTranslation } from 'react-i18next'

export function EmptyGenresInfo() {
  const { t } = useTranslation()

  return (
    <div className="text-center max-w-[500px]">
      <h3 className="text-2xl font-semibold tracking-tight">
        {t('genre.list.empty.title')}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t('genre.list.empty.info')}
      </p>
      <p className="text-sm text-muted-foreground">
        {t('genre.list.empty.action')}
      </p>
    </div>
  )
}
