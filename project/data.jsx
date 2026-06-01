// data.jsx — mock attestation data for the prototype
// Domain: Broadridge BPO T+1 access review. Real client names + real apps
// for ED&F MAN (Marex) and Natixis lifted from the source spreadsheet;
// remaining clients synthesized for visual variety.

const CYCLE = {
  label: 'May 16 – May 30, 2026',
  dueDate: 'Fri, May 30',
  daysLeft: 8,
  number: 'Cycle 11 · 2026',
};

const USER_PRAVEEN = {
  id: '303606',
  firstName: 'Virat',
  lastName: 'Kohli',
  email: 'virat.kohli@broadridge.com',
  team: 'BPO T+1 · Govies Settlements',
  manager: 'Sourav Ganguly',
  avatar: 'VK',
  role: 'manager',
};

const TEAM = [
  { id: '303606', name: 'Virat Kohli',       avatar: 'VK', apps: 21, attested: 13, role: 'Lead Analyst' },
  { id: '301122', name: 'Suresh Raina',      avatar: 'SR', apps: 14, attested: 14, role: 'Analyst' },
  { id: '302845', name: 'Rohit Sharma',      avatar: 'RS', apps: 12, attested: 4,  role: 'Analyst' },
  { id: '304011', name: 'MS Dhoni',          avatar: 'MD', apps: 19, attested: 17, role: 'Sr. Analyst' },
  { id: '305230', name: 'Hardik Pandya',     avatar: 'HP', apps: 9,  attested: 0,  role: 'Analyst' },
  { id: '306177', name: 'Ravindra Jadeja',   avatar: 'RJ', apps: 11, attested: 9,  role: 'Sr. Analyst' },
];

const mkRemarks = (...entries) =>
  entries.map(([author, at, text]) => ({ author, at, text }));

