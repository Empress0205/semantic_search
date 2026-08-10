export function Skeleton({ width = '100%', height = 12, radius = 6, style }) {
  return (
    <span
      className="skeleton"
      style={{
        display: 'block',
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card stat-card">
      <Skeleton width={36} height={36} radius={10} />
      <div className="stack gap-2">
        <Skeleton width="45%" height={22} />
        <Skeleton width="70%" height={11} />
      </div>
    </div>
  )
}

export function NoteCardSkeleton() {
  return (
    <div className="card note-card">
      <Skeleton width="65%" height={15} />
      <div className="stack gap-2">
        <Skeleton height={11} />
        <Skeleton height={11} />
        <Skeleton width="80%" height={11} />
      </div>
      <div className="note-card-foot">
        <Skeleton width={78} height={20} radius={999} />
        <Skeleton width={56} height={20} radius={999} />
      </div>
    </div>
  )
}

export function ResultCardSkeleton() {
  return (
    <div className="card result-card">
      <Skeleton width={30} height={30} radius={999} />
      <div className="result-body">
        <Skeleton width="42%" height={15} />
        <div className="stack gap-2">
          <Skeleton height={11} />
          <Skeleton width="88%" height={11} />
        </div>
        <Skeleton width={140} height={20} radius={999} />
      </div>
      <div className="score">
        <Skeleton width={54} height={18} />
        <Skeleton height={5} radius={999} />
      </div>
    </div>
  )
}

/** Repeats a skeleton without wrapping it, so grid/flex layouts stay intact. */
export function Repeat({ count, children: render }) {
  return Array.from({ length: count }, (_, i) => render(i))
}
