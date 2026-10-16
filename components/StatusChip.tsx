import { COR_STATUS, type Status } from '@/lib/constants'

export function StatusChip({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COR_STATUS[status]}`}
    >
      {status}
    </span>
  )
}
