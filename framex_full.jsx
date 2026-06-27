import { useState, useRef, useEffect, useCallback } from "react";

const COLORS = {
  bg: "#0A0A0C",
  surface: "#111115",
  card: "#16161C",
  border: "#2A2A35",
  borderHover: "#3A3A4A",
  orange: "#FF5500",
  orangeDim: "#CC4400",
  cyan: "#00C2FF",
  cyanDim: "#0099CC",
  green: "#00E676",
  yellow: "#FFD600",
  red: "#FF3D3D",
  textPrimary: "#F0F0F5",
  textSecondary: "#8A8A9A",
  textMuted: "#55555F",
};

const PROJECTS = [
  { id: 1, title: "Titan VFX Seq A", client: "Paramount", status: "in_review", due: "Jun 20", thumb: "🎬", progress: 72, assets: 14 },
  { id: 2, title: "Neon City Comp", client: "Netflix", status: "approved", due: "Jun 15", thumb: "🌆", progress: 100, assets: 8 },
  { id: 3, title: "Creature Rig v3", client: "Disney", status: "pending", due: "Jul 2", thumb: "🐉", progress: 34, assets: 22 },
  { id: 4, title: "Storm Sequence", client: "Universal", status: "in_review", due: "Jun 28", thumb: "⚡", progress: 58, assets: 11 },
];

const INITIAL_ASSETS = {
  1: [
    { id: "a1", type: "video", name: "TitanA_comp_v04.mp4", version: "v04", status: "in_review", uploader: "Jake M.", duration: 124, comments: [{ id: "c1", time: 12, author: "Sarah D.", text: "Explosion edge needs more scatter", color: COLORS.orange, resolved: false }, { id: "c2", time: 47, author: "Tom R.", text: "Grade looks great here 👍", color: COLORS.green, resolved: true }, { id: "c3", time: 91, author: "Lisa K.", text: "Hold frame on hero shot longer?", color: COLORS.cyan, resolved: false }] },
    { id: "a2", type: "board", name: "TitanA_storyboard_r2.jpg", version: "r2", status: "approved", uploader: "Ana P.", comments: [] },
    { id: "a3", type: "video", name: "TitanA_beauty_pass.mp4", version: "v01", status: "pending", uploader: "Jake M.", duration: 87, comments: [] },
  ],
  2: [
    { id: "a4", type: "video", name: "NeonCity_final.mp4", version: "v07", status: "approved", uploader: "Sam K.", duration: 210, comments: [] },
  ],
  3: [
    { id: "a5", type: "board", name: "Creature_ref_board.jpg", version: "r1", status: "pending", uploader: "Mike J.", comments: [] },
  ],
  4: [
    { id: "a6", type: "video", name: "Storm_rough_cut.mp4", version: "v02", status: "in_review", uploader: "Ana P.", duration: 156, comments: [{ id: "c4", time: 33, author: "Director Chen", text: "Too long - tighten by 8 seconds", color: COLORS.red, resolved: false }] },
  ],
};

const STATUS_META = {
  approved: { label: "Approved", color: COLORS.green, bg: "#003320" },
  in_review: { label: "In Review", color: COLORS.yellow, bg: "#332800" },
  pending: { label: "Pending", color: COLORS.textSecondary, bg: "#1E1E28" },
  changes: { label: "Changes Req.", color: COLORS.red, bg: "#330000" },
};

