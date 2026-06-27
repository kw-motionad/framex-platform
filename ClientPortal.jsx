import { useState, useRef } from "react";

// ─── Motion Adrenaline Design Tokens ─────────────────────────────────────────
const C = {
  bg:          "#05050A",
  surface:     "#09090F",
  card:        "#0D0D16",
  cardHover:   "#11111C",
  border:      "#1A1A28",
  borderHover: "#282838",
  blue:        "#5B7FFF",
  blueLow:     "#5B7FFF18",
  blueMid:     "#5B7FFF35",
  green:       "#22D48A",
  greenLow:    "#22D48A15",
  yellow:      "#F5C842",
  yellowLow:   "#F5C84215",
  red:         "#FF5252",
  redLow:      "#FF525215",
  orange:      "#FF7A35",
  orangeLow:   "#FF7A3515",
  purple:      "#9B7AFF",
  purpleLow:   "#9B7AFF15",
  teal:        "#00D4AA",
  tealLow:     "#00D4AA15",
  text:        "#F0F0FA",
  textSec:     "#7878A0",
  textMuted:   "#3A3A55",
};

const LIFECYCLE_META = {
  inquiry:  { label: "Inquiry",     color: "#FF6EC7", icon: "📬" },
  awarded:  { label: "Awarded",     color: C.orange,  icon: "🏆" },
  pre:      { label: "Pre-Pro",     color: C.purple,  icon: "🎭" },
  prod:     { label: "Production",  color: C.yellow,  icon: "🎥" },
  vfx3d:   { label: "3D VFX",      color: C.teal,    icon: "🧊" },
  post:     { label: "Post",        color: C.blue,    icon: "✨" },
  wrap:     { label: "Wrap",        color: C.green,   icon: "📦" },
  archived: { label: "Archived",    color: C.textMuted, icon: "🗃" },
};

const STATUS_META = {
  approved:  { label: "Approved",     color: C.green,    bg: C.greenLow },
  in_review: { label: "In Review",    color: C.yellow,   bg: C.yellowLow },
  pending:   { label: "Pending",      color: C.textSec,  bg: "#161622" },
  changes:   { label: "Changes Req.", color: C.red,      bg: C.redLow },
  signed:    { label: "Signed",       color: C.blue,     bg: C.blueLow },
  sent:      { label: "Sent",         color: C.teal,     bg: C.tealLow },
  draft:     { label: "Draft",        color: C.textMuted,bg: "#0D0D16" },
  delivered: { label: "Delivered",    color: C.green,    bg: C.greenLow },
};

// ─── MA Sunburst Watermark ────────────────────────────────────────────────────
function Sunburst({ size = 560, opacity = 0.05 }) {
  const RAYS = 24;
  const cx = size / 2, cy = size / 2;
  const inner = size * 0.085, outer = size * 0.5;
  const paths = Array.from({ length: RAYS }, (_, i) => {
    const a1 = (i / RAYS) * Math.PI * 2;
    const a2 = ((i + 0.42) / RAYS) * Math.PI * 2;
    return (
      `M${cx + Math.cos(a1) * inner},${cy + Math.sin(a1) * inner}` +
      ` L${cx + Math.cos(a1) * outer},${cy + Math.sin(a1) * outer}` +
      ` L${cx + Math.cos(a2) * outer},${cy + Math.sin(a2) * outer}` +
      ` L${cx + Math.cos(a2) * inner},${cy + Math.sin(a2) * inner} Z`
    );
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", opacity, pointerEvents: "none", userSelect: "none" }}>
      {paths.map((d, i) => <path key={i} d={d} fill={C.blue} />)}
      <circle cx={cx} cy={cy} r={inner * 0.75} fill={C.blue} />
    </svg>
  );
}

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
function Avatar({ name = "?", size = 28 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const hue = (name.charCodeAt(0) * 47 + (name.charCodeAt(name.length - 1) || 13) * 13) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},28%,16%)`, border: `1.5px solid hsl(${hue},32%,32%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: `hsl(${hue},60%,70%)`, flexShrink: 0,
    }}>{initials}</div>
  );
}

function Badge({ status, small }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      background: m.bg, color: m.color, border: `1px solid ${m.color}28`,
      borderRadius: 4, padding: small ? "2px 7px" : "3px 10px",
      fontSize: small ? 10 : 11, fontWeight: 600,
      letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{m.label}</span>
  );
}

