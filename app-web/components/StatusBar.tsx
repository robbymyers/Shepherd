export default function StatusBar() {
  return (
    <div className="statusbar">
      <span>19:02</span>
      <span className="glyphs" aria-hidden>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="7" width="3" height="5" rx="1" />
          <rect x="5" y="4" width="3" height="8" rx="1" />
          <rect x="10" y="1.5" width="3" height="10.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2.2c2.4 0 4.6.9 6.3 2.4l1.2-1.4A11 11 0 0 0 8.5.3 11 11 0 0 0 1 3.2l1.2 1.4A9 9 0 0 1 8.5 2.2Zm0 3.4c1.5 0 2.9.5 3.9 1.5l1.2-1.4a8 8 0 0 0-10.2 0l1.2 1.4c1-1 2.4-1.5 3.9-1.5Zm0 3.3c.8 0 1.5.3 2 .8L8.5 12l-2-2.3c.5-.5 1.2-.8 2-.8Z" />
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect x="1" y="1" width="21" height="11" rx="3" stroke="currentColor" opacity="0.45" />
          <rect x="3" y="3" width="17" height="7" rx="1.5" fill="currentColor" />
          <rect x="23.5" y="4.5" width="1.6" height="4" rx="0.8" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  );
}
