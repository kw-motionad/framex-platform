import { useState, useRef } from "react";

// ─── Motion Adrenaline Design Tokens ─────────────────────────────────────────
const C_DARK = {
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

const C_LIGHT = {
  bg:          "#F4F4FA",
  surface:     "#FFFFFF",
  card:        "#FFFFFF",
  cardHover:   "#EEEEF8",
  border:      "#E0E0EE",
  borderHover: "#C8C8E0",
  blue:        "#4060EE",
  blueLow:     "#4060EE18",
  blueMid:     "#4060EE35",
  green:       "#16A870",
  greenLow:    "#16A87015",
  yellow:      "#C08800",
  yellowLow:   "#C0880015",
  red:         "#E03030",
  redLow:      "#E0303015",
  orange:      "#D46000",
  orangeLow:   "#D4600015",
  purple:      "#7050CC",
  purpleLow:   "#7050CC15",
  teal:        "#009980",
  tealLow:     "#00998015",
  text:        "#1A1A2E",
  textSec:     "#5858A0",
  textMuted:   "#9898C0",
};

let C = { ...C_DARK };

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

// ─── Preview helpers ─────────────────────────────────────────────────────────

function detectPreviewType(name="",mimeType=""){
  const ext=name.split(".").pop().toLowerCase();
  if(mimeType.startsWith("video/")||["mp4","mov","webm","avi","mkv"].includes(ext))return "video";
  if(mimeType.startsWith("image/")||["jpg","jpeg","png","gif","webp","svg","bmp"].includes(ext))return "image";
  if(ext==="pdf"||mimeType==="application/pdf")return "pdf";
  return null;
}
function doDownload(entry){
  if(!entry?.previewUrl)return;
  const a=document.createElement("a");a.href=entry.previewUrl;a.download=entry.name;a.click();
}
function PreviewModal({entry,onClose,onAnnotate,authorName="You",onApprove,onRequestChanges,entryStatus}){
  const type=detectPreviewType(entry.name,entry.mimeType||"");
  const dlBtn=<button onClick={()=>doDownload(entry)} style={{background:C.card,border:`1px solid ${C.border}`,color:C.textSec,borderRadius:7,padding:"5px 11px",cursor:"pointer",fontSize:11,whiteSpace:"nowrap"}}>⬇ Download</button>;
  if(type==="pdf"&&onAnnotate){
    return (
      <div style={{position:"fixed",inset:0,background:"#000000E0",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,width:"100%",maxWidth:1140,maxHeight:"94vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{entry.name}</span>
            {entryStatus&&<Badge status={entryStatus} small/>}
            {onApprove&&<Btn variant="green" onClick={onApprove} style={{fontSize:10,padding:"4px 10px",whiteSpace:"nowrap"}}>✓ Approve</Btn>}
            {onRequestChanges&&<Btn variant="red" onClick={onRequestChanges} style={{fontSize:10,padding:"4px 10px",whiteSpace:"nowrap"}}>✗ Changes</Btn>}
            {entry.previewUrl&&dlBtn}
            <button onClick={onClose} style={{background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:20,flexShrink:0}}>✕</button>
          </div>
          <div style={{flex:1,overflow:"hidden",display:"flex",minHeight:0}}>
            <PdfAnnotator entry={entry} onAnnotate={onAnnotate} authorName={authorName}/>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{position:"fixed",inset:0,background:"#000000E0",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,width:"100%",maxWidth:900,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{entry.name}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:20,flexShrink:0,marginLeft:12}}>✕</button>
        </div>
        <div style={{overflowY:"auto",padding:20,flex:1}}>
          {type==="video"&&<div>
            <video src={entry.previewUrl} controls autoPlay style={{width:"100%",maxHeight:500,background:"#000",borderRadius:8,display:"block",marginBottom:12}}/>
            {entry.previewUrl&&<div style={{textAlign:"center"}}>{dlBtn}</div>}
          </div>}
          {type==="image"&&<div style={{textAlign:"center",background:"#06060A",borderRadius:8,padding:12}}>
            <img src={entry.previewUrl} alt={entry.name} style={{maxWidth:"100%",maxHeight:520,objectFit:"contain",borderRadius:6,display:"block",marginBottom:12}}/>
            {entry.previewUrl&&dlBtn}
          </div>}
          {type==="pdf"&&<iframe src={entry.previewUrl} title={entry.name} style={{width:"100%",height:600,border:"none",borderRadius:6}}/>}
          {!type&&<div style={{textAlign:"center",padding:"40px 0",color:C.textMuted}}><div style={{fontSize:40,marginBottom:12}}>📄</div><p>No preview available for this file type.</p></div>}
        </div>
      </div>
    </div>
  );
}

function PdfAnnotator({entry, onAnnotate, authorName="You"}){
  const [page,setPage]=useState(1);
  const [mode,setMode]=useState("view");
  const [pending,setPending]=useState(null);
  const [noteText,setNoteText]=useState("");
  const [activePin,setActivePin]=useState(null);
  const [reply,setReply]=useState("");
  const overlayRef=useRef(null);

  const annotations=entry.annotations||[];
  const pageAnnotations=annotations.filter(a=>a.page===page);
  const accent=C.blue;

  const handleCapture=(e)=>{
    if(mode!=="pin")return;
    const rect=overlayRef.current.getBoundingClientRect();
    setPending({x:((e.clientX-rect.left)/rect.width)*100,y:((e.clientY-rect.top)/rect.height)*100});
    setNoteText("");
  };
  const savePin=()=>{
    if(!pending||!noteText.trim())return;
    onAnnotate({type:"add",ann:{id:`ann${Date.now()}`,page,x:pending.x,y:pending.y,author:authorName,text:noteText,replies:[],resolved:false}});
    setPending(null);setNoteText("");setMode("view");
  };
  const saveReply=(pinId)=>{
    if(!reply.trim())return;
    onAnnotate({type:"reply",pinId,reply:{id:`r${Date.now()}`,author:authorName,text:reply,date:new Date().toISOString().slice(0,10)}});
    setReply("");
  };
  const resolve=(pinId)=>onAnnotate({type:"resolve",pinId});
  const iStyle={background:"#0A0A16",border:`1px solid ${C.border}`,borderRadius:5,padding:"6px 9px",color:C.text,fontSize:11,outline:"none"};

  const Pin=({num,x,y,resolved,active,onClick})=>(
    <div onClick={onClick} title={`Pin ${num}`}
      style={{position:"absolute",left:`${x}%`,top:`${y}%`,transform:"translate(-50%,-100%)",display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",pointerEvents:"all",zIndex:12,filter:resolved?"grayscale(1) opacity(0.35)":"none"}}>
      <div style={{width:24,height:24,borderRadius:"50%",background:active?"#fff":accent,border:active?`2.5px solid ${accent}`:"2.5px solid rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:active?accent:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,0.7)"}}>{num}</div>
      <div style={{width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:`6px solid ${active?"#fff":accent}`}}/>
    </div>
  );

  return (
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderBottom:`1px solid ${C.border}`,flexShrink:0,background:C.surface,flexWrap:"wrap"}}>
          <button onClick={()=>{setPage(p=>Math.max(1,p-1));setPending(null);}} disabled={page<=1}
            style={{background:C.card,border:`1px solid ${C.border}`,color:page<=1?C.textMuted:C.text,borderRadius:5,padding:"4px 10px",cursor:page<=1?"default":"pointer",fontSize:12}}>◀</button>
          <span style={{fontSize:12,color:C.textSec,minWidth:54,textAlign:"center"}}>Page {page}</span>
          <button onClick={()=>{setPage(p=>p+1);setPending(null);}}
            style={{background:C.card,border:`1px solid ${C.border}`,color:C.text,borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:12}}>▶</button>
          <span style={{flex:1}}/>
          {mode==="pin"&&<span style={{fontSize:10,color:accent,fontWeight:600}}>Click to place pin #{annotations.length+1}</span>}
          <button onClick={()=>{setMode(m=>m==="pin"?"view":"pin");setPending(null);}}
            style={{background:mode==="pin"?accent+"22":C.card,border:`1px solid ${mode==="pin"?accent+"40":C.border}`,color:mode==="pin"?accent:C.textSec,borderRadius:7,padding:"5px 13px",cursor:"pointer",fontSize:11,fontWeight:600}}>
            {mode==="pin"?"👁 Done":"📌 Add Pin"}
          </button>
        </div>

        <div ref={overlayRef} style={{flex:1,position:"relative",overflow:"hidden",background:"#06060A",minHeight:0}}>
          <iframe src={`${entry.previewUrl}#page=${page}`} style={{width:"100%",height:"100%",border:"none",display:"block"}}/>
          <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
            {pageAnnotations.map(a=>{
              const num=annotations.findIndex(x=>x.id===a.id)+1;
              return <Pin key={a.id} num={num} x={a.x} y={a.y} resolved={a.resolved} active={activePin?.id===a.id}
                onClick={e=>{if(mode!=="pin"){e.stopPropagation();setActivePin(activePin?.id===a.id?null:a);}}}/>;
            })}
            {pending&&<div style={{position:"absolute",left:`${pending.x}%`,top:`${pending.y}%`,transform:"translate(-50%,-100%)",display:"flex",flexDirection:"column",alignItems:"center",pointerEvents:"none",zIndex:13,opacity:0.8}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:accent,border:"2.5px solid rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.7)"}}>{annotations.length+1}</div>
              <div style={{width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:`6px solid ${accent}`}}/>
            </div>}
          </div>
          {mode==="pin"&&<div onClick={handleCapture} style={{position:"absolute",inset:0,zIndex:11,cursor:"crosshair",background:`${accent}05`,border:`2px dashed ${accent}30`}}/>}
        </div>

        {pending&&(
          <div style={{padding:"10px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,background:C.surface,flexShrink:0,alignItems:"center"}}>
            <span style={{width:22,height:22,borderRadius:"50%",background:accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",flexShrink:0}}>{annotations.length+1}</span>
            <input autoFocus value={noteText} onChange={e=>setNoteText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&savePin()} placeholder="Type a note for this pin…" style={{flex:1,...iStyle}}/>
            <button onClick={savePin} disabled={!noteText.trim()} style={{background:accent,border:"none",color:"#fff",borderRadius:7,padding:"6px 13px",cursor:noteText.trim()?"pointer":"default",fontSize:12,fontWeight:600,opacity:noteText.trim()?1:0.5}}>Pin it</button>
            <button onClick={()=>setPending(null)} style={{background:"none",border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:7,padding:"6px 10px",cursor:"pointer",fontSize:12}}>✕</button>
          </div>
        )}
      </div>

      <div style={{width:278,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <span style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Pins </span>
          <span style={{fontSize:11,fontWeight:700,color:accent}}>{annotations.length}</span>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {annotations.length===0&&(
            <div style={{padding:"40px 16px",textAlign:"center",color:C.textMuted,fontSize:12,lineHeight:1.7}}>
              No pins yet.<br/>Click "Add Pin" then click<br/>anywhere on the PDF.
            </div>
          )}
          {annotations.map((a,idx)=>{
            const isActive=activePin?.id===a.id;
            return (
              <div key={a.id} onClick={()=>setActivePin(isActive?null:a)}
                style={{borderBottom:`1px solid ${C.border}22`,padding:"12px 14px",borderLeft:`3px solid ${a.resolved?"#3A3A55":accent}`,background:isActive?accent+"10":"transparent",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <span style={{width:20,height:20,borderRadius:"50%",background:a.resolved?"#3A3A55":accent,color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0}}>{idx+1}</span>
                  <span style={{fontSize:11,fontWeight:600,color:C.text}}>{a.author}</span>
                  <span style={{marginLeft:"auto",fontSize:10,color:C.textMuted,background:"#111120",padding:"1px 6px",borderRadius:3,whiteSpace:"nowrap"}}>p.{a.page}</span>
                </div>
                <p style={{margin:"0 0 4px",fontSize:12,color:C.textSec,lineHeight:1.4}}>{a.text}</p>
                {(a.replies||[]).map(r=>(
                  <div key={r.id} style={{paddingLeft:8,borderLeft:`2px solid ${C.border}`,marginTop:4}}>
                    <span style={{fontSize:10,fontWeight:600,color:C.textSec}}>{r.author}: </span>
                    <span style={{fontSize:10,color:C.textSec}}>{r.text}</span>
                  </div>
                ))}
                {isActive&&(
                  <div onClick={e=>e.stopPropagation()} style={{marginTop:8}}>
                    <div style={{display:"flex",gap:5,marginBottom:6}}>
                      <input value={reply} onChange={e=>setReply(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveReply(a.id)} onClick={e=>e.stopPropagation()} placeholder="Reply…" style={{flex:1,...iStyle}}/>
                      <button onClick={()=>saveReply(a.id)} disabled={!reply.trim()} style={{background:accent,border:"none",color:"#fff",borderRadius:5,padding:"5px 10px",cursor:reply.trim()?"pointer":"default",fontSize:11,opacity:reply.trim()?1:0.5}}>→</button>
                    </div>
                    {!a.resolved&&<button onClick={()=>resolve(a.id)} style={{background:C.greenLow,border:`1px solid ${C.green}28`,color:C.green,borderRadius:5,padding:"3px 10px",cursor:"pointer",fontSize:10,fontWeight:600}}>✓ Resolve</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
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

function TopNav({ user, logoUrl, logoRef, onLogoChange, onSignOut, active, onNav, portalSettings }) {
  const ps = portalSettings || {};
  const displayLogo = ps.logoUrl || logoUrl;
  const accent = ps.accentColor || C.blue;

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
        {displayLogo
          ? <img src={displayLogo} alt="Logo" style={{ height: 30, objectFit: "contain" }} />
          : <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{
                width: 34, height: 34, background: accent, borderRadius: 9,
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
              background: on ? accent + "18" : "none",
              border: `1px solid ${on ? accent + "35" : "transparent"}`,
              borderRadius: 7, color: on ? accent : C.textSec,
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
function Hero({ user, projects, portalSettings }) {
  const ps = portalSettings || {};
  const accent = ps.accentColor || C.blue;
  const theme = ps.theme || "dark";
  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const pendingReviews = mine.reduce((n, p) => n + p.posts.filter(a => a.shared && a.status === "in_review").length, 0);
  const openMsgs      = mine.reduce((n, p) => n + p.clientComments.filter(c => !c.resolved).length, 0);
  const sharedFiles   = mine.reduce((n, p) => n + Object.values(p.documents).flat().filter(d => d.shared).length, 0);

  const eyebrow = ps.portalHeadline || "MOTION ADRENALINE · CLIENT PORTAL";
  const firstName = user.name.split(" ")[0];
  const subtext = ps.welcomeMessage || ps.subheadline || `${user.company} · ${mine.length} active project${mine.length !== 1 ? "s" : ""}`;

  const hasBgVideo = !!ps.bgVideoUrl;
  const hasBgImage = !!ps.bgImageUrl && !hasBgVideo;
  const hasBgMedia = hasBgVideo || hasBgImage;
  const heroBg = hasBgVideo ? "#000000" : hasBgImage
    ? `url(${ps.bgImageUrl}) center/cover no-repeat`
    : theme === "light"
    ? "linear-gradient(135deg,#EEF0FF 0%,#E8E8F8 100%)"
    : "linear-gradient(135deg,#060610 0%,#08081A 55%,#0A0A20 100%)";

  const statBg    = hasBgMedia ? "#08081580" : theme === "light" ? "rgba(255,255,255,0.8)" : "#08081580";
  const headColor = hasBgMedia || theme === "dark" ? "#F0F0FA" : C.text;
  const subColor  = hasBgMedia ? "#7878A0" : C.textSec;

  return (
    <div style={{
      position: "relative", padding: "36px 28px 32px",
      background: heroBg,
      borderBottom: `1px solid ${C.border}`, flexShrink: 0, overflow: "hidden",
    }}>
      {hasBgVideo && (
        <video key={ps.bgVideoUrl} src={ps.bgVideoUrl} autoPlay muted loop playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
      )}
      {hasBgMedia && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.58)", zIndex: 1 }} />}
      {!hasBgMedia && theme === "dark" && (
        <div style={{ position: "absolute", right: -60, top: -60, pointerEvents: "none", zIndex: 1 }}>
          <Sunburst size={460} opacity={0.055} />
        </div>
      )}
      <div style={{
        position: "absolute", right: 120, top: 30, width: 280, height: 280,
        background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 1,
      }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {ps.logoUrl && <img src={ps.logoUrl} alt="Logo" style={{ height: 30, objectFit: "contain", marginBottom: 12, display: "block" }} />}
        <div style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
          {eyebrow}
        </div>
        <h1 style={{ margin: "0 0 5px", fontSize: 28, fontWeight: 800, color: headColor, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ margin: "0 0 26px", fontSize: 13, color: subColor }}>
          {subtext}
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "Active Projects",  val: mine.length,      color: accent,   sym: "◈" },
            { label: "Pending Reviews",  val: pendingReviews,   color: C.yellow, sym: "▶" },
            { label: "Open Messages",    val: openMsgs,         color: C.orange, sym: "◉" },
            { label: "Shared Files",     val: sharedFiles,      color: C.green,  sym: "▣" },
          ].map(s => (
            <div key={s.label} style={{
              background: statBg, border: `1px solid ${C.border}`,
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

// ─── Portal Card Components ───────────────────────────────────────────────────
function PortalStripCard({ project, onClick }) {
  const bg = project.portalSettings?.bgImageUrl;
  const meta = LIFECYCLE_META[project.status] || LIFECYCLE_META.post;
  const toReview = project.posts.filter(a => a.shared && a.status === "in_review").length;
  return (
    <div onClick={onClick}
      style={{ position: "relative", height: 190, borderRadius: 14, overflow: "hidden", cursor: "pointer", border: `1px solid ${C.border}`, marginBottom: 12, flexShrink: 0, transition: "transform 0.18s,box-shadow 0.18s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 48px rgba(0,0,0,0.55)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
      {bg
        ? <img src={bg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#0A0A18 0%,#1A1A2E 50%,#0E1826 100%)" }} />
      }
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.05) 40%,rgba(0,0,0,0.88) 100%)" }} />
      <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ background: meta.color + "25", border: `1px solid ${meta.color}60`, color: meta.color, borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 700, backdropFilter: "blur(10px)" }}>
          {meta.icon} {meta.label}
        </span>
        {toReview > 0 && <span style={{ background: "rgba(255,200,0,0.25)", border: "1px solid rgba(255,200,0,0.5)", color: "#FFD700", borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 700, backdropFilter: "blur(8px)" }}>
          {toReview} to review
        </span>}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.9)", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
          {project.title}
        </h3>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>Delivery: {project.deliveryDate || "—"}</div>
      </div>
    </div>
  );
}

function PortalGridCard({ project, onClick }) {
  const bg = project.portalSettings?.bgImageUrl;
  const meta = LIFECYCLE_META[project.status] || LIFECYCLE_META.post;
  const [hov, setHov] = useState(false);
  const toReview = project.posts.filter(a => a.shared && a.status === "in_review").length;
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer", border: `1px solid ${hov ? meta.color + "55" : C.border}`, transition: "transform 0.18s,border-color 0.18s,box-shadow 0.18s", transform: hov ? "translateY(-5px)" : "none", boxShadow: hov ? "0 18px 56px rgba(0,0,0,0.55)" : "none", aspectRatio: "1" }}>
      {bg
        ? <img src={bg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#0A0A18 0%,#1A1A2E 50%,#0E1826 100%)" }} />
      }
      <div style={{ position: "absolute", inset: 0, background: hov ? "linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.18) 30%,rgba(0,0,0,0.88) 100%)" : "linear-gradient(to bottom,rgba(0,0,0,0.4) 0%,rgba(0,0,0,0.08) 40%,rgba(0,0,0,0.78) 100%)" }} />
      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <span style={{ background: meta.color + "25", border: `1px solid ${meta.color}60`, color: meta.color, borderRadius: 5, padding: "2px 8px", fontSize: 9, fontWeight: 700, backdropFilter: "blur(10px)" }}>
          {meta.icon} {meta.label}
        </span>
      </div>
      {toReview > 0 && <div style={{ position: "absolute", top: 10, right: 10 }}>
        <span style={{ background: "rgba(255,200,0,0.25)", border: "1px solid rgba(255,200,0,0.5)", color: "#FFD700", borderRadius: 5, padding: "2px 7px", fontSize: 9, fontWeight: 700, backdropFilter: "blur(8px)" }}>{toReview}</span>
      </div>}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.9)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{project.title}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>Delivery: {project.deliveryDate || "—"}</div>
      </div>
      {hov && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "8px 20px", color: "#fff", fontSize: 12, fontWeight: 600 }}>Open Project →</div>
      </div>}
    </div>
  );
}

// ─── Projects View ────────────────────────────────────────────────────────────
function ProjectsView({ user, projects, onSelect }) {
  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("framex_portal_view") || "grid");
  const switchView = m => { setViewMode(m); localStorage.setItem("framex_portal_view", m); };
  if (mine.length === 0) return <Empty icon="◈" msg="No projects shared with you yet." sub="Contact your Motion Adrenaline representative to get started." />;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 1, background: C.card, borderRadius: 7, padding: 2 }}>
          {[{ m: "strip", icon: "☰", title: "List view" }, { m: "grid", icon: "⊞", title: "Grid view" }].map(v => (
            <button key={v.m} title={v.title} onClick={() => switchView(v.m)} style={{ background: viewMode === v.m ? C.surface : "none", border: "none", borderRadius: 5, color: viewMode === v.m ? C.text : C.textMuted, cursor: "pointer", padding: "4px 10px", fontSize: 15, lineHeight: 1 }}>{v.icon}</button>
          ))}
        </div>
      </div>
      {viewMode === "strip"
        ? <div>{mine.map(p => <PortalStripCard key={p.id} project={p} onClick={() => onSelect(p.id, "overview")} />)}</div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {mine.map(p => <PortalGridCard key={p.id} project={p} onClick={() => onSelect(p.id, "overview")} />)}
          </div>
      }
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
            {playing.previewUrl && playing.mimeType?.startsWith("video/")
              ? <video src={playing.previewUrl} controls style={{ maxWidth: "100%", maxHeight: 340, borderRadius: 8, background: "#000", display: "block" }} />
              : playing.previewUrl && playing.mimeType?.startsWith("image/")
              ? <img src={playing.previewUrl} alt={playing.name} style={{ maxWidth: "100%", maxHeight: 340, objectFit: "contain", borderRadius: 8 }} />
              : <>
                  <div onClick={togglePlay} style={{ width: 72, height: 72, borderRadius: "50%", background: C.blueLow, border: `2px solid ${C.blue}40`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 28, color: C.blue }}>
                    {running ? "⏸" : "▶"}
                  </div>
                  <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>{fmtTime(t)} / {fmtTime(dur)}</span>
                  <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Simulated playback — add timecode notes below</p>
                </>
            }
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
  const [previewEntry, setPreviewEntry] = useState(null);
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
                    {detectPreviewType(item.name, item.mimeType||"")==="image" && item.previewUrl
                      ? <img src={item.previewUrl} style={{width:38,height:38,objectFit:"cover",borderRadius:8,flexShrink:0}} alt=""/>
                      : <div style={{ width: 38, height: 38, borderRadius: 8, background: meta.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{meta.icon}</div>}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{item.projectTitle}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Badge status={item.status} small />
                    <Btn variant="ghost" onClick={() => item.previewUrl && setPreviewEntry(item)} style={{ fontSize: 10, padding: "3px 8px", opacity: item.previewUrl ? 1 : 0.45 }}>{item.previewUrl ? "👁 View" : "View"}</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {previewEntry && <PreviewModal entry={previewEntry} onClose={() => setPreviewEntry(null)} />}
    </div>
  );
}

// ─── Documents View ───────────────────────────────────────────────────────────
function DocumentsView({ user, projects, onUpdate }) {
  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const [esig, setEsig] = useState(null);
  const [sigName, setSigName] = useState("");
  const [previewEntry, setPreviewEntry] = useState(null);

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

  const updateDocStatus = (cat, docId, status) => {
    const proj = mine.find(p => p.documents[cat]?.some(d => d.id === docId));
    if (!proj) return;
    onUpdate({...proj, documents: {...proj.documents, [cat]: proj.documents[cat].map(d => d.id === docId ? {...d, status} : d)}});
  };

  const handleAnnotate = (action) => {
    const proj = mine.find(p => p.id === previewEntry?.projectId);
    if (!proj) return;
    const cat = previewEntry.catKey;
    let anns;
    if (action.type === "add") anns = [...(previewEntry.annotations||[]), action.ann];
    else if (action.type === "reply") anns = (previewEntry.annotations||[]).map(a => a.id === action.pinId ? {...a, replies:[...(a.replies||[]),action.reply]} : a);
    else if (action.type === "resolve") anns = (previewEntry.annotations||[]).map(a => a.id === action.pinId ? {...a, resolved:true} : a);
    else return;
    setPreviewEntry(prev => ({...prev, annotations: anns}));
    onUpdate({...proj, documents: {...proj.documents, [cat]: proj.documents[cat].map(d => d.id === previewEntry.id ? {...d, annotations: anns} : d)}});
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
                {detectPreviewType(doc.name, doc.mimeType||"")==="image" && doc.previewUrl
                  ? <img src={doc.previewUrl} style={{width:36,height:36,objectFit:"cover",borderRadius:7,flexShrink:0}} alt=""/>
                  : <div style={{ width: 36, height: 36, borderRadius: 7, background: meta.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{meta.icon}</div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{doc.projectTitle} · {doc.date} · {doc.uploader}</div>
                </div>
                <Badge status={doc.status} small />
                {key === "contracts" && doc.status !== "signed" && (
                  <Btn variant="blue" onClick={() => setEsig(doc)} style={{ fontSize: 10, padding: "4px 10px" }}>✍ Sign</Btn>
                )}
                <Btn variant="ghost" onClick={() => doc.previewUrl && setPreviewEntry(doc)} style={{ fontSize: 10, padding: "4px 8px", opacity: doc.previewUrl ? 1 : 0.4 }}>{doc.previewUrl ? "👁" : "⬇"}</Btn>
              </div>
            ))}
          </div>
        );
      })}

      {previewEntry && <PreviewModal entry={previewEntry} onClose={() => setPreviewEntry(null)}
        onAnnotate={detectPreviewType(previewEntry.name,previewEntry.mimeType||"")==="pdf"?handleAnnotate:undefined}
        authorName={user.name}
        entryStatus={previewEntry.status}
        onApprove={previewEntry.status!=="approved"?()=>{updateDocStatus(previewEntry.catKey,previewEntry.id,"approved");setPreviewEntry(p=>({...p,status:"approved"}));}:undefined}
        onRequestChanges={previewEntry.status!=="changes"?()=>{updateDocStatus(previewEntry.catKey,previewEntry.id,"changes");setPreviewEntry(p=>({...p,status:"changes"}));}:undefined}
      />}
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
    { id: "overview",     label: "Overview",     sym: "⌂" },
    { id: "updates",      label: "Updates",      sym: "◎" },
    { id: "deliverables", label: "Deliverables", sym: "▶" },
    { id: "creative",     label: "Creative",     sym: "✦" },
    { id: "documents",    label: "Documents",    sym: "▣" },
    { id: "messages",     label: "Messages",     sym: "◉" },
  ];

  const heroMeta   = LIFECYCLE_META[project.status] || LIFECYCLE_META.post;
  const sharedDocs   = Object.values(project.documents).flat().filter(d => d.shared);
  const sharedAssets = project.posts.filter(p => p.shared);
  const openMsgs     = project.clientComments.filter(c => !c.resolved).length;
  const bg = project.portalSettings?.bgImageUrl;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* ─── Hero Banner ──────────────────────────────────────────────── */}
      <div style={{ position: "relative", height: 220, flexShrink: 0, overflow: "hidden" }}>
        {bg
          ? <img src={bg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#060610 0%,#131328 50%,#0A0A1E 100%)" }} />
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0.92) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0) 60%)" }} />
        {/* Back + stats */}
        <div style={{ position: "absolute", top: 14, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onBack} style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", cursor: "pointer", fontSize: 12, padding: "5px 14px", borderRadius: 6, fontWeight: 500 }}>← Back</button>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: `${sharedDocs.length} docs`,    color: C.blue },
              { label: `${sharedAssets.length} assets`, color: C.yellow },
              ...(openMsgs > 0 ? [{ label: `${openMsgs} msgs`, color: C.orange }] : []),
            ].map(s => (
              <span key={s.label} style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", border: `1px solid ${s.color}40`, borderRadius: 5, padding: "3px 9px", fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</span>
            ))}
          </div>
        </div>
        {/* Title at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.9)", lineHeight: 1.15, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {project.title}
              </h2>
              <div style={{ display: "flex", gap: 14, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                <span>{project.client}</span>
                <span>Delivery: {project.deliveryDate}</span>
              </div>
            </div>
            <LifecyclePill stage={project.status} />
          </div>
        </div>
      </div>
      {/* ─── Tab bar ──────────────────────────────────────────────────── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", flexShrink: 0, display: "flex", gap: 0, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            borderBottom: `2px solid ${tab === t.id ? C.blue : "transparent"}`,
            color: tab === t.id ? C.blue : C.textSec,
            padding: "10px 14px", cursor: "pointer", fontSize: 12,
            fontWeight: tab === t.id ? 600 : 400, whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 5,
          }}>{t.sym} {t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                {[
                  { label: "Stage",    val: `${heroMeta.icon} ${heroMeta.label}`, color: heroMeta.color },
                  { label: "Delivery", val: project.deliveryDate,                  color: C.text },
                ].map(s => (
                  <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Ready for Review</div>
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
            {/* Quick Actions sidebar */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Quick Actions</div>
              {[
                { label: "Send Message",      icon: "✉", color: C.blue,   t: "messages" },
                { label: "View Deliverables", icon: "▶", color: C.yellow, t: "deliverables" },
                { label: "View Documents",    icon: "▣", color: C.orange, t: "documents" },
                { label: "Creative Review",   icon: "✦", color: C.green,  t: "creative" },
              ].map(a => (
                <button key={a.label} onClick={() => setTab(a.t)}
                  style={{ display: "flex", alignItems: "center", gap: 10, background: a.color + "12", border: `1px solid ${a.color}30`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", color: a.color, fontSize: 12, fontWeight: 600, textAlign: "left", width: "100%" }}
                  onMouseEnter={e => { e.currentTarget.style.background = a.color + "20"; e.currentTarget.style.borderColor = a.color + "55"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = a.color + "12"; e.currentTarget.style.borderColor = a.color + "30"; }}>
                  <span style={{ fontSize: 14 }}>{a.icon}</span>{a.label}
                </button>
              ))}
              <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Summary</div>
                {[
                  { label: "Shared Files", val: sharedDocs.length,    icon: "📁" },
                  { label: "Assets",       val: sharedAssets.length,  icon: "🎬" },
                  { label: "Open Msgs",    val: openMsgs,             icon: "💬" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
                    <span style={{ fontSize: 12, color: C.textSec }}>{s.icon} {s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === "updates" && (
          <div>
            {(() => {
              const events = [
                ...sharedAssets.map(a => ({ icon: "🎬", color: C.yellow, name: a.name, sub: `Asset · ${a.version || "v01"}`, status: a.status })),
                ...sharedDocs.map(d => ({ icon: "📄", color: C.blue, name: d.name, sub: `Document · ${d.date || ""}`, status: d.status })),
                ...(project.clientComments || []).map(c => ({ icon: "💬", color: c.resolved ? C.green : C.orange, name: (c.text || "Comment").slice(0, 60), sub: `${c.author || "Client"} · ${c.resolved ? "Resolved" : "Open"}`, status: c.resolved ? "resolved" : "open" })),
              ];
              if (!events.length) return (
                <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>◎</div>
                  <div style={{ fontSize: 14, color: C.textSec, fontWeight: 600, marginBottom: 6 }}>No activity yet</div>
                  <div style={{ fontSize: 12 }}>Files shared, approvals and messages will appear here.</div>
                </div>
              );
              return events.map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}25` }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: ev.color + "20", border: `1px solid ${ev.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15 }}>{ev.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{ev.sub}</div>
                  </div>
                  <Badge status={ev.status} small />
                </div>
              ));
            })()}
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
export default function ClientPortal({ user, projects, onUpdateProject, onSignOut, logoUrl, onLogoChange, clientBranding = {} }) {
  const [nav, setNav] = useState("home");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const logoRef = useRef(null);

  const mine = projects.filter(p => p.clientId === user.id || p.client === user.company);
  const selected = mine.find(p => p.id === selectedId);
  const projectSettings = (selected || mine[0])?.portalSettings || {};
  const userBranding = user.branding || clientBranding;
  // Client-level branding is the base; project-specific settings override
  const portalSettings = { ...userBranding, ...projectSettings };
  C = portalSettings.theme === "light" ? { ...C_LIGHT } : { ...C_DARK };

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
        portalSettings={portalSettings}
      />

      {selected
        ? <PortalProjectDetail
            project={selected} user={user}
            onUpdate={onUpdateProject}
            onBack={() => setSelectedId(null)}
            initTab={selectedTab}
          />
        : <>
            <Hero user={user} projects={projects} portalSettings={portalSettings} />
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