// `used` is what shipped from the spreadsheet (true / false / null) and
// `tier` is synthesized — primary on tools the analyst checked, secondary
// elsewhere — so the badges have visual variety for the demo.
const CLIENTS = [
  {
    id: 'marex',
    name: 'ED&F MAN (Marex)',
    code: 'MRX',
    accent: '#2563eb',
    apps: [
      { id: 'mrx-access-edge', name: 'Access Edge',  tier: 'secondary', used: false, remarks: [] },
      { id: 'mrx-bdas',        name: 'BDAS Chase',   tier: 'secondary', used: false, remarks: [] },
      { id: 'mrx-bdc',         name: 'BDC',          tier: 'secondary', used: false, remarks: [] },
      { id: 'mrx-bpa',         name: 'BPA T Stream', tier: 'secondary', used: false, remarks: [] },
      { id: 'mrx-bps',         name: 'BPS',          tier: 'secondary', used: false, remarks: [] },
      { id: 'mrx-dtcc',        name: 'DTCC',         tier: 'secondary', used: false, remarks: [] },
      { id: 'mrx-edf',         name: 'ED&F Reports', tier: 'secondary', used: null,  remarks: [] },
      { id: 'mrx-ficc',        name: 'FICC',         tier: 'secondary', used: false, remarks: [] },
      { id: 'mrx-impact',      name: 'IMPACT',       tier: 'primary',   used: true,
        remarks: mkRemarks(['Virat', '2026-05-19', 'Daily user — primary settlements tool for Marex.']) },
      { id: 'mrx-jpm',         name: 'JPM',          tier: 'secondary', used: false, remarks: [] },
      { id: 'mrx-mbse',        name: 'MBSE',         tier: 'secondary', used: null,  remarks: [] },
    ],
  },
  {
    id: 'natixis',
    name: 'Natixis',
    code: 'NTX',
    accent: '#0891b2',
    apps: [
      { id: 'ntx-access-edge', name: 'Access Edge',     tier: 'primary',   used: true,  remarks: [] },
      { id: 'ntx-bdc',         name: 'BDC',             tier: 'primary',   used: true,
        remarks: mkRemarks(['Virat', '2026-05-20', 'Primary user for BDC on Natixis books.']) },
      { id: 'ntx-cass',        name: 'CASS Hub',        tier: 'primary',   used: true,  remarks: [] },
      { id: 'ntx-ficc',        name: 'FICC',            tier: 'secondary', used: false, remarks: [] },
      { id: 'ntx-symphony',    name: 'SYMPHONY',        tier: 'primary',   used: true,  remarks: [] },
      { id: 'ntx-secids',      name: 'Security IDs',    tier: 'primary',   used: true,  remarks: [] },
      { id: 'ntx-sharepoint',  name: 'Sharepoint',      tier: 'primary',   used: true,  remarks: [] },
      { id: 'ntx-summit-amer', name: 'Summit Amer prod',tier: 'secondary', used: null,  remarks: [] },
      { id: 'ntx-summit-tci',  name: 'Summit TCI',      tier: 'secondary', used: null,  remarks: [] },
      { id: 'ntx-team',        name: 'Team',            tier: 'secondary', used: false, remarks: [] },
    ],
  },
  {
    id: 'janestreet',
    name: 'Jane Street',
    code: 'JST',
    accent: '#7c3aed',
    apps: [
      { id: 'jst-access-edge', name: 'Access Edge', tier: 'primary',   used: true,  remarks: [] },
      { id: 'jst-ficc',        name: 'FICC',        tier: 'primary',   used: true,  remarks: [] },
      { id: 'jst-impact',      name: 'IMPACT',      tier: 'secondary', used: null,
        remarks: mkRemarks(['Virat', '2026-05-15', 'Backup only — Suresh is primary.']) },
      { id: 'jst-sharepoint',  name: 'Sharepoint',  tier: 'secondary', used: false, remarks: [] },
    ],
  },
  {
    id: 'jefferies',
    name: 'Jefferies',
    code: 'JEF',
    accent: '#ca8a04',
    apps: [
      { id: 'jef-bdas',        name: 'BDAS Chase',  tier: 'primary',   used: true,  remarks: [] },
      { id: 'jef-bdc',         name: 'BDC',         tier: 'secondary', used: null,  remarks: [] },
      { id: 'jef-dtcc',        name: 'DTCC',        tier: 'primary',   used: true,  remarks: [] },
      { id: 'jef-impact',      name: 'IMPACT',      tier: 'secondary', used: false, remarks: [] },
    ],
  },
  {
    id: 'barclays',
    name: 'Barclays Capital',
    code: 'BCS',
    accent: '#db2777',
    apps: [
      { id: 'bcs-access-edge', name: 'Access Edge', tier: 'secondary', used: null,  remarks: [] },
      { id: 'bcs-bps',         name: 'BPS',         tier: 'primary',   used: true,  remarks: [] },
      { id: 'bcs-dtcc',        name: 'DTCC',        tier: 'primary',   used: true,  remarks: [] },
      { id: 'bcs-symphony',    name: 'SYMPHONY',    tier: 'secondary', used: false, remarks: [] },
    ],
  },
  {
    id: 'bbva',
    name: 'BBVA',
    code: 'BBV',
    accent: '#0d9488',
    apps: [
      { id: 'bbv-bdc',         name: 'BDC',         tier: 'secondary', used: null,  remarks: [] },
      { id: 'bbv-ficc',        name: 'FICC',        tier: 'secondary', used: null,  remarks: [] },
      { id: 'bbv-mbse',        name: 'MBSE',        tier: 'secondary', used: false, remarks: [] },
    ],
  },
  {
    id: 'ing',
    name: 'ING',
    code: 'ING',
    accent: '#e11d48',
    apps: [
      { id: 'ing-bpa',         name: 'BPA T Stream',tier: 'primary',   used: true,  remarks: [] },
      { id: 'ing-impact',      name: 'IMPACT',      tier: 'primary',   used: true,  remarks: [] },
      { id: 'ing-team',        name: 'Team',        tier: 'secondary', used: null,  remarks: [] },
    ],
  },
];

function countByClient(client) {
  const total = client.apps.length;
  const attested = client.apps.filter((a) => a.used !== null).length;
  const used = client.apps.filter((a) => a.used === true).length;
  const pending = total - attested;
  return { total, attested, used, pending };
}

function relativeDate(iso) {
  if (!iso) return 'Never';
  const d = new Date(iso + 'T00:00:00');
  const now = new Date('2026-05-22T00:00:00');
  const diff = Math.round((now - d) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}

Object.assign(window, {
  CYCLE, USER_PRAVEEN, TEAM, CLIENTS, countByClient, relativeDate,
});
