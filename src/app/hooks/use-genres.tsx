import { useQuery } from '@tanstack/react-query'
import { subsonic } from '@/service/subsonic'
import { queryKeys } from '@/utils/queryKeys'

export function useGenres() {
  return useQuery({
    queryKey: [queryKeys.genre],
    queryFn: subsonic.genres.get,
  })
}
