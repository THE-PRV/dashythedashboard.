// KanbanDashboard.jsx — Variation 3 (replacement): drag-style status board.
// Three columns — Pending / Used / Not used — apps as small cards. Click any
// arrow on a card to move it between columns. Client chip on each card so
// the cross-client view stays scannable.

function KanbanDashboard({ user, cycle, clients, density, onOpenRemarks, onToggleUsed }) {
  const [search, setSearch] = React.useState('');
  const [filterClient, setFilterClient] = React.useState('all');

  // Flatten all apps with their parent client into one list — kanban needs
  // a cross-client stream, not per-client buckets.
  const allApps = React.useMemo(() => {
    const flat = [];
    clients.forEach((c) => c.apps.forEach((a) => flat.push({ ...a, client: c })));
    return flat;
  }, [clients]);

  const matches = (a) =>
    (filterClient === 'all' || a.client.id === filterClient) &&
    (!search || a.name.toLowerCase().includes(search.toLowerCase()));

  const visible = allApps.filter(matches);
  const columns = [
    { id: 'pending', label: 'Pending review', tone: 'pending', value: null,  items: visible.filter((a) => a.used === null) },
    { id: 'used',    label: 'Used this cycle', tone: 'used',    value: true,  items: visible.filter((a) => a.used === true) },
    { id: 'notused', label: 'Not used',        tone: 'notused', value: false, items: visible.filter((a) => a.used === false) },
  ];

  const totals = {
    total: allApps.length,
    pending: allApps.filter((a) => a.used === null).length,
    used: allApps.filter((a) => a.used === true).length,
    notused: allApps.filter((a) => a.used === false).length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <TopBar user={user} cycle={cycle} density={density} search={search} onSearch={setSearch} />

      {/* Header strip */}
      <div style={{
        padding: density === 'compact' ? '14px 24px' : '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Triage board · {cycle.number}
          </h1>
          <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
            Sort your tools into Used / Not used. {totals.pending} still pending review.
          </p>
        </div>
        <div style={{ flex: 1 }} />
        {/* Stacked progress bar showing the three buckets at once */}
        <div style={{
          width: 280, padding: 12, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Cycle progress
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
              {totals.used + totals.notused}/{totals.total}
            </span>
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', background: 'var(--surface-2)' }}>
            <div style={{ width: `${(totals.used / totals.total) * 100}%`, background: 'var(--badge-used-dot)' }} />
            <div style={{ width: `${(totals.notused / totals.total) * 100}%`, background: 'var(--badge-notused-dot)' }} />
            <div style={{ width: `${(totals.pending / totals.total) * 100}%`, background: 'var(--badge-pending-dot)', opacity: .5 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--badge-used-dot)' }} /> {totals.used} used
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--badge-notused-dot)' }} /> {totals.notused} not used
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--badge-pending-dot)' }} /> {totals.pending} pending
            </span>
          </div>
        </div>
        <Button variant="primary" icon="check">Submit attestation</Button>
      </div>

      {/* Client filter strip */}
      <div style={{
        padding: '10px 24px', borderBottom: '1px solid var(--border)',
        display: 'flex', gap: 8, overflowX: 'auto', background: 'var(--surface)',
      }}>
        <FilterChip active={filterClient === 'all'} onClick={() => setFilterClient('all')}
          label="All clients" count={allApps.length} />
        {clients.map((c) => (
          <FilterChip key={c.id} active={filterClient === c.id} onClick={() => setFilterClient(c.id)}
            label={c.name} count={c.apps.length} accent={c.accent} code={c.code} />
        ))}
      </div>

      {/* Kanban */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: 16, display: 'flex', gap: 16 }}>
        {columns.map((col) => (
          <KanbanColumn key={col.id} column={col}
            onMove={(item, value) => onToggleUsed(item.client.id, item.id, value)}
            onOpenRemarks={onOpenRemarks} density={density} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label, count, accent, code }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, height: 28, padding: '0 12px 0 8px',
      borderRadius: 999, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
      background: active ? 'var(--text)' : 'var(--surface-2)',
      color: active ? 'var(--bg)' : 'var(--text)',
      border: `1px solid ${active ? 'var(--text)' : 'var(--border)'}`,
      whiteSpace: 'nowrap', flex: 'none',
    }}>
      {code ? (
        <span style={{
          width: 20, height: 20, borderRadius: 5, background: accent, color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
        }}>{code}</span>
      ) : (
        <Icon name="briefcase" size={12} />
      )}
      <span>{label}</span>
      <span style={{
        fontSize: 11, padding: '0 6px', borderRadius: 999, fontVariantNumeric: 'tabular-nums',
        background: active ? 'rgba(255,255,255,.15)' : 'var(--surface)',
        color: active ? 'inherit' : 'var(--text-muted)',
      }}>{count}</span>
    </button>
  );
}

function KanbanColumn({ column, onMove, onOpenRemarks, density }) {
  const dot = `var(--badge-${column.tone}-dot)`;
  return (
    <div style={{
      flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
      background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, flex: 'none' }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{column.label}</span>
        <span style={{
          padding: '1px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600,
          background: 'var(--surface)', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums',
        }}>{column.items.length}</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {column.items.length === 0 ? (
          <div style={{
            margin: 'auto 0', padding: 24, textAlign: 'center',
            color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic',
          }}>Nothing here yet.</div>
        ) : (
          column.items.map((item) => (
            <KanbanCard key={item.id} item={item} columnId={column.id}
              onMove={onMove} onOpenRemarks={onOpenRemarks} />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanCard({ item, columnId, onMove, onOpenRemarks }) {
  const latest = item.remarks[0];
  // Show the two opposite buckets as arrow-actions so users can flick items
  // around without opening a menu. From "pending" both arrows appear; from
  // "used" / "notused", the other two are offered.
  const otherStates = [
    { id: 'used',    value: true,  label: 'Used',     icon: 'check' },
    { id: 'notused', value: false, label: 'Not used', icon: 'x' },
    { id: 'pending', value: null,  label: 'Pending',  icon: 'history' },
  ].filter((s) => s.id !== columnId);

  return (
    <div style={{
      padding: 11, background: 'var(--surface)',
      border: '1px solid var(--border)', borderRadius: 10,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6,
          background: `color-mix(in oklab, ${item.client.accent}, transparent 86%)`,
          color: item.client.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
        }}><Icon name="app" size={12} /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </div>
          <div style={{ marginTop: 2, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: item.client.accent, flex: 'none' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.client.name}</span>
          </div>
        </div>
        <Badge variant={item.tier === 'primary' ? 'primary' : 'secondary'} size="sm">{item.tier[0].toUpperCase()}</Badge>
      </div>

      {latest && (
        <div onClick={() => onOpenRemarks(item.client.id, item.id)} style={{
          padding: '6px 8px', borderRadius: 7, background: 'var(--surface-2)',
          fontSize: 11.5, color: 'var(--text-muted)', cursor: 'pointer',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontStyle: 'italic',
        }}>"{latest.text}"</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {otherStates.map((s) => (
          <button key={s.id} onClick={() => onMove(item, s.value)} title={`Move to ${s.label}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
              borderRadius: 6, border: '1px solid var(--border-subtle)',
              background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 10.5, fontWeight: 500,
            }}>
            <Icon name={s.icon} size={10} stroke={2.2} />
            {s.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => onOpenRemarks(item.client.id, item.id)} title="Add remark"
          style={{
            width: 22, height: 22, borderRadius: 5, border: 0, cursor: 'pointer',
            background: latest ? 'var(--surface-2)' : 'transparent',
            color: latest ? 'var(--text)' : 'var(--text-muted)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <Icon name="message" size={12} />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { KanbanDashboard });
