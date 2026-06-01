// ui.jsx — Shared atoms (Icon, Avatar, Badge, Toggle, Pill, Progress, etc.)
// shadcn-meets-enterprise: neutral zinc surface, single blue accent.

// ── Icon ─────────────────────────────────────────────────────────────────
// Hand-picked lucide-style paths so we don't ship the whole icon set.
const ICONS = {
  search:   <path d="M11 3a8 8 0 1 0 5.2 14.1l3.85 3.85 1.4-1.4-3.85-3.85A8 8 0 0 0 11 3Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />,
  check:    <path d="M5 12.5 9.5 17 19 7" />,
  x:        <path d="M5 5l14 14M19 5L5 19" />,
  chevdown: <path d="M5 8.5 12 15.5l7-7" />,
  chevright:<path d="M9 5l7 7-7 7" />,
  chevleft: <path d="M15 5l-7 7 7 7" />,
  filter:   <path d="M3 5h18l-7 9v5l-4 2v-7L3 5z" />,
  plus:     <path d="M12 5v14M5 12h14" />,
  history:  <path d="M3 3v6h6M3.5 9a9 9 0 1 1-.2 6M12 7v5l3.5 2" />,
  edit:     <path d="M4 20h4l10-10-4-4L4 16v4z M14 6l4 4" />,
  user:     <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5Z" />,
  users:    <path d="M9 11a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 9 11Zm7 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-7 2c-3 0-6 1.5-6 4v2h12v-2c0-2.5-3-4-6-4Zm7 0c-.7 0-1.4.1-2 .3 1.2.9 2 2.2 2 3.7v2h5v-2c0-2.5-2.5-4-5-4Z" />,
  bell:     <path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4l2-2Zm4 3a2 2 0 0 0 4 0" />,
  moon:     <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z" />,
  sun:      <path d="M12 4v2M12 18v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4 4.2 19.8M19.8 4.2l-1.4 1.4M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />,
  briefcase:<path d="M3 8h18v11H3z M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />,
  app:      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  list:     <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.5M3.5 12h.5M3.5 18h.5" />,
  grid:     <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  message:  <path d="M4 4h16v12H7l-3 3V4z" />,
  star:     <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />,
  shield:   <path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3z" />,
  clock:    <path d="M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8Zm0 4v4l3 2" />,
  link:     <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />,
  more:     <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  arrow_up_right: <path d="M7 17 17 7M9 7h8v8" />,
};
function Icon({ name, size = 16, stroke = 1.6, fill, style, className }) {
  const path = ICONS[name];
  if (!path) return <span style={{ width: size, height: size }}>{`[${name}?]`}</span>;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'}
         stroke={fill ? 'none' : 'currentColor'} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
         style={{ flex: 'none', ...style }} aria-hidden="true">
      {path}
    </svg>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────
function Avatar({ initials, size = 28, accent }) {
  const hue = (initials.charCodeAt(0) + initials.charCodeAt(1 % initials.length)) * 17 % 360;
  const bg = accent ?? `oklch(0.62 0.13 ${hue})`;
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: bg, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: size * 0.4, letterSpacing: '-0.02em',
      flex: 'none',
    }}>{initials}</div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────
// variants: tier (primary/secondary), status (used/notused/pending/never)
function Badge({ children, variant = 'neutral', size = 'md' }) {
  const PAD = size === 'sm' ? '1px 6px' : '2px 8px';
  const FS = size === 'sm' ? 10.5 : 11.5;
  // Solid-fill swatch on left + light tint background. Dark/light variants
  // resolve via CSS custom props so both themes work without per-variant overrides.
  const tones = {
    primary:    { fg: 'var(--badge-primary-fg)',  bg: 'var(--badge-primary-bg)',  dot: 'var(--badge-primary-dot)' },
    secondary:  { fg: 'var(--badge-secondary-fg)',bg: 'var(--badge-secondary-bg)',dot: 'var(--badge-secondary-dot)' },
    used:       { fg: 'var(--badge-used-fg)',     bg: 'var(--badge-used-bg)',     dot: 'var(--badge-used-dot)' },
    notused:    { fg: 'var(--badge-notused-fg)',  bg: 'var(--badge-notused-bg)',  dot: 'var(--badge-notused-dot)' },
    pending:    { fg: 'var(--badge-pending-fg)',  bg: 'var(--badge-pending-bg)',  dot: 'var(--badge-pending-dot)' },
    neutral:    { fg: 'var(--text-muted)', bg: 'var(--surface-2)', dot: 'var(--text-muted)' },
  }[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: PAD, borderRadius: 999, background: tones.bg, color: tones.fg,
      fontSize: FS, fontWeight: 500, lineHeight: 1.3, letterSpacing: '0.005em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: tones.dot, flex: 'none' }} />
      {children}
    </span>
  );
}

