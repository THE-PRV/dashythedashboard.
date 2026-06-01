// CardDashboard.jsx — Variation 2: Card-based
// Each client is a card section with an attestation progress header. Apps
// inside render as a small card grid. More visual, easier to scan.

function CardDashboard({ user, cycle, clients, density, onOpenRemarks, onToggleUsed }) {
  const [search, setSearch] = React.useState('');
  const [expandedClient, setExpandedClient] = React.useState(clients[0]?.id);

  const totals = React.useMemo(() => {
    let total = 0, attested = 0, used = 0;
    clients.forEach((c) => c.apps.forEach((a) => {
      total += 1;
      if (a.used !== null) attested += 1;
      if (a.used === true) used += 1;
    }));
    return { total, attested, used, pending: total - attested };
  }, [clients]);

  const visibleClients = clients
    .map((c) => ({ ...c, apps: c.apps.filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase())) }))
    .filter((c) => c.apps.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <TopBar user={user} cycle={cycle} density={density} search={search} onSearch={setSearch} />

      {/* Hero strip — big cycle progress band */}
      <div style={{
        padding: density === 'compact' ? '18px 24px' : '24px 24px',
        background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent), transparent 92%), transparent 60%)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'flex-end', gap: 32,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <Icon name="shield" size={13} /> Biweekly access review
          </div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Good morning, {user.firstName}.
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, maxWidth: 540 }}>
            You have {totals.pending} tools left to attest before {cycle.dueDate}. Mark which ones you actually used this cycle.
          </p>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 20px',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
          minWidth: 280,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Cycle progress</span>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{cycle.daysLeft}d left</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{totals.attested}</span>
            <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/ {totals.total}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 500, color: 'var(--accent)' }}>
              {Math.round((totals.attested / totals.total) * 100)}%
            </span>
          </div>
          <Progress value={totals.attested} max={totals.total} height={6} />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button variant="primary" size="sm" icon="check" style={{ flex: 1, justifyContent: 'center' }}>Submit attestation</Button>
          </div>
        </div>
      </div>

      {/* Client cards stream */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {visibleClients.map((client) => {
          const stats = countByClient(client);
          const open = expandedClient === client.id;
          return (
            <section key={client.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden',
            }}>
              <header
                onClick={() => setExpandedClient(open ? null : client.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer',
                  borderBottom: open ? '1px solid var(--border)' : 'none',
                }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 9,
                  background: `linear-gradient(135deg, ${client.accent}, color-mix(in oklab, ${client.accent}, black 25%))`,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13, letterSpacing: 0.5,
                }}>{client.code}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{client.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {stats.total} apps · {stats.used} used · {stats.pending > 0 ? `${stats.pending} pending` : 'all attested'}
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ width: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>Attested</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>{stats.attested}/{stats.total}</span>
                  </div>
                  <Progress value={stats.attested} max={stats.total} color={client.accent} height={5} />
                </div>
                <button style={{
                  width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)',
                  background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s',
                }}><Icon name="chevdown" size={13} /></button>
              </header>

              {open && (
                <div style={{
                  padding: 14, display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10,
                }}>
                  {client.apps.map((app) => (
                    <AppCard key={app.id} app={app} client={client}
                      onToggleUsed={onToggleUsed} onOpenRemarks={onOpenRemarks} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AppCard({ app, client, onToggleUsed, onOpenRemarks }) {
  const latestRemark = app.remarks[0];
  const pending = app.used === null;
  return (
    <div style={{
      padding: 12, borderRadius: 10,
      background: pending ? 'color-mix(in oklab, var(--warning-bg), transparent 50%)' : 'var(--surface-2)',
      border: `1px solid ${pending ? 'var(--warning-border)' : 'var(--border-subtle)'}`,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 7,
          background: `color-mix(in oklab, ${client.accent}, transparent 86%)`,
          color: client.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
        }}><Icon name="app" size={15} /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.005em' }}>{app.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Badge variant={app.tier === 'primary' ? 'primary' : 'secondary'} size="sm">{app.tier}</Badge>
          </div>
        </div>
      </div>

      <TriToggle value={app.used} onChange={(v) => onToggleUsed(client.id, app.id, v)} size="sm" />

      <button onClick={() => onOpenRemarks(client.id, app.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', marginLeft: -6,
          border: 0, background: 'transparent', color: latestRemark ? 'var(--text-muted)' : 'var(--accent)',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, textAlign: 'left', borderRadius: 6,
        }}>
        <Icon name="message" size={12} />
        {latestRemark ? (
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
            "{latestRemark.text}"
          </span>
        ) : (
          <span>Add remark</span>
        )}
      </button>
    </div>
  );
}

Object.assign(window, { CardDashboard });
