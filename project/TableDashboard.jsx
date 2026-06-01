// TableDashboard.jsx — Variation 1: Table-heavy
// Power-user spreadsheet replacement. All apps in one big table with
// sticky client group headers. Best for users who came from the Excel.

const collapseBtnStyle = {
  height: 26, padding: '0 10px', borderRadius: 7,
  border: '1px solid var(--border)', background: 'var(--surface)',
  color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 500,
  cursor: 'pointer',
};

function TableDashboard({ user, cycle, clients, density, groupByClient, onOpenRemarks, onToggleUsed }) {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all'); // all|pending|used|notused
  // Collapsed client groups — Set of client.id. Default expanded.
  const [collapsed, setCollapsed] = React.useState(() => new Set());
  const toggleCollapsed = (id) => setCollapsed((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Totals across all clients (for the summary tiles up top).
  const totals = React.useMemo(() => {
    let total = 0, attested = 0, used = 0, primary = 0;
    clients.forEach((c) => c.apps.forEach((a) => {
      total += 1;
      if (a.used !== null) attested += 1;
      if (a.used === true) used += 1;
      if (a.tier === 'primary') primary += 1;
    }));
    return { total, attested, used, primary, pending: total - attested };
  }, [clients]);

  // Search + filter pipeline. Flat or grouped both consume this filtered set.
  const matches = (a, client) =>
    (filter === 'all' ||
      (filter === 'pending' && a.used === null) ||
      (filter === 'used' && a.used === true) ||
      (filter === 'notused' && a.used === false)) &&
    (!search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      client.name.toLowerCase().includes(search.toLowerCase()));

  const rowPad = density === 'compact' ? '8px 14px' : density === 'spacious' ? '16px 14px' : '12px 14px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <TopBar user={user} cycle={cycle} density={density} search={search} onSearch={setSearch} />

      <div style={{ padding: density === 'compact' ? '16px 24px 0' : '20px 24px 0', display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0 }}>

        {/* Page title row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                My access · {cycle.number}
              </h1>
              <Badge variant="pending">{totals.pending} pending</Badge>
            </div>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
              Mark every tool you used this cycle. If access lapsed, request renewal in remarks.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon="history">Past cycles</Button>
            <Button variant="primary" icon="check">Submit attestation</Button>
          </div>
        </div>

        {/* Summary tiles */}
        <div style={{ display: 'flex', gap: 12 }}>
          <StatTile label="Total apps" value={totals.total} sub={`across ${clients.length} clients`} icon="app" />
          <StatTile label="Used this cycle" value={totals.used} sub={`${Math.round((totals.used / totals.total) * 100)}%`} icon="check" />
          <StatTile label="Attested" value={`${totals.attested} / ${totals.total}`} sub={`${totals.pending} left`} icon="shield" />
          <StatTile label="Primary user" value={totals.primary} sub="critical to keep" icon="star" />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            ['all', 'All', totals.total],
            ['pending', 'Pending', totals.pending],
            ['used', 'Used', totals.used],
            ['notused', 'Not used', totals.attested - totals.used],
          ].map(([k, label, count]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 12px',
                borderRadius: 999, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: filter === k ? 'var(--text)' : 'var(--surface)',
                color: filter === k ? 'var(--bg)' : 'var(--text-muted)',
                border: `1px solid ${filter === k ? 'var(--text)' : 'var(--border)'}`,
                transition: 'all .12s',
              }}>
              {label}
              <span style={{
                fontSize: 11, padding: '0 6px', borderRadius: 999, fontVariantNumeric: 'tabular-nums',
                background: filter === k ? 'rgba(255,255,255,.15)' : 'var(--surface-2)',
                color: filter === k ? 'inherit' : 'var(--text-muted)',
              }}>{count}</span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <Button size="sm" icon="filter">Filters</Button>
          {groupByClient && (
            <>
              <button onClick={() => setCollapsed(new Set(clients.map((c) => c.id)))}
                style={collapseBtnStyle}>Collapse all</button>
              <button onClick={() => setCollapsed(new Set())}
                style={collapseBtnStyle}>Expand all</button>
            </>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {groupByClient ? 'Grouped by client' : 'Flat list'}
          </span>
        </div>

        {/* Table */}
        <div style={{
          flex: 1, minHeight: 0, overflow: 'auto',
          border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '34%' }} />
              {!groupByClient && <col style={{ width: '20%' }} />}
              <col style={{ width: '12%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: groupByClient ? '34%' : '14%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Application', !groupByClient && 'Client', 'Tier', 'Used this cycle', 'Remarks'].filter(Boolean).map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 14px', fontSize: 11,
                    fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                    color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
                    position: 'sticky', top: 0, background: 'var(--surface-2)', zIndex: 2,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupByClient ? (
                clients.map((client) => {
                  const visible = client.apps.filter((a) => matches(a, client));
                  if (!visible.length) return null;
                  const stats = countByClient(client);
                  const isCollapsed = collapsed.has(client.id);
                  return (
                    <React.Fragment key={client.id}>
                      <tr>
                        <td colSpan={5} onClick={() => toggleCollapsed(client.id)} style={{
                          padding: '14px 14px 12px', background: 'var(--surface)',
                          borderBottom: '1px solid var(--border)', cursor: 'pointer',
                          position: 'sticky', top: 35, zIndex: 1,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              width: 18, height: 18, borderRadius: 4, display: 'inline-flex',
                              alignItems: 'center', justifyContent: 'center',
                              color: 'var(--text-muted)', transition: 'transform .15s',
                              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                            }}>
                              <Icon name="chevdown" size={14} stroke={2} />
                            </span>
                            <div style={{
                              width: 24, height: 24, borderRadius: 6, background: client.accent, color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                            }}>{client.code}</div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{client.name}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {stats.attested}/{stats.total} attested · {stats.used} used
                            </span>
                            {isCollapsed && stats.pending > 0 && (
                              <Badge variant="pending" size="sm">{stats.pending} pending</Badge>
                            )}
                            <div style={{ flex: 1, maxWidth: 120, marginLeft: 8 }}>
                              <Progress value={stats.attested} max={stats.total} color={client.accent} />
                            </div>
                          </div>
                        </td>
                      </tr>
                      {!isCollapsed && visible.map((app) => (
                        <AppRow key={app.id} app={app} client={client} groupByClient density={density}
                          onToggleUsed={onToggleUsed} onOpenRemarks={onOpenRemarks} rowPad={rowPad} />
                      ))}
                    </React.Fragment>
                  );
                })
              ) : (
                clients.flatMap((c) => c.apps.filter((a) => matches(a, c)).map((a) => (
                  <AppRow key={a.id} app={a} client={c} groupByClient={false} density={density}
                    onToggleUsed={onToggleUsed} onOpenRemarks={onOpenRemarks} rowPad={rowPad} />
                )))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AppRow({ app, client, groupByClient, onToggleUsed, onOpenRemarks, rowPad }) {
  const latestRemark = app.remarks[0];
  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td style={{ padding: rowPad, verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: `color-mix(in oklab, ${client.accent}, transparent 86%)`,
            color: client.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
          }}>
            <Icon name="app" size={14} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>{app.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{app.id.toUpperCase()}</div>
          </div>
        </div>
      </td>
      {!groupByClient && (
        <td style={{ padding: rowPad, fontSize: 13, color: 'var(--text)', verticalAlign: 'middle' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: client.accent }} />
            {client.name}
          </div>
        </td>
      )}
      <td style={{ padding: rowPad, verticalAlign: 'middle' }}>
        <Badge variant={app.tier === 'primary' ? 'primary' : 'secondary'}>{app.tier}</Badge>
      </td>
      <td style={{ padding: rowPad, verticalAlign: 'middle' }}>
        <TriToggle value={app.used} onChange={(v) => onToggleUsed(client.id, app.id, v)} size="sm" />
      </td>
      <td style={{ padding: rowPad, verticalAlign: 'middle' }}>
        <button onClick={() => onOpenRemarks(client.id, app.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, border: 0, background: 'transparent',
            color: latestRemark ? 'var(--text)' : 'var(--accent)', cursor: 'pointer', padding: 0,
            fontFamily: 'inherit', fontSize: 12.5, textAlign: 'left', maxWidth: '100%', overflow: 'hidden',
          }}>
          <Icon name="message" size={13} />
          {latestRemark ? (
            <span style={{
              maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{latestRemark.text}</span>
          ) : (
            <span>Add remark</span>
          )}
          {app.remarks.length > 1 && (
            <span style={{
              fontSize: 10, padding: '0 5px', borderRadius: 999,
              background: 'var(--surface-2)', color: 'var(--text-muted)', fontWeight: 600,
            }}>+{app.remarks.length - 1}</span>
          )}
        </button>
      </td>
    </tr>
  );
}

Object.assign(window, { TableDashboard });