// ── Tri-state Toggle ─────────────────────────────────────────────────────
// Three pills: Used / Not used / —. Each tick is an answer; "—" is "not yet
// attested" (the pending state).
function TriToggle({ value, onChange, size = 'md' }) {
  const opts = [
    { v: true,  label: 'Used',     icon: 'check' },
    { v: false, label: 'Not used', icon: 'x' },
  ];
  const H = size === 'sm' ? 24 : 28;
  return (
    <div style={{
      display: 'inline-flex', gap: 2, padding: 2,
      background: 'var(--surface-2)', borderRadius: 8,
      border: '1px solid var(--border)',
    }}>
      {opts.map(({ v, label, icon }) => {
        const active = value === v;
        return (
          <button key={String(v)} onClick={() => onChange(active ? null : v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              height: H, padding: `0 ${size === 'sm' ? 8 : 10}px`,
              border: 0, cursor: 'pointer',
              background: active ? (v ? 'var(--toggle-used-bg)' : 'var(--toggle-notused-bg)') : 'transparent',
              color: active ? (v ? 'var(--toggle-used-fg)' : 'var(--toggle-notused-fg)') : 'var(--text-muted)',
              fontWeight: active ? 600 : 500, fontSize: 12,
              borderRadius: 6, transition: 'background .12s, color .12s',
              fontFamily: 'inherit',
            }}>
            <Icon name={icon} size={12} stroke={2.2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Progress ─────────────────────────────────────────────────────────────
function Progress({ value, max = 1, color, height = 4 }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div style={{ width: '100%', height, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct * 100}%`, height: '100%', background: color || 'var(--accent)', transition: 'width .25s' }} />
    </div>
  );
}

// ── Summary tile ─────────────────────────────────────────────────────────
function StatTile({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      flex: 1, padding: '14px 16px', background: 'var(--surface)',
      border: '1px solid var(--border)', borderRadius: 10,
      display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</span>
        {icon && <Icon name={icon} size={14} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: accent || 'var(--text)' }}>{value}</span>
        {sub && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</span>}
      </div>
    </div>
  );
}

// ── Search input ─────────────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder = 'Search applications…', width }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, width: width ?? 'auto',
      height: 32, padding: '0 10px', borderRadius: 8,
      background: 'var(--surface)', border: '1px solid var(--border)',
      color: 'var(--text-muted)',
    }}>
      <Icon name="search" size={14} />
      <input value={value || ''} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder}
        style={{
          flex: 1, minWidth: 0, height: '100%', border: 0, background: 'transparent',
          outline: 'none', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
        }} />
      <kbd style={{
        fontSize: 10, padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border)',
        background: 'var(--surface-2)', color: 'var(--text-muted)', fontFamily: 'var(--mono)',
      }}>⌘K</kbd>
    </div>
  );
}

// ── Button ───────────────────────────────────────────────────────────────
function Button({ variant = 'outline', size = 'md', icon, children, onClick, style }) {
  const H = size === 'sm' ? 26 : 32;
  const variants = {
    primary: { bg: 'var(--accent)', fg: 'var(--accent-fg)', border: 'var(--accent)' },
    outline: { bg: 'var(--surface)', fg: 'var(--text)', border: 'var(--border)' },
    ghost:   { bg: 'transparent', fg: 'var(--text-muted)', border: 'transparent' },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: H, padding: `0 ${size === 'sm' ? 10 : 12}px`,
      background: v.bg, color: v.fg, border: `1px solid ${v.border}`,
      borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
      cursor: 'pointer', transition: 'background .12s, border-color .12s',
      whiteSpace: 'nowrap', ...style,
    }}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
}

// ── Top app bar (shared across all 3 variations) ─────────────────────────
function TopBar({ user, cycle, dark, density, onSearch, search }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: density === 'compact' ? '10px 20px' : '14px 24px',
      borderBottom: '1px solid var(--border)', background: 'var(--surface)',
      flex: 'none',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent), black 25%))',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, letterSpacing: '-0.02em',
        }}>B</div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: '-0.01em', color: 'var(--text)' }}>Broadridge</span>
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Access Review</span>
        </div>
      </div>

      {/* Cycle pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        height: 28, padding: '0 10px', borderRadius: 999,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        color: 'var(--text-muted)', fontSize: 11.5, fontWeight: 500,
      }}>
        <Icon name="clock" size={12} />
        <span style={{ color: 'var(--text)' }}>{cycle.label}</span>
        <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
        <span>Due {cycle.dueDate}</span>
        <span style={{
          padding: '1px 6px', borderRadius: 999, fontSize: 10.5, fontWeight: 600,
          background: 'var(--warning-bg)', color: 'var(--warning-fg)',
        }}>{cycle.daysLeft}d left</span>
      </div>

      <div style={{ flex: 1 }} />

      <SearchBar value={search} onChange={onSearch} width={260} />

      <button style={{
        width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
        background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <Icon name="bell" size={15} />
        <span style={{
          position: 'absolute', top: 6, right: 7, width: 6, height: 6,
          borderRadius: 999, background: 'var(--accent)',
        }} />
      </button>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px',
        borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer',
      }}>
        <Avatar initials={user.avatar} size={24} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{user.firstName} {user.lastName}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>ID · {user.id}</span>
        </div>
        <Icon name="chevdown" size={12} style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, Avatar, Badge, TriToggle, Progress, StatTile, SearchBar, Button, TopBar,
});
