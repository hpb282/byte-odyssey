export function Icon({ name }: { name: 'user' | 'pause' | 'play' }) {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {name === 'user' ? (
        <>
          <circle cx="12" cy="7" r="5" />
          <path d="M3 22v-3a9 9 0 0 1 18 0v3z" />
        </>
      ) : name === 'pause' ? (
        <>
          <rect x="5" y="3" width="5" height="18" rx="1" />
          <rect x="14" y="3" width="5" height="18" rx="1" />
        </>
      ) : (
        <path d="M6 3v18l15-9z" />
      )}
    </svg>
  );
}
