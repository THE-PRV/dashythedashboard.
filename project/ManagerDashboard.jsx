// ManagerDashboard.jsx — Manager / approver roll-up
// Virat wearing his manager hat. Charts on top (donut + stacked bars +
// tier pie); team roster below; per-member drilldown on the right.

// ── Donut ──────────────────────────────────────────────────────────────
// One SVG, one ring per slice using stroke-dasharray. Slices are ordered
// largest-first so a long thin sliver doesn't get hidden under the next one.
function Donut({ data, size = 144, thickness = 20, centerTop, centerBottom, gap = 2 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--surface-2)" strokeWidth={thickness} />
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {data.map((d, i) => {
          const len = (d.value / total) * C - gap;
          if (len <= 0) return null;
          const dash = `${len} ${C - len}`;
          const node = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={d.color} strokeWidth={thickness}
              strokeDasharray={dash} strokeDashoffset={-offset} strokeLinecap="butt" />
          );
          offset += len + gap;
          return node;
        })}
      </g>
      {centerTop != null && (
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle"
          style={{ fontSize: size * 0.22, fontWeight: 600, fill: 'var(--text)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
          {centerTop}
        </text>
      )}
      {centerBottom && (
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle"
          style={{ fontSize: 10.5, fill: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {centerBottom}
        </text>
      )}
    </svg>
  );
}

// ── Pie (filled wedges) ────────────────────────────────────────────────
function Pie({ data, size = 120 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size / 2 - 2;
  let a0 = -Math.PI / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const frac = d.value / total;
        const a1 = a0 + frac * Math.PI * 2;
        const large = frac > 0.5 ? 1 : 0;
        const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const dStr = frac >= 0.9999
          ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
          : `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
        a0 = a1;
        return <path key={i} d={dStr} fill={d.color} stroke="var(--surface)" strokeWidth={1} />;
      })}
    </svg>
  );
}

// ── Horizontal stacked bar ────────────────────────────────────────────
function StackedBar({ segments, height = 8 }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div style={{ display: 'flex', height, borderRadius: 999, overflow: 'hidden', background: 'var(--surface-2)' }}>
      {segments.map((s, i) => (
        <div key={i} title={`${s.label}: ${s.value}`}
          style={{ width: `${(s.value / total) * 100}%`, background: s.color, opacity: s.opacity ?? 1 }} />
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, children, height }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: 16, height,
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', gap: 18 }}>
        {children}
      </div>
    </div>
  );
}

function Legend({ items, columns = 1 }) {
  return (
    <ul style={{
      flex: 1, minWidth: 0, margin: 0, padding: 0, listStyle: 'none',
      display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: '8px 14px', fontSize: 12,
    }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: it.color, flex: 'none' }} />
          <span style={{ color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {it.label}
          </span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {it.value}{it.suffix || ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
function ManagerDashboard({ user, cycle, team, clients, density }) {
  const [selectedMember, setSelectedMember] = React.useState(team[0]?.id);
  const [filter, setFilter] = React.useState('all');

  // Synthesize a status per member so the table can sort/filter on it.
  const enriched = team.map((m) => {
    const pct = m.attested / m.apps;
    const status = pct === 1 ? 'submitted' : m.attested === 0 ? 'notstarted' : 'inprogress';
    return { ...m, pct, status };
  });

  const totals = enriched.reduce((acc, m) => ({
    apps: acc.apps + m.apps,
    attested: acc.attested + m.attested,
    submitted: acc.submitted + (m.status === 'submitted' ? 1 : 0),
    notstarted: acc.notstarted + (m.status === 'notstarted' ? 1 : 0),
    inprogress: acc.inprogress + (m.status === 'inprogress' ? 1 : 0),
  }), { apps: 0, attested: 0, submitted: 0, notstarted: 0, inprogress: 0 });

  // Synthesize a per-client attestation slice across the whole team so the
  // bars chart has real numbers. Each client gets `apps_per_member` *
  // `team_size`-ish total slots; attested fraction tracks `totals.attested
  // /totals.apps` weighted by accent for visual distinction.
  const clientBreakdown = clients.map((c, i) => {
    const slots = c.apps.length * team.length;
    const baseFrac = totals.attested / totals.apps;
    const jitter = [0.05, -0.12, 0.02, -0.08, 0.1][i] ?? 0;
    const filled = Math.max(0, Math.min(slots, Math.round(slots * (baseFrac + jitter))));
    return { ...c, slots, filled };
  });

  const tierBreakdown = (() => {
    let primary = 0, secondary = 0;
    clients.forEach((c) => c.apps.forEach((a) => a.tier === 'primary' ? primary++ : secondary++));
    return { primary: primary * team.length, secondary: secondary * team.length };
  })();

  const TONE = {
    submitted:  'var(--badge-used-dot)',
    inprogress: 'var(--badge-pending-dot)',
    notstarted: 'var(--badge-notused-dot)',
  };

  const statusDonut = [
    { label: 'Submitted',   value: totals.submitted,  color: TONE.submitted },
    { label: 'In progress', value: totals.inprogress, color: TONE.inprogress },
    { label: 'Not started', value: totals.notstarted, color: TONE.notstarted },
  ];

  const tierPie = [
    { label: 'Primary',   value: tierBreakdown.primary,   color: 'var(--accent)' },
    { label: 'Secondary', value: tierBreakdown.secondary, color: 'var(--badge-secondary-dot)' },
  ];

  const sorted = [...enriched]
    .filter((m) => filter === 'all'
      || (filter === 'done' && m.status === 'submitted')
      || (filter === 'pending' && m.status === 'inprogress')
      || (filter === 'overdue' && m.status === 'notstarted'))
    .sort((a, b) => {
      const order = { notstarted: 0, inprogress: 1, submitted: 2 };
      return order[a.status] - order[b.status];
    });

  const selected = enriched.find((m) => m.id === selectedMember) || enriched[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <TopBar user={user} cycle={cycle} density={density} />

      {/* Manager mode strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px',
        background: 'color-mix(in oklab, var(--accent), transparent 92%)',
        borderBottom: '1px solid var(--border)',
        fontSize: 12, color: 'var(--text)',
      }}>
        <Icon name="users" size={14} style={{ color: 'var(--accent)' }} />
        <span style={{ fontWeight: 600 }}>Manager view</span>
        <span style={{ color: 'var(--text-muted)' }}>Reviewing access for {team.length} direct reports</span>
        <div style={{ flex: 1 }} />
        <Button size="sm" icon="arrow_up_right">Switch to my access</Button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '20px 24px', gap: 16, overflow: 'hidden' }}>
          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                Team attestation · {cycle.number}
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
                {totals.submitted} of {team.length} submitted · {totals.notstarted > 0 ? (
                  <span style={{ color: 'var(--danger-fg)', fontWeight: 600 }}>{totals.notstarted} haven't started</span>
                ) : (
                  <span>everyone has started</span>
                )} · due {cycle.dueDate}
              </p>
            </div>
            <Button size="sm" icon="bell">Nudge all overdue</Button>
          </div>

          {/* Charts row */}
          <div style={{ display: 'flex', gap: 12 }}>
            <ChartCard title="Team submission status"
              subtitle={`${Math.round((totals.submitted / team.length) * 100)}% submitted`}>
              <Donut data={statusDonut} size={132} thickness={20}
                centerTop={`${totals.submitted}/${team.length}`} centerBottom="done" />
              <Legend items={statusDonut.map((s) => ({ ...s, suffix: '' }))} />
            </ChartCard>

            <ChartCard title="App coverage by client"
              subtitle={`${totals.attested}/${totals.apps} app-attestations recorded`}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {clientBreakdown.map((c) => (
                  <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '20px 70px 1fr 56px', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: c.accent }} />
                    <span style={{ fontSize: 11.5, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.code}</span>
                    <StackedBar segments={[
                      { value: c.filled, color: c.accent, label: 'attested' },
                      { value: c.slots - c.filled, color: 'var(--surface-2)', label: 'remaining' },
                    ]} height={8} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                      {Math.round((c.filled / c.slots) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Tier mix" subtitle="Across all team app-grants">
              <Pie data={tierPie} size={108} />
              <Legend items={tierPie.map((p) => ({ ...p, suffix: '' }))} />
            </ChartCard>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[
              ['all', 'Everyone', team.length],
              ['overdue', 'Not started', totals.notstarted],
              ['pending', 'In progress', totals.inprogress],
              ['done', 'Submitted', totals.submitted],
            ].map(([k, label, count]) => (
              <button key={k} onClick={() => setFilter(k)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 12px',
                  borderRadius: 999, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  background: filter === k ? 'var(--text)' : 'var(--surface)',
                  color: filter === k ? 'var(--bg)' : 'var(--text-muted)',
                  border: `1px solid ${filter === k ? 'var(--text)' : 'var(--border)'}`,
                }}>
                {label}
                <span style={{
                  fontSize: 11, padding: '0 6px', borderRadius: 999, fontVariantNumeric: 'tabular-nums',
                  background: filter === k ? 'rgba(255,255,255,.15)' : 'var(--surface-2)',
                  color: filter === k ? 'inherit' : 'var(--text-muted)',
                }}>{count}</span>
              </button>
            ))}
          </div>

          {/* Team table */}
          <div style={{
            flex: 1, minHeight: 0, overflow: 'auto',
            border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', position: 'sticky', top: 0, zIndex: 1 }}>
                  {['Team member', 'Role', 'Progress', 'Status', ''].map((h) => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '10px 14px', fontSize: 11,
                      fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                      color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((m) => (
                  <MemberRow key={m.id} member={m} selected={m.id === selectedMember}
                    onSelect={() => setSelectedMember(m.id)} density={density} />
                ))}
              </tbody>
            </table>
          </div>
        </main>

        {/* Right side: member detail panel */}
        <aside style={{
          width: 340, flex: 'none', borderLeft: '1px solid var(--border)',
          background: 'var(--surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {selected && <MemberDetail member={selected} clients={clients} />}
        </aside>
      </div>
    </div>
  );
}

function MemberRow({ member, selected, onSelect, density }) {
  const pad = density === 'compact' ? '10px 14px' : density === 'spacious' ? '16px 14px' : '13px 14px';
  const statusInfo = {
    submitted:  { label: 'Submitted',   variant: 'used' },
    inprogress: { label: 'In progress', variant: 'pending' },
    notstarted: { label: 'Not started', variant: 'notused' },
  }[member.status];

  return (
    <tr onClick={onSelect} style={{
      cursor: 'pointer',
      background: selected ? 'color-mix(in oklab, var(--accent), transparent 94%)' : 'transparent',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <td style={{ padding: pad, verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={member.avatar} size={32} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{member.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>ID · {member.id}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: pad, fontSize: 12.5, color: 'var(--text-muted)', verticalAlign: 'middle' }}>{member.role}</td>
      <td style={{ padding: pad, verticalAlign: 'middle', width: 260 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <Progress value={member.attested} max={member.apps} height={5} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', minWidth: 56, textAlign: 'right' }}>
            {member.attested}/{member.apps}
          </span>
        </div>
      </td>
      <td style={{ padding: pad, verticalAlign: 'middle' }}>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </td>
      <td style={{ padding: pad, verticalAlign: 'middle', textAlign: 'right' }}>
        <Icon name="chevright" size={14} style={{ color: 'var(--text-muted)' }} />
      </td>
    </tr>
  );
}

function MemberDetail({ member, clients }) {
  // Synthesize a per-client breakdown for the selected member.
  const breakdown = clients.slice(0, Math.min(clients.length, 4)).map((c, i) => {
    const total = Math.max(2, c.apps.length - i);
    const attested = Math.max(0, Math.min(total, Math.round(member.pct * total) + (i % 2 === 0 ? 0 : -1)));
    return { ...c, total, attested };
  });

  // Donut data for the member's overall progress.
  const memberDonut = [
    { label: 'Attested',  value: member.attested, color: 'var(--accent)' },
    { label: 'Remaining', value: Math.max(0, member.apps - member.attested), color: 'var(--surface-2)' },
  ];

  const statusInfo = {
    submitted:  { label: 'Submitted',   color: 'var(--badge-used-fg)' },
    inprogress: { label: 'In progress', color: 'var(--badge-pending-fg)' },
    notstarted: { label: 'Not started', color: 'var(--badge-notused-fg)' },
  }[member.status];

  return (
    <>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials={member.avatar} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{member.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{member.role} · ID {member.id}</div>
          </div>
        </div>

        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center', gap: 14,
          padding: 14, borderRadius: 10, background: 'var(--surface-2)',
        }}>
          <Donut data={memberDonut} size={92} thickness={14}
            centerTop={`${Math.round(member.pct * 100)}%`} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Cycle progress
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {member.attested}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ {member.apps} apps</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 11.5, color: statusInfo.color, fontWeight: 600 }}>{statusInfo.label}</div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <Button size="sm" icon="bell" style={{ flex: 1, justifyContent: 'center' }}>Nudge</Button>
          <Button size="sm" icon="message" style={{ flex: 1, justifyContent: 'center' }}>Message</Button>
          <Button size="sm" variant="primary" icon="arrow_up_right" style={{ flex: 1, justifyContent: 'center' }}>Open</Button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
          Per-client breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {breakdown.map((c) => (
            <div key={c.id} style={{
              padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, background: c.accent, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                  fontWeight: 700, fontSize: 10.5, letterSpacing: 0.4,
                }}>{c.code}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {c.attested}/{c.total}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Progress value={c.attested} max={c.total} color={c.accent} height={3} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ManagerDashboard });
