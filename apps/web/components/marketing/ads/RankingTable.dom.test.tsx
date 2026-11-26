// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { buildCreatives, judgeCamp } from '@/lib/marketing/ads-analysis'
import { ADS_WEEKS } from '@/lib/marketing/data/ads-results'
import RankingTable from './RankingTable'
import { campLabel } from './shared'

test('mở camp xếp hạng bằng phím Enter, một lần cho mỗi thao tác', async () => {
  const judged = buildCreatives(ADS_WEEKS).flatMap(({ camps }) => camps.flatMap((camp) => {
    const verdict = judgeCamp(camp, ADS_WEEKS)
    return verdict && verdict.decision !== 'stale' ? [{ camp, verdict }] : []
  }))
  const item = judged[0]
  const onOpen = vi.fn()
  const user = userEvent.setup()
  render(<RankingTable judged={[item]} periodLabel="Kỳ mẫu" onOpen={onOpen} />)

  const button = screen.getByRole('button', { name: campLabel(item.camp) })
  button.focus()
  await user.keyboard('{Enter}')
  expect(onOpen).toHaveBeenCalledExactlyOnceWith(item.camp.key)
})