function LifecyclePill({ stage }) {
  const m = LIFECYCLE_META[stage] || LIFECYCLE_META.post;
  return (
    <span style={{
      background: m.color + "16", color: m.color, border: `1px solid ${m.color}28`,
      borderRadius: 5, padding: "3px 9px", fontSize: 10, fontWeight: 700,
      letterSpacing: "0.07em", textTransform: "uppercase",
    }}>{m.icon} {m.label}</span>
  );
}

function Btn({ onClick, variant = "ghost", children, style = {}, disabled }) {
  const V = {
    primary: { background: C.blue,       border: "none",                        color: "#fff",      fontWeight: 700 },
    blue:    { background: C.blueLow,    border: `1px solid ${C.blue}45`,       color: C.blue,      fontWeight: 600 },
    green:   { background: C.greenLow,   border: `1px solid ${C.green}45`,      color: C.green,     fontWeight: 600 },
    red:     { background: C.redLow,     border: `1px solid ${C.red}45`,        color: C.red,       fontWeight: 600 },
    ghost:   { background: "#12121C",    border: `1px solid ${C.border}`,       color: C.textSec },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      borderRadius: 7, padding: "7px 16px", cursor: disabled ? "default" : "pointer",
      fontSize: 12, fontWeight: 500, opacity: disabled ? 0.45 : 1,
      transition: "opacity 0.1s", ...V[variant], ...style,
    }}>{children}</button>
  );
}