function Badge({ status, small }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}30`, borderRadius: 4, padding: small ? "2px 7px" : "3px 10px", fontSize: small ? 10 : 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

function Avatar({ name, size = 28 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const hue = name.charCodeAt(0) * 37 % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `hsl(${hue},40%,28%)`, border: `1.5px solid hsl(${hue},40%,40%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 600, color: `hsl(${hue},70%,80%)`, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function VideoPlayer({ asset, onClose }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAddComment, setShowAddComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [comments, setComments] = useState(asset.comments || []);
  const [hoveredComment, setHoveredComment] = useState(null);
  const [activeComment, setActiveComment] = useState(null);
  const intervalRef = useRef(null);
  const duration = asset.duration || 120;

  const tick = useCallback(() => {
    setCurrentTime(t => {
      if (t >= duration) { setPlaying(false); return duration; }
      return t + 0.5;
    });
  }, [duration]);

  useEffect(() => {
    if (playing) { intervalRef.current = setInterval(tick, 500); }
    else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [playing, tick]);

  const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = (currentTime / duration) * 100;

  const addComment = () => {
    if (!newCommentText.trim()) return;
    const colors = [COLORS.orange, COLORS.cyan, COLORS.yellow, COLORS.red];
    const nc = { id: `c${Date.now()}`, time: Math.floor(currentTime), author: "You", text: newCommentText, color: colors[Math.floor(Math.random() * colors.length)], resolved: false };
    setComments(prev => [...prev, nc]);
    setNewCommentText("");
    setShowAddComment(false);
    setPlaying(false);
  };

  const toggleResolved = (id) => setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c));

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000E0", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, width: "100%", maxWidth: 900, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, fontFamily: "monospace" }}>{asset.name}</span>
            <Badge status={asset.status} small />
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>{asset.version}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px" }}>✕</button>
        </div>

        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Video canvas */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#060608" }}>
            {/* Fake video viewport */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 280 }}>
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#1A1A22", border: `2px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => setPlaying(p => !p)}>
                  <span style={{ fontSize: 28, userSelect: "none" }}>{playing ? "⏸" : "▶"}</span>
                </div>
                <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace" }}>{fmtTime(currentTime)} / {fmtTime(duration)}</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>Preview mode · {asset.name}</span>
              </div>
              {/* Active comment overlay */}
              {activeComment && (
                <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, background: "#000000CC", border: `1px solid ${activeComment.color}`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Avatar name={activeComment.author} size={22} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: activeComment.color }}>{activeComment.author}</span>
                    <span style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: "monospace" }}>@ {fmtTime(activeComment.time)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.textPrimary }}>{activeComment.text}</p>
                </div>
              )}
            </div>

            {/* Scrubber */}
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.border}` }}>
              <div style={{ position: "relative", height: 32 }}>
                {/* Track */}
                <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 8, background: "#1E1E28", borderRadius: 4, cursor: "pointer" }}
                  onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setCurrentTime(((e.clientX - r.left) / r.width) * duration); }}>
                  {/* Progress */}
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: COLORS.orange, borderRadius: 4 }} />
                  {/* Comment markers */}
                  {comments.map(c => (
                    <div key={c.id}
                      style={{ position: "absolute", top: -4, width: 4, height: 16, background: c.color, borderRadius: 2, left: `${(c.time / duration) * 100}%`, transform: "translateX(-50%)", cursor: "pointer", zIndex: 2, opacity: c.resolved ? 0.4 : 1 }}
                      onMouseEnter={() => setHoveredComment(c)}
                      onMouseLeave={() => setHoveredComment(null)}
                      onClick={e => { e.stopPropagation(); setCurrentTime(c.time); setActiveComment(activeComment?.id === c.id ? null : c); }}
                    />
                  ))}
                  {/* Playhead */}
                  <div style={{ position: "absolute", top: -4, width: 3, height: 16, background: "white", borderRadius: 2, left: `${pct}%`, transform: "translateX(-50%)", zIndex: 3 }} />
                  {/* Hover tooltip */}
                  {hoveredComment && (
                    <div style={{ position: "absolute", bottom: 20, left: `${(hoveredComment.time / duration) * 100}%`, transform: "translateX(-50%)", background: COLORS.card, border: `1px solid ${hoveredComment.color}`, borderRadius: 6, padding: "6px 10px", whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none" }}>
                      <span style={{ fontSize: 11, color: hoveredComment.color, fontWeight: 600 }}>{hoveredComment.author}</span>
                      <span style={{ fontSize: 10, color: COLORS.textMuted, marginLeft: 6, fontFamily: "monospace" }}>{fmtTime(hoveredComment.time)}</span>
                    </div>
                  )}
                </div>
                {/* Playhead knob */}
                <div style={{ position: "absolute", top: 8, width: 16, height: 16, background: "white", borderRadius: "50%", left: `${pct}%`, transform: "translateX(-50%)", zIndex: 4, boxShadow: "0 0 0 2px #000" }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setPlaying(p => !p)} style={{ background: playing ? COLORS.orange : "#1E1E28", border: `1px solid ${playing ? COLORS.orange : COLORS.border}`, color: COLORS.textPrimary, borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    {playing ? "⏸ Pause" : "▶ Play"}
                  </button>
                  <button onClick={() => setCurrentTime(0)} style={{ background: "#1E1E28", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>⏮</button>
                </div>
                <button onClick={() => { setPlaying(false); setShowAddComment(true); }} style={{ background: "#1A1A28", border: `1px solid ${COLORS.cyan}50`, color: COLORS.cyan, borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  + Mark Comment
                </button>
              </div>

              {showAddComment && (
                <div style={{ marginTop: 10, background: "#0D0D18", border: `1px solid ${COLORS.cyan}40`, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: COLORS.cyan, marginBottom: 6, fontFamily: "monospace" }}>Comment at {fmtTime(currentTime)}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={newCommentText} onChange={e => setNewCommentText(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()} placeholder="Type your note..." style={{ flex: 1, background: "#16161E", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "7px 10px", color: COLORS.textPrimary, fontSize: 13, outline: "none" }} autoFocus />
                    <button onClick={addComment} style={{ background: COLORS.cyan, border: "none", color: "#000", borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Save</button>
                    <button onClick={() => setShowAddComment(false)} style={{ background: "#1E1E28", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "7px 10px", cursor: "pointer", fontSize: 12 }}>✕</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments panel */}
          <div style={{ width: 260, borderLeft: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>Comments</span>
              <span style={{ fontSize: 11, background: "#1E1E28", borderRadius: 10, padding: "2px 7px", color: COLORS.textSecondary }}>{comments.filter(c => !c.resolved).length} open</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {comments.length === 0 ? (
                <p style={{ color: COLORS.textMuted, fontSize: 12, textAlign: "center", padding: "24px 16px" }}>No comments yet.<br />Mark a timecode to add one.</p>
              ) : comments.map(c => (
                <div key={c.id} onClick={() => { setCurrentTime(c.time); setActiveComment(activeComment?.id === c.id ? null : c); }}
                  style={{ padding: "10px 16px", cursor: "pointer", borderLeft: `3px solid ${c.resolved ? COLORS.textMuted : c.color}`, marginBottom: 2, background: activeComment?.id === c.id ? "#1A1A24" : "transparent", transition: "background 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <Avatar name={c.author} size={22} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: c.resolved ? COLORS.textMuted : COLORS.textPrimary }}>{c.author}</span>
                    <span style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: "monospace", marginLeft: "auto" }}>{fmtTime(c.time)}</span>
                  </div>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: c.resolved ? COLORS.textMuted : COLORS.textSecondary, textDecoration: c.resolved ? "line-through" : "none" }}>{c.text}</p>
                  <button onClick={e => { e.stopPropagation(); toggleResolved(c.id); }} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: c.resolved ? COLORS.green : COLORS.textMuted, borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 10 }}>
                    {c.resolved ? "↩ Reopen" : "✓ Resolve"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardViewer({ asset, onClose }) {
  const [comments, setComments] = useState(asset.comments || []);
  const [pins, setPins] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [pendingPos, setPendingPos] = useState(null);

  const handleImageClick = (e) => {
    if (!adding) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPendingPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const savePin = () => {
    if (!newText.trim() || !pendingPos) return;
    setPins(prev => [...prev, { id: `p${Date.now()}`, ...pendingPos, text: newText, author: "You" }]);
    setNewText("");
    setPendingPos(null);
    setAdding(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000E0", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, width: "100%", maxWidth: 800, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, fontFamily: "monospace" }}>{asset.name}</span>
            <Badge status={asset.status} small />
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, position: "relative", background: "#080810", minHeight: 360, cursor: adding ? "crosshair" : "default" }} onClick={handleImageClick}>
            {/* Simulated storyboard */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, padding: 16, height: "100%" }}>
              {["Opening wide", "Hero entrance", "VFX burst", "Reaction CU", "Final reveal", "End frame"].map((label, i) => (
                <div key={i} style={{ background: `hsl(${220 + i * 10},20%,${8 + i * 2}%)`, borderRadius: 4, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${COLORS.border}` }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{"🎬🎥🔥👤✨🎞"[i]}</div>
                    <div style={{ fontSize: 9, color: COLORS.textMuted }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pins */}
            {pins.map((p, i) => (
              <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-100%)", zIndex: 5 }}>
                <div style={{ background: COLORS.orange, color: "#000", borderRadius: "50% 50% 50% 0", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
                  title={`${p.author}: ${p.text}`}>{i + 1}</div>
              </div>
            ))}
            {pendingPos && (
              <div style={{ position: "absolute", left: `${pendingPos.x}%`, top: `${pendingPos.y}%`, transform: "translate(-50%,-100%)" }}>
                <div style={{ background: COLORS.cyan, borderRadius: "50%", width: 14, height: 14 }} />
              </div>
            )}
          </div>
          <div style={{ width: 220, borderLeft: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 14, borderBottom: `1px solid ${COLORS.border}` }}>
              <button onClick={() => { setAdding(a => !a); setPendingPos(null); }} style={{ width: "100%", background: adding ? COLORS.orange : "#1E1E28", border: `1px solid ${adding ? COLORS.orange : COLORS.border}`, color: adding ? "#000" : COLORS.textSecondary, borderRadius: 6, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {adding ? "Click on board to pin" : "📌 Add Pin Comment"}
              </button>
              {pendingPos && (
                <div style={{ marginTop: 8 }}>
                  <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && savePin()} placeholder="Pin note..." style={{ width: "100%", background: "#16161E", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "6px 8px", color: COLORS.textPrimary, fontSize: 12, outline: "none", boxSizing: "border-box" }} autoFocus />
                  <button onClick={savePin} style={{ marginTop: 6, width: "100%", background: COLORS.cyan, border: "none", color: "#000", borderRadius: 6, padding: "6px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Save Pin</button>
                </div>
              )}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              {pins.length === 0 ? <p style={{ color: COLORS.textMuted, fontSize: 11, textAlign: "center", marginTop: 20 }}>No pins yet</p> : pins.map((p, i) => (
                <div key={p.id} style={{ padding: "8px 10px", borderLeft: `3px solid ${COLORS.orange}`, marginBottom: 6, background: "#1A1A22", borderRadius: "0 6px 6px 0" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                    <span style={{ background: COLORS.orange, color: "#000", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{p.author}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.textPrimary }}>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "12px 20px", borderTop: `1px solid ${COLORS.border}` }}>
          <button style={{ background: COLORS.green + "18", border: `1px solid ${COLORS.green}50`, color: COLORS.green, borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>✓ Approve</button>
          <button style={{ background: COLORS.red + "18", border: `1px solid ${COLORS.red}50`, color: COLORS.red, borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>✗ Request Changes</button>
          <button style={{ background: "#1E1E28", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontSize: 12, marginLeft: "auto" }}>⬇ Download</button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ projectId, onUpload, onClose }) {
  const [dragging, setDragging] = useState(false);
  const [type, setType] = useState("video");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("v01");

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setName(f.name); setType(f.type.startsWith("video") ? "video" : "board"); }
  };

  const submit = () => {
    if (!name.trim()) return;
    onUpload({ id: `a${Date.now()}`, type, name: name || `new_asset_${version}`, version, status: "pending", uploader: "You", duration: type === "video" ? Math.floor(Math.random() * 180 + 60) : undefined, comments: [] });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000C0", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, width: 460, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: COLORS.textPrimary, fontSize: 16 }}>Upload Asset</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {["video", "board"].map(t => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, background: type === t ? (t === "video" ? COLORS.orange : COLORS.cyan) + "22" : "#1E1E28", border: `1px solid ${type === t ? (t === "video" ? COLORS.orange : COLORS.cyan) : COLORS.border}`, color: type === t ? (t === "video" ? COLORS.orange : COLORS.cyan) : COLORS.textSecondary, borderRadius: 6, padding: "8px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {t === "video" ? "🎬 Video" : "🖼 Storyboard"}
            </button>
          ))}
        </div>

        <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
          style={{ border: `2px dashed ${dragging ? COLORS.cyan : COLORS.border}`, borderRadius: 8, padding: "32px 24px", textAlign: "center", background: dragging ? COLORS.cyan + "08" : "#0D0D12", marginBottom: 16, cursor: "pointer", transition: "all 0.15s" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{type === "video" ? "🎬" : "🖼"}</div>
          <p style={{ margin: "0 0 4px", color: COLORS.textSecondary, fontSize: 13 }}>Drag & drop file here</p>
          <p style={{ margin: 0, color: COLORS.textMuted, fontSize: 11 }}>{type === "video" ? "MP4, MOV, MXF" : "JPG, PNG, PDF, PSD"}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 10, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: COLORS.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Filename</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={type === "video" ? "scene_comp_v01.mp4" : "board_r1.jpg"} style={{ width: "100%", background: "#0D0D12", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.textPrimary, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: COLORS.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Version</label>
            <input value={version} onChange={e => setVersion(e.target.value)} style={{ width: "100%", background: "#0D0D12", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px 10px", color: COLORS.textPrimary, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#1E1E28", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 6, padding: "9px 18px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={submit} style={{ background: COLORS.orange, border: "none", color: "#fff", borderRadius: 6, padding: "9px 22px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Upload Asset</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedProject, setSelectedProject] = useState(null);
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [playingAsset, setPlayingAsset] = useState(null);
  const [viewingBoard, setViewingBoard] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [projects, setProjects] = useState(PROJECTS);

  const currentAssets = selectedProject ? (assets[selectedProject.id] || []) : [];

  const handleUpload = (asset) => {
    setAssets(prev => ({ ...prev, [selectedProject.id]: [...(prev[selectedProject.id] || []), asset] }));
  };

  const updateAssetStatus = (assetId, status) => {
    setAssets(prev => {
      const updated = { ...prev };
      updated[selectedProject.id] = updated[selectedProject.id].map(a => a.id === assetId ? { ...a, status } : a);
      return updated;
    });
  };

  const navItems = [
    { id: "projects", icon: "🗂", label: "Projects" },
    { id: "review", icon: "👁", label: "Review Queue" },
    { id: "team", icon: "👥", label: "Team" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: COLORS.bg, fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.textPrimary, overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: COLORS.orange, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎬</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, letterSpacing: "-0.02em" }}>FRAME<span style={{ color: COLORS.orange }}>X</span></div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.1em" }}>POST PRODUCTION</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 8px", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if (item.id !== "projects") setSelectedProject(null); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", background: activeTab === item.id ? COLORS.orange + "18" : "none", border: `1px solid ${activeTab === item.id ? COLORS.orange + "40" : "transparent"}`, borderRadius: 7, color: activeTab === item.id ? COLORS.orange : COLORS.textSecondary, cursor: "pointer", fontSize: 13, marginBottom: 2, textAlign: "left", fontWeight: activeTab === item.id ? 600 : 400 }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        {/* Review queue badge */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ background: "#1A1A22", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>Pending review</span>
            <span style={{ background: COLORS.orange, color: "#000", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
              {Object.values(assets).flat().filter(a => a.status === "in_review").length}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 56, background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          {selectedProject && (
            <button onClick={() => setSelectedProject(null)} style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              ← Projects
            </button>
          )}
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.textPrimary }}>
            {selectedProject ? selectedProject.title : activeTab === "projects" ? "Projects" : activeTab === "review" ? "Review Queue" : activeTab === "team" ? "Team" : "Settings"}
          </h1>
          {selectedProject && <Badge status={selectedProject.status} small />}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            {selectedProject && (
              <button onClick={() => setShowUpload(true)} style={{ background: COLORS.orange, border: "none", color: "#fff", borderRadius: 7, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                + Upload
              </button>
            )}
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2A2A3A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>👤</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

          {/* PROJECTS LIST */}
          {activeTab === "projects" && !selectedProject && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {projects.map(p => (
                  <div key={p.id} onClick={() => { setSelectedProject(p); setActiveTab("projects"); }}
                    style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18, cursor: "pointer", transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderHover}
                    onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontSize: 28 }}>{p.thumb}</div>
                      <Badge status={p.status} small />
                    </div>
                    <h3 style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600, color: COLORS.textPrimary }}>{p.title}</h3>
                    <p style={{ margin: "0 0 12px", fontSize: 12, color: COLORS.textMuted }}>{p.client}</p>
                    <div style={{ background: "#1E1E28", borderRadius: 4, height: 4, marginBottom: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.progress}%`, background: p.progress === 100 ? COLORS.green : p.progress > 60 ? COLORS.orange : COLORS.cyan, borderRadius: 4, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textMuted }}>
                      <span>{p.progress}% complete</span>
                      <span>Due {p.due}</span>
                    </div>
                  </div>
                ))}
                {/* Add project card */}
                <div style={{ background: "transparent", border: `1.5px dashed ${COLORS.border}`, borderRadius: 10, padding: 18, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 160, color: COLORS.textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.orange; e.currentTarget.style.color = COLORS.orange; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted; }}>
                  <span style={{ fontSize: 28, marginBottom: 8 }}>+</span>
                  <span style={{ fontSize: 13 }}>New Project</span>
                </div>
              </div>
            </div>
          )}

          {/* PROJECT ASSETS */}
          {activeTab === "projects" && selectedProject && (
            <div>
              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Total Assets", val: currentAssets.length, color: COLORS.textPrimary },
                  { label: "In Review", val: currentAssets.filter(a => a.status === "in_review").length, color: COLORS.yellow },
                  { label: "Approved", val: currentAssets.filter(a => a.status === "approved").length, color: COLORS.green },
                  { label: "Open Comments", val: currentAssets.reduce((n, a) => n + (a.comments?.filter(c => !c.resolved).length || 0), 0), color: COLORS.orange },
                ].map(s => (
                  <div key={s.label} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "12px 16px" }}>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Asset list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {currentAssets.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.textMuted }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                    <p>No assets yet. Upload your first file.</p>
                  </div>
                )}
                {currentAssets.map(asset => {
                  const openComments = asset.comments?.filter(c => !c.resolved).length || 0;
                  return (
                    <div key={asset.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                      {/* Icon */}
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: asset.type === "video" ? COLORS.orange + "20" : COLORS.cyan + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {asset.type === "video" ? "🎬" : "🖼"}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.name}</span>
                          <span style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: "monospace", flexShrink: 0 }}>{asset.version}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={asset.uploader} size={18} />
                          <span style={{ fontSize: 11, color: COLORS.textMuted }}>{asset.uploader}</span>
                          {asset.duration && <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>{Math.floor(asset.duration / 60)}:{String(asset.duration % 60).padStart(2, "0")}</span>}
                          {openComments > 0 && <span style={{ fontSize: 10, background: COLORS.orange + "25", color: COLORS.orange, borderRadius: 10, padding: "2px 7px" }}>{openComments} comment{openComments !== 1 ? "s" : ""}</span>}
                        </div>
                      </div>
                      {/* Status & actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <Badge status={asset.status} small />
                        <button onClick={() => asset.type === "video" ? setPlayingAsset(asset) : setViewingBoard(asset)}
                          style={{ background: "#1E1E28", border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          {asset.type === "video" ? "▶ Play" : "👁 View"}
                        </button>
                        {asset.status !== "approved" && (
                          <button onClick={() => updateAssetStatus(asset.id, "approved")}
                            style={{ background: COLORS.green + "15", border: `1px solid ${COLORS.green}40`, color: COLORS.green, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>✓</button>
                        )}
                        {asset.status !== "changes" && (
                          <button onClick={() => updateAssetStatus(asset.id, "changes")}
                            style={{ background: COLORS.red + "15", border: `1px solid ${COLORS.red}40`, color: COLORS.red, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>✗</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REVIEW QUEUE */}
          {activeTab === "review" && (
            <div>
              <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 20 }}>All assets currently awaiting your review across projects.</p>
              {Object.entries(assets).flatMap(([projId, assetList]) =>
                assetList.filter(a => a.status === "in_review").map(a => {
                  const proj = projects.find(p => p.id === Number(projId));
                  return (
                    <div key={a.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: a.type === "video" ? COLORS.orange + "20" : COLORS.cyan + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {a.type === "video" ? "🎬" : "🖼"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, fontFamily: "monospace" }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted }}>{proj?.title} · {proj?.client}</div>
                      </div>
                      <button onClick={() => { setSelectedProject(proj); setActiveTab("projects"); setTimeout(() => a.type === "video" ? setPlayingAsset(a) : setViewingBoard(a), 100); }}
                        style={{ background: COLORS.orange, border: "none", color: "#fff", borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Review</button>
                    </div>
                  );
                })
              )}
              {Object.values(assets).flat().filter(a => a.status === "in_review").length === 0 && (
                <div style={{ textAlign: "center", padding: 60, color: COLORS.textMuted }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <p>Review queue is clear.</p>
                </div>
              )}
            </div>
          )}

          {/* TEAM */}
          {activeTab === "team" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {["Jake M.", "Sarah D.", "Tom R.", "Lisa K.", "Ana P.", "Sam K.", "Mike J.", "Director Chen"].map(name => (
                <div key={name} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18, textAlign: "center" }}>
                  <Avatar name={name} size={48} />
                  <div style={{ marginTop: 10, fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>{name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>VFX Artist</div>
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, display: "inline-block" }} />
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>Online</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div style={{ maxWidth: 520 }}>
              {[["Company Name", "FrameX Studios"], ["Default Review Deadline", "7 days"], ["Notification Email", "team@framex.io"], ["Storage Limit", "10 TB"]].map(([label, val]) => (
                <div key={label} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{label}</span>
                  <span style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {playingAsset && <VideoPlayer asset={playingAsset} onClose={() => setPlayingAsset(null)} />}
      {viewingBoard && <BoardViewer asset={viewingBoard} onClose={() => setViewingBoard(null)} />}
      {showUpload && <UploadModal projectId={selectedProject?.id} onUpload={handleUpload} onClose={() => setShowUpload(false)} />}
    </div>
  );
}
