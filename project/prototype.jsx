// prototype.jsx — Final deliverable. Two screens (Employee · Card view +
// Manager · Roll-up), role toggle in the top-right of each screen, no
// design-canvas chrome. All toggles, remarks modal, and chart updates work
// against a single shared state store.

function PrototypeApp() {
  const [role, setRole] = React.useState('employee'); // 'employee' | 'manager'
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  // Shared mock state — clone once on mount.
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

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Floating role + theme switcher — sits above the dashboard. */}
      <RoleSwitcher role={role} onRole={setRole} dark={dark} onDark={setDark} />

      <div style={{ flex: 1, minHeight: 0 }}>
        {role === 'employee' ? (
          <CardDashboard user={USER_PRAVEEN} cycle={CYCLE} clients={clients}
            density="comfortable" onOpenRemarks={openRemarks} onToggleUsed={toggleUsed} />
        ) : (
          <ManagerDashboard user={USER_PRAVEEN} cycle={CYCLE} team={TEAM}
            clients={clients} density="comfortable" />
        )}
      </div>

      {remarksPane && (
        <RemarksModal pane={remarksPane} clients={clients}
          onClose={closeRemarks} onSubmit={addRemark} />
      )}
    </div>
  );
}

// ── Role + theme switcher ──────────────────────────────────────────────
// Pinned bottom-center. Pill-shaped, segmented for role + a moon/sun toggle.
function RoleSwitcher({ role, onRole, dark, onDark }) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 50, display: 'flex', alignItems: 'center', gap: 4, padding: 4,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
    }}>
      {[
        { id: 'employee', label: 'Employee view', icon: 'user' },
        { id: 'manager',  label: 'Manager view',  icon: 'users' },
      ].map((opt) => {
        const active = role === opt.id;
        return (
          <button key={opt.id} onClick={() => onRole(opt.id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 34, padding: '0 16px', borderRadius: 999, border: 0, cursor: 'pointer',
            background: active ? 'var(--text)' : 'transparent',
            color: active ? 'var(--bg)' : 'var(--text-muted)',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
            transition: 'background .15s, color .15s',
          }}>
            <Icon name={opt.icon} size={14} />
            {opt.label}
          </button>
        );
      })}
      <span style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
      <button onClick={() => onDark(!dark)} title={dark ? 'Switch to light' : 'Switch to dark'} style={{
        width: 34, height: 34, borderRadius: 999, border: 0, cursor: 'pointer',
        background: 'transparent', color: 'var(--text-muted)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={dark ? 'sun' : 'moon'} size={15} />
      </button>
    </div>
  );
}

// ── Remarks modal (reused from app.jsx, copied here so prototype is self-contained)
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
root.render(<PrototypeApp />);
