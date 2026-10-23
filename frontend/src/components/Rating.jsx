export default function Rating({ value = 0, count }) {
  return (
    <span className="rating" title={`${value.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? 'star on' : 'star'}>
          ★
        </span>
      ))}
      {count !== undefined && <span className="muted"> ({count})</span>}
    </span>
  );
}
