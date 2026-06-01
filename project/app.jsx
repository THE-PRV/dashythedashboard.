// app.jsx — Main shell. Wires the four dashboards (3 employee variations +
// 1 manager view) into a DesignCanvas with a shared Tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "density": "comfortable",
  "groupByClient": true,
  "accent": "#2563eb"
}/*EDITMODE-END*/;

const ACCENTS = ['#2563eb', '#0f172a', '#9333ea', '#16a34a'];

function applyTheme(t) {
  const r = document.documentElement;
  r.dataset.theme = t.dark ? 'dark' : 'light';
  r.style.setProperty('--accent', t.accent);
  r.style.setProperty('--accent-fg', '#fff');
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => applyTheme(t), [t]);

  // Single source of truth for the mock data so every artboard reflects the
  // same toggles/remarks the user changes. Clone deeply once on mount.
  const [clients, setClients] = React.useState(() =>
    CLIENTS.map((c) => ({ ...c, apps: c.apps.map((a) => ({ ...a, remarks: [...a.remarks] })) }))
  );
  const [remarksPane, setRemarksPane] = React.useState(null);

  const toggleUsed = (clientId, appId, used) => {
    setClients((cs) => cs.map((c) => c.id !== clientId ? c : ({
      ...c, apps: c.apps.map((a) => a.id === appId ? { ...a, used } : a),
    })));
  };

  const openRemarks = (clientId, appId) => setRemarksPane({ clientId, appId });
  const closeRemarks = () => setRemarksPane(null);
  const addRemark = (text) => {
    if (!text.trim() || !remarksPane) return;
    setClients((cs) => cs.map((c) => c.id !== remarksPane.clientId ? c : ({
      ...c, apps: c.apps.map((a) => a.id !== remarksPane.appId ? a : ({
        ...a, remarks: [{ author: 'Virat', at: '2026-05-22', text: text.trim() }, ...a.remarks],
      })),
    })));
  };

  const commonProps = {
    user: USER_PRAVEEN, cycle: CYCLE, clients, density: t.density,
    onOpenRemarks: openRemarks, onToggleUsed: toggleUsed,
  };

  return (
    <>
      <DesignCanvas minScale={0.1} maxScale={2}>
        <DCSection id="employee" title="Employee view · Virat Kohli"
          subtitle="Three layout directions for the biweekly self-attestation flow.">
          <DCArtboard id="table" label="A · Table-heavy" width={1280} height={860}>
            <TableDashboard {...commonProps} groupByClient={t.groupByClient} />
          </DCArtboard>
          <DCArtboard id="cards" label="B · Card-based" width={1280} height={860}>
            <CardDashboard {...commonProps} />
          </DCArtboard>
          <DCArtboard id="kanban" label="C · Status board" width={1280} height={860}>
            <KanbanDashboard {...commonProps} />
          </DCArtboard>
        </DCSection>

        <DCSection id="manager" title="Manager view · same user, different hat"
          subtitle="What Virat sees when reviewing his direct reports' attestation status.">
          <DCArtboard id="manager-roster" label="D · Team roll-up" width={1440} height={960}>
            <ManagerDashboard user={USER_PRAVEEN} cycle={CYCLE} team={TEAM}
              clients={clients} density={t.density} />
          </DCArtboard>
        </DCSection>

        <DCPostIt top={120} left={40} rotate={-3} width={210}>
          Three layout directions on top, manager roll-up below. Click any
          artboard label to focus it fullscreen.
        </DCPostIt>
      </DesignCanvas>

      {remarksPane && (
        <RemarksModal pane={remarksPane} clients={clients}
          onClose={closeRemarks} onSubmit={addRemark} />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
          <TweakColor label="Accent" value={t.accent}
            options={ACCENTS}
            onChange={(v) => setTweak('accent', v)} />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio label="Density" value={t.density}
            options={['compact', 'comfortable', 'spacious']}
            onChange={(v) => setTweak('density', v)} />
          <TweakToggle label="Group table by client" value={t.groupByClient}
            onChange={(v) => setTweak('groupByClient', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// ── Remarks modal ──────────────────────────────────────────────────────
// Shared across all variations — opening it from any dashboard surfaces the
// full audit trail + a compose box that posts the new remark back into the
// shared state.
function RemarksModal({ pane, clients, onClose, onSubmit }) {
  const client = clients.find((c) => c.id === pane.clientId);
  const app = client?.apps.find((a) => a.id === pane.appId);
  const [text, setText] = React.useState('');
  if (!app) return null;

  return ReactDOM.createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15, 12, 8, 0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fade 120ms ease-out',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        background: 'var(--surface)', borderRadius: 14,
        border: '1px solid var(--border)', boxShadow: '0 20px 70px rgba(0,0,0,.35)',
        overflow: 'hidden', color: 'var(--text)',
      }}>
        <header style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: `color-mix(in oklab, ${client.accent}, transparent 86%)`,
              color: client.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
            }}><Icon name="message" size={16} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{app.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{client.name} · remarks</div>
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)',
              background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="x" size={14} /></button>
          </div>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px 20px' }}>
          {app.remarks.length === 0 ? (
            <div style={{
              padding: 18, borderRadius: 10, border: '1px dashed var(--border)',
              background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center',
            }}>No remarks yet. Add the first one below.</div>
          ) : (
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {app.remarks.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: 12 }}>
                  <Avatar initials={r.author.slice(0, 2).toUpperCase()} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r.author}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{r.at}</span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>{r.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <footer style={{ padding: '14px 20px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Add a remark for your auditor or manager…"
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
              fontFamily: 'inherit', fontSize: 13, resize: 'vertical', outline: 'none',
            }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Visible to your manager + audit.</span>
            <div style={{ flex: 1 }} />
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" icon="check" onClick={() => { onSubmit(text); setText(''); }}>Post remark</Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