function fmtTime(s) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`; }

function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Empty({ icon, msg, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 0", color: C.textMuted }}>
      <div style={{ fontSize: 42, marginBottom: 14, opacity: 0.35 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 14, color: C.textSec }}>{msg}</p>
      {sub && <p style={{ margin: "6px 0 0", fontSize: 12 }}>{sub}</p>}
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "home",         label: "Home",         sym: "⌂" },
  { id: "projects",     label: "Projects",     sym: "◈" },
  { id: "deliverables", label: "Deliverables", sym: "▶" },
  { id: "creative",     label: "Creative",     sym: "✦" },
  { id: "documents",    label: "Documents",    sym: "▣" },
  { id: "messages",     label: "Messages",     sym: "◉" },
];

function TopNav({ user, logoUrl, logoRef, onLogoChange, onSignOut, active, onNav }) {
  return (
    <div style={{
      height: 58, background: C.surface, borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", padding: "0 24px",
      flexShrink: 0, position: "relative", zIndex: 10,
    }}>
      <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files[0];
          if (f) { const r = new FileReader(); r.onload = ev => onLogoChange(ev.target.result); r.readAsDataURL(f); }
        }} />

      {/* Logo */}
      <div onClick={() => logoRef.current?.click()} style={{ cursor: "pointer", marginRight: 28, flexShrink: 0 }}>
        {logoUrl
          ? <img src={logoUrl} alt="Logo" style={{ height: 30, objectFit: "contain" }} />
          : <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{
                width: 34, height: 34, background: C.blue, borderRadius: 9,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "0.02em",
              }}>MA</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.text, letterSpacing: "0.06em", textTransform: "uppercase" }}>Motion Adrenaline</div>
                <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.16em", textTransform: "uppercase" }}>Client Portal</div>
              </div>
            </div>
        }
      </div>

      {/* Nav items */}
      <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        {NAV.map(item => {
          const on = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              background: on ? C.blueLow : "none",
              border: `1px solid ${on ? C.blue + "35" : "transparent"}`,
              borderRadius: 7, color: on ? C.blue : C.textSec,
              padding: "6px 14px", cursor: "pointer", fontSize: 12,
              fontWeight: on ? 600 : 400, display: "flex", alignItems: "center",
              gap: 6, transition: "all 0.1s",
            }}>
              <span style={{ fontSize: 12 }}>{item.sym}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User area */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{user.name}</div>
          <div style={{ fontSize: 10, color: C.textMuted }}>{user.company}</div>
        </div>
        <Avatar name={user.name} size={32} />
        <button onClick={onSignOut} title="Sign out" style={{
          background: "none", border: `1px solid ${C.border}`,
          color: C.textMuted, cursor: "pointer", fontSize: 12,
          borderRadius: 6, padding: "5px 9px", marginLeft: 2,
        }}>⏏</button>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero({ user, projects }) {
  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const pendingReviews = mine.reduce((n, p) => n + p.posts.filter(a => a.shared && a.status === "in_review").length, 0);
  const openMsgs      = mine.reduce((n, p) => n + p.clientComments.filter(c => !c.resolved).length, 0);
  const sharedFiles   = mine.reduce((n, p) => n + Object.values(p.documents).flat().filter(d => d.shared).length, 0);

  return (
    <div style={{
      position: "relative", padding: "36px 28px 32px",
      background: "linear-gradient(135deg,#060610 0%,#08081A 55%,#0A0A20 100%)",
      borderBottom: `1px solid ${C.border}`, flexShrink: 0, overflow: "hidden",
    }}>
      {/* Sunburst */}
      <div style={{ position: "absolute", right: -60, top: -60, pointerEvents: "none" }}>
        <Sunburst size={460} opacity={0.055} />
      </div>
      {/* Radial glow */}
      <div style={{
        position: "absolute", right: 120, top: 30, width: 280, height: 280,
        background: `radial-gradient(circle, ${C.blue}10 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
          Motion Adrenaline · Client Portal
        </div>
        <h1 style={{ margin: "0 0 5px", fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p style={{ margin: "0 0 26px", fontSize: 13, color: C.textSec }}>
          {user.company} &nbsp;·&nbsp; {mine.length} active project{mine.length !== 1 ? "s" : ""}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Active Projects",  val: mine.length,      color: C.blue,   sym: "◈" },
            { label: "Pending Reviews",  val: pendingReviews,   color: C.yellow, sym: "▶" },
            { label: "Open Messages",    val: openMsgs,         color: C.orange, sym: "◉" },
            { label: "Shared Files",     val: sharedFiles,      color: C.green,  sym: "▣" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#08081580", border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "11px 18px", minWidth: 108,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 13, color: s.color }}>{s.sym}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</span>
              </div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Home View ────────────────────────────────────────────────────────────────
function HomeView({ user, projects, onSelect }) {
  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const recentAssets = mine.flatMap(p =>
    p.posts.filter(a => a.shared).map(a => ({ ...a, projectTitle: p.title, projectId: p.id }))
  ).slice(0, 4);
  const recentDocs = mine.flatMap(p =>
    Object.values(p.documents).flat().filter(d => d.shared).map(d => ({ ...d, projectTitle: p.title, projectId: p.id }))
  ).slice(0, 5);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
      <div>
        <SectionHead title="Recent Deliverables" sub="Assets shared for your review" />
        {recentAssets.length === 0
          ? <Empty icon="▶" msg="No deliverables shared yet." sub="The team will upload assets here when ready." />
          : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
              {recentAssets.map(a => (
                <div key={a.id} onClick={() => onSelect(a.projectId, "deliverables")}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue + "50"; e.currentTarget.style.background = C.cardHover; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: C.blueLow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎬</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{a.projectTitle}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Badge status={a.status} small />
                    <span style={{ fontSize: 10, color: C.blue, fontWeight: 600 }}>Review →</span>
                  </div>
                </div>
              ))}
            </div>
        }

        <SectionHead title="Recent Documents" sub="Contracts, estimates & invoices" />
        {recentDocs.length === 0
          ? <Empty icon="▣" msg="No documents shared yet." />
          : recentDocs.map(d => (
              <div key={d.id} onClick={() => onSelect(d.projectId, "documents")}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.blue + "40"}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ width: 34, height: 34, borderRadius: 7, background: "#13131E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📄</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{d.projectTitle} · {d.date}</div>
                </div>
                <Badge status={d.status} small />
              </div>
            ))
        }
      </div>

      {/* Sidebar: project list */}
      <div>
        <SectionHead title="Your Projects" />
        {mine.length === 0
          ? <Empty icon="◈" msg="No projects yet." />
          : mine.map(p => {
              const sm = LIFECYCLE_META[p.status] || LIFECYCLE_META.post;
              const pending = p.posts.filter(a => a.shared && a.status === "in_review").length;
              return (
                <div key={p.id} onClick={() => onSelect(p.id, "overview")}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = sm.color + "50"; e.currentTarget.style.background = C.cardHover; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <LifecyclePill stage={p.status} />
                    {pending > 0 && <span style={{ fontSize: 10, background: C.yellowLow, color: C.yellow, border: `1px solid ${C.yellow}28`, borderRadius: 5, padding: "2px 7px", fontWeight: 600 }}>{pending} to review</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>Delivery: {p.deliveryDate}</div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

// ─── Projects View ────────────────────────────────────────────────────────────
function ProjectsView({ user, projects, onSelect }) {
  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  if (mine.length === 0) return <Empty icon="◈" msg="No projects shared with you yet." sub="Contact your Motion Adrenaline representative to get started." />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
      {mine.map(p => {
        const sm = LIFECYCLE_META[p.status] || LIFECYCLE_META.post;
        const assets    = p.posts.filter(a => a.shared).length;
        const docs      = Object.values(p.documents).flat().filter(d => d.shared).length;
        const msgs      = p.clientComments.filter(c => !c.resolved).length;
        const toReview  = p.posts.filter(a => a.shared && a.status === "in_review").length;
        return (
          <div key={p.id} onClick={() => onSelect(p.id, "overview")}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = sm.color + "55"; e.currentTarget.style.background = C.cardHover; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <LifecyclePill stage={p.status} />
              {toReview > 0 && <span style={{ fontSize: 10, background: C.yellowLow, color: C.yellow, border: `1px solid ${C.yellow}28`, borderRadius: 5, padding: "2px 8px", fontWeight: 600 }}>{toReview} to review</span>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16 }}>Delivery: {p.deliveryDate}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { val: docs,   label: "docs",     sym: "▣" },
                { val: assets, label: "assets",   sym: "▶" },
                { val: msgs,   label: "messages", sym: "◉", hi: msgs > 0 },
              ].map(s => (
                <span key={s.label} style={{
                  background: s.hi ? C.orangeLow : "#111120",
                  color: s.hi ? C.orange : C.textSec,
                  border: `1px solid ${s.hi ? C.orange + "28" : C.border}`,
                  borderRadius: 5, padding: "3px 9px", fontSize: 10,
                }}>{s.sym} {s.val} {s.label}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Deliverables View ────────────────────────────────────────────────────────
function DeliverablesView({ user, projects, onUpdate }) {
  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const [playing, setPlaying] = useState(null);
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);
  const [newNote, setNewNote] = useState("");
  const [noteTime, setNoteTime] = useState("");

  const allAssets = mine.flatMap(p =>
    p.posts.filter(a => a.shared).map(a => ({ ...a, projectTitle: p.title, projectId: p.id }))
  );

  const dur = playing?.duration || 120;
  const pct = (t / dur) * 100;
  const tick = () => setT(prev => { if (prev >= dur) { setRunning(false); return dur; } return prev + 0.4; });

  const togglePlay = () => {
    if (running) { clearInterval(timerRef.current); setRunning(false); }
    else { timerRef.current = setInterval(tick, 400); setRunning(true); }
  };

  const addNote = () => {
    if (!newNote.trim() || !playing) return;
    const colors = [C.blue, C.yellow, C.green, C.orange];
    const note = { id: `c${Date.now()}`, time: parseInt(noteTime) || Math.floor(t), author: "You", text: newNote, color: colors[playing.comments.length % 4], resolved: false };
    const proj = mine.find(p => p.id === playing.projectId);
    if (proj) onUpdate({ ...proj, posts: proj.posts.map(a => a.id === playing.id ? { ...a, comments: [...a.comments, note] } : a) });
    setPlaying(prev => ({ ...prev, comments: [...prev.comments, note] }));
    setNewNote(""); setNoteTime("");
  };

  const setStatus = (projectId, assetId, status) => {
    const proj = mine.find(p => p.id === projectId);
    if (proj) onUpdate({ ...proj, posts: proj.posts.map(a => a.id === assetId ? { ...a, status } : a) });
    if (playing?.id === assetId) setPlaying(prev => ({ ...prev, status }));
  };

  if (allAssets.length === 0) return <Empty icon="▶" msg="No deliverables yet." sub="Assets will appear here when the team shares them for your review." />;

  return (
    <div style={{ display: "flex", gap: 20, minHeight: 0 }}>
      {/* Asset list */}
      <div style={{ flex: playing ? 0 : 1, width: playing ? "320px" : "100%", flexShrink: 0 }}>
        {allAssets.map(asset => (
          <div key={asset.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 9, background: C.blueLow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎬</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.name}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                <span style={{ fontSize: 10, color: C.textMuted }}>{asset.projectTitle}</span>
                <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "monospace" }}>{asset.version}</span>
                {asset.comments.filter(c => !c.resolved).length > 0 && (
                  <span style={{ fontSize: 10, background: C.orangeLow, color: C.orange, borderRadius: 6, padding: "1px 6px", border: `1px solid ${C.orange}28` }}>
                    {asset.comments.filter(c => !c.resolved).length} notes
                  </span>
                )}
              </div>
            </div>
            <Badge status={asset.status} small />
            <Btn variant="blue" onClick={() => { setPlaying(asset); setT(0); setRunning(false); clearInterval(timerRef.current); }} style={{ fontSize: 11, padding: "5px 12px" }}>▶ Review</Btn>
            {asset.status !== "approved" && <Btn variant="green" onClick={() => setStatus(asset.projectId, asset.id, "approved")} style={{ fontSize: 10, padding: "4px 8px" }}>✓</Btn>}
            {asset.status !== "changes" && <Btn variant="red" onClick={() => setStatus(asset.projectId, asset.id, "changes")} style={{ fontSize: 10, padding: "4px 8px" }}>✗</Btn>}
          </div>
        ))}
      </div>

      {/* Player */}
      {playing && (
        <div style={{ flex: 1, background: "#030307", borderRadius: 12, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", minHeight: 400 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "monospace" }}>{playing.name}</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{playing.projectTitle}</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Badge status={playing.status} small />
              <Btn variant="green" onClick={() => setStatus(playing.projectId, playing.id, "approved")} style={{ fontSize: 11, padding: "4px 10px" }}>✓ Approve</Btn>
              <Btn variant="red" onClick={() => setStatus(playing.projectId, playing.id, "changes")} style={{ fontSize: 11, padding: "4px 10px" }}>✗ Changes</Btn>
              <button onClick={() => { clearInterval(timerRef.current); setPlaying(null); setRunning(false); }} style={{ background: "none", border: "none", color: C.textSec, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, padding: 24 }}>
            <div onClick={togglePlay} style={{ width: 72, height: 72, borderRadius: "50%", background: C.blueLow, border: `2px solid ${C.blue}40`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 28, color: C.blue }}>
              {running ? "⏸" : "▶"}
            </div>
            <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>{fmtTime(t)} / {fmtTime(dur)}</span>
            <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Simulated playback — add timecode notes below</p>
          </div>

          {/* Scrubber */}
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ position: "relative", height: 28, marginBottom: 8 }}>
              <div onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setT(((e.clientX - r.left) / r.width) * dur); }}
                style={{ position: "absolute", top: 10, left: 0, right: 0, height: 8, background: "#18182A", borderRadius: 4, cursor: "pointer" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: C.blue, borderRadius: 4 }} />
                {playing.comments.map(c => (
                  <div key={c.id} onClick={e => { e.stopPropagation(); setT(c.time); }}
                    style={{ position: "absolute", top: -4, width: 4, height: 16, background: c.color, borderRadius: 2, left: `${(c.time / dur) * 100}%`, transform: "translateX(-50%)", cursor: "pointer", zIndex: 2, opacity: c.resolved ? 0.35 : 1 }} />
                ))}
                <div style={{ position: "absolute", top: -4, width: 3, height: 16, background: "#fff", borderRadius: 2, left: `${pct}%`, transform: "translateX(-50%)", zIndex: 3 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={noteTime} onChange={e => setNoteTime(e.target.value)} placeholder={`@${Math.floor(t)}s`}
                style={{ width: 60, background: "#0A0A16", border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 7px", color: C.text, fontSize: 11, outline: "none" }} />
              <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder="Add timecode note…"
                style={{ flex: 1, background: "#0A0A16", border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 8px", color: C.text, fontSize: 11, outline: "none" }} />
              <Btn variant="blue" onClick={addNote} style={{ fontSize: 11, padding: "5px 12px" }}>+ Note</Btn>
            </div>
          </div>

          {/* Timecode notes */}
          <div style={{ maxHeight: 180, overflowY: "auto", borderTop: `1px solid ${C.border}` }}>
            {playing.comments.map(c => (
              <div key={c.id} style={{ padding: "8px 16px", borderLeft: `3px solid ${c.resolved ? C.textMuted : c.color}`, borderBottom: `1px solid ${C.border}18` }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                  <Avatar name={c.author} size={18} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{c.author}</span>
                  <span style={{ fontSize: 10, color: c.color, fontFamily: "monospace", background: c.color + "18", padding: "1px 5px", borderRadius: 3 }}>@{fmtTime(c.time)}</span>
                  {c.resolved && <span style={{ fontSize: 9, color: C.green, marginLeft: "auto" }}>✓ Resolved</span>}
                </div>
                <p style={{ margin: 0, fontSize: 11, color: C.textSec }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Creative View ────────────────────────────────────────────────────────────
function CreativeView({ user, projects }) {
  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const CAT_META = {
    pitchDecks:     { label: "Pitch Decks",    icon: "🎯", color: C.blue },
    moodBoards:     { label: "Mood Boards",     icon: "🎨", color: C.purple },
    storyboards:    { label: "Storyboards",     icon: "📋", color: "#00C2FF" },
    locationScouts: { label: "Location Scouts", icon: "📍", color: C.teal },
  };
  const all = mine.flatMap(p =>
    Object.entries(CAT_META).flatMap(([key, meta]) =>
      (p.creative[key] || []).filter(i => i.shared).map(i => ({ ...i, catKey: key, meta, projectTitle: p.title }))
    )
  );

  if (all.length === 0) return <Empty icon="✦" msg="No creative assets shared yet." sub="Pitch decks, mood boards, and storyboards will appear here." />;

  return (
    <div>
      {Object.entries(CAT_META).map(([key, meta]) => {
        const items = all.filter(i => i.catKey === key);
        if (items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{meta.icon} {meta.label}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 12 }}>
              {items.map(item => (
                <div key={item.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: meta.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{meta.icon}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{item.projectTitle}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Badge status={item.status} small />
                    <Btn variant="ghost" style={{ fontSize: 10, padding: "3px 8px" }}>View</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Documents View ───────────────────────────────────────────────────────────
function DocumentsView({ user, projects, onUpdate }) {
  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const [esig, setEsig] = useState(null);
  const [sigName, setSigName] = useState("");

  const CAT_META = {
    contracts: { label: "Contracts", icon: "📝", color: C.blue },
    estimates: { label: "Estimates", icon: "📊", color: C.yellow },
    invoices:  { label: "Invoices",  icon: "🧾", color: C.orange },
    schedules: { label: "Schedules", icon: "📅", color: C.purple },
  };

  const all = mine.flatMap(p =>
    Object.entries(CAT_META).flatMap(([key, meta]) =>
      (p.documents[key] || []).filter(d => d.shared).map(d => ({ ...d, catKey: key, meta, projectTitle: p.title, projectId: p.id }))
    )
  );

  const sign = () => {
    if (!sigName.trim()) return;
    const proj = mine.find(p => p.id === esig.projectId);
    if (proj) onUpdate({ ...proj, documents: { ...proj.documents, [esig.catKey]: proj.documents[esig.catKey].map(d => d.id === esig.id ? { ...d, status: "signed" } : d) } });
    setEsig(null); setSigName("");
  };

  if (all.length === 0) return <Empty icon="▣" msg="No documents shared yet." sub="Contracts, estimates, and invoices will appear here." />;

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {Object.entries(CAT_META).map(([key, meta]) => {
          const count = all.filter(d => d.catKey === key).length;
          return (
            <div key={key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{meta.icon}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 2 }}>{meta.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: meta.color }}>{count}</div>
            </div>
          );
        })}
      </div>

      {Object.entries(CAT_META).map(([key, meta]) => {
        const docs = all.filter(d => d.catKey === key);
        if (docs.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{meta.icon} {meta.label}</div>
            {docs.map(doc => (
              <div key={doc.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 7, background: meta.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{meta.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{doc.projectTitle} · {doc.date} · {doc.uploader}</div>
                </div>
                <Badge status={doc.status} small />
                {key === "contracts" && doc.status !== "signed" && (
                  <Btn variant="blue" onClick={() => setEsig(doc)} style={{ fontSize: 10, padding: "4px 10px" }}>✍ Sign</Btn>
                )}
                <Btn variant="ghost" style={{ fontSize: 10, padding: "4px 8px" }}>⬇</Btn>
              </div>
            ))}
          </div>
        );
      })}

      {/* E-signature modal */}
      {esig && (
        <div style={{ position: "fixed", inset: 0, background: "#000000E0", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, width: "100%", maxWidth: 460, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>✍ E-Signature</span>
              <button onClick={() => setEsig(null)} style={{ background: "none", border: "none", color: C.textSec, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <p style={{ color: C.textSec, fontSize: 13, marginBottom: 16 }}>Signing: <strong style={{ color: C.text }}>{esig.name}</strong></p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: C.textMuted, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>Type your full name to sign</label>
              <input type="text" value={sigName} onChange={e => setSigName(e.target.value)} placeholder="Your full legal name"
                style={{ width: "100%", background: "#08080E", border: `1px solid ${C.border}`, borderRadius: 6, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ background: "#08080E80", border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 16, fontFamily: "cursive", fontSize: 24, color: C.blue, minHeight: 54 }}>
              {sigName || <span style={{ color: C.textMuted, fontFamily: "'Inter',sans-serif", fontSize: 13 }}>Signature will appear here</span>}
            </div>
            <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 18 }}>By clicking Sign, you agree this constitutes a legally binding electronic signature.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setEsig(null)}>Cancel</Btn>
              <Btn variant="primary" onClick={sign} disabled={!sigName.trim()}>✍ Sign Document</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Messages View ────────────────────────────────────────────────────────────
function MessagesView({ user, projects, onUpdate }) {
  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const [projId, setProjId] = useState(mine[0]?.id || null);
  const [text, setText] = useState("");

  const proj = mine.find(p => p.id === projId);
  const comments = proj?.clientComments || [];

  const send = () => {
    if (!text.trim() || !proj) return;
    onUpdate({ ...proj, clientComments: [...comments, { id: `cc${Date.now()}`, author: user.name, date: new Date().toISOString().slice(0, 10), text, resolved: false }] });
    setText("");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 20 }}>
      {/* Sidebar */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Projects</div>
        {mine.map(p => {
          const open = p.clientComments.filter(c => !c.resolved).length;
          const on = projId === p.id;
          return (
            <div key={p.id} onClick={() => setProjId(p.id)}
              style={{ background: on ? C.blueLow : C.card, border: `1px solid ${on ? C.blue + "40" : C.border}`, borderRadius: 9, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{p.title}</div>
                {open > 0 && <span style={{ fontSize: 10, background: C.orangeLow, color: C.orange, borderRadius: 5, padding: "1px 6px", border: `1px solid ${C.orange}28`, flexShrink: 0, marginLeft: 6 }}>{open}</span>}
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>{p.clientComments.length} message{p.clientComments.length !== 1 ? "s" : ""}</div>
            </div>
          );
        })}
      </div>

      {/* Thread */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {!proj
          ? <Empty icon="◉" msg="Select a project to view messages." />
          : <>
              <div style={{ flex: 1, overflowY: "auto", minHeight: 200 }}>
                {comments.length === 0
                  ? <Empty icon="◉" msg="No messages yet." sub="Start the conversation below." />
                  : [...comments].reverse().map(c => (
                      <div key={c.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <Avatar name={c.author} size={28} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.author}</div>
                            <div style={{ fontSize: 10, color: C.textMuted }}>{c.date}</div>
                          </div>
                          <div style={{ marginLeft: "auto" }}>
                            {c.resolved
                              ? <span style={{ fontSize: 10, background: C.greenLow, color: C.green, border: `1px solid ${C.green}28`, borderRadius: 4, padding: "2px 7px" }}>Resolved</span>
                              : <span style={{ fontSize: 10, background: C.yellowLow, color: C.yellow, border: `1px solid ${C.yellow}28`, borderRadius: 4, padding: "2px 7px" }}>Open</span>
                            }
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>{c.text}</p>
                      </div>
                    ))
                }
              </div>
              <div style={{ marginTop: 16, flexShrink: 0 }}>
                <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
                  placeholder={`Message the team about ${proj.title}…`}
                  style={{ width: "100%", background: "#08080E", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <Btn variant="primary" onClick={send} disabled={!text.trim()}>Send Message</Btn>
                </div>
              </div>
            </>
        }
      </div>
    </div>
  );
}

// ─── Portal Project Detail ────────────────────────────────────────────────────
function PortalProjectDetail({ project, user, onUpdate, onBack, initTab }) {
  const [tab, setTab] = useState(initTab || "overview");
  const TABS = [
    { id: "overview",      label: "Overview",      sym: "⌂" },
    { id: "deliverables",  label: "Deliverables",  sym: "▶" },
    { id: "creative",      label: "Creative",      sym: "✦" },
    { id: "documents",     label: "Documents",     sym: "▣" },
    { id: "messages",      label: "Messages",      sym: "◉" },
  ];

  const sm = LIFECYCLE_META[project.status] || LIFECYCLE_META.post;
  const sharedDocs   = Object.values(project.documents).flat().filter(d => d.shared);
  const sharedAssets = project.posts.filter(p => p.shared);
  const openMsgs     = project.clientComments.filter(c => !c.resolved).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "16px 28px", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.textSec, cursor: "pointer", fontSize: 12, padding: 0, marginBottom: 10 }}>
          ← Back
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>{project.title}</h2>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: C.textSec }}>{project.client}</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>Delivery: {project.deliveryDate}</span>
            </div>
          </div>
          <LifecyclePill stage={project.status} />
        </div>
        {/* Mini stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Shared Files", val: sharedDocs.length, color: C.blue },
            { label: "Assets",       val: sharedAssets.length, color: C.yellow },
            { label: "Open Messages", val: openMsgs,          color: C.orange },
          ].map(s => (
            <div key={s.label} style={{ background: "#07071280", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 14px", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</span>
              <span style={{ fontSize: 11, color: C.textMuted }}>{s.label}</span>
            </div>
          ))}
        </div>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? C.blueLow : "none",
              border: `1px solid ${tab === t.id ? C.blue + "35" : "transparent"}`,
              borderRadius: 7, color: tab === t.id ? C.blue : C.textSec,
              padding: "6px 14px", cursor: "pointer", fontSize: 12,
              fontWeight: tab === t.id ? 600 : 400, display: "flex", alignItems: "center", gap: 5,
            }}>{t.sym} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Stage",    val: `${sm.icon} ${sm.label}`, color: sm.color },
                { label: "Delivery", val: project.deliveryDate,      color: C.text },
              ].map(s => (
                <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Ready for You</div>
              {sharedAssets.length === 0 && sharedDocs.length === 0
                ? <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Nothing shared yet — the team will notify you when content is ready.</p>
                : [...sharedAssets.map(a => ({ icon: "🎬", name: a.name, sub: `${a.version} · Asset`, status: a.status })),
                    ...sharedDocs.map(d => ({ icon: "📄", name: d.name, sub: `Document · ${d.date}`, status: d.status }))
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}18` }}>
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{item.name}</div>
                        <div style={{ fontSize: 10, color: C.textMuted }}>{item.sub}</div>
                      </div>
                      <Badge status={item.status} small />
                    </div>
                  ))
              }
            </div>
          </div>
        )}
        {tab === "deliverables" && <DeliverablesView user={user} projects={[project]} onUpdate={onUpdate} />}
        {tab === "creative"     && <CreativeView     user={user} projects={[project]} />}
        {tab === "documents"    && <DocumentsView    user={user} projects={[project]} onUpdate={onUpdate} />}
        {tab === "messages"     && <MessagesView     user={user} projects={[project]} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}

// ─── ClientPortal (default export) ───────────────────────────────────────────
export default function ClientPortal({ user, projects, onUpdateProject, onSignOut, logoUrl, onLogoChange }) {
  const [nav, setNav] = useState("home");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const logoRef = useRef(null);

  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const selected = mine.find(p => p.id === selectedId);

  const handleSelect = (id, tab = "overview") => {
    setSelectedId(id);
    setSelectedTab(tab);
  };

  const handleNavChange = (n) => {
    setNav(n);
    setSelectedId(null);
  };

  const showHero = !selected;

  return (
    <div style={{ height: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", display: "flex", flexDirection: "column", overflow: "hidden", color: C.text }}>
      <TopNav
        user={user} logoUrl={logoUrl} logoRef={logoRef}
        onLogoChange={onLogoChange} onSignOut={onSignOut}
        active={nav} onNav={handleNavChange}
      />

      {selected
        ? <PortalProjectDetail
            project={selected} user={user}
            onUpdate={onUpdateProject}
            onBack={() => setSelectedId(null)}
            initTab={selectedTab}
          />
        : <>
            <Hero user={user} projects={projects} />
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px" }}>
              {nav === "home"         && <HomeView         user={user} projects={projects} onSelect={handleSelect} />}
              {nav === "projects"     && <ProjectsView     user={user} projects={projects} onSelect={handleSelect} />}
              {nav === "deliverables" && <DeliverablesView user={user} projects={projects} onUpdate={onUpdateProject} />}
              {nav === "creative"     && <CreativeView     user={user} projects={projects} />}
              {nav === "documents"    && <DocumentsView    user={user} projects={projects} onUpdate={onUpdateProject} />}
              {nav === "messages"     && <MessagesView     user={user} projects={projects} onUpdate={onUpdateProject} />}
            </div>
          </>
      }
    </div>
  );
}
