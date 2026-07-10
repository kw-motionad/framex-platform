import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import ClientPortal from './ClientPortal';
const FF_LOGO = "/ff_final_logo.png";
const FF_BG_VIDEO = "/ff_launch_background.mp4";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:"#000000",surface:"#0A0A0F",card:"#0D0A18",
  border:"rgba(139,47,255,0.2)",borderHover:"rgba(43,142,255,0.4)",
  orange:"#7B5FFF",orangeLow:"#7B5FFF18",
  cyan:"#2B8EFF",cyanLow:"#2B8EFF15",
  green:"#7B9EC8",greenLow:"#7B9EC815",
  yellow:"#A8C4E0",yellowLow:"#A8C4E015",
  red:"#FF453A",redLow:"#FF453A18",
  purple:"#8B2FFF",purpleLow:"#8B2FFF15",
  teal:"#5BB8F6",tealLow:"#5BB8F615",
  pink:"#A8C4E0",pinkLow:"#A8C4E015",
  blue:"#5B7FFF",blueLow:"#5B7FFF15",
  text:"#FFFFFF",textSec:"#AEAEB2",textMuted:"#636366",
  font:"'-apple-system,BlinkMacSystemFont,\"SF Pro Display\",\"SF Pro Text\",\"Helvetica Neue\",Arial,sans-serif'",
};

const STATUS_META = {
  approved:  {label:"Approved",      color:"#7B9EC8",  bg:"#7B9EC815"},
  in_review: {label:"In Review",     color:"#A8C4E0",  bg:"#A8C4E015"},
  pending:   {label:"Pending",       color:C.textSec,  bg:"#1E1E28"},
  changes:   {label:"Changes Req.",  color:C.red,      bg:C.redLow},
  locked:    {label:"Locked",        color:"#7B9EC8",  bg:"#7B9EC815"},
  draft:     {label:"Draft",         color:C.textMuted,bg:"#141419"},
  signed:    {label:"Signed",        color:"#5BB8F6",  bg:"#5BB8F615"},
  sent:      {label:"Sent",          color:"#A8C4E0",  bg:"#A8C4E015"},
  inquiry:   {label:"Inquiry",       color:"#7B9EC8",  bg:"#7B9EC815"},
  awarded:   {label:"Awarded",       color:"#5B7FFF",  bg:"#5B7FFF15"},
  wrap:      {label:"Wrap",          color:"#7B9EC8",  bg:"#7B9EC815"},
  archived:  {label:"Archived",      color:C.textMuted,bg:"#1A1A22"},
};

const LIFECYCLE = ["inquiry","awarded","pre","prod","vfx3d","post","wrap","archived"];
const LIFECYCLE_META = {
  inquiry: {label:"Inquiry",      color:"#7B9EC8",  icon:"📬"},
  awarded: {label:"Awarded",      color:"#5B7FFF",  icon:"🏆"},
  pre:     {label:"Pre-Pro",      color:"#7B9EC8",  icon:"🎭"},
  prod:    {label:"Production",   color:"#5BB8F6",  icon:"🎥"},
  vfx3d:   {label:"3D VFX",       color:"#A8C4E0",  icon:"🧊"},
  post:    {label:"Post",         color:"#5BB8F6",  icon:"✨"},
  wrap:    {label:"Wrap",         color:"#7B9EC8",  icon:"📦"},
  archived:{label:"Archived",     color:C.textMuted,icon:"🗃"},
};

const ROLES = {
  admin:       {label:"Admin",       color:"#5B7FFF", canSeeInternal:true,  canApprove:true,  isClient:false},
  producer:    {label:"Producer",    color:"#7B9EC8", canSeeInternal:true,  canApprove:true,  isClient:false},
  coordinator: {label:"Coordinator", color:"#5BB8F6", canSeeInternal:true,  canApprove:false, isClient:false},
  vfx_artist:  {label:"VFX Artist",  color:"#A8C4E0", canSeeInternal:true,  canApprove:false, isClient:false},
  accountant:  {label:"Accountant",  color:"#7B9EC8", canSeeInternal:true,  canApprove:false, isClient:false},
  client:      {label:"Client",      color:"#5BB8F6", canSeeInternal:false, canApprove:true,  isClient:true},
};

const DEMO_USERS = [
  {id:"u1",email:"admin@studio.com",     password:"admin123",   name:"Sarah D.",      role:"admin",       company:null},
  {id:"u2",email:"producer@studio.com",  password:"prod123",    name:"Ana P.",        role:"producer",    company:null},
  {id:"u3",email:"vfx@studio.com",       password:"vfx123",     name:"Tom R.",        role:"vfx_artist",  company:null},
  {id:"u4",email:"accounts@studio.com",  password:"acc123",     name:"Mike J.",       role:"accountant",  company:null},
  {id:"u5",email:"client@paramount.com", password:"client123",  name:"Jordan Lee",    role:"client",      company:"Paramount Pictures"},
];

const SEED_PROJECTS = [
  {id:1,title:"Titan VFX — Sequence A",client:"Paramount Pictures",clientId:"u5",status:"post",producer:"Ana P.",startDate:"2026-04-01",deliveryDate:"2026-06-20",budget:480000,
   documents:{contracts:[{id:"doc1",name:"Master_Service_Agreement.pdf",status:"signed",uploader:"Ana P.",date:"2026-04-01",shared:true,esig:true,mimeType:"application/pdf"}],budgets:[{id:"doc2",name:"TitanA_Budget_v3.xlsx",status:"approved",uploader:"Mike J.",date:"2026-04-15",shared:false,esig:false,mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}],estimates:[{id:"doc3",name:"VFX_Estimate_v2.pdf",status:"sent",uploader:"Ana P.",date:"2026-04-10",shared:true,esig:false,mimeType:"application/pdf"}],invoices:[{id:"doc4",name:"Invoice_001_50pct.pdf",status:"sent",uploader:"Mike J.",date:"2026-05-01",shared:true,esig:false,mimeType:"application/pdf"}],schedules:[{id:"doc5",name:"Production_Schedule.pdf",status:"approved",uploader:"Ana P.",date:"2026-04-12",shared:true,esig:false,mimeType:"application/pdf"}]},
   creative:{pitchDecks:[{id:"cr1",name:"TitanA_Pitch_v2.pdf",status:"approved",shared:true,uploader:"Sarah D.",comments:[]}],moodBoards:[{id:"cr2",name:"Visual_Refs.jpg",status:"approved",shared:true,uploader:"Jake M.",comments:[]}],locationScouts:[],storyboards:[{id:"cr3",name:"Storyboard_Seq_A.pdf",status:"in_review",shared:true,uploader:"Ana P.",comments:[]}]},
   crew:[{id:"cr1",name:"Director Chen",role:"Director",email:"chen@studio.com",phone:"+44 7700 900001",rate:"£2500/day",dietary:"None",payrollDocs:true,notes:""},{id:"cr2",name:"Marco Ricci",role:"DP",email:"marco@studio.com",phone:"+44 7700 900002",rate:"£1800/day",dietary:"Vegetarian",payrollDocs:true,notes:"Anamorphic specialist"}],
   talent:[{id:"t1",name:"Alex Storm",agent:"CAA London",agentEmail:"agent@caa.com",rate:"£5000/day",usage:"Worldwide 2yr",dietary:"Vegan",releaseForm:true,notes:"Stunt double required"}],
   producer_data:{vendors:[{id:"v1",name:"Pinewood Studios",type:"Stage",cost:"£18000",status:"confirmed"},{id:"v2",name:"Arri Rental UK",type:"Camera",cost:"£4200",status:"confirmed"}],permits:[{id:"p1",location:"London Bridge",date:"2026-06-18",status:"approved"}],rentals:[{id:"r1",item:"ARRI Alexa 35 Package",vendor:"Arri Rental",cost:"£3800/week",status:"confirmed"}],travel:[],productionNotes:"LED volume booked Stage 7.",postNotes:"VFX pipeline: Houdini → Nuke → DaVinci."},
   wrap:{finalInvoices:[],expenseReports:[],signedContracts:[],releases:[],deliverables:[],wrapNotes:""},
   clientComments:[{id:"cc1",author:"Jordan Lee",date:"2026-06-10",text:"Love the explosion effect at 0:47 — can we hold that frame a bit longer?",resolved:false}],
   internalNotes:"Client has final approval gate on grade. Delivery deadline firm.",
   posts:[{id:"pa1",type:"video",name:"TitanA_comp_v04.mp4",version:"v04",status:"in_review",uploader:"Tom R.",duration:124,editNotes:"Explosion edge needs scatter.",shared:true,comments:[{id:"c1",time:12,author:"Sarah D.",text:"More scatter on edge",color:"#FF5500",resolved:false}]}],
  },
  {id:2,title:"Dragon Awakening",client:"Disney",clientId:null,status:"pre",producer:"Ana P.",startDate:"2026-06-01",deliveryDate:"2026-08-15",budget:720000,
   documents:{contracts:[],budgets:[{id:"doc6",name:"Dragon_Budget_Draft.xlsx",status:"draft",uploader:"Mike J.",date:"2026-06-05",shared:false,esig:false,mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}],estimates:[{id:"doc7",name:"VFX_Estimate_v1.pdf",status:"draft",uploader:"Ana P.",date:"2026-06-04",shared:false,esig:false,mimeType:"application/pdf"}],invoices:[],schedules:[]},
   creative:{pitchDecks:[{id:"cr4",name:"Dragon_Pitch_Deck.pdf",status:"approved",shared:true,uploader:"Sarah D.",comments:[]}],moodBoards:[{id:"cr5",name:"Creature_Refs.jpg",status:"in_review",shared:false,uploader:"Jake M.",comments:[]}],locationScouts:[{id:"cr6",name:"Iceland_Recce_Notes.pdf",status:"pending",shared:false,uploader:"Ana P.",comments:[]}],storyboards:[]},
   crew:[],talent:[],
   producer_data:{vendors:[],permits:[],rentals:[],travel:[{id:"tr1",who:"Ana P.",to:"Reykjavik",dates:"Jul 10-12",cost:"£1800",status:"booked"}],productionNotes:"",postNotes:""},
   wrap:{finalInvoices:[],expenseReports:[],signedContracts:[],releases:[],deliverables:[],wrapNotes:""},
   clientComments:[],internalNotes:"Greenlight pending Disney legal review.",
   posts:[],
  },
  {id:3,title:"Neon City Commercial",client:"Netflix",clientId:null,status:"wrap",producer:"Ana P.",startDate:"2026-02-01",deliveryDate:"2026-06-15",budget:210000,
   documents:{contracts:[{id:"doc8",name:"Netflix_Contract.pdf",status:"signed",uploader:"Ana P.",date:"2026-02-01",shared:true,esig:true,mimeType:"application/pdf"}],budgets:[{id:"doc9",name:"NeonCity_Final_Budget.xlsx",status:"approved",uploader:"Mike J.",date:"2026-06-01",shared:false,esig:false,mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}],estimates:[],invoices:[{id:"doc10",name:"Final_Invoice_100pct.pdf",status:"sent",uploader:"Mike J.",date:"2026-06-14",shared:true,esig:false,mimeType:"application/pdf"}],schedules:[]},
   creative:{pitchDecks:[],moodBoards:[],locationScouts:[],storyboards:[]},
   crew:[],talent:[],
   producer_data:{vendors:[],permits:[],rentals:[],travel:[],productionNotes:"Picture locked Jun 12.",postNotes:"Delivered to Netflix Jun 14."},
   wrap:{finalInvoices:[{id:"wi1",name:"Final_Invoice_100pct.pdf",status:"sent",date:"2026-06-14"}],expenseReports:[{id:"we1",name:"Expense_Summary.xlsx",status:"pending",date:"2026-06-15"}],signedContracts:[{id:"wc1",name:"Netflix_Contract_Signed.pdf",date:"2026-02-02"}],releases:[{id:"wr1",name:"Talent_Release_All.pdf",status:"signed",date:"2026-05-20"}],deliverables:[{id:"wd1",name:"NeonCity_Master_4K.mp4",status:"delivered",date:"2026-06-14"}],wrapNotes:"All deliverables sent. Awaiting final payment."},
   clientComments:[],internalNotes:"Final payment due Jul 1.",
   posts:[{id:"pa2",type:"video",name:"NeonCity_final_v07.mp4",version:"v07",status:"approved",uploader:"Sam K.",duration:210,editNotes:"Picture locked.",shared:true,comments:[]}],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTime(s){return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;}
function fmtCurrency(n){return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(n);}

function Badge({status,small}){
  const m=STATUS_META[status]||STATUS_META.pending;
  return <span style={{background:m.bg,color:m.color,border:`1px solid ${m.color}35`,borderRadius:4,padding:small?"2px 7px":"3px 10px",fontSize:small?10:11,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{m.label}</span>;
}
function LifecyclePill({stage}){
  const m=LIFECYCLE_META[stage]||LIFECYCLE_META.inquiry;
  return <span style={{background:m.color+"18",color:m.color,border:`1px solid ${m.color}35`,borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>{m.icon} {m.label}</span>;
}
function Avatar({name="?",size=28}){
  const initials=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const hue=(name.charCodeAt(0)*47+(name.charCodeAt(name.length-1)||13)*13)%360;
  return <div style={{width:size,height:size,borderRadius:"50%",background:`hsl(${hue},35%,22%)`,border:`1.5px solid hsl(${hue},40%,38%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.36,fontWeight:600,color:`hsl(${hue},70%,75%)`,flexShrink:0}}>{initials}</div>;
}
function Btn({onClick,variant="ghost",children,style={},disabled}){
  const s={
    primary:{background:"linear-gradient(135deg,#2B8EFF 0%,#8B2FFF 100%)",border:"none",color:"#fff",fontWeight:600,letterSpacing:"-0.01em"},
    cyan:   {background:"rgba(91,184,246,0.12)",border:"1px solid rgba(91,184,246,0.25)",color:"#5BB8F6",fontWeight:600},
    green:  {background:"rgba(123,158,200,0.12)",border:"1px solid rgba(123,158,200,0.25)",color:"#A8C4E0",fontWeight:600},
    red:    {background:"rgba(255,69,58,0.12)",border:"1px solid rgba(255,69,58,0.3)",color:C.red,fontWeight:600},
    ghost:  {background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:C.textSec},
    purple: {background:"rgba(123,158,200,0.12)",border:"1px solid rgba(123,158,200,0.25)",color:"#A8C4E0",fontWeight:600},
    teal:   {background:"rgba(91,184,246,0.12)",border:"1px solid rgba(91,184,246,0.25)",color:"#5BB8F6",fontWeight:600},
    pink:   {background:"rgba(123,158,200,0.12)",border:"1px solid rgba(123,158,200,0.25)",color:"#A8C4E0",fontWeight:600},
  };
  return <button onClick={onClick} disabled={disabled} style={{borderRadius:10,padding:"8px 16px",cursor:disabled?"default":"pointer",fontSize:13,opacity:disabled?0.4:1,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",...s[variant],...style}}>{children}</button>;
}

function DeleteBtn({onConfirm,small}){
  const [confirm,setConfirm]=useState(false);
  const p=small?"3px 7px":"5px 10px";
  return confirm
    ?<span style={{display:"inline-flex",gap:4,alignItems:"center"}}>
      <button onClick={()=>setConfirm(false)} style={{background:"none",border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:5,padding:p,cursor:"pointer",fontSize:11}}>✕</button>
      <button onClick={()=>{setConfirm(false);onConfirm();}} style={{background:C.redLow,border:`1px solid ${C.red}50`,color:C.red,borderRadius:5,padding:p,cursor:"pointer",fontSize:11,fontWeight:600}}>Delete</button>
    </span>
    :<button onClick={()=>setConfirm(true)} title="Delete" style={{background:"none",border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:5,padding:p,cursor:"pointer",fontSize:11,lineHeight:1}}>🗑</button>;
}

function Input({label,value,onChange,placeholder,type="text",style={}}){
  return <div style={{marginBottom:12}}>
    {label&&<label style={{fontSize:10,color:C.textMuted,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{width:"100%",background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 10px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",...style}}/>
  </div>;
}

function DropZone({onFiles,accept,label,color=C.orange,compact=false}){
  const [drag,setDrag]=useState(false);
  const [done,setDone]=useState(false);
  const ref=useRef(null);
  const handle=(files)=>{if(files.length){onFiles(files);setDone(true);setTimeout(()=>setDone(false),1800);}};
  return <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
    onDrop={e=>{e.preventDefault();setDrag(false);handle(Array.from(e.dataTransfer.files));}}
    onClick={()=>ref.current?.click()}
    style={{border:`2px dashed ${done?C.green:drag?color:C.border}`,borderRadius:9,background:done?C.greenLow:drag?color+"08":"transparent",padding:compact?"10px 14px":"20px",textAlign:"center",cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:14}}>
    <input ref={ref} type="file" multiple accept={accept} style={{display:"none"}} onChange={e=>{handle(Array.from(e.target.files));e.target.value="";}}/>
    <span style={{fontSize:compact?15:20}}>{done?"✅":"⬆"}</span>
    <div>
      <div style={{fontSize:12,fontWeight:600,color:done?C.green:drag?color:C.textSec}}>{done?"Uploaded!":drag?"Drop to upload":label}</div>
      {!compact&&<div style={{fontSize:10,color:C.textMuted,marginTop:2}}>drag & drop or click to browse</div>}
    </div>
  </div>;
}

function Modal({title,onClose,children,wide}){
  return <div style={{position:"fixed",inset:0,background:"#000000DD",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:"100%",maxWidth:wide?860:500,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <span style={{fontSize:15,fontWeight:700,color:C.text}}>{title}</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:18}}>✕</button>
      </div>
      <div style={{overflowY:"auto",padding:20,flex:1}}>{children}</div>
    </div>
  </div>;
}

// ─── Preview helpers ─────────────────────────────────────────────────────────

function detectPreviewType(name="",mimeType=""){
  const ext=name.split(".").pop().toLowerCase();
  if(mimeType.startsWith("video/")||["mp4","mov","webm","avi","mkv","mxf","r3d","braw","m4v","mpg","mpeg","m2v"].includes(ext))return "video";
  if(mimeType.startsWith("image/")||["jpg","jpeg","png","gif","webp","svg","bmp"].includes(ext))return "image";
  if(ext==="pdf"||mimeType==="application/pdf")return "pdf";
  return null;
}
function doDownload(entry){
  if(!entry?.previewUrl)return;
  const a=document.createElement("a");a.href=entry.previewUrl;a.download=entry.name;a.click();
}
async function uploadFile(file,folder=""){
  try{
    const r=await fetch("/api/presign",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({filename:file.name,contentType:file.type||"application/octet-stream",folder}),
    });
    if(!r.ok)throw new Error(`presign ${r.status}`);
    const{uploadUrl,fileUrl}=await r.json();
    const put=await fetch(uploadUrl,{
      method:"PUT",
      headers:{"Content-Type":file.type||"application/octet-stream"},
      body:file,
    });
    if(!put.ok)throw new Error(`s3 put ${put.status}`);
    return fileUrl;
  }catch(e){
    console.warn("[S3] upload failed, using blob URL:",e.message);
    return URL.createObjectURL(file);
  }
}
async function uploadFileRaw(file,folder=""){
  try{
    const r=await fetch("/api/presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filename:file.name,contentType:file.type||"application/octet-stream",folder})});
    if(!r.ok)throw new Error(`presign ${r.status}`);
    const{uploadUrl,fileUrl,key}=await r.json();
    await fetch(uploadUrl,{method:"PUT",headers:{"Content-Type":file.type||"application/octet-stream"},body:file});
    return{url:fileUrl,key};
  }catch(e){
    console.warn("[S3] upload failed:",e.message);
    return{url:URL.createObjectURL(file),key:null};
  }
}

function FileIcon({name="",mimeType="",previewUrl,size=36,fallback="📄"}){
  const type=detectPreviewType(name,mimeType);
  if(type==="image"&&previewUrl)
    return <img src={previewUrl} style={{width:size,height:size,objectFit:"cover",borderRadius:7,flexShrink:0}} alt=""/>;
  if(type==="pdf")
    return <div style={{width:size,height:size,borderRadius:7,background:"#FF443315",border:"1px solid #FF443330",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:10,fontWeight:800,color:"#FF4444",letterSpacing:"-0.02em"}}>PDF</span>
    </div>;
  if(type==="video")
    return <div style={{width:size,height:size,borderRadius:7,background:C.cyan+"15",border:`1px solid ${C.cyan}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:size>28?16:12}}>🎬</span>
    </div>;
  return <div style={{width:size,height:size,borderRadius:7,background:"#1A1A24",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
    <span style={{fontSize:size>28?18:14}}>{fallback}</span>
  </div>;
}
// ─── View Toggle & File Card ─────────────────────────────────────────────────
function useViewPref(key,def="list"){
  const [mode,setMode]=useState(()=>localStorage.getItem(key)||def);
  const set=(m)=>{setMode(m);localStorage.setItem(key,m);};
  return [mode,set];
}

function ViewToggle({value,onChange}){
  return (
    <div style={{display:"flex",gap:1,background:"#0D0D14",borderRadius:6,padding:2,flexShrink:0,border:`1px solid ${C.border}`}}>
      {[{m:"grid",icon:"⊞"},{m:"list",icon:"☰"}].map(v=>(
        <button key={v.m} onClick={()=>onChange(v.m)} title={v.m==="grid"?"Grid view":"List view"}
          style={{background:value===v.m?C.surface:"none",border:"none",borderRadius:4,color:value===v.m?C.text:C.textMuted,cursor:"pointer",padding:"3px 9px",fontSize:14,lineHeight:1,transition:"background 0.15s"}}>
          {v.icon}
        </button>
      ))}
    </div>
  );
}

function FileCard({item,onPreview,onApprove,onReject,canApprove,onDelete,fallbackIcon="📄"}){
  const [hov,setHov]=useState(false);
  const type=detectPreviewType(item.name||"",item.mimeType||"");
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{position:"relative",aspectRatio:"1",borderRadius:10,overflow:"hidden",cursor:"pointer",background:C.card,border:`1px solid ${hov?C.borderHover:C.border}`,transition:"border-color 0.15s,transform 0.15s,box-shadow 0.15s",transform:hov?"translateY(-2px)":"none",boxShadow:hov?"0 8px 24px rgba(0,0,0,0.5)":"none"}}>
      {type==="image"&&item.previewUrl
        ?<img src={item.previewUrl} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
        :type==="video"
        ?<div style={{position:"absolute",inset:0,background:"#040408",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {item.previewUrl&&<video src={item.previewUrl} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} muted playsInline preload="metadata"/>}
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)"}}/>
          <div style={{position:"relative",width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.18)",backdropFilter:"blur(8px)",border:"1.5px solid rgba(255,255,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,paddingLeft:2}}>▶</div>
        </div>
        :type==="pdf"
        ?<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#1A0808,#2A1010)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:22,fontWeight:900,color:"#FF4444",fontFamily:"monospace",letterSpacing:"-0.03em"}}>PDF</span>
        </div>
        :<div style={{position:"absolute",inset:0,background:C.card,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:32}}>{fallbackIcon}</span>
        </div>
      }
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"55%",background:"linear-gradient(to top,rgba(0,0,0,0.88),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:6,right:6,zIndex:2}}><Badge status={item.status} small/></div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"5px 8px 7px",zIndex:2}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.9)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500}}>{item.name}</div>
      </div>
      {hov&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(2px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:7,zIndex:3}}>
        {onPreview&&<button onClick={e=>{e.stopPropagation();onPreview(item);}} style={{background:"rgba(255,255,255,0.14)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.28)",borderRadius:6,padding:"5px 14px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",width:106}}>👁 Preview</button>}
        {canApprove&&item.status!=="approved"&&onApprove&&<button onClick={e=>{e.stopPropagation();onApprove(item.id);}} style={{background:"rgba(255,255,255,0.14)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.28)",borderRadius:6,padding:"5px 14px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",width:106}}>✓ Approve</button>}
        {canApprove&&item.status!=="changes"&&onReject&&<button onClick={e=>{e.stopPropagation();onReject(item.id);}} style={{background:"rgba(255,255,255,0.14)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.28)",borderRadius:6,padding:"5px 14px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",width:106}}>✗ Changes</button>}
        {onDelete&&<button onClick={e=>{e.stopPropagation();onDelete(item.id);}} style={{background:"rgba(180,40,40,0.25)",border:"1px solid rgba(220,60,60,0.4)",borderRadius:6,padding:"5px 14px",color:"#ff6666",fontSize:11,fontWeight:600,cursor:"pointer",width:106}}>🗑 Delete</button>}
      </div>}
    </div>
  );
}

function MediaCard({item,onPreview,onApprove,onReject,canApprove,onDelete,fallbackIcon="📄"}){
  const [hov,setHov]=useState(false);
  const type=detectPreviewType(item.name||"",item.mimeType||"");
  const dur=item.duration;
  const durStr=dur?`${Math.floor(dur/60)}:${String(Math.floor(dur%60)).padStart(2,"0")}`:null;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{borderRadius:10,overflow:"hidden",background:C.card,border:`1px solid ${hov?C.borderHover:C.border}`,transition:"border-color 0.15s,transform 0.15s,box-shadow 0.15s",transform:hov?"translateY(-2px)":"none",boxShadow:hov?"0 8px 24px rgba(0,0,0,0.5)":"none"}}>
      <div onClick={onPreview} style={{position:"relative",aspectRatio:"16/9",background:"#080810",overflow:"hidden",cursor:onPreview?"pointer":"default"}}>
        {type==="image"&&item.previewUrl
          ?<img src={item.previewUrl} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
          :type==="video"
          ?<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#0D0D20,#1A1A2E)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {item.previewUrl&&<video src={item.previewUrl} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} muted playsInline preload="metadata"/>}
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)"}}/>
            <div style={{position:"relative",width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.18)",backdropFilter:"blur(8px)",border:"1.5px solid rgba(255,255,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,paddingLeft:2}}>▶</div>
          </div>
          :type==="pdf"
          ?<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#1A0808,#2A1010)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:28,fontWeight:900,color:"#FF4444",fontFamily:"monospace"}}>PDF</span>
          </div>
          :<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#0D0D1A,#141428)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:36,opacity:0.5}}>{fallbackIcon}</span>
          </div>
        }
        {durStr&&<div style={{position:"absolute",bottom:6,right:7,background:"rgba(0,0,0,0.82)",borderRadius:4,padding:"2px 6px",fontSize:11,fontWeight:600,color:"#fff",fontFamily:"monospace",letterSpacing:"0.02em"}}>{durStr}</div>}
        {item.encodingStatus==="queued"&&<div style={{position:"absolute",top:6,left:6,background:"rgba(0,0,0,0.72)",border:`1px solid ${C.yellow}50`,borderRadius:4,padding:"2px 7px",fontSize:10,color:C.yellow}}>⏳ Queued</div>}
        {item.encodingStatus==="encoding"&&<div style={{position:"absolute",top:6,left:6,background:"rgba(0,0,0,0.72)",border:`1px solid ${C.cyan}50`,borderRadius:4,padding:"2px 7px",fontSize:10,color:C.cyan}}>⚙ {item.encodingProgress||0}%</div>}
        {hov&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(1px)",display:"flex",alignItems:"center",justifyContent:"center",gap:7,zIndex:3}}>
          {onPreview&&<button onClick={e=>{e.stopPropagation();onPreview(item);}} style={{background:"rgba(255,255,255,0.14)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.28)",borderRadius:6,padding:"5px 14px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>👁 Preview</button>}
          {canApprove&&item.status!=="approved"&&onApprove&&<button onClick={e=>{e.stopPropagation();onApprove(item.id);}} style={{background:"rgba(255,255,255,0.14)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.28)",borderRadius:6,padding:"5px 12px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>✓</button>}
          {canApprove&&item.status!=="changes"&&onReject&&<button onClick={e=>{e.stopPropagation();onReject(item.id);}} style={{background:"rgba(255,255,255,0.14)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.28)",borderRadius:6,padding:"5px 12px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>✗</button>}
          {onDelete&&<button onClick={e=>{e.stopPropagation();onDelete(item.id);}} style={{background:"rgba(180,40,40,0.25)",border:"1px solid rgba(220,60,60,0.4)",borderRadius:6,padding:"5px 10px",color:"#ff6666",fontSize:11,cursor:"pointer"}}>🗑</button>}
        </div>}
      </div>
      <div style={{padding:"9px 11px 10px"}}>
        <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{item.name}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
          <div style={{fontSize:10,color:C.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>
            {[item.uploader,item.date||item.version].filter(Boolean).join(" · ")}
          </div>
          {item.encodingStatus==="done"?<span style={{fontSize:10,color:C.green,whiteSpace:"nowrap",flexShrink:0}}>✓ HLS</span>
            :item.encodingStatus==="error"?<span style={{fontSize:10,color:C.red,whiteSpace:"nowrap",flexShrink:0}}>✗ Err</span>
            :<Badge status={item.status} small/>}
        </div>
      </div>
    </div>
  );
}

function PreviewModal({entry,onClose,onAnnotate,onApprove,onRequestChanges,entryStatus}){
  const type=detectPreviewType(entry.name,entry.mimeType||"");
  const dlBtn=<button onClick={()=>doDownload(entry)} style={{background:"#14141C",border:`1px solid ${C.border}`,color:C.textSec,borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,whiteSpace:"nowrap"}}>⬇ Download</button>;
  if(!entry.previewUrl){
    return <Modal title={entry.name} onClose={onClose}>
      <div style={{textAlign:"center",padding:"52px 20px",color:C.textMuted}}>
        <div style={{fontSize:44,marginBottom:14}}>{type==="pdf"?"📄":type==="video"?"🎬":type==="image"?"🖼️":"📄"}</div>
        <div style={{fontSize:13,fontWeight:600,color:C.textSec,marginBottom:6}}>No file attached</div>
        <div style={{fontSize:11,lineHeight:1.6}}>Upload a file to enable preview.<br/>Use the drop zone in the panel or the ⬆ Upload button.</div>
      </div>
    </Modal>;
  }
  if(type==="pdf"&&onAnnotate){
    return <div style={{position:"fixed",inset:0,background:"#000000E0",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width:"100%",maxWidth:1140,maxHeight:"94vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <span style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{entry.name}</span>
          {entryStatus&&<Badge status={entryStatus} small/>}
          {onApprove&&<Btn variant="green" onClick={onApprove} style={{fontSize:10,padding:"4px 10px",whiteSpace:"nowrap"}}>✓ Approve</Btn>}
          {onRequestChanges&&<Btn variant="red" onClick={onRequestChanges} style={{fontSize:10,padding:"4px 10px",whiteSpace:"nowrap"}}>✗ Changes</Btn>}
          {entry.previewUrl&&dlBtn}
          <button onClick={onClose} style={{background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:18,flexShrink:0}}>✕</button>
        </div>
        <div style={{flex:1,overflow:"hidden",display:"flex",minHeight:0}}>
          <PdfAnnotator entry={entry} onAnnotate={onAnnotate}/>
        </div>
      </div>
    </div>;
  }
  return <Modal title={entry.name} onClose={onClose} wide>
    {type==="video"&&<div>
      <video src={entry.previewUrl} controls autoPlay style={{width:"100%",maxHeight:500,background:"#000",borderRadius:8,display:"block",marginBottom:12}}/>
      {entry.previewUrl&&<div style={{textAlign:"center"}}>{dlBtn}</div>}
    </div>}
    {type==="image"&&<div style={{textAlign:"center",background:"#1A1A22",borderRadius:8,padding:12}}>
      <img src={entry.previewUrl} alt={entry.name} style={{maxWidth:"100%",maxHeight:520,objectFit:"contain",borderRadius:6,display:"block",marginBottom:12}}/>
      {entry.previewUrl&&dlBtn}
    </div>}
    {type==="pdf"&&<iframe src={entry.previewUrl} title={entry.name} style={{width:"100%",height:600,border:"none",borderRadius:6}}/>}
    {!type&&<div style={{textAlign:"center",padding:"40px 0",color:C.textMuted}}><div style={{fontSize:40,marginBottom:12}}>📄</div><p>No preview available for this file type.</p></div>}
  </Modal>;
}

function PdfAnnotator({entry,onAnnotate}){
  const [page,setPage]=useState(1);
  const [mode,setMode]=useState("view");
  const [pending,setPending]=useState(null);
  const [noteText,setNoteText]=useState("");
  const [activePin,setActivePin]=useState(null);
  const [reply,setReply]=useState("");
  const overlayRef=useRef(null);

  const annotations=entry.annotations||[];
  const pageAnnotations=annotations.filter(a=>a.page===page);
  const accent=C.cyan;

  const handleCapture=(e)=>{
    if(mode!=="pin")return;
    const rect=overlayRef.current.getBoundingClientRect();
    setPending({x:((e.clientX-rect.left)/rect.width)*100,y:((e.clientY-rect.top)/rect.height)*100});
    setNoteText("");
  };
  const savePin=()=>{
    if(!pending||!noteText.trim())return;
    onAnnotate({type:"add",ann:{id:`ann${Date.now()}`,page,x:pending.x,y:pending.y,author:"You",text:noteText,replies:[],resolved:false}});
    setPending(null);setNoteText("");setMode("view");
  };
  const saveReply=(pinId)=>{
    if(!reply.trim())return;
    onAnnotate({type:"reply",pinId,reply:{id:`r${Date.now()}`,author:"You",text:reply,date:new Date().toISOString().slice(0,10)}});
    setReply("");
  };
  const resolve=(pinId)=>onAnnotate({type:"resolve",pinId});
  const iStyle={background:"#0A0A14",border:`1px solid ${C.border}`,borderRadius:5,padding:"6px 9px",color:C.text,fontSize:11,outline:"none"};

  const Pin=({num,x,y,resolved,active,onClick})=>(
    <div onClick={onClick} title={`Pin ${num}`}
      style={{position:"absolute",left:`${x}%`,top:`${y}%`,transform:"translate(-50%,-100%)",display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",pointerEvents:"all",zIndex:12,filter:resolved?"grayscale(1) opacity(0.35)":"none"}}>
      <div style={{width:24,height:24,borderRadius:"50%",background:active?"#fff":accent,border:active?`2.5px solid ${accent}`:"2.5px solid rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:active?accent:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,0.7)"}}>{num}</div>
      <div style={{width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:`6px solid ${active?"#fff":accent}`}}/>
    </div>
  );

  return <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderBottom:`1px solid ${C.border}`,flexShrink:0,background:"#09090F",flexWrap:"wrap"}}>
        <button onClick={()=>{setPage(p=>Math.max(1,p-1));setPending(null);}} disabled={page<=1}
          style={{background:"#14141C",border:`1px solid ${C.border}`,color:page<=1?C.textMuted:C.text,borderRadius:5,padding:"4px 10px",cursor:page<=1?"default":"pointer",fontSize:12}}>◀</button>
        <span style={{fontSize:12,color:C.textSec,minWidth:54,textAlign:"center"}}>Page {page}</span>
        <button onClick={()=>{setPage(p=>p+1);setPending(null);}}
          style={{background:"#14141C",border:`1px solid ${C.border}`,color:C.text,borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:12}}>▶</button>
        <span style={{flex:1}}/>
        {mode==="pin"&&<span style={{fontSize:10,color:accent,fontWeight:600}}>Click to place pin #{annotations.length+1}</span>}
        <button onClick={()=>{setMode(m=>m==="pin"?"view":"pin");setPending(null);}}
          style={{background:mode==="pin"?accent+"22":"#14141C",border:`1px solid ${mode==="pin"?accent+"40":C.border}`,color:mode==="pin"?accent:C.textSec,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:600}}>
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

      {pending&&<div style={{padding:"10px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,background:"#08080E",flexShrink:0,alignItems:"center"}}>
        <span style={{width:22,height:22,borderRadius:"50%",background:accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",flexShrink:0}}>{annotations.length+1}</span>
        <input autoFocus value={noteText} onChange={e=>setNoteText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&savePin()} placeholder="Type a note for this pin…" style={{flex:1,...iStyle}}/>
        <button onClick={savePin} disabled={!noteText.trim()} style={{background:accent,border:"none",color:"#fff",borderRadius:6,padding:"6px 12px",cursor:noteText.trim()?"pointer":"default",fontSize:12,fontWeight:600,opacity:noteText.trim()?1:0.5}}>Pin it</button>
        <button onClick={()=>setPending(null)} style={{background:"none",border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:12}}>✕</button>
      </div>}
    </div>

    <div style={{width:274,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <span style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Pins </span>
        <span style={{fontSize:11,fontWeight:700,color:accent}}>{annotations.length}</span>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {annotations.length===0&&<div style={{padding:"40px 14px",textAlign:"center",color:C.textMuted,fontSize:12,lineHeight:1.7}}>No pins yet.<br/>Click "Add Pin" then click<br/>anywhere on the PDF.</div>}
        {annotations.map((a,idx)=>{
          const isActive=activePin?.id===a.id;
          return <div key={a.id} onClick={()=>setActivePin(isActive?null:a)}
            style={{borderBottom:`1px solid ${C.border}22`,padding:"11px 13px",borderLeft:`3px solid ${a.resolved?"#3A3A55":accent}`,background:isActive?accent+"12":"transparent",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
              <span style={{width:20,height:20,borderRadius:"50%",background:a.resolved?"#3A3A55":accent,color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0}}>{idx+1}</span>
              <span style={{fontSize:11,fontWeight:600,color:C.text}}>{a.author}</span>
              <span style={{marginLeft:"auto",fontSize:10,color:C.textMuted,background:"#1A1A28",padding:"1px 6px",borderRadius:3,whiteSpace:"nowrap"}}>p.{a.page}</span>
            </div>
            <p style={{margin:"0 0 4px",fontSize:12,color:C.textSec,lineHeight:1.4}}>{a.text}</p>
            {(a.replies||[]).map(r=>(
              <div key={r.id} style={{paddingLeft:8,borderLeft:`2px solid ${C.border}`,marginTop:4}}>
                <span style={{fontSize:10,fontWeight:600,color:C.textSec}}>{r.author}: </span>
                <span style={{fontSize:10,color:C.textSec}}>{r.text}</span>
              </div>
            ))}
            {isActive&&<div onClick={e=>e.stopPropagation()} style={{marginTop:8}}>
              <div style={{display:"flex",gap:5,marginBottom:6}}>
                <input value={reply} onChange={e=>setReply(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveReply(a.id)} onClick={e=>e.stopPropagation()} placeholder="Reply…" style={{flex:1,...iStyle}}/>
                <button onClick={()=>saveReply(a.id)} disabled={!reply.trim()} style={{background:accent,border:"none",color:"#fff",borderRadius:5,padding:"5px 10px",cursor:reply.trim()?"pointer":"default",fontSize:11,opacity:reply.trim()?1:0.5}}>→</button>
              </div>
              {!a.resolved&&<button onClick={()=>resolve(a.id)} style={{background:C.greenLow,border:`1px solid ${C.green}30`,color:C.green,borderRadius:5,padding:"3px 10px",cursor:"pointer",fontSize:10,fontWeight:600}}>✓ Resolve</button>}
            </div>}
          </div>;
        })}
      </div>
    </div>
  </div>;
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

function SignIn({onSignIn,logoUrl}){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [showPass,setShowPass]=useState(false);

  const attempt=()=>{
    setErr("");setLoading(true);
    setTimeout(()=>{
      const u=DEMO_USERS.find(u=>u.email===email.trim().toLowerCase()&&u.password===pass);
      if(u)onSignIn(u); else setErr("Incorrect email or password.");
      setLoading(false);
    },500);
  };

  return <div style={{minHeight:"100vh",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',sans-serif",padding:20,overflow:"hidden"}}>
    {/* Video background */}
    <video autoPlay loop muted playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:0}}>
      <source src={FF_BG_VIDEO} type="video/mp4"/>
    </video>
    {/* Dark overlay */}
    <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(0,0,0,0.85) 0%,rgba(10,0,30,0.75) 100%)",zIndex:1}}/>
    {/* Logo top-left */}
    <div style={{position:"absolute",top:24,left:28,zIndex:3}}>
      <img src={FF_LOGO} alt="Full Flux" style={{height:52,objectFit:"contain"}}/>
    </div>
    {/* Login card */}
    <div style={{width:"100%",maxWidth:400,position:"relative",zIndex:2}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <p style={{margin:0,fontSize:15,color:"rgba(255,255,255,0.7)",letterSpacing:"-0.01em"}}>Sign in to your workspace</p>
      </div>
      <div style={{background:"rgba(10,0,30,0.6)",border:"1px solid rgba(139,47,255,0.3)",borderRadius:18,padding:28,marginBottom:16,backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",boxShadow:"0 0 40px rgba(139,47,255,0.15),inset 0 1px 0 rgba(255,255,255,0.07)"}}>
        <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@studio.com" type="email"/>
        <div style={{marginBottom:20,position:"relative"}}>
          <label style={{fontSize:11,color:C.textMuted,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Password</label>
          <input value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} type={showPass?"text":"password"} placeholder="••••••••"
            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:`1px solid ${err?"rgba(255,69,58,0.6)":"rgba(255,255,255,0.1)"}`,borderRadius:10,padding:"12px 40px 12px 14px",color:C.text,fontSize:15,outline:"none",boxSizing:"border-box",letterSpacing:"0.02em"}}/>
          <button onClick={()=>setShowPass(p=>!p)} style={{position:"absolute",right:12,top:34,background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:14}}>{showPass?"🙈":"👁"}</button>
        </div>
        {err&&<div style={{background:"rgba(255,69,58,0.12)",border:"1px solid rgba(255,69,58,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:C.red}}>{err}</div>}
        <button onClick={attempt} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#2B8EFF 0%,#8B2FFF 100%)",border:"none",color:"#fff",borderRadius:12,padding:"14px",cursor:"pointer",fontSize:16,fontWeight:600,letterSpacing:"-0.01em",boxShadow:"0 4px 24px rgba(139,47,255,0.5)"}}>{loading?"Signing in…":"Sign In"}</button>
      </div>
      <div style={{background:"rgba(10,0,30,0.5)",border:"1px solid rgba(139,47,255,0.2)",borderRadius:14,padding:18,backdropFilter:"blur(20px)"}}>
        <div style={{fontSize:11,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Demo accounts</div>
        {DEMO_USERS.map(u=>(
          <button key={u.id} onClick={()=>onSignIn(u)} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 14px",cursor:"pointer",textAlign:"left",width:"100%",marginBottom:8,transition:"border-color 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(139,47,255,0.5)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}>
            <Avatar name={u.name} size={26}/>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{u.name}</div>
            <div style={{fontSize:10,color:C.textMuted}}>{ROLES[u.role].label}{u.company?` · ${u.company}`:""}</div></div>
            <span style={{fontSize:10,color:ROLES[u.role].color,fontWeight:600}}>{ROLES[u.role].label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>;
}

// ─── Lifecycle Progress Bar ───────────────────────────────────────────────────

function LifecycleBar({current,onChange,canEdit}){
  const idx=LIFECYCLE.indexOf(current);
  return <div style={{display:"flex",alignItems:"center",gap:0,background:"#0F0F18",borderRadius:8,padding:"10px 14px",marginBottom:20,overflowX:"auto"}}>
    {LIFECYCLE.map((stage,i)=>{
      const m=LIFECYCLE_META[stage];
      const active=i===idx; const past=i<idx;
      return <div key={stage} style={{display:"flex",alignItems:"center",flexShrink:0}}>
        <div onClick={()=>canEdit&&onChange(stage)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:6,background:active?m.color+"22":"transparent",border:`1px solid ${active?m.color+"60":"transparent"}`,cursor:canEdit?"pointer":"default",transition:"all 0.15s"}}>
          <span style={{fontSize:13}}>{m.icon}</span>
          <span style={{fontSize:11,fontWeight:active?700:400,color:active?m.color:past?m.color+"80":C.textMuted,whiteSpace:"nowrap"}}>{m.label}</span>
        </div>
        {i<LIFECYCLE.length-1&&<div style={{width:16,height:1,background:i<idx?C.border+"80":C.border+"40",flexShrink:0}}/>}
      </div>;
    })}
  </div>;
}

// ─── Universal Upload Modal ───────────────────────────────────────────────────

function VideoPlayer({asset,style={}}){
  const videoRef=useRef(null);
  const hlsRef=useRef(null);
  const [levels,setLevels]=useState([]);
  const [lvl,setLvl]=useState(-1);
  const hlsUrl=asset?.hlsUrl;

  useEffect(()=>{
    const video=videoRef.current;
    if(!video||!hlsUrl)return;
    if(Hls.isSupported()){
      const hls=new Hls({capLevelToPlayerSize:true,startLevel:-1});
      hlsRef.current=hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED,(_,d)=>setLevels(d.levels));
      return()=>{hls.destroy();hlsRef.current=null;setLevels([]);};
    }else if(video.canPlayType("application/vnd.apple.mpegurl")){
      video.src=hlsUrl;
    }
  },[hlsUrl]);

  if(asset?.encodingStatus==="queued")return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:"36px 20px",...style}}>
      <div style={{fontSize:40}}>⏳</div>
      <div style={{fontSize:13,fontWeight:600,color:C.yellow}}>Queued for encoding</div>
      <div style={{fontSize:11,color:C.textMuted}}>AWS MediaConvert will begin shortly</div>
    </div>
  );
  if(asset?.encodingStatus==="encoding")return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:"36px 20px",...style}}>
      <div style={{fontSize:40}}>⚙</div>
      <div style={{fontSize:13,fontWeight:600,color:C.cyan}}>Encoding — {asset.encodingProgress||0}%</div>
      <div style={{background:"#1A1A24",borderRadius:6,height:6,width:220}}>
        <div style={{background:C.cyan,height:"100%",width:`${asset.encodingProgress||0}%`,borderRadius:6,transition:"width 0.8s"}}/>
      </div>
      <div style={{fontSize:11,color:C.textMuted}}>AWS MediaConvert processing…</div>
    </div>
  );
  if(asset?.encodingStatus==="failed")return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:"36px 20px",...style}}>
      <div style={{fontSize:40}}>⚠</div>
      <div style={{fontSize:13,color:C.red,fontWeight:600}}>Encoding failed</div>
      {asset?.previewUrl&&<video src={asset.previewUrl} controls style={{maxWidth:"100%",maxHeight:280,borderRadius:8,background:"#000"}}/>}
    </div>
  );
  return(
    <div style={{position:"relative",...style}}>
      <video ref={videoRef} src={hlsUrl?undefined:asset?.previewUrl} controls
        style={{width:"100%",maxHeight:340,borderRadius:8,background:"#000",display:"block"}}/>
      {levels.length>1&&(
        <div style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.82)",borderRadius:6,border:"1px solid rgba(255,255,255,0.15)"}}>
          <select value={lvl} onChange={e=>{const l=Number(e.target.value);setLvl(l);if(hlsRef.current)hlsRef.current.currentLevel=l;}}
            style={{background:"transparent",color:"#fff",border:"none",padding:"4px 8px",fontSize:10,cursor:"pointer",outline:"none"}}>
            <option value={-1}>Auto</option>
            {[...levels].reverse().map((l,i)=>(
              <option key={i} value={levels.length-1-i}>{l.height}p</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function UploadModal({project,onClose,onUpload}){
  const [section,setSection]=useState("documents");
  const [cat,setCat]=useState("contracts");
  const [files,setFiles]=useState([]);
  const [statuses,setStatuses]=useState({});
  const [isUploading,setIsUploading]=useState(false);
  const [version,setVersion]=useState("v01");
  const [notes,setNotes]=useState("");
  const [dragging,setDragging]=useState(false);
  const [videoFormat,setVideoFormat]=useState("hls");
  const [videoQuality,setVideoQuality]=useState("web");
  const fileRef=useRef(null);

  const SECS={
    documents:{label:"Documents",icon:"📁",color:"#5BB8F6",cats:{contracts:"Contracts",budgets:"Budgets",estimates:"Estimates",invoices:"Invoices",schedules:"Schedules"}},
    creative:{label:"Creative",icon:"🎨",color:"#7B9EC8",cats:{pitchDecks:"Pitch Decks",moodBoards:"Mood Boards",locationScouts:"Location Scouts",storyboards:"Storyboards"}},
    post:{label:"Post / VFX",icon:"✨",color:"#5B7FFF",cats:null},
    video:{label:"Video",icon:"🎬",color:"#5BB8F6",cats:null},
    wrap:{label:"Wrap",icon:"📦",color:"#7B9EC8",cats:{finalInvoices:"Final Invoices",expenseReports:"Expense Reports",signedContracts:"Signed Contracts",releases:"Releases",deliverables:"Deliverables"}},
  };
  const sec=SECS[section];
  const isVideo=section==="video";
  const changeSection=(s)=>{setSection(s);setCat(Object.keys(SECS[s].cats||{})[0]||"");setFiles([]);setStatuses({});};
  const addFiles=(fs)=>setFiles(prev=>[...prev,...Array.from(fs)]);
  const removeFile=(i)=>setFiles(prev=>prev.filter((_,j)=>j!==i));

  const VIDEO_FORMATS=[
    {value:"hls",    label:"HLS Streaming",       badge:"HLS",    desc:"Multi-bitrate adaptive, smooth web streaming",recommended:true},
    {value:"mp4_h264",label:"MP4 H.264",           badge:"H.264",  desc:"Broad compatibility, single file"},
    {value:"mp4_h265",label:"MP4 H.265 (4K)",      badge:"H.265",  desc:"Better compression for 4K footage"},
    {value:"prores", label:"ProRes 422",            badge:"ProRes", desc:"Broadcast quality, archival format"},
    {value:"original",label:"Original (no encoding)",badge:"RAW",   desc:"Upload as-is, no conversion"},
  ];
  const VIDEO_QUALITIES=[
    {value:"web",  label:"Web (1080p)",desc:"Optimized for streaming"},
    {value:"high", label:"High (4K)",  desc:"Maximum quality renditions"},
    {value:"master",label:"Master",    desc:"Original quality, largest file"},
  ];
  const FORMAT_BADGE={r3d:{l:"R3D",c:"#FF3333"},braw:{l:"BRAW",c:"#FF7722"},mxf:{l:"MXF",c:"#9966FF"},mov:{l:"MOV",c:"#3399FF"},mp4:{l:"MP4",c:"#33CC77"},avi:{l:"AVI",c:"#AAAAAA"},webm:{l:"WebM",c:"#33BBFF"},mkv:{l:"MKV",c:"#AAAA33"}};

  // Estimated output size: target bitrate (Mbps) × estimated duration
  const OUTPUT_MBPS={hls:{web:9.5,high:32,master:100},mp4_h264:{web:5,high:20,master:50},mp4_h265:{web:3,high:12,master:25},prores:{web:707,high:1200,master:1200},original:{web:0,high:0,master:0}};
  const estOutputMB=files.reduce((tot,f)=>{
    if(videoFormat==="original")return tot+f.size/1024/1024;
    const srcMbps=["r3d","braw"].includes(f.name.split(".").pop().toLowerCase())?200:10;
    const durSecs=(f.size*8)/(srcMbps*1_000_000);
    return tot+(OUTPUT_MBPS[videoFormat]?.[videoQuality]||9.5)*durSecs/8;
  },0);
  const fmtMB=mb=>mb>1024?`~${(mb/1024).toFixed(1)} GB`:`~${Math.round(mb)} MB`;

  const doUpload=async()=>{
    if(!files.length||isUploading)return;
    setIsUploading(true);
    const results=[];
    if(isVideo){
      for(let i=0;i<files.length;i++){
        setStatuses(prev=>({...prev,[i]:"uploading"}));
        try{
          const{url,key}=await uploadFileRaw(files[i],"video");
          let jobId=null,hlsBase=null;
          if(videoFormat!=="original"&&key){
            setStatuses(prev=>({...prev,[i]:"queuing"}));
            try{
              const tr=await fetch("/api/transcode",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({s3Key:key,format:videoFormat,quality:videoQuality,outputKey:`encoded/${Date.now()}_${i}`})});
              if(tr.ok){const d=await tr.json();jobId=d.jobId;hlsBase=d.hlsBase;}
            }catch{}
          }
          results.push({file:files[i],url,key,jobId,hlsBase});
        }catch{results.push({file:files[i],url:URL.createObjectURL(files[i]),key:null,jobId:null,hlsBase:null});}
        setStatuses(prev=>({...prev,[i]:"done"}));
      }
    }else{
      for(let i=0;i<files.length;i++){
        setStatuses(prev=>({...prev,[i]:"uploading"}));
        const url=await uploadFile(files[i],`${section}/${cat}`);
        setStatuses(prev=>({...prev,[i]:"done"}));
        results.push({file:files[i],url});
      }
    }
    onUpload(section,cat,results,{version,notes,format:videoFormat,quality:videoQuality});
    onClose();
  };

  const iStyle={background:"#0A0A16",border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"};
  const uploadLabel=isVideo&&videoFormat!=="original"
    ?isUploading?(statuses[0]==="queuing"?"🔄 Queuing…":"⬆ Uploading…"):`⬆ Upload & Encode${files.length>1?` ${files.length}`:" 1"} file${files.length>1?"s":""}`
    :isUploading?"⬆ Uploading…":`⬆ Upload${files.length>1?` ${files.length} files`:files.length===1?" 1 file":""}`;

  return (
    <div style={{position:"fixed",inset:0,background:"#000000CC",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,width:"100%",maxWidth:600,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:700,color:C.text}}>⬆ Upload Files</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div style={{overflowY:"auto",padding:20,flex:1,display:"flex",flexDirection:"column",gap:16}}>

          {/* Section picker */}
          <div>
            <label style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>Section</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {Object.entries(SECS).map(([key,s])=>(
                <button key={key} onClick={()=>changeSection(key)}
                  style={{background:section===key?s.color+"20":C.surface,border:`1px solid ${section===key?s.color+"50":C.border}`,color:section===key?s.color:C.textSec,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:section===key?700:400,transition:"all 0.15s"}}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category picker (non-video sections) */}
          {sec.cats&&(
            <div>
              <label style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>Category</label>
              <select value={cat} onChange={e=>setCat(e.target.value)} style={{...iStyle,cursor:"pointer"}}>
                {Object.entries(sec.cats).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={e=>{e.preventDefault();setDragging(true);}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);addFiles(e.dataTransfer.files);}}
            onClick={()=>fileRef.current?.click()}
            style={{border:`2px dashed ${dragging?sec.color:C.border}`,borderRadius:12,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:dragging?sec.color+"08":C.surface,transition:"all 0.2s"}}>
            <div style={{fontSize:32,marginBottom:8}}>{isVideo?"🎬":"📂"}</div>
            <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:4}}>Drop files here</div>
            <div style={{fontSize:11,color:C.textMuted}}>
              {isVideo?"MP4, MOV, MXF, AVI, R3D, BRAW, ProRes, H.264, H.265":"or click to browse"}
            </div>
            <input ref={fileRef} type="file" multiple style={{display:"none"}}
              accept={isVideo?".mp4,.mov,.mxf,.avi,.webm,.r3d,.braw,.m4v,.mpg,.mpeg,.mkv,video/*":"*"}
              onChange={e=>addFiles(e.target.files)}/>
          </div>

          {/* File list */}
          {files.length>0&&(
            <div>
              <label style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>Selected ({files.length})</label>
              {files.map((f,i)=>{
                const ext=f.name.split(".").pop().toLowerCase();
                const badge=isVideo?(FORMAT_BADGE[ext]||{l:ext.toUpperCase().slice(0,4),c:C.textMuted}):null;
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"#0A0A16",borderRadius:7,padding:"8px 12px",marginBottom:5}}>
                    <FileIcon name={f.name} mimeType={f.type} size={28} fallback="📄"/>
                    {badge&&<span style={{fontSize:9,fontWeight:700,color:badge.c,background:badge.c+"18",borderRadius:4,padding:"2px 5px",border:`1px solid ${badge.c}35`,flexShrink:0}}>{badge.l}</span>}
                    <span style={{flex:1,fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span>
                    <span style={{fontSize:10,color:C.textMuted,flexShrink:0}}>{(f.size/1024/1024).toFixed(1)} MB</span>
                    {statuses[i]==="uploading"&&<span style={{fontSize:10,color:C.cyan,flexShrink:0}}>⬆…</span>}
                    {statuses[i]==="queuing"&&<span style={{fontSize:10,color:C.yellow,flexShrink:0}}>🔄…</span>}
                    {statuses[i]==="done"&&<span style={{fontSize:10,color:C.green,flexShrink:0}}>✓</span>}
                    {!statuses[i]&&!isUploading&&<button onClick={()=>removeFile(i)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:14,flexShrink:0,padding:2}}>✕</button>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Video-specific controls */}
          {isVideo&&<>
            <div>
              <label style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>Target Format</label>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {VIDEO_FORMATS.map(f=>(
                  <div key={f.value} onClick={()=>setVideoFormat(f.value)}
                    style={{display:"flex",alignItems:"center",gap:10,background:videoFormat===f.value?C.teal+"10":C.surface,border:`1px solid ${videoFormat===f.value?C.teal+"55":C.border}`,borderRadius:8,padding:"9px 12px",cursor:"pointer",transition:"all 0.15s"}}>
                    <div style={{width:15,height:15,borderRadius:"50%",border:`2px solid ${videoFormat===f.value?C.teal:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {videoFormat===f.value&&<div style={{width:7,height:7,borderRadius:"50%",background:C.teal}}/>}
                    </div>
                    <span style={{fontSize:9,fontWeight:700,color:f.value==="hls"?C.cyan:f.value==="prores"?C.purple:C.textSec,background:C.card,borderRadius:4,padding:"2px 6px",flexShrink:0}}>{f.badge}</span>
                    <div style={{flex:1}}>
                      <span style={{fontSize:12,fontWeight:videoFormat===f.value?600:400,color:videoFormat===f.value?C.text:C.textSec}}>{f.label}</span>
                      {f.recommended&&<span style={{fontSize:9,color:C.teal,marginLeft:6}}>recommended</span>}
                      <div style={{fontSize:10,color:C.textMuted}}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {videoFormat!=="original"&&videoFormat!=="prores"&&<div>
              <label style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>Quality Preset</label>
              <div style={{display:"flex",gap:8}}>
                {VIDEO_QUALITIES.map(q=>(
                  <button key={q.value} onClick={()=>setVideoQuality(q.value)}
                    style={{flex:1,padding:"8px 4px",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600,transition:"all 0.15s",background:videoQuality===q.value?C.orange+"20":"none",border:`1.5px solid ${videoQuality===q.value?C.orange:C.border}`,color:videoQuality===q.value?C.orange:C.textSec}}>
                    {q.label}
                    <div style={{fontSize:9,color:C.textMuted,fontWeight:400,marginTop:2}}>{q.desc}</div>
                  </button>
                ))}
              </div>
            </div>}

            {files.length>0&&<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:16}}>
              <div>
                <div style={{fontSize:10,color:C.textMuted,marginBottom:2}}>Input</div>
                <div style={{fontSize:12,color:C.text,fontWeight:600}}>{fmtMB(files.reduce((s,f)=>s+f.size/1024/1024,0))}</div>
              </div>
              {videoFormat!=="original"&&<><div style={{color:C.textMuted}}>→</div>
              <div>
                <div style={{fontSize:10,color:C.textMuted,marginBottom:2}}>Est. output</div>
                <div style={{fontSize:12,color:C.teal,fontWeight:600}}>{fmtMB(estOutputMB)}</div>
              </div></>}
              <div style={{marginLeft:"auto",textAlign:"right"}}>
                <div style={{fontSize:10,color:C.textMuted,marginBottom:2}}>Encoding</div>
                <div style={{fontSize:11,color:C.cyan,fontWeight:600}}>AWS MediaConvert</div>
              </div>
            </div>}
          </>}

          {/* Version + Notes */}
          <div style={{display:"flex",gap:12}}>
            {(section==="post"||section==="video")&&(
              <div style={{flex:"0 0 110px"}}>
                <label style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>Version</label>
                <input value={version} onChange={e=>setVersion(e.target.value)} placeholder="v01" style={iStyle}/>
              </div>
            )}
            <div style={{flex:1}}>
              <label style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>Notes</label>
              <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional notes…" style={iStyle}/>
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:10,padding:"14px 20px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <Btn variant="ghost" onClick={onClose} style={{opacity:isUploading?0.45:"",pointerEvents:isUploading?"none":""}}>Cancel</Btn>
          <Btn variant="cyan" onClick={doUpload} style={{opacity:files.length&&!isUploading?1:0.45,pointerEvents:files.length&&!isUploading?"auto":"none"}}>
            {uploadLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── White Glove Setup Panel ──────────────────────────────────────────────────

function WhiteGlovePanel({allProjects,onSettings,onClose,onPreviewAsClient,initialProject,onProjectUpdate}){
  const clients=[...new Map(allProjects.filter(p=>p.client&&p.client!=="—").map(p=>[p.client,{name:p.client}])).values()];

  const DEFAULT_NAV=[
    {id:"home",sym:"⌂",label:"Home",visible:true},
    {id:"projects",sym:"◈",label:"Projects",visible:true},
    {id:"deliverables",sym:"▶",label:"Deliverables",visible:true},
    {id:"creative",sym:"✦",label:"Creative",visible:true},
    {id:"documents",sym:"▣",label:"Documents",visible:true},
    {id:"messages",sym:"◉",label:"Messages",visible:true},
  ];
  const DEFAULTS={accentColor:"#5B7FFF",secondaryColor:"#22D48A",logoUrl:null,theme:"dark",bgImageUrl:null,bgImagePosition:"center center",bgVideoUrl:"",mainBgColor:"",mainBgImageUrl:null,mainBgImagePosition:"center center",portalHeadline:"",welcomeMessage:"",showStatsCards:true,navItems:DEFAULT_NAV,defaultView:"grid",cardShowDates:true,cardShowProducer:true,cardShowStatus:true};

  const loadSt=(key)=>{try{return JSON.parse(localStorage.getItem("framex_wg_settings")||"{}")[key]||{};}catch{return{};}};

  const [clientKey,setClientKey]=useState(()=>initialProject?.client||clients[0]?.name||"");
  const [s,setS]=useState(()=>({...DEFAULTS,...loadSt(initialProject?.client||clients[0]?.name||"")}));
  const [sec,setSec]=useState("branding");
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    const loaded={...DEFAULTS,...loadSt(clientKey)};
    setS(loaded);
    onSettings(clientKey,loaded);
  },[clientKey]);

  const clientProjects=allProjects.filter(p=>p.client===clientKey);
  const clientUser=DEMO_USERS.find(u=>u.company===clientKey);

  const upd=(k,v)=>{const next={...s,[k]:v};setS(next);onSettings(clientKey,next);};

  const save=()=>{
    let all={};try{all=JSON.parse(localStorage.getItem("framex_wg_settings")||"{}");}catch{}
    all[clientKey]=s;localStorage.setItem("framex_wg_settings",JSON.stringify(all));
    setSaved(true);setTimeout(()=>setSaved(false),2200);
  };

  const pickImg=(key)=>{
    const fi=document.createElement("input");fi.type="file";fi.accept="image/*";
    fi.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>upd(key,ev.target.result);r.readAsDataURL(f);};
    fi.click();
  };

  const SWATCHES=["#5B7FFF","#22D48A","#FF5500","#FFD600","#FF3D3D","#B57BFF","#00FFB8","#FF6EC7","#00C2FF"];
  const navItems=s.navItems||DEFAULT_NAV;
  const setNavItem=(id,k,v)=>upd("navItems",navItems.map(n=>n.id===id?{...n,[k]:v}:n));
  const moveNav=(id,dir)=>{const arr=[...navItems];const i=arr.findIndex(n=>n.id===id);if(i+dir<0||i+dir>=arr.length)return;[arr[i],arr[i+dir]]=[arr[i+dir],arr[i]];upd("navItems",arr);};

  const fld={width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,padding:"7px 10px",fontSize:12,boxSizing:"border-box",outline:"none",fontFamily:"inherit"};
  const lbl={fontSize:9,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,display:"block"};
  const row={marginBottom:18};

  const Toggle=({val,onChange,label})=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:7}}>
      <span style={{fontSize:12,color:C.text}}>{label}</span>
      <div onClick={()=>onChange(!val)} style={{width:36,height:20,borderRadius:10,background:val?C.green:"#282830",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
        <div style={{position:"absolute",top:2,left:val?17:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
      </div>
    </div>
  );

  const SECS=[{id:"branding",icon:"🎨",label:"Branding"},{id:"hero",icon:"🖼",label:"Hero"},{id:"nav",icon:"◈",label:"Nav"},{id:"cards",icon:"◻",label:"Cards"},{id:"access",icon:"🔑",label:"Access"}];

  return (
    <div style={{position:"fixed",inset:0,zIndex:1100,display:"flex",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.52)",backdropFilter:"blur(3px)"}}/>
      <div style={{position:"relative",width:540,background:C.surface,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100%",boxShadow:"-16px 0 60px rgba(0,0,0,0.8)"}}>

        {/* Header */}
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{fontSize:15,fontWeight:800,color:C.text,letterSpacing:"-0.02em"}}>⚙ White Glove Setup</span>
            <div style={{marginLeft:"auto",display:"flex",gap:8}}>
              <button onClick={save} style={{background:saved?C.greenLow:C.green,border:`1px solid ${saved?"transparent":C.green}`,borderRadius:6,padding:"5px 14px",color:saved?C.green:"#000",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>
                {saved?"✓ Saved":"Save Settings"}
              </button>
              <button onClick={onClose} style={{background:"none",border:`1px solid ${C.border}`,color:C.textSec,cursor:"pointer",borderRadius:6,padding:"5px 10px",fontSize:13}}>✕</button>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",flexShrink:0}}>Client</span>
            <select value={clientKey} onChange={e=>setClientKey(e.target.value)}
              style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:6,color:C.text,padding:"5px 8px",fontSize:12,outline:"none"}}>
              {clients.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}
              {clients.length===0&&<option value="">No clients configured</option>}
            </select>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,flexShrink:0,background:C.bg}}>
          {SECS.map(t=>(
            <button key={t.id} onClick={()=>setSec(t.id)} style={{flex:1,padding:"9px 4px",background:"none",border:"none",borderBottom:`2px solid ${sec===t.id?C.orange:"transparent"}`,color:sec===t.id?C.orange:C.textSec,cursor:"pointer",fontSize:10,fontWeight:sec===t.id?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"color 0.15s"}}>
              <span style={{fontSize:14}}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 22px"}}>

          {/* ── BRANDING ── */}
          {sec==="branding"&&<>
            <div style={row}>
              <span style={lbl}>Client Logo</span>
              <div onClick={()=>pickImg("logoUrl")} style={{height:68,background:C.card,border:`1px dashed ${C.border}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",transition:"border-color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.cyan}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                {s.logoUrl?<img src={s.logoUrl} alt="Logo" style={{maxHeight:"90%",maxWidth:"90%",objectFit:"contain"}}/>
                  :<span style={{fontSize:12,color:C.textMuted}}>Click to upload logo</span>}
              </div>
              {s.logoUrl&&<button onClick={()=>upd("logoUrl",null)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:10,marginTop:4,padding:0}}>✕ Remove logo</button>}
            </div>
            <div style={row}>
              <span style={lbl}>Primary Accent Color</span>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <input type="color" value={s.accentColor} onChange={e=>upd("accentColor",e.target.value)} style={{width:36,height:28,border:"none",background:"none",cursor:"pointer",padding:0}}/>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {SWATCHES.map(sw=>(
                    <div key={sw} onClick={()=>upd("accentColor",sw)} style={{width:22,height:22,borderRadius:5,background:sw,cursor:"pointer",border:`2px solid ${s.accentColor===sw?"#fff":"transparent"}`,boxSizing:"border-box",flexShrink:0}}/>
                  ))}
                </div>
                <code style={{fontSize:10,color:C.textMuted}}>{s.accentColor}</code>
              </div>
            </div>
            <div style={row}>
              <span style={lbl}>Secondary Color</span>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="color" value={s.secondaryColor} onChange={e=>upd("secondaryColor",e.target.value)} style={{width:36,height:28,border:"none",background:"none",cursor:"pointer",padding:0}}/>
                <code style={{fontSize:10,color:C.textMuted}}>{s.secondaryColor}</code>
              </div>
            </div>
            <div style={row}>
              <span style={lbl}>Portal Theme</span>
              <div style={{display:"flex",gap:8}}>
                {[{val:"dark",label:"🌙 Dark"},{val:"light",label:"☀️ Light"}].map(opt=>(
                  <button key={opt.val} onClick={()=>upd("theme",opt.val)} style={{flex:1,padding:"9px 0",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s",background:s.theme===opt.val?C.orange+"20":"none",border:`1.5px solid ${s.theme===opt.val?C.orange:C.border}`,color:s.theme===opt.val?C.orange:C.textSec}}>{opt.label}</button>
                ))}
              </div>
            </div>
          </>}

          {/* ── HERO ── */}
          {sec==="hero"&&<>
            <div style={row}>
              <span style={lbl}>Background Image</span>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div onClick={()=>pickImg("bgImageUrl")} style={{flex:1,height:90,background:s.bgImageUrl?`url(${s.bgImageUrl}) ${s.bgImagePosition||"center center"}/cover`:C.card,border:`1px dashed ${C.border}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",transition:"border-color 0.15s",position:"relative"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.cyan}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  {!s.bgImageUrl&&<span style={{fontSize:12,color:C.textMuted}}>Click to upload</span>}
                  {s.bgImageUrl&&<div style={{position:"absolute",bottom:5,right:7,background:"rgba(0,0,0,0.6)",borderRadius:4,padding:"2px 7px",fontSize:10,color:"rgba(255,255,255,0.6)"}}>click to replace</div>}
                </div>
                {s.bgImageUrl&&<div style={{flexShrink:0}}>
                  <div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Focus</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,26px)",gridTemplateRows:"repeat(3,26px)",gap:3}}>
                    {[["left top","center top","right top"],["left center","center center","right center"],["left bottom","center bottom","right bottom"]].map(row=>row.map(pos=>(
                      <div key={pos} onClick={()=>upd("bgImagePosition",pos)} title={pos}
                        style={{borderRadius:5,background:(s.bgImagePosition||"center center")===pos?C.cyan+"28":C.card,border:`1.5px solid ${(s.bgImagePosition||"center center")===pos?C.cyan:C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.12s"}}>
                        <div style={{width:5,height:5,borderRadius:"50%",background:(s.bgImagePosition||"center center")===pos?C.cyan:"#3A3A5A"}}/>
                      </div>
                    )))}
                  </div>
                </div>}
              </div>
              {s.bgImageUrl&&<button onClick={()=>upd("bgImageUrl",null)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:10,marginTop:4,padding:0}}>✕ Remove image</button>}
            </div>
            <div style={row}>
              <span style={lbl}>Background Video URL <span style={{fontWeight:400,textTransform:"none",letterSpacing:0,opacity:0.6}}>(.mp4 or .webm, autoplays muted)</span></span>
              <input value={s.bgVideoUrl} onChange={e=>upd("bgVideoUrl",e.target.value)} placeholder="https://cdn.example.com/reel.mp4" style={fld}/>
              {s.bgVideoUrl&&<button onClick={()=>upd("bgVideoUrl","")} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:10,marginTop:4,padding:0}}>✕ Clear</button>}
            </div>
            <div style={{margin:"20px 0 12px",paddingTop:16,borderTop:`1px solid ${C.border}`}}>
              <span style={{...lbl,color:C.textMuted,letterSpacing:"0.08em"}}>MAIN CONTENT AREA</span>
            </div>
            <div style={row}>
              <span style={lbl}>Page Background Color</span>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="color" value={s.mainBgColor||"#06060F"} onChange={e=>upd("mainBgColor",e.target.value)} style={{width:36,height:28,border:"none",background:"none",cursor:"pointer",padding:0}}/>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {["","#06060F","#0A0A1A","#0F0F1E","#111827","#0D1117","#1A1A2E","#F5F5F7","#FFFFFF"].map(sw=>(
                    <div key={sw} onClick={()=>upd("mainBgColor",sw)} title={sw||"Default"} style={{width:22,height:22,borderRadius:5,background:sw||C.bg,cursor:"pointer",border:`2px solid ${(s.mainBgColor||"")===sw?"#fff":"rgba(255,255,255,0.15)"}`,boxSizing:"border-box",flexShrink:0}}/>
                  ))}
                </div>
                {s.mainBgColor&&<button onClick={()=>upd("mainBgColor","")} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:10,padding:0}}>✕ Reset</button>}
              </div>
            </div>
            <div style={row}>
              <span style={lbl}>Page Background Image</span>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div onClick={()=>pickImg("mainBgImageUrl")} style={{flex:1,height:90,background:s.mainBgImageUrl?`url(${s.mainBgImageUrl}) ${s.mainBgImagePosition||"center center"}/cover`:C.card,border:`1px dashed ${C.border}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",transition:"border-color 0.15s",position:"relative"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.cyan}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  {!s.mainBgImageUrl&&<span style={{fontSize:12,color:C.textMuted}}>Click to upload</span>}
                  {s.mainBgImageUrl&&<div style={{position:"absolute",bottom:5,right:7,background:"rgba(0,0,0,0.6)",borderRadius:4,padding:"2px 7px",fontSize:10,color:"rgba(255,255,255,0.6)"}}>click to replace</div>}
                </div>
                {s.mainBgImageUrl&&<div style={{flexShrink:0}}>
                  <div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Focus</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,26px)",gridTemplateRows:"repeat(3,26px)",gap:3}}>
                    {[["left top","center top","right top"],["left center","center center","right center"],["left bottom","center bottom","right bottom"]].map(row=>row.map(pos=>(
                      <div key={pos} onClick={()=>upd("mainBgImagePosition",pos)} title={pos}
                        style={{borderRadius:5,background:(s.mainBgImagePosition||"center center")===pos?C.cyan+"28":C.card,border:`1.5px solid ${(s.mainBgImagePosition||"center center")===pos?C.cyan:C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.12s"}}>
                        <div style={{width:5,height:5,borderRadius:"50%",background:(s.mainBgImagePosition||"center center")===pos?C.cyan:"#3A3A5A"}}/>
                      </div>
                    )))}
                  </div>
                </div>}
              </div>
              {s.mainBgImageUrl&&<button onClick={()=>upd("mainBgImageUrl",null)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:10,marginTop:4,padding:0}}>✕ Remove image</button>}
            </div>
            <div style={{margin:"20px 0 12px",paddingTop:16,borderTop:`1px solid ${C.border}`}}>
              <span style={{...lbl,color:C.textMuted,letterSpacing:"0.08em"}}>HERO TEXT</span>
            </div>
            <div style={row}>
              <span style={lbl}>Portal Headline</span>
              <input value={s.portalHeadline} onChange={e=>upd("portalHeadline",e.target.value)} placeholder="MOTION ADRENALINE · CLIENT PORTAL" style={fld}/>
            </div>
            <div style={row}>
              <span style={lbl}>Welcome Message</span>
              <textarea value={s.welcomeMessage} onChange={e=>upd("welcomeMessage",e.target.value)} rows={2} placeholder="Your projects, deliverables and reviews — all in one place." style={{...fld,resize:"vertical"}}/>
            </div>
          </>}

          {/* ── NAVIGATION ── */}
          {sec==="nav"&&<>
            <p style={{fontSize:11,color:C.textMuted,marginBottom:16,lineHeight:1.5}}>Control which items appear in the client portal nav. Toggle, rename, and reorder.</p>
            {navItems.map((item,idx)=>(
              <div key={item.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:C.textMuted,fontSize:13,flexShrink:0,cursor:"default"}}>⠿</span>
                <div onClick={()=>setNavItem(item.id,"visible",!(item.visible!==false))} style={{width:32,height:18,borderRadius:9,background:item.visible!==false?C.green:"#282830",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                  <div style={{position:"absolute",top:1,left:item.visible!==false?15:1,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                </div>
                <input value={item.sym} onChange={e=>setNavItem(item.id,"sym",e.target.value.slice(-2))} style={{...fld,width:34,textAlign:"center",padding:"4px 2px"}}/>
                <input value={item.label} onChange={e=>setNavItem(item.id,"label",e.target.value)} style={{...fld,flex:1,padding:"5px 8px"}}/>
                <div style={{display:"flex",flexDirection:"column",gap:1}}>
                  <button onClick={()=>moveNav(item.id,-1)} disabled={idx===0} style={{background:"none",border:"none",color:idx===0?C.textMuted:C.textSec,cursor:idx===0?"default":"pointer",padding:"1px 5px",fontSize:10,lineHeight:1}}>▲</button>
                  <button onClick={()=>moveNav(item.id,1)} disabled={idx===navItems.length-1} style={{background:"none",border:"none",color:idx===navItems.length-1?C.textMuted:C.textSec,cursor:idx===navItems.length-1?"default":"pointer",padding:"1px 5px",fontSize:10,lineHeight:1}}>▼</button>
                </div>
                {item.custom&&<button onClick={()=>upd("navItems",navItems.filter(n=>n.id!==item.id))} style={{background:"none",border:"none",color:C.red,cursor:"pointer",padding:"2px 4px",fontSize:11,flexShrink:0}}>✕</button>}
              </div>
            ))}
            <button onClick={()=>upd("navItems",[...navItems,{id:`custom_${Date.now()}`,sym:"★",label:"Custom",visible:true,custom:true}])}
              style={{width:"100%",marginTop:8,background:"none",border:`1px dashed ${C.border}`,borderRadius:8,padding:"10px",color:C.textSec,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"border-color 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.cyan}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              + Add Custom Nav Item
            </button>
          </>}

          {/* ── CARDS ── */}
          {sec==="cards"&&<>
            <div style={row}>
              <span style={lbl}>Default Project View</span>
              <div style={{display:"flex",gap:8}}>
                {[{val:"grid",label:"⊞ Grid"},{val:"list",label:"☰ List"}].map(opt=>(
                  <button key={opt.val} onClick={()=>upd("defaultView",opt.val)} style={{flex:1,padding:"9px 0",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s",background:s.defaultView===opt.val?C.orange+"20":"none",border:`1.5px solid ${s.defaultView===opt.val?C.orange:C.border}`,color:s.defaultView===opt.val?C.orange:C.textSec}}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div style={{...row,marginTop:16}}>
              <span style={lbl}>Show on Project Cards</span>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <Toggle val={s.cardShowDates!==false} onChange={v=>upd("cardShowDates",v)} label="Start & Delivery Dates"/>
                <Toggle val={s.cardShowProducer!==false} onChange={v=>upd("cardShowProducer",v)} label="Lead Producer Name"/>
                <Toggle val={s.cardShowStatus!==false} onChange={v=>upd("cardShowStatus",v)} label="Project Status Pill"/>
              </div>
            </div>
            {clientProjects.length>0&&<div style={row}>
              <span style={lbl}>Per-Project Hero Images</span>
              {clientProjects.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",marginBottom:6}}>
                  <div style={{width:58,height:36,borderRadius:6,overflow:"hidden",background:p.portalSettings?.bgImageUrl?`url(${p.portalSettings.bgImageUrl}) center/cover`:C.bg,border:`1px solid ${C.border}`,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</div>
                    <div style={{fontSize:10,color:C.textMuted}}>{p.status}</div>
                  </div>
                  <button onClick={()=>{
                    const fi=document.createElement("input");fi.type="file";fi.accept="image/*";
                    fi.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{onProjectUpdate&&onProjectUpdate({...p,portalSettings:{...(p.portalSettings||{}),bgImageUrl:ev.target.result}});};r.readAsDataURL(f);};
                    fi.click();
                  }} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",color:C.textSec,cursor:"pointer",fontSize:10,flexShrink:0,whiteSpace:"nowrap"}}>⬆ Hero</button>
                </div>
              ))}
            </div>}
          </>}

          {/* ── ACCESS ── */}
          {sec==="access"&&<>
            {clientUser&&<div style={row}>
              <span style={lbl}>Client Login Credentials</span>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
                {[{label:"Email",val:clientUser.email},{label:"Password",val:clientUser.password}].map((f,fi)=>(
                  <div key={f.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:fi===0?12:0}}>
                    <div>
                      <div style={{fontSize:10,color:C.textMuted,marginBottom:2}}>{f.label}</div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:"monospace"}}>{f.val}</div>
                    </div>
                    <button onClick={()=>navigator.clipboard?.writeText(f.val)} style={{background:"none",border:`1px solid ${C.border}`,color:C.textSec,cursor:"pointer",borderRadius:5,padding:"4px 10px",fontSize:10}}>Copy</button>
                  </div>
                ))}
              </div>
            </div>}
            <div style={row}>
              <span style={lbl}>Portal URL</span>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 10px",fontSize:11,color:C.textSec,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{window.location.origin}</div>
                <button onClick={()=>navigator.clipboard?.writeText(window.location.origin)} style={{background:C.card,border:`1px solid ${C.border}`,color:C.textSec,cursor:"pointer",borderRadius:7,padding:"7px 12px",fontSize:11,flexShrink:0}}>Copy</button>
              </div>
            </div>
            {clientUser&&<div style={row}>
              <button onClick={()=>{
                const body=`Hi ${clientUser.name},\n\nYour client portal is ready.\n\nPortal: ${window.location.origin}\nEmail: ${clientUser.email}\nPassword: ${clientUser.password}\n\nMotion Adrenaline`;
                window.open(`mailto:${clientUser.email}?subject=Your Client Portal Access&body=${encodeURIComponent(body)}`);
              }} style={{width:"100%",background:C.cyanLow,border:`1px solid ${C.cyan}40`,borderRadius:8,padding:"11px",color:C.cyan,fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:10}}>
                ✉ Send Login Email to {clientUser.email}
              </button>
              <button onClick={()=>{onPreviewAsClient&&onPreviewAsClient(clientUser);onClose();}} style={{width:"100%",background:C.orange+"18",border:`1px solid ${C.orange}40`,borderRadius:8,padding:"11px",color:C.orange,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                👁 Preview Portal as {clientUser.name}
              </button>
            </div>}
            {!clientUser&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px",color:C.textMuted,fontSize:12,lineHeight:1.5}}>
              No client account found for "{clientKey}". Add a DEMO_USERS entry with company="{clientKey}" to enable credentials and portal preview.
            </div>}
          </>}
        </div>
      </div>
    </div>
  );
}

// ─── Documents Panel ──────────────────────────────────────────────────────────

function DocumentsPanel({docs,onUpdate,isClient,canApprove}){
  const [esigModal,setEsigModal]=useState(null);
  const [esigName,setEsigName]=useState("");
  const [previewEntry,setPreviewEntry]=useState(null);
  const cats=[
    {id:"contracts",label:"Contracts",icon:"📝",color:C.cyan},
    {id:"budgets",label:"Budgets",icon:"💰",color:C.green,hideFromClient:true},
    {id:"estimates",label:"Estimates",icon:"📊",color:C.yellow},
    {id:"invoices",label:"Invoices",icon:"🧾",color:C.orange},
    {id:"schedules",label:"Schedules",icon:"📅",color:C.purple},
  ];
  const visibleCats=isClient?cats.filter(c=>!c.hideFromClient):cats;

  const [uploading,setUploading]=useState(0);
  const updateDocStatus=(cat,id,status)=>onUpdate({...docs,[cat]:docs[cat].map(d=>d.id===id?{...d,status}:d)});
  const deleteDoc=(cat,id)=>onUpdate({...docs,[cat]:(docs[cat]||[]).filter(d=>d.id!==id)});
  const addDoc=async(cat,file)=>{
    setUploading(n=>n+1);
    try{
      const previewUrl=await uploadFile(file,`documents/${cat}`);
      const nd={id:`doc${Date.now()}`,name:file.name,status:"pending",uploader:"You",date:new Date().toISOString().slice(0,10),shared:false,esig:false,mimeType:file.type,previewUrl};
      onUpdate({...docs,[cat]:[...(docs[cat]||[]),nd]});
    }finally{setUploading(n=>n-1);}
  };
  const signDoc=()=>{
    if(!esigName.trim())return;
    updateDocStatus(esigModal.cat,esigModal.id,"signed");
    setEsigModal(null);setEsigName("");
  };
  const toggleShared=(cat,id)=>onUpdate({...docs,[cat]:docs[cat].map(d=>d.id===id?{...d,shared:!d.shared}:d)});
  const handleAnnotate=(action)=>{
    const cat=previewEntry?._cat;
    if(!cat)return;
    let anns;
    if(action.type==="add")anns=[...(previewEntry.annotations||[]),action.ann];
    else if(action.type==="reply")anns=(previewEntry.annotations||[]).map(a=>a.id===action.pinId?{...a,replies:[...(a.replies||[]),action.reply]}:a);
    else if(action.type==="resolve")anns=(previewEntry.annotations||[]).map(a=>a.id===action.pinId?{...a,resolved:true}:a);
    else return;
    setPreviewEntry(prev=>({...prev,annotations:anns}));
    onUpdate({...docs,[cat]:docs[cat].map(d=>d.id===previewEntry.id?{...d,annotations:anns}:d)});
  };

  const totalDocs=visibleCats.reduce((n,c)=>(docs[c.id]||[]).length+n,0);
  const [viewMode,setViewMode]=useViewPref("framex_view_documents");

  return <div>
    {uploading>0&&<div style={{background:C.cyan+"15",border:`1px solid ${C.cyan}30`,borderRadius:6,padding:"7px 14px",marginBottom:14,fontSize:11,color:C.cyan}}>⬆ Uploading {uploading} file{uploading>1?"s":""}…</div>}
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><ViewToggle value={viewMode} onChange={setViewMode}/></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
      {visibleCats.map(cat=>{
        const items=docs[cat.id]||[];
        return <div key={cat.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:16,marginBottom:4}}>{cat.icon}</div>
          <div style={{fontSize:10,color:C.textMuted,marginBottom:2}}>{cat.label}</div>
          <div style={{fontSize:20,fontWeight:700,color:cat.color}}>{items.length}</div>
        </div>;
      })}
    </div>

    {visibleCats.map(cat=>{
      const items=(docs[cat.id]||[]).filter(d=>isClient?d.shared:true);
      return <div key={cat.id} style={{marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:11,fontWeight:700,color:cat.color,textTransform:"uppercase",letterSpacing:"0.08em"}}>{cat.icon} {cat.label}</span>
          {!isClient&&<DropZone onFiles={fs=>fs.forEach(f=>addDoc(cat.id,f))} accept="*" label={`Drop ${cat.label.toLowerCase()}`} color={cat.color} compact/>}
        </div>
        {items.length===0&&<p style={{color:C.textMuted,fontSize:12,padding:"8px 0"}}>No {cat.label.toLowerCase()} yet.</p>}
        {viewMode==="grid"
          ?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:4}}>
            {items.map(doc=>(
              <MediaCard key={doc.id} item={doc}
                onPreview={()=>setPreviewEntry({...doc,_cat:cat.id})}
                onApprove={canApprove&&doc.status!=="approved"?()=>updateDocStatus(cat.id,doc.id,"approved"):undefined}
                onReject={canApprove&&doc.status!=="changes"?()=>updateDocStatus(cat.id,doc.id,"changes"):undefined}
                canApprove={canApprove}
                onDelete={!isClient?()=>deleteDoc(cat.id,doc.id):undefined}
                fallbackIcon={cat.icon}/>
            ))}
          </div>
          :<div>
            {items.map(doc=>(
              <div key={doc.id} onClick={()=>setPreviewEntry({...doc,_cat:cat.id})}
                style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"border-color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.border+"99"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <FileIcon name={doc.name} mimeType={doc.mimeType||""} previewUrl={doc.previewUrl} size={36} fallback={cat.icon}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
                  <div style={{fontSize:10,color:C.textMuted}}>{doc.uploader} · {doc.date}{doc.shared&&!isClient?<span style={{color:C.green,marginLeft:8}}>● Shared with client</span>:null}</div>
                </div>
                <Badge status={doc.status} small/>
                {!isClient&&<button onClick={e=>{e.stopPropagation();toggleShared(cat.id,doc.id);}} style={{background:doc.shared?C.greenLow:"#1E1E28",border:`1px solid ${doc.shared?C.green+"50":C.border}`,color:doc.shared?C.green:C.textMuted,borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:10,whiteSpace:"nowrap"}}>{doc.shared?"👁 Shared":"Share"}</button>}
                {cat.id==="contracts"&&doc.status!=="signed"&&<Btn variant="cyan" onClick={e=>{e.stopPropagation();setEsigModal({...doc,cat:cat.id});}} style={{fontSize:10,padding:"4px 10px"}}>✍ Sign</Btn>}
                {canApprove&&doc.status==="pending"&&<Btn variant="green" onClick={e=>{e.stopPropagation();updateDocStatus(cat.id,doc.id,"approved");}} style={{fontSize:10,padding:"4px 8px"}}>✓</Btn>}
                {doc.previewUrl&&<span style={{fontSize:10,color:C.textMuted,flexShrink:0}}>👁</span>}
                {!isClient&&<span onClick={e=>e.stopPropagation()}><DeleteBtn small onConfirm={()=>deleteDoc(cat.id,doc.id)}/></span>}
              </div>
            ))}
          </div>
        }
      </div>;
    })}

    {previewEntry&&<PreviewModal entry={previewEntry} onClose={()=>setPreviewEntry(null)}
      onAnnotate={detectPreviewType(previewEntry.name,previewEntry.mimeType||"")==="pdf"?handleAnnotate:undefined}
      entryStatus={previewEntry.status}
      onApprove={canApprove&&previewEntry.status!=="approved"?()=>{updateDocStatus(previewEntry._cat,previewEntry.id,"approved");setPreviewEntry(p=>({...p,status:"approved"}));}:undefined}
      onRequestChanges={canApprove&&previewEntry.status!=="changes"?()=>{updateDocStatus(previewEntry._cat,previewEntry.id,"changes");setPreviewEntry(p=>({...p,status:"changes"}));}:undefined}
    />}
    {esigModal&&<Modal title="✍ E-Signature" onClose={()=>setEsigModal(null)}>
      <p style={{color:C.textSec,fontSize:13,marginBottom:16}}>Signing: <strong style={{color:C.text}}>{esigModal.name}</strong></p>
      <Input label="Type your full name to sign" value={esigName} onChange={e=>setEsigName(e.target.value)} placeholder="Your full legal name"/>
      <div style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:14,marginBottom:16,fontFamily:"cursive",fontSize:22,color:C.cyan,minHeight:50}}>{esigName||<span style={{color:C.textMuted,fontFamily:"'Inter',sans-serif",fontSize:13}}>Signature will appear here</span>}</div>
      <p style={{fontSize:11,color:C.textMuted,marginBottom:16}}>By clicking Sign, you agree this constitutes a legally binding electronic signature.</p>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <Btn variant="ghost" onClick={()=>setEsigModal(null)}>Cancel</Btn>
        <Btn variant="cyan" onClick={signDoc} disabled={!esigName.trim()}>✍ Sign Document</Btn>
      </div>
    </Modal>}
  </div>;
}

// ─── Creative Panel ───────────────────────────────────────────────────────────

function CreativePanel({creative,onUpdate,isClient,canApprove}){
  const cats=[
    {id:"pitchDecks",label:"Pitch Decks",icon:"🎯",color:C.orange},
    {id:"moodBoards",label:"Mood Boards",icon:"🎨",color:C.purple},
    {id:"locationScouts",label:"Location Scouts",icon:"📍",color:C.teal},
    {id:"storyboards",label:"Storyboards",icon:"📋",color:C.cyan},
  ];
  const [uploading,setUploading]=useState(0);
  const addItem=async(cat,file)=>{
    setUploading(n=>n+1);
    try{
      const previewUrl=await uploadFile(file,`creative/${cat}`);
      const item={id:`cr${Date.now()}`,name:file.name,status:"pending",shared:false,uploader:"You",mimeType:file.type,previewUrl};
      onUpdate({...creative,[cat]:[...(creative[cat]||[]),item]});
    }finally{setUploading(n=>n-1);}
  };
  const updateStatus=(cat,id,status)=>onUpdate({...creative,[cat]:creative[cat].map(i=>i.id===id?{...i,status}:i)});
  const toggleShared=(cat,id)=>onUpdate({...creative,[cat]:creative[cat].map(i=>i.id===id?{...i,shared:!i.shared}:i)});
  const deleteCreative=(cat,id)=>onUpdate({...creative,[cat]:(creative[cat]||[]).filter(i=>i.id!==id)});
  const addComment=(cat,id,text)=>{
    const comment={id:`cmt${Date.now()}`,author:"You",text,date:new Date().toISOString().slice(0,10),resolved:false};
    onUpdate({...creative,[cat]:creative[cat].map(i=>i.id===id?{...i,comments:[...(i.comments||[]),comment]}:i)});
  };
  const [commentInputs,setCommentInputs]=useState({});
  const [previewEntry,setPreviewEntry]=useState(null);
  const [viewMode,setViewMode]=useViewPref("framex_view_creative");

  return <div>
    {uploading>0&&<div style={{background:C.cyan+"15",border:`1px solid ${C.cyan}30`,borderRadius:6,padding:"7px 14px",marginBottom:14,fontSize:11,color:C.cyan}}>⬆ Uploading {uploading} file{uploading>1?"s":""}…</div>}
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><ViewToggle value={viewMode} onChange={setViewMode}/></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
      {cats.map(cat=>{
        const items=creative[cat.id]||[];
        const approved=items.filter(i=>i.status==="approved").length;
        return <div key={cat.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:16,marginBottom:4}}>{cat.icon}</div>
          <div style={{fontSize:10,color:C.textMuted}}>{cat.label}</div>
          <div style={{fontSize:20,fontWeight:700,color:cat.color}}>{items.length}</div>
          <div style={{fontSize:10,color:C.green,marginTop:2}}>{approved} approved</div>
        </div>;
      })}
    </div>

    {cats.map(cat=>{
      const items=(creative[cat.id]||[]).filter(i=>isClient?i.shared:true);
      return <div key={cat.id} style={{marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:700,color:cat.color,textTransform:"uppercase",letterSpacing:"0.08em"}}>{cat.icon} {cat.label}</span>
          {!isClient&&<DropZone onFiles={fs=>fs.forEach(f=>addItem(cat.id,f))} accept="*" label={`Add ${cat.label}`} color={cat.color} compact/>}
        </div>
        {items.length===0&&<p style={{color:C.textMuted,fontSize:12,padding:"6px 0 12px"}}>No {cat.label.toLowerCase()} yet.</p>}
        {viewMode==="grid"
          ?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:4}}>
            {items.map(item=>(
              <MediaCard key={item.id} item={item}
                onPreview={()=>setPreviewEntry(item)}
                onApprove={canApprove&&item.status!=="approved"?()=>updateStatus(cat.id,item.id,"approved"):undefined}
                onReject={canApprove&&item.status!=="changes"?()=>updateStatus(cat.id,item.id,"changes"):undefined}
                canApprove={canApprove}
                onDelete={!isClient?()=>deleteCreative(cat.id,item.id):undefined}
                fallbackIcon={cat.icon}/>
            ))}
          </div>
          :<div>
            {items.map(item=>{
              const ck=`${cat.id}_${item.id}`;
              return <div key={item.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <FileIcon name={item.name} mimeType={item.mimeType||""} previewUrl={item.previewUrl} size={28} fallback={cat.icon}/>
                  <span style={{fontSize:12,fontWeight:600,color:C.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:item.previewUrl?"pointer":"default"}} onClick={()=>item.previewUrl&&setPreviewEntry(item)}>{item.name}</span>
                  {item.previewUrl&&<Btn variant="ghost" onClick={()=>setPreviewEntry(item)} style={{fontSize:10,padding:"4px 8px"}}>👁</Btn>}
                  <Badge status={item.status} small/>
                  {!isClient&&<button onClick={()=>toggleShared(cat.id,item.id)} style={{background:item.shared?C.greenLow:"#1E1E28",border:`1px solid ${item.shared?C.green+"50":C.border}`,color:item.shared?C.green:C.textMuted,borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:10}}>{item.shared?"👁 Shared":"Share"}</button>}
                  {canApprove&&<Btn variant="green" onClick={()=>updateStatus(cat.id,item.id,"approved")} style={{fontSize:10,padding:"4px 8px"}}>✓ Approve</Btn>}
                  {canApprove&&item.status!=="changes"&&<Btn variant="red" onClick={()=>updateStatus(cat.id,item.id,"changes")} style={{fontSize:10,padding:"4px 8px"}}>✗</Btn>}
                  {!isClient&&<DeleteBtn small onConfirm={()=>deleteCreative(cat.id,item.id)}/>}
                </div>
                {(item.comments||[]).map(c=>(
                  <div key={c.id} style={{display:"flex",gap:8,padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
                    <Avatar name={c.author} size={20}/>
                    <div><span style={{fontSize:11,fontWeight:600,color:C.textSec}}>{c.author}</span><span style={{fontSize:10,color:C.textMuted,marginLeft:6}}>{c.date}</span>
                    <p style={{margin:"2px 0 0",fontSize:12,color:C.textSec}}>{c.text}</p></div>
                  </div>
                ))}
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  <input value={commentInputs[ck]||""} onChange={e=>setCommentInputs(p=>({...p,[ck]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&commentInputs[ck]?.trim()){addComment(cat.id,item.id,commentInputs[ck]);setCommentInputs(p=>({...p,[ck]:""}));}}} placeholder="Add comment…" style={{flex:1,background:"#14141C",border:`1px solid ${C.border}`,borderRadius:5,padding:"6px 8px",color:C.text,fontSize:11,outline:"none"}}/>
                </div>
              </div>;
            })}
          </div>
        }
      </div>;
    })}
    {previewEntry&&<PreviewModal entry={previewEntry} onClose={()=>setPreviewEntry(null)}/>}
  </div>;
}

// ─── Call Sheets ─────────────────────────────────────────────────────────────

function CallSheetEditor({sheet,crew,talent,projectTitle,onUpdate,onBack,onDelete}){
  const upd=(k,v)=>onUpdate({[k]:v});
  const addBlock=()=>onUpdate({schedule:[...(sheet.schedule||[]),{id:`sb${Date.now()}`,time:"",scene:"",location:"",cast:"",notes:""}]});
  const updBlock=(id,k,v)=>onUpdate({schedule:sheet.schedule.map(b=>b.id===id?{...b,[k]:v}:b)});
  const delBlock=(id)=>onUpdate({schedule:sheet.schedule.filter(b=>b.id!==id)});
  const allPeople=[...crew.map(p=>({...p,ptype:"crew"})),...talent.map(p=>({...p,ptype:"talent"}))];
  const getCall=(pid)=>(sheet.calls||[]).find(c=>c.personId===pid)||null;
  const setCall=(pid,ptype,callTime)=>{
    const filtered=(sheet.calls||[]).filter(c=>c.personId!==pid);
    onUpdate({calls:callTime?[...filtered,{personId:pid,ptype,callTime}]:filtered});
  };
  const fld={background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:6,color:C.text,padding:"6px 9px",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box",width:"100%"};

  const [showSend,setShowSend]=useState(false);
  const [sendEmails,setSendEmails]=useState(()=>[...new Set([...crew.map(c=>c.email),...talent.map(t=>t.agentEmail)].filter(Boolean))]);
  const [customEmail,setCustomEmail]=useState("");
  const [sending,setSending]=useState(false);
  const [sendResult,setSendResult]=useState(null);

  const toggleEmail=(email)=>setSendEmails(prev=>prev.includes(email)?prev.filter(e=>e!==email):[...prev,email]);
  const addCustom=()=>{if(!customEmail.trim())return;setSendEmails(prev=>[...new Set([...prev,customEmail.trim()])]);setCustomEmail("");};

  const sendSheet=async()=>{
    if(!sendEmails.length)return;
    setSending(true);setSendResult(null);
    const callsWithNames=(sheet.calls||[]).map(c=>{
      const person=allPeople.find(p=>p.id===c.personId);
      return{...c,name:person?.name||c.personId};
    });
    try{
      const r=await fetch("/api/send-callsheet",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({sheet:{...sheet,calls:callsWithNames},recipients:sendEmails,projectTitle:projectTitle||"Production"}),
      });
      const d=await r.json();
      setSendResult(r.ok?{ok:true}:{ok:false,error:d.error});
    }catch(e){setSendResult({ok:false,error:e.message});}
    setSending(false);
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <button onClick={onBack} style={{background:"none",border:`1px solid ${C.border}`,color:C.textSec,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:12}}>← Call Sheets</button>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Btn variant="cyan" onClick={()=>{setShowSend(true);setSendResult(null);}} style={{fontSize:11,padding:"5px 12px"}}>📧 Send</Btn>
          <Btn variant="ghost" onClick={()=>window.print()} style={{fontSize:11,padding:"5px 10px"}}>🖨 Print</Btn>
          <DeleteBtn onConfirm={onDelete}/>
        </div>
      </div>

      {/* Send modal */}
      {showSend&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,width:"100%",maxWidth:480,padding:24}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <span style={{fontSize:15,fontWeight:700,color:C.text}}>📧 Send Call Sheet</span>
            <button onClick={()=>setShowSend(false)} style={{background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:18}}>✕</button>
          </div>
          <div style={{fontSize:11,color:C.textMuted,marginBottom:14}}>Select recipients — crew and talent emails are pre-loaded from their records.</div>

          {/* Crew emails */}
          {crew.filter(c=>c.email).length>0&&<>
            <div style={{fontSize:10,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Crew</div>
            {crew.filter(c=>c.email).map(c=>(
              <label key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:7,background:"#0F0F18",marginBottom:6,cursor:"pointer"}}>
                <input type="checkbox" checked={sendEmails.includes(c.email)} onChange={()=>toggleEmail(c.email)} style={{accentColor:C.cyan}}/>
                <Avatar name={c.name} size={22}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{c.name}</div>
                  <div style={{fontSize:10,color:C.textMuted}}>{c.email}</div>
                </div>
              </label>
            ))}
          </>}

          {/* Talent agent emails */}
          {talent.filter(t=>t.agentEmail).length>0&&<>
            <div style={{fontSize:10,fontWeight:700,color:C.pink,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,marginTop:12}}>Talent (via Agent)</div>
            {talent.filter(t=>t.agentEmail).map(t=>(
              <label key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:7,background:"#0F0F18",marginBottom:6,cursor:"pointer"}}>
                <input type="checkbox" checked={sendEmails.includes(t.agentEmail)} onChange={()=>toggleEmail(t.agentEmail)} style={{accentColor:C.cyan}}/>
                <Avatar name={t.name} size={22}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{t.name} <span style={{color:C.textMuted,fontWeight:400}}>via {t.agent}</span></div>
                  <div style={{fontSize:10,color:C.textMuted}}>{t.agentEmail}</div>
                </div>
              </label>
            ))}
          </>}

          {/* Custom email */}
          <div style={{marginTop:14,marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Add Email</div>
            <div style={{display:"flex",gap:8}}>
              <input value={customEmail} onChange={e=>setCustomEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addCustom()}
                placeholder="name@example.com" style={{...fld,flex:1}}/>
              <Btn variant="ghost" onClick={addCustom} style={{fontSize:11,padding:"6px 12px",flexShrink:0}}>Add</Btn>
            </div>
            {sendEmails.filter(e=>![...crew.map(c=>c.email),...talent.map(t=>t.agentEmail)].includes(e)).map(e=>(
              <div key={e} style={{display:"flex",alignItems:"center",gap:8,marginTop:6,fontSize:11,color:C.textSec}}>
                <span>✉ {e}</span>
                <button onClick={()=>setSendEmails(prev=>prev.filter(x=>x!==e))} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:12,padding:0}}>✕</button>
              </div>
            ))}
          </div>

          {sendResult&&(
            sendResult.ok
              ?<div style={{background:C.greenLow,border:`1px solid ${C.green}40`,borderRadius:7,padding:"10px 14px",marginBottom:14,fontSize:12,color:C.green}}>✓ Call sheet sent to {sendEmails.length} recipient{sendEmails.length!==1?"s":""}!</div>
              :<div style={{background:"#1A0A0A",border:`1px solid ${C.red}40`,borderRadius:7,padding:"10px 14px",marginBottom:14,fontSize:12,color:C.red}}>✗ {sendResult.error}</div>
          )}

          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="ghost" onClick={()=>setShowSend(false)}>Cancel</Btn>
            <Btn variant="cyan" onClick={sendSheet} disabled={!sendEmails.length||sending} style={{minWidth:120}}>
              {sending?"Sending…":`Send to ${sendEmails.length}`}
            </Btn>
          </div>
        </div>
      </div>}

      {/* Production info */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 20px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>📋 Production Info</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Shoot Date</label>
            <input type="date" value={sheet.date||""} onChange={e=>upd("date",e.target.value)} style={fld}/></div>
          <div><label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Director</label>
            <input value={sheet.director||""} onChange={e=>upd("director",e.target.value)} style={fld}/></div>
          <div><label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>DP / Cinematographer</label>
            <input value={sheet.dp||""} onChange={e=>upd("dp",e.target.value)} style={fld}/></div>
          <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Location / Address</label>
            <input value={sheet.location||""} onChange={e=>upd("location",e.target.value)} placeholder="Studio, address…" style={fld}/></div>
          <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Nearest Hospital</label>
            <input value={sheet.hospital||""} onChange={e=>upd("hospital",e.target.value)} placeholder="Name + address" style={fld}/></div>
        </div>
      </div>

      {/* Daily Schedule times */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 20px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>⏰ Daily Schedule</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[
            ["generalCall","Crew Call","🟡"],
            ["shootingCall","Shooting Call","🎬"],
            ["estLunch","Est. Lunch","🍽"],
            ["secondLunch","Second Lunch","🍽"],
            ["estWrap","Est. Wrap","🔴"],
          ].map(([k,label,icon])=>(
            <div key={k}>
              <label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>{icon} {label}</label>
              <input type="time" value={sheet[k]||""} onChange={e=>upd(k,e.target.value)} style={fld}/>
            </div>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 20px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>🌤 Weather</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <div><label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Condition</label>
            <input value={sheet.weatherCondition||""} onChange={e=>upd("weatherCondition",e.target.value)} placeholder="Sunny, Cloudy, Rain…" style={fld}/></div>
          <div><label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Temperature</label>
            <input value={sheet.weatherTemp||""} onChange={e=>upd("weatherTemp",e.target.value)} placeholder="72°F / 22°C" style={fld}/></div>
          <div><label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Weather Notes</label>
            <input value={sheet.weather||""} onChange={e=>upd("weather",e.target.value)} placeholder="Wind, UV index…" style={fld}/></div>
          <div><label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>🌅 Sunrise</label>
            <input type="time" value={sheet.sunrise||""} onChange={e=>upd("sunrise",e.target.value)} style={fld}/></div>
          <div><label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>🌇 Sunset</label>
            <input type="time" value={sheet.sunset||""} onChange={e=>upd("sunset",e.target.value)} style={fld}/></div>
        </div>
      </div>

      {/* Location & Parking Maps */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 20px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>🗺 Location & Parking Maps</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {[["locationMap","Location Map",C.cyan],["parkingMap","Parking Map",C.green]].map(([field,label,color])=>{
            const val=sheet[field];
            return <div key={field}>
              <label style={{fontSize:11,fontWeight:500,color:C.textSec,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>
              {val
                ? <a href={val.url||"#"} target="_blank" rel="noreferrer"
                    style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,color,background:color+"15",border:`1px solid ${color}30`,borderRadius:5,padding:"5px 10px",textDecoration:"none",maxWidth:"100%"}}>
                    📎 {val.name}
                    <button onClick={e=>{e.preventDefault();upd(field,null);}} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:12,marginLeft:4,padding:0}}>✕</button>
                  </a>
                : <label style={{display:"block",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:6,padding:"8px 12px",color:C.textMuted,fontSize:11,cursor:"pointer",textAlign:"center"}}>
                    📎 Attach {label}…
                    <input type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={async e=>{
                      if(!e.target.files[0])return;
                      const url=await uploadFile(e.target.files[0],`callsheets/maps`);
                      upd(field,{name:e.target.files[0].name,url});
                    }}/>
                  </label>
              }
            </div>;
          })}
        </div>
      </div>

      {/* Schedule */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 20px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <span style={{fontSize:10,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.1em"}}>Shoot Schedule</span>
          <Btn variant="ghost" onClick={addBlock} style={{fontSize:11,padding:"4px 10px"}}>+ Add Scene</Btn>
        </div>
        {(sheet.schedule||[]).length===0&&<p style={{color:C.textMuted,fontSize:12,textAlign:"center",padding:"14px 0"}}>No scenes yet.</p>}
        {(sheet.schedule||[]).length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"90px 1.2fr 1fr 1fr 1fr 24px",gap:5,marginBottom:6,padding:"0 2px"}}>
            {["Time","Scene","Location","Cast","Notes",""].map(h=>(
              <div key={h} style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</div>
            ))}
          </div>
        )}
        {(sheet.schedule||[]).map(block=>(
          <div key={block.id} style={{display:"grid",gridTemplateColumns:"90px 1.2fr 1fr 1fr 1fr 24px",gap:5,marginBottom:5}}>
            <input type="time" value={block.time} onChange={e=>updBlock(block.id,"time",e.target.value)} style={{...fld,width:"auto"}}/>
            <input value={block.scene} onChange={e=>updBlock(block.id,"scene",e.target.value)} placeholder="Scene" style={{...fld,width:"auto"}}/>
            <input value={block.location} onChange={e=>updBlock(block.id,"location",e.target.value)} placeholder="Location" style={{...fld,width:"auto"}}/>
            <input value={block.cast} onChange={e=>updBlock(block.id,"cast",e.target.value)} placeholder="Cast" style={{...fld,width:"auto"}}/>
            <input value={block.notes} onChange={e=>updBlock(block.id,"notes",e.target.value)} placeholder="Notes" style={{...fld,width:"auto"}}/>
            <button onClick={()=>delBlock(block.id)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:14,padding:0,alignSelf:"center"}}>✕</button>
          </div>
        ))}
      </div>

      {/* Call times */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 20px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontSize:10,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.1em"}}>👥 Individual Call Times</span>
          <div style={{display:"flex",gap:10,fontSize:10,color:C.textMuted}}>
            <span><span style={{color:C.green}}>●</span> Confirmed: {(sheet.calls||[]).filter(c=>c.confirmed).length}</span>
            <span><span style={{color:C.yellow}}>●</span> Pending: {(sheet.calls||[]).filter(c=>c.callTime&&!c.confirmed).length}</span>
          </div>
        </div>
        {allPeople.length===0&&<p style={{color:C.textMuted,fontSize:12}}>Add crew and talent first.</p>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {allPeople.map(person=>{
            const call=getCall(person.id);
            const toggleConfirm=()=>{
              onUpdate({calls:(sheet.calls||[]).map(c=>c.personId===person.id?{...c,confirmed:!c.confirmed}:c)});
            };
            return (
              <div key={person.id} style={{display:"flex",alignItems:"center",gap:10,background:"#0F0F18",border:`1px solid ${call?.confirmed?C.green+"50":C.border}`,borderRadius:8,padding:"10px 12px",transition:"border-color 0.2s"}}>
                <Avatar name={person.name} size={28}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{person.name}</div>
                  <div style={{fontSize:10,color:person.ptype==="talent"?C.pink:C.yellow}}>{person.role||person.ptype}</div>
                </div>
                <input type="time" value={call?.callTime||""} onChange={e=>setCall(person.id,person.ptype,e.target.value)}
                  style={{background:"#0D0D14",border:`1px solid ${call?.callTime?C.cyan+"60":C.border}`,borderRadius:6,color:call?.callTime?C.cyan:C.textMuted,padding:"5px 8px",fontSize:12,fontWeight:call?.callTime?700:400,outline:"none",width:90}}/>
                {call?.callTime&&(
                  <button onClick={toggleConfirm}
                    title={call.confirmed?"Confirmed — click to unconfirm":"Mark as confirmed"}
                    style={{background:call.confirmed?C.greenLow:"#1A1A24",border:`1px solid ${call.confirmed?C.green+"50":C.border}`,color:call.confirmed?C.green:C.textMuted,borderRadius:6,padding:"4px 9px",cursor:"pointer",fontSize:12,fontWeight:700,transition:"all 0.15s"}}>
                    {call.confirmed?"✓":"?"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 20px"}}>
        <label style={{fontSize:9,color:C.textMuted,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Additional Notes / Special Instructions</label>
        <textarea value={sheet.notes||""} onChange={e=>upd("notes",e.target.value)} rows={3}
          style={{background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:6,color:C.text,padding:"8px 10px",fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",width:"100%",fontFamily:"inherit"}}
          placeholder="Parking, catering, emergency info, dress code…"/>
      </div>
    </div>
  );
}

function CallSheetsView({crew,talent,callsheets,onUpdate,projectTitle}){
  const [selected,setSelected]=useState(null);
  const create=()=>{
    const id=`cs${Date.now()}`;
    const sheet={id,date:new Date().toISOString().slice(0,10),generalCall:"08:00",location:"",weather:"",director:"",dp:"",hospital:"",notes:"",schedule:[],calls:[]};
    onUpdate([...callsheets,sheet]);
    setSelected(id);
  };
  const deleteSheet=(id)=>{onUpdate(callsheets.filter(s=>s.id!==id));if(selected===id)setSelected(null);};
  const updateSheet=(id,changes)=>onUpdate(callsheets.map(s=>s.id===id?{...s,...changes}:s));

  if(selected){
    const sheet=callsheets.find(s=>s.id===selected);
    if(!sheet){setSelected(null);return null;}
    return <CallSheetEditor sheet={sheet} crew={crew} talent={talent} projectTitle={projectTitle}
      onUpdate={changes=>updateSheet(selected,changes)}
      onBack={()=>setSelected(null)}
      onDelete={()=>deleteSheet(selected)}/>;
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontSize:11,color:C.textMuted}}>{callsheets.length} call sheet{callsheets.length!==1?"s":""}</span>
        <Btn variant="cyan" onClick={create} style={{fontSize:11,padding:"5px 14px"}}>+ New Call Sheet</Btn>
      </div>
      {callsheets.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0",color:C.textMuted}}>
          <div style={{fontSize:44,marginBottom:14,opacity:0.4}}>📋</div>
          <div style={{fontSize:14,color:C.textSec,marginBottom:6}}>No call sheets yet.</div>
          <div style={{fontSize:12}}>Create one to manage crew call times and shoot schedules.</div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {callsheets.map(sheet=>{
          const crewWithCalls=(sheet.calls||[]).length;
          const sceneCount=(sheet.schedule||[]).length;
          return (
            <div key={sheet.id} onClick={()=>setSelected(sheet.id)}
              style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 18px",cursor:"pointer",transition:"border-color 0.15s,transform 0.15s",transform:"none"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.cyan+"60";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.text}}>{sheet.date||"Date TBD"}</div>
                  <div style={{fontSize:11,color:C.textMuted,marginTop:3}}>General Call: <span style={{color:C.cyan,fontWeight:700}}>{sheet.generalCall||"—"}</span></div>
                </div>
                <span onClick={e=>{e.stopPropagation();deleteSheet(sheet.id);}} style={{color:C.textMuted,cursor:"pointer",fontSize:14,padding:"2px 4px"}}>🗑</span>
              </div>
              {sheet.location&&<div style={{fontSize:11,color:C.textSec,marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {sheet.location}</div>}
              <div style={{display:"flex",gap:12,fontSize:10,color:C.textMuted,borderTop:`1px solid ${C.border}`,paddingTop:10,marginTop:8}}>
                <span>📋 {sceneCount} scene{sceneCount!==1?"s":""}</span>
                <span>👥 {crewWithCalls} call time{crewWithCalls!==1?"s":""} set</span>
                {sheet.weather&&<span>🌤 {sheet.weather}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Crew & Talent Panel ──────────────────────────────────────────────────────

function CrewPanel({crew,talent,callsheets,onUpdateCrew,onUpdateTalent,onUpdateCallsheets,isClient,projectTitle}){
  const [addingCrew,setAddingCrew]=useState(false);
  const [addingTalent,setAddingTalent]=useState(false);
  const [nc,setNc]=useState({name:"",role:"",email:"",phone:"",rate:"",dietary:"",notes:""});
  const [nt,setNt]=useState({name:"",agent:"",agentEmail:"",rate:"",usage:"",dietary:"",notes:""});

  if(isClient) return <div style={{padding:"40px 0",textAlign:"center",color:C.textMuted}}><div style={{fontSize:40,marginBottom:12}}>🔒</div><p>Crew & talent details are internal only.</p></div>;

  const [crewTab,setCrewTab]=useState("crew");
  const [viewMode,setViewMode]=useViewPref("framex_view_crew");

  const CrewCard=({person,color,badge})=>{
    const [hov,setHov]=useState(false);
    return (
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{position:"relative",borderRadius:10,overflow:"hidden",background:C.card,border:`1px solid ${hov?C.borderHover:C.border}`,transition:"border-color 0.15s,transform 0.15s,box-shadow 0.15s",transform:hov?"translateY(-2px)":"none",boxShadow:hov?"0 8px 24px rgba(0,0,0,0.4)":"none",padding:"20px 12px 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,cursor:"default"}}>
        <Avatar name={person.name} size={52}/>
        <div style={{textAlign:"center",minWidth:0,width:"100%"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{person.name}</div>
          <div style={{fontSize:10,color:C.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{person.role||person.agent&&`Agent: ${person.agent}`||""}</div>
        </div>
        {badge&&<span style={{fontSize:9,background:C.greenLow,color:C.green,border:`1px solid ${C.green}35`,borderRadius:3,padding:"1px 6px"}}>{badge}</span>}
        {hov&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(2px)",display:"flex",flexDirection:"column",justifyContent:"center",padding:"10px 12px",gap:5}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.9)",fontWeight:600}}>{person.name}</div>
          {person.email&&<div style={{fontSize:9,color:C.textSec}}>📧 {person.email}</div>}
          {person.phone&&<div style={{fontSize:9,color:C.textSec}}>📞 {person.phone}</div>}
          {person.agentEmail&&<div style={{fontSize:9,color:C.textSec}}>📧 {person.agentEmail}</div>}
          {person.rate&&<div style={{fontSize:9,color:color}}>💰 {person.rate}</div>}
        </div>}
      </div>
    );
  };

  return <div>
    {/* Sub-tabs */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
      <div style={{display:"flex",gap:2,background:"#0D0D14",borderRadius:8,padding:3,border:`1px solid ${C.border}`}}>
        {[{id:"crew",label:"👥 Crew & Talent"},{id:"callsheets",label:"📋 Call Sheets"}].map(t=>(
          <button key={t.id} onClick={()=>setCrewTab(t.id)}
            style={{background:crewTab===t.id?C.surface:"none",border:"none",borderRadius:6,color:crewTab===t.id?C.text:C.textMuted,cursor:"pointer",padding:"5px 14px",fontSize:12,fontWeight:crewTab===t.id?600:400,transition:"all 0.15s"}}>
            {t.label}
          </button>
        ))}
      </div>
      {crewTab!=="callsheets"&&<ViewToggle value={viewMode} onChange={setViewMode}/>}
    </div>

    {crewTab==="callsheets"&&<CallSheetsView crew={crew} talent={talent} callsheets={callsheets||[]} onUpdate={onUpdateCallsheets} projectTitle={projectTitle}/>}

    {crewTab!=="callsheets"&&viewMode==="grid"
      ?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        {/* Crew grid */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"0.08em"}}>👥 Crew ({crew.length})</span>
            <Btn variant="ghost" onClick={()=>setAddingCrew(true)} style={{fontSize:11,padding:"5px 10px"}}>+ Add</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:10}}>
            {crew.map(c=><CrewCard key={c.id} person={c} color={C.yellow} badge={c.payrollDocs?"Payroll ✓":null}/>)}
          </div>
          {addingCrew&&<div style={{background:"#0A0A14",border:`1px solid ${C.yellow}40`,borderRadius:8,padding:14,marginTop:12}}>
            {["name","role","email","phone","rate","dietary","notes"].map(f=>(
              <Input key={f} label={f} value={nc[f]} onChange={e=>setNc(p=>({...p,[f]:e.target.value}))} placeholder={f}/>
            ))}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn variant="ghost" onClick={()=>setAddingCrew(false)}>Cancel</Btn>
              <Btn variant="green" onClick={()=>{if(!nc.name.trim())return;onUpdateCrew([...crew,{id:`cr${Date.now()}`,...nc,payrollDocs:false}]);setNc({name:"",role:"",email:"",phone:"",rate:"",dietary:"",notes:""});setAddingCrew(false);}}>Add Crew</Btn>
            </div>
          </div>}
        </div>
        {/* Talent grid */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:11,fontWeight:700,color:C.pink,textTransform:"uppercase",letterSpacing:"0.08em"}}>🌟 Talent ({talent.length})</span>
            <Btn variant="ghost" onClick={()=>setAddingTalent(true)} style={{fontSize:11,padding:"5px 10px"}}>+ Add</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:10}}>
            {talent.map(t=><CrewCard key={t.id} person={t} color={C.pink} badge={t.releaseForm?"Release ✓":null}/>)}
          </div>
          {addingTalent&&<div style={{background:"#0A0A14",border:`1px solid ${C.pink}40`,borderRadius:8,padding:14,marginTop:12}}>
            {["name","agent","agentEmail","rate","usage","dietary","notes"].map(f=>(
              <Input key={f} label={f.replace(/([A-Z])/g," $1")} value={nt[f]} onChange={e=>setNt(p=>({...p,[f]:e.target.value}))} placeholder={f}/>
            ))}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn variant="ghost" onClick={()=>setAddingTalent(false)}>Cancel</Btn>
              <Btn variant="pink" onClick={()=>{if(!nt.name.trim())return;onUpdateTalent([...talent,{id:`t${Date.now()}`,...nt,releaseForm:false}]);setNt({name:"",agent:"",agentEmail:"",rate:"",usage:"",dietary:"",notes:""});setAddingTalent(false);}}>Add Talent</Btn>
            </div>
          </div>}
        </div>
      </div>

      :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {/* Crew list */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontSize:12,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"0.08em"}}>👥 Crew ({crew.length})</span>
            <Btn variant="ghost" onClick={()=>setAddingCrew(true)} style={{fontSize:11,padding:"5px 10px"}}>+ Add</Btn>
          </div>
          {crew.map(c=>(
            <div key={c.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <Avatar name={c.name} size={32}/>
                <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.name}</div>
                <div style={{fontSize:11,color:C.textMuted}}>{c.role}</div></div>
                {c.payrollDocs&&<span style={{marginLeft:"auto",fontSize:10,background:C.greenLow,color:C.green,border:`1px solid ${C.green}35`,borderRadius:4,padding:"2px 7px"}}>Payroll ✓</span>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11,color:C.textSec}}>
                <span>📧 {c.email}</span><span>📞 {c.phone}</span>
                <span>💰 {c.rate}</span><span>🥗 {c.dietary||"—"}</span>
              </div>
              {c.notes&&<p style={{margin:"6px 0 0",fontSize:11,color:C.textMuted,fontStyle:"italic"}}>{c.notes}</p>}
            </div>
          ))}
          {addingCrew&&<div style={{background:"#0A0A14",border:`1px solid ${C.yellow}40`,borderRadius:8,padding:14,marginTop:8}}>
            {["name","role","email","phone","rate","dietary","notes"].map(f=>(
              <Input key={f} label={f} value={nc[f]} onChange={e=>setNc(p=>({...p,[f]:e.target.value}))} placeholder={f}/>
            ))}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn variant="ghost" onClick={()=>setAddingCrew(false)}>Cancel</Btn>
              <Btn variant="green" onClick={()=>{if(!nc.name.trim())return;onUpdateCrew([...crew,{id:`cr${Date.now()}`,...nc,payrollDocs:false}]);setNc({name:"",role:"",email:"",phone:"",rate:"",dietary:"",notes:""});setAddingCrew(false);}}>Add Crew</Btn>
            </div>
          </div>}
        </div>
        {/* Talent list */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontSize:12,fontWeight:700,color:C.pink,textTransform:"uppercase",letterSpacing:"0.08em"}}>🌟 Talent ({talent.length})</span>
            <Btn variant="ghost" onClick={()=>setAddingTalent(true)} style={{fontSize:11,padding:"5px 10px"}}>+ Add</Btn>
          </div>
          {talent.map(t=>(
            <div key={t.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <Avatar name={t.name} size={32}/>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{t.name}</div>
                <div style={{fontSize:11,color:C.textMuted}}>Agent: {t.agent}</div></div>
                {t.releaseForm&&<span style={{fontSize:10,background:C.greenLow,color:C.green,border:`1px solid ${C.green}35`,borderRadius:4,padding:"2px 7px"}}>Release ✓</span>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11,color:C.textSec}}>
                <span>📧 {t.agentEmail}</span><span>💰 {t.rate}</span>
                <span>📄 {t.usage}</span><span>🥗 {t.dietary||"—"}</span>
              </div>
            </div>
          ))}
          {addingTalent&&<div style={{background:"#0A0A14",border:`1px solid ${C.pink}40`,borderRadius:8,padding:14,marginTop:8}}>
            {["name","agent","agentEmail","rate","usage","dietary","notes"].map(f=>(
              <Input key={f} label={f.replace(/([A-Z])/g," $1")} value={nt[f]} onChange={e=>setNt(p=>({...p,[f]:e.target.value}))} placeholder={f}/>
            ))}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn variant="ghost" onClick={()=>setAddingTalent(false)}>Cancel</Btn>
              <Btn variant="pink" onClick={()=>{if(!nt.name.trim())return;onUpdateTalent([...talent,{id:`t${Date.now()}`,...nt,releaseForm:false}]);setNt({name:"",agent:"",agentEmail:"",rate:"",usage:"",dietary:"",notes:""});setAddingTalent(false);}}>Add Talent</Btn>
            </div>
          </div>}
        </div>
      </div>
    }
  </div>;
}

// ─── Producer Section ─────────────────────────────────────────────────────────

function ProducerSection({producer,onUpdate,isClient}){
  if(isClient) return <div style={{padding:"40px 0",textAlign:"center",color:C.textMuted}}><div style={{fontSize:40,marginBottom:12}}>🔒</div><p>Producer details are internal only.</p></div>;

  const fld={background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:5,color:C.text,padding:"5px 8px",fontSize:11,outline:"none",fontFamily:"inherit",boxSizing:"border-box",width:"100%"};
  const addItem=(cat,item)=>onUpdate({...producer,[cat]:[...(producer[cat]||[]),item]});
  const updItem=(cat,id,key,val)=>onUpdate({...producer,[cat]:(producer[cat]||[]).map(x=>x.id===id?{...x,[key]:val}:x)});
  const delItem=(cat,id)=>onUpdate({...producer,[cat]:(producer[cat]||[]).filter(x=>x.id!==id)});
  const addFile=async(cat,id,fileKey,file)=>{
    const url=await uploadFile(file,`producer/${cat}/${id}`);
    updItem(cat,id,fileKey,[...((producer[cat]||[]).find(x=>x.id===id)?.[fileKey]||[]),{name:file.name,url,date:new Date().toISOString().slice(0,10)}]);
  };
  const [notes,setNotes]=useState({prod:producer.productionNotes||"",post:producer.postNotes||""});

  const StatusSelect=({val,onChange})=>(
    <select value={val} onChange={e=>onChange(e.target.value)}
      style={{...fld,width:"auto",padding:"4px 7px",cursor:"pointer"}}>
      {["pending","confirmed","approved","cancelled","booked"].map(s=><option key={s} value={s}>{s}</option>)}
    </select>
  );

  const FileAttachments=({files,onAdd,color})=>{
    const ref=useRef();
    return <div style={{marginTop:8}}>
      {(files||[]).map((f,i)=>(
        <a key={i} href={f.url||"#"} target="_blank" rel="noreferrer"
          style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,color,background:color+"15",border:`1px solid ${color}30`,borderRadius:4,padding:"2px 8px",marginRight:5,marginBottom:4,textDecoration:"none"}}>
          📎 {f.name}
        </a>
      ))}
      <button onClick={()=>ref.current?.click()}
        style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10,color:C.textMuted,background:"transparent",border:`1px dashed ${C.border}`,borderRadius:4,padding:"2px 8px",cursor:"pointer"}}>
        + Attach file
      </button>
      <input ref={ref} type="file" style={{display:"none"}} onChange={e=>e.target.files[0]&&onAdd(e.target.files[0])}/>
    </div>;
  };

  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>

      {/* Vendors */}
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.orange,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>🏭 Vendors</div>
        {(producer.vendors||[]).map(v=>(
          <div key={v.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
              <input value={v.name} onChange={e=>updItem("vendors",v.id,"name",e.target.value)} placeholder="Vendor name" style={fld}/>
              <input value={v.type} onChange={e=>updItem("vendors",v.id,"type",e.target.value)} placeholder="Type (Stage, Camera…)" style={fld}/>
              <input value={v.cost} onChange={e=>updItem("vendors",v.id,"cost",e.target.value)} placeholder="Cost" style={fld}/>
              <StatusSelect val={v.status||"pending"} onChange={val=>updItem("vendors",v.id,"status",val)}/>
            </div>
            <FileAttachments files={v.files} color={C.orange} onAdd={f=>addFile("vendors",v.id,"files",f)}/>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}><DeleteBtn small onConfirm={()=>delItem("vendors",v.id)}/></div>
          </div>
        ))}
        <Btn variant="ghost" style={{fontSize:11,padding:"5px 10px",width:"100%",marginTop:4}} onClick={()=>addItem("vendors",{id:`v${Date.now()}`,name:"",type:"",cost:"",status:"pending",files:[]})}>+ Add Vendor</Btn>
      </div>

      {/* Permits */}
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>📋 Permits</div>
        {(producer.permits||[]).map(p=>(
          <div key={p.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
              <input value={p.location} onChange={e=>updItem("permits",p.id,"location",e.target.value)} placeholder="Location / address" style={fld}/>
              <input type="date" value={p.date} onChange={e=>updItem("permits",p.id,"date",e.target.value)} style={fld}/>
              <input value={p.authority||""} onChange={e=>updItem("permits",p.id,"authority",e.target.value)} placeholder="Issuing authority" style={fld}/>
              <StatusSelect val={p.status||"pending"} onChange={val=>updItem("permits",p.id,"status",val)}/>
            </div>
            <FileAttachments files={p.files} color={C.teal} onAdd={f=>addFile("permits",p.id,"files",f)}/>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}><DeleteBtn small onConfirm={()=>delItem("permits",p.id)}/></div>
          </div>
        ))}
        <Btn variant="ghost" style={{fontSize:11,padding:"5px 10px",width:"100%",marginTop:4}} onClick={()=>addItem("permits",{id:`p${Date.now()}`,location:"",date:"",authority:"",status:"pending",files:[]})}>+ Add Permit</Btn>
      </div>

      {/* Rentals */}
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.purple,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>🎬 Rentals</div>
        {(producer.rentals||[]).map(r=>(
          <div key={r.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
              <input value={r.item} onChange={e=>updItem("rentals",r.id,"item",e.target.value)} placeholder="Item description" style={fld}/>
              <input value={r.vendor} onChange={e=>updItem("rentals",r.id,"vendor",e.target.value)} placeholder="Vendor" style={fld}/>
              <input value={r.cost} onChange={e=>updItem("rentals",r.id,"cost",e.target.value)} placeholder="Cost" style={fld}/>
              <StatusSelect val={r.status||"pending"} onChange={val=>updItem("rentals",r.id,"status",val)}/>
            </div>
            <FileAttachments files={r.files} color={C.purple} onAdd={f=>addFile("rentals",r.id,"files",f)}/>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}><DeleteBtn small onConfirm={()=>delItem("rentals",r.id)}/></div>
          </div>
        ))}
        <Btn variant="ghost" style={{fontSize:11,padding:"5px 10px",width:"100%",marginTop:4}} onClick={()=>addItem("rentals",{id:`r${Date.now()}`,item:"",vendor:"",cost:"",status:"pending",files:[]})}>+ Add Rental</Btn>
      </div>

      {/* Travel */}
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>✈ Travel</div>
        {(producer.travel||[]).map(t=>(
          <div key={t.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
              <input value={t.who} onChange={e=>updItem("travel",t.id,"who",e.target.value)} placeholder="Traveler name" style={fld}/>
              <input value={t.to} onChange={e=>updItem("travel",t.id,"to",e.target.value)} placeholder="Destination" style={fld}/>
              <input value={t.dates} onChange={e=>updItem("travel",t.id,"dates",e.target.value)} placeholder="Dates (e.g. Jul 10–12)" style={fld}/>
              <input value={t.cost} onChange={e=>updItem("travel",t.id,"cost",e.target.value)} placeholder="Cost" style={fld}/>
              <input value={t.flight||""} onChange={e=>updItem("travel",t.id,"flight",e.target.value)} placeholder="Flight / booking ref" style={fld}/>
              <input value={t.hotel||""} onChange={e=>updItem("travel",t.id,"hotel",e.target.value)} placeholder="Hotel" style={fld}/>
              <div style={{gridColumn:"1/-1"}}><StatusSelect val={t.status||"booked"} onChange={val=>updItem("travel",t.id,"status",val)}/></div>
            </div>
            <div style={{fontSize:10,color:C.yellow,fontWeight:600,marginBottom:4}}>📎 Travel docs (memos, booking confirmations)</div>
            <FileAttachments files={t.files} color={C.yellow} onAdd={f=>addFile("travel",t.id,"files",f)}/>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}><DeleteBtn small onConfirm={()=>delItem("travel",t.id)}/></div>
          </div>
        ))}
        <Btn variant="ghost" style={{fontSize:11,padding:"5px 10px",width:"100%",marginTop:4}} onClick={()=>addItem("travel",{id:`tr${Date.now()}`,who:"",to:"",dates:"",cost:"",flight:"",hotel:"",status:"booked",files:[]})}>+ Add Travel</Btn>
      </div>
    </div>

    {/* Notes */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      {[["prod","productionNotes","Production Notes",C.orange],["post","postNotes","Post Notes",C.cyan]].map(([k,field,label,color])=>(
        <div key={k}>
          <label style={{fontSize:10,color:C.textMuted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>
          <textarea value={notes[k]} onChange={e=>{setNotes(p=>({...p,[k]:e.target.value}));onUpdate({...producer,[field]:e.target.value});}} rows={3}
            style={{width:"100%",background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 10px",color:C.text,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
        </div>
      ))}
    </div>
  </div>;
}

// ─── Wrap Panel ───────────────────────────────────────────────────────────────

function WrapPanel({wrap,onUpdate,isClient}){
  const cats=[
    {id:"finalInvoices",label:"Final Invoices",icon:"🧾",color:C.orange,clientVisible:true},
    {id:"expenseReports",label:"Expense Reports",icon:"📊",color:C.yellow,clientVisible:false},
    {id:"signedContracts",label:"Signed Contracts",icon:"📝",color:C.cyan,clientVisible:true},
    {id:"releases",label:"Releases",icon:"🔏",color:C.purple,clientVisible:false},
    {id:"deliverables",label:"Deliverables",icon:"📦",color:C.green,clientVisible:true},
  ];
  const visible=isClient?cats.filter(c=>c.clientVisible):cats;
  const [previewEntry,setPreviewEntry]=useState(null);
  const [uploading,setUploading]=useState(0);
  const addItem=async(cat,file)=>{
    setUploading(n=>n+1);
    try{
      const previewUrl=await uploadFile(file,`wrap/${cat}`);
      const item={id:`w${Date.now()}`,name:file.name,status:"pending",date:new Date().toISOString().slice(0,10),mimeType:file.type,previewUrl};
      onUpdate({...wrap,[cat]:[...(wrap[cat]||[]),item]});
    }finally{setUploading(n=>n-1);}
  };
  const totalDelivered=(wrap.deliverables||[]).filter(d=>d.status==="delivered").length;
  const deleteWrap=(cat,id)=>onUpdate({...wrap,[cat]:(wrap[cat]||[]).filter(i=>i.id!==id)});
  const [viewMode,setViewMode]=useViewPref("framex_view_wrap");

  return <div>
    {uploading>0&&<div style={{background:C.cyan+"15",border:`1px solid ${C.cyan}30`,borderRadius:6,padding:"7px 14px",marginBottom:14,fontSize:11,color:C.cyan}}>⬆ Uploading {uploading} file{uploading>1?"s":""}…</div>}
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><ViewToggle value={viewMode} onChange={setViewMode}/></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
      {visible.map(cat=>{
        const items=wrap[cat.id]||[];
        return <div key={cat.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:16,marginBottom:4}}>{cat.icon}</div>
          <div style={{fontSize:10,color:C.textMuted}}>{cat.label}</div>
          <div style={{fontSize:20,fontWeight:700,color:cat.color}}>{items.length}</div>
        </div>;
      })}
    </div>

    {visible.map(cat=>{
      const items=wrap[cat.id]||[];
      return <div key={cat.id} style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:700,color:cat.color,textTransform:"uppercase",letterSpacing:"0.08em"}}>{cat.icon} {cat.label}</span>
          {!isClient&&<DropZone onFiles={fs=>fs.forEach(f=>addItem(cat.id,f))} accept="*" label={`Add ${cat.label.toLowerCase()}`} color={cat.color} compact/>}
        </div>
        {items.length===0&&<p style={{color:C.textMuted,fontSize:12}}>No {cat.label.toLowerCase()} yet.</p>}
        {viewMode==="grid"
          ?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:4}}>
            {items.map(item=>(
              <MediaCard key={item.id} item={item}
                onPreview={item.previewUrl?()=>setPreviewEntry(item):undefined}
                onDelete={!isClient?()=>deleteWrap(cat.id,item.id):undefined}
                fallbackIcon={cat.icon}/>
            ))}
          </div>
          :<div>
            {items.map(item=>(
              <div key={item.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
                <FileIcon name={item.name} mimeType={item.mimeType||""} previewUrl={item.previewUrl} size={28} fallback={cat.icon}/>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                <div style={{fontSize:10,color:C.textMuted}}>{item.date}</div></div>
                <Badge status={item.status} small/>
                <Btn variant="ghost" onClick={()=>item.previewUrl?setPreviewEntry(item):doDownload(item)} style={{fontSize:10,padding:"4px 8px",opacity:item.previewUrl?1:0.4}}>{item.previewUrl?"👁":"⬇"}</Btn>
                {!isClient&&<DeleteBtn small onConfirm={()=>deleteWrap(cat.id,item.id)}/>}
              </div>
            ))}
          </div>
        }
      </div>;
    })}

    {previewEntry&&<PreviewModal entry={previewEntry} onClose={()=>setPreviewEntry(null)}/>}
    <div style={{marginTop:16}}>
      <label style={{fontSize:10,color:C.textMuted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Wrap Notes</label>
      <textarea value={wrap.wrapNotes||""} onChange={e=>onUpdate({...wrap,wrapNotes:e.target.value})} rows={3}
        style={{width:"100%",background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 10px",color:C.text,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box"}}
        placeholder="Final notes, outstanding items…"/>
    </div>
  </div>;
}

// ─── Post/VFX Quick Panels (simplified for project view) ─────────────────────

function PostPanel({posts,onUpdate,isClient,canApprove}){
  const [playing,setPlaying]=useState(null);
  const [t,setT]=useState(0);
  const [running,setRunning]=useState(false);
  const timerRef=useRef(null);
  const [newNote,setNewNote]=useState("");
  const [noteTime,setNoteTime]=useState("");
  const postsRef=useRef(posts);
  const onUpdateRef=useRef(onUpdate);
  useEffect(()=>{postsRef.current=posts;},[posts]);
  useEffect(()=>{onUpdateRef.current=onUpdate;},[onUpdate]);

  // Poll encoding status for queued/encoding assets
  useEffect(()=>{
    const interval=setInterval(async()=>{
      const pending=postsRef.current.filter(p=>p.encodingJobId&&(p.encodingStatus==="queued"||p.encodingStatus==="encoding"));
      if(!pending.length)return;
      const updated=await Promise.all(pending.map(async p=>{
        try{
          const r=await fetch(`/api/transcode-status?jobId=${p.encodingJobId}`);
          if(!r.ok)return null;
          const d=await r.json();
          if(d.status==="COMPLETE"){
            const hlsUrl=p.hlsBase?`${p.hlsBase}/index.m3u8`:null;
            return{...p,encodingStatus:"done",encodingProgress:100,hlsUrl:hlsUrl||p.previewUrl};
          }else if(d.status==="ERROR"||d.status==="CANCELED"){
            return{...p,encodingStatus:"error",encodingProgress:0};
          }else if(d.status==="PROGRESSING"){
            return{...p,encodingStatus:"encoding",encodingProgress:d.progress||0};
          }
        }catch{}
        return null;
      }));
      const changes=updated.filter(Boolean);
      if(!changes.length)return;
      const changeMap=Object.fromEntries(changes.map(p=>[p.id,p]));
      onUpdateRef.current(postsRef.current.map(p=>changeMap[p.id]||p));
    },12000);
    return()=>clearInterval(interval);
  },[]);

  const visible=isClient?posts.filter(p=>p.shared):posts;

  const dur=playing?.duration||120;
  const pct=(t/dur)*100;

  const tick=()=>setT(prev=>{if(prev>=dur){setRunning(false);return dur;}return prev+0.4;});
  const togglePlay=()=>{
    if(running){clearInterval(timerRef.current);setRunning(false);}
    else{timerRef.current=setInterval(tick,400);setRunning(true);}
  };

  const addNote=()=>{
    if(!newNote.trim()||!playing)return;
    const colors=[C.orange,C.cyan,C.yellow,C.red];
    const note={id:`c${Date.now()}`,time:parseInt(noteTime)||Math.floor(t),author:"You",text:newNote,color:colors[playing.comments.length%4],resolved:false};
    onUpdate(posts.map(p=>p.id===playing.id?{...p,comments:[...p.comments,note]}:p));
    setPlaying(prev=>({...prev,comments:[...prev.comments,note]}));
    setNewNote(""); setNoteTime("");
  };

  const toggleShare=(id)=>onUpdate(posts.map(p=>p.id===id?{...p,shared:!p.shared}:p));
  const updateStatus=(id,status)=>{onUpdate(posts.map(p=>p.id===id?{...p,status}:p));if(playing?.id===id)setPlaying(prev=>({...prev,status}));};
  const deletePost=(id)=>{onUpdate(posts.filter(p=>p.id!==id));if(playing?.id===id){clearInterval(timerRef.current);setPlaying(null);setRunning(false);}};
  const [uploading,setUploading]=useState(0);
  const [viewMode,setViewMode]=useViewPref("framex_view_post");
  const addPost=async(file)=>{
    setUploading(n=>n+1);
    try{
      const previewUrl=await uploadFile(file,"post");
      onUpdate([...posts,{id:`pa${Date.now()}`,type:file.type.startsWith("video")?"video":"board",name:file.name,version:"v01",status:"pending",uploader:"You",duration:file.type.startsWith("video")?120:undefined,editNotes:"",shared:false,comments:[],mimeType:file.type,previewUrl}]);
    }finally{setUploading(n=>n-1);}
  };

  return <div style={{display:"flex",gap:20,minHeight:0}}>
    {/* Asset list */}
    <div style={{flex:playing?0:1,width:playing?"300px":"100%",flexShrink:0}}>
      {!isClient&&<DropZone onFiles={fs=>fs.forEach(addPost)} accept="video/*,image/*,.pdf" label="Drop video or image files here" color={C.cyan}/>}
      {uploading>0&&<div style={{background:C.cyan+"15",border:`1px solid ${C.cyan}30`,borderRadius:6,padding:"7px 14px",margin:"8px 0",fontSize:11,color:C.cyan}}>⬆ Uploading {uploading} file{uploading>1?"s":""}…</div>}
      <div style={{display:"flex",justifyContent:"flex-end",margin:"6px 0"}}><ViewToggle value={viewMode} onChange={setViewMode}/></div>
      {visible.length===0&&<p style={{color:C.textMuted,textAlign:"center",padding:"40px 0"}}>No assets yet.</p>}
      {viewMode==="grid"
        ?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:4}}>
          {visible.map(asset=>(
            <MediaCard key={asset.id} item={asset}
              onPreview={()=>{setPlaying(asset);setT(0);setRunning(false);clearInterval(timerRef.current);}}
              onApprove={canApprove&&asset.status!=="approved"?()=>updateStatus(asset.id,"approved"):undefined}
              onReject={canApprove&&asset.status!=="changes"?()=>updateStatus(asset.id,"changes"):undefined}
              canApprove={canApprove}
              onDelete={!isClient?()=>deletePost(asset.id):undefined}
              fallbackIcon="🎬"/>
          ))}
        </div>
        :<div>
          {visible.map(asset=>(
            <div key={asset.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:7,background:C.cyanLow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎬</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{asset.name}</div>
                <div style={{display:"flex",gap:8,alignItems:"center",marginTop:2}}>
                  <span style={{fontSize:10,color:C.textMuted,fontFamily:"monospace"}}>{asset.version}</span>
                  {asset.encodingStatus==="queued"&&<span style={{fontSize:10,background:C.yellowLow,color:C.yellow,borderRadius:4,padding:"1px 6px",border:`1px solid ${C.yellow}35`}}>⏳ Queued</span>}
                  {asset.encodingStatus==="encoding"&&<span style={{fontSize:10,background:"#1A1A2E",color:C.cyan,borderRadius:4,padding:"1px 6px",border:`1px solid ${C.cyan}35`}}>⚙ {asset.encodingProgress||0}%</span>}
                  {asset.encodingStatus==="done"&&<span style={{fontSize:10,background:C.greenLow,color:C.green,borderRadius:4,padding:"1px 6px",border:`1px solid ${C.green}35`}}>✓ HLS Ready</span>}
                  {asset.encodingStatus==="error"&&<span style={{fontSize:10,background:"#1A0A0A",color:C.red,borderRadius:4,padding:"1px 6px",border:`1px solid ${C.red}35`}}>✗ Failed</span>}
                  {asset.comments.filter(c=>!c.resolved).length>0&&<span style={{fontSize:10,background:C.orangeLow,color:C.orange,borderRadius:8,padding:"1px 6px",border:`1px solid ${C.orange}35`}}>{asset.comments.filter(c=>!c.resolved).length} notes</span>}
                  {asset.shared&&isClient&&<span style={{fontSize:10,color:C.green}}>● Shared</span>}
                </div>
              </div>
              <Badge status={asset.status} small/>
              <Btn variant="cyan" onClick={()=>{setPlaying(asset);setT(0);setRunning(false);clearInterval(timerRef.current);}} style={{fontSize:11,padding:"5px 10px"}}>▶ Review</Btn>
              {!isClient&&<button onClick={()=>toggleShare(asset.id)} style={{background:asset.shared?C.greenLow:"#1E1E28",border:`1px solid ${asset.shared?C.green+"50":C.border}`,color:asset.shared?C.green:C.textMuted,borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:10}}>{asset.shared?"👁":"Share"}</button>}
              {canApprove&&<Btn variant="green" onClick={()=>updateStatus(asset.id,"approved")} style={{fontSize:10,padding:"4px 8px"}}>✓</Btn>}
              {!isClient&&<DeleteBtn small onConfirm={()=>deletePost(asset.id)}/>}
            </div>
          ))}
        </div>
      }
    </div>

    {/* Player */}
    {playing&&<div style={{flex:1,background:"#040407",borderRadius:10,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",minHeight:400}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"monospace"}}>{playing.name}</span>
        <div style={{display:"flex",gap:6}}>
          <Badge status={playing.status} small/>
          {canApprove&&<Btn variant="green" onClick={()=>updateStatus(playing.id,"approved")} style={{fontSize:11,padding:"4px 10px"}}>✓ Approve</Btn>}
          {canApprove&&<Btn variant="red" onClick={()=>updateStatus(playing.id,"changes")} style={{fontSize:11,padding:"4px 10px"}}>✗</Btn>}
          <button onClick={()=>{clearInterval(timerRef.current);setPlaying(null);setRunning(false);}} style={{background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:16}}>✕</button>
        </div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,padding:20}}>
        {(playing.hlsUrl||playing.mimeType?.startsWith("video/"))
          ?<VideoPlayer asset={playing} style={{width:"100%",maxHeight:340}}/>
          :playing.previewUrl&&playing.mimeType?.startsWith("image/")
          ?<img src={playing.previewUrl} alt={playing.name} style={{maxWidth:"100%",maxHeight:340,objectFit:"contain",borderRadius:8}}/>
          :<><div style={{width:64,height:64,borderRadius:"50%",background:"#16161E",border:`2px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:24}} onClick={togglePlay}>{running?"⏸":"▶"}</div>
          <span style={{fontSize:11,color:C.textMuted,fontFamily:"monospace"}}>{fmtTime(t)} / {fmtTime(dur)}</span></>}
      </div>
      {/* Scrubber */}
      <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`}}>
        <div style={{position:"relative",height:28}}>
          <div style={{position:"absolute",top:10,left:0,right:0,height:8,background:"#1A1A24",borderRadius:4,cursor:"pointer"}}
            onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setT(((e.clientX-r.left)/r.width)*dur);}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,background:C.cyan,borderRadius:4}}/>
            {playing.comments.map(c=>(
              <div key={c.id} style={{position:"absolute",top:-4,width:4,height:16,background:c.color,borderRadius:2,left:`${(c.time/dur)*100}%`,transform:"translateX(-50%)",cursor:"pointer",zIndex:2,opacity:c.resolved?0.35:1}}
                onClick={e=>{e.stopPropagation();setT(c.time);}}/>
            ))}
            <div style={{position:"absolute",top:-4,width:3,height:16,background:"#fff",borderRadius:2,left:`${pct}%`,transform:"translateX(-50%)",zIndex:3}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginTop:6}}>
          <input value={noteTime} onChange={e=>setNoteTime(e.target.value)} placeholder={`fr ${Math.floor(t)}s`} style={{width:60,background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:5,padding:"5px 7px",color:C.text,fontSize:11,outline:"none"}}/>
          <input value={newNote} onChange={e=>setNewNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addNote()} placeholder="Add timecode note…" style={{flex:1,background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:5,padding:"5px 8px",color:C.text,fontSize:11,outline:"none"}}/>
          <Btn variant="cyan" onClick={addNote} style={{fontSize:11,padding:"5px 10px"}}>+ Note</Btn>
        </div>
      </div>
      {/* Comment list */}
      <div style={{maxHeight:160,overflowY:"auto",borderTop:`1px solid ${C.border}`}}>
        {playing.comments.map(c=>(
          <div key={c.id} style={{padding:"8px 14px",borderLeft:`3px solid ${c.resolved?C.textMuted:c.color}`,borderBottom:`1px solid ${C.border}30`}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
              <Avatar name={c.author} size={18}/><span style={{fontSize:11,fontWeight:600,color:C.text}}>{c.author}</span>
              <span style={{fontSize:10,color:c.color,fontFamily:"monospace",background:c.color+"18",padding:"1px 5px",borderRadius:3}}>@{fmtTime(c.time)}</span>
            </div>
            <p style={{margin:0,fontSize:11,color:C.textSec}}>{c.text}</p>
          </div>
        ))}
      </div>
    </div>}
  </div>;
}

// ─── Client Comments Section ──────────────────────────────────────────────────

function ClientComments({comments,onUpdate,currentUser}){
  const [text,setText]=useState("");
  const [visibility,setVisibility]=useState("all");
  const isInternal=!ROLES[currentUser.role].isClient;

  const renderText=(t)=>{
    const parts=t.split(/(@\w+)/g);
    return parts.map((p,i)=>p.startsWith("@")
      ?<span key={i} style={{color:C.cyan,fontWeight:600}}>{p}</span>
      :p
    );
  };

  const add=()=>{
    if(!text.trim())return;
    onUpdate([...comments,{id:`cc${Date.now()}`,author:currentUser.name,role:currentUser.role,date:new Date().toISOString().slice(0,10),text,resolved:false,visibility}]);
    setText("");
    setVisibility("all");
  };

  const visible=comments.filter(c=>{
    if(!c.visibility||c.visibility==="all") return true;
    if(c.visibility==="internal") return isInternal;
    return true;
  });

  const visOpts=[
    {id:"all",    label:"Everyone", icon:"👁",  color:C.textSec},
    {id:"internal",label:"Team only",icon:"🔒", color:C.orange},
  ];

  return <div>
    <div style={{marginBottom:14}}>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={3}
        placeholder="Leave a comment… use @name to mention someone"
        onKeyDown={e=>e.key==="Enter"&&e.metaKey&&add()}
        style={{width:"100%",background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,gap:10}}>
        {isInternal&&(
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{fontSize:10,color:C.textMuted}}>Visible to:</span>
            {visOpts.map(v=>(
              <button key={v.id} onClick={()=>setVisibility(v.id)}
                style={{display:"flex",alignItems:"center",gap:4,fontSize:10,fontWeight:visibility===v.id?700:400,
                  background:visibility===v.id?v.color+"18":"transparent",
                  border:`1px solid ${visibility===v.id?v.color+"50":C.border}`,
                  color:visibility===v.id?v.color:C.textMuted,
                  borderRadius:5,padding:"3px 9px",cursor:"pointer",transition:"all 0.12s"}}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        )}
        <Btn variant="primary" onClick={add} style={{marginLeft:"auto"}}>Post Comment</Btn>
      </div>
    </div>
    {visible.length===0&&<p style={{color:C.textMuted,fontSize:13,textAlign:"center",padding:"20px 0"}}>No comments yet.</p>}
    {[...visible].reverse().map(c=>{
      const isInternalOnly=c.visibility==="internal";
      return (
        <div key={c.id} style={{background:"#0F0F18",border:`1px solid ${isInternalOnly?C.orange+"30":C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <Avatar name={c.author} size={28}/>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.author}</div>
            <div style={{fontSize:10,color:C.textMuted}}>{c.date}</div></div>
            {isInternal&&isInternalOnly&&<span style={{fontSize:9,fontWeight:700,background:C.orangeLow,color:C.orange,border:`1px solid ${C.orange}30`,borderRadius:3,padding:"2px 6px",textTransform:"uppercase",letterSpacing:"0.05em"}}>🔒 Team only</span>}
            {!c.resolved&&<span style={{marginLeft:"auto",fontSize:10,background:C.yellowLow,color:C.yellow,border:`1px solid ${C.yellow}35`,borderRadius:4,padding:"2px 7px"}}>Open</span>}
            {c.resolved&&<span style={{marginLeft:"auto",fontSize:10,background:C.greenLow,color:C.green,border:`1px solid ${C.green}35`,borderRadius:4,padding:"2px 7px"}}>Resolved</span>}
            {isInternal&&<button onClick={()=>onUpdate(comments.map(x=>x.id===c.id?{...x,resolved:!x.resolved}:x))} style={{background:"none",border:`1px solid ${C.border}`,color:c.resolved?C.green:C.textMuted,borderRadius:4,padding:"2px 7px",cursor:"pointer",fontSize:10}}>{c.resolved?"↩ Reopen":"✓ Resolve"}</button>}
          </div>
          <p style={{margin:0,fontSize:13,color:C.textSec}}>{renderText(c.text)}</p>
        </div>
      );
    })}
  </div>;
}

// ─── Status Dropdown ─────────────────────────────────────────────────────────

function StatusDropdown({stage,onChange}){
  const [open,setOpen]=useState(false);
  const meta=LIFECYCLE_META[stage]||LIFECYCLE_META.inquiry;
  return (
    <div style={{position:"relative"}}>
      <button onClick={e=>{e.stopPropagation();setOpen(o=>!o);}}
        style={{background:meta.color+"25",border:`1px solid ${meta.color}60`,color:meta.color,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:6,backdropFilter:"blur(10px)"}}>
        {meta.icon} {meta.label} ▾
      </button>
      {open&&<>
        <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:99}}/>
        <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:"0 12px 40px rgba(0,0,0,0.6)",zIndex:100,minWidth:190,padding:6}}>
          {LIFECYCLE.map(s=>{
            const m=LIFECYCLE_META[s];
            return (
              <button key={s} onClick={e=>{e.stopPropagation();onChange(s);setOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:s===stage?m.color+"18":"none",border:"none",borderRadius:6,padding:"7px 10px",cursor:"pointer",color:s===stage?m.color:C.textSec,fontSize:12,fontWeight:s===stage?700:400,textAlign:"left"}}>
                <span style={{fontSize:13}}>{m.icon}</span><span>{m.label}</span>
                {s===stage&&<span style={{marginLeft:"auto",fontSize:9,color:m.color}}>✓</span>}
              </button>
            );
          })}
        </div>
      </>}
    </div>
  );
}

// ─── Project Timeline ─────────────────────────────────────────────────────────

function ProjectTimeline({project}){
  const stages=LIFECYCLE.filter(s=>s!=="archived");
  const currentIdx=stages.indexOf(project.status);
  const pct=Math.max(4,Math.min(100,((currentIdx+1)/stages.length)*100));
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 20px",marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:20}}>Project Timeline</div>
      {/* Stage progress bar */}
      <div style={{position:"relative",paddingBottom:28}}>
        {/* Track */}
        <div style={{height:4,background:C.border,borderRadius:2,position:"relative",marginBottom:0}}>
          <div style={{height:"100%",width:`${pct}%`,borderRadius:2,background:`linear-gradient(to right,${C.orange},${C.cyan})`,transition:"width 0.3s"}}/>
        </div>
        {/* Stage dots — positioned over track */}
        <div style={{display:"flex",justifyContent:"space-between",position:"absolute",top:-5,left:0,right:0}}>
          {stages.map((s,i)=>{
            const m=LIFECYCLE_META[s];
            const done=i<currentIdx;
            const current=i===currentIdx;
            return (
              <div key={s} title={m.label} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <div style={{width:current?16:12,height:current?16:12,borderRadius:"50%",flexShrink:0,
                  background:done||current?m.color:C.border,
                  border:`2px solid ${done||current?m.color:C.border}`,
                  boxShadow:current?`0 0 0 3px ${m.color}35,0 0 12px ${m.color}60`:undefined,
                  transition:"all 0.2s",marginTop:current?-2:0}}/>
                <span style={{fontSize:7,color:current?m.color:done?C.textSec:C.textMuted,fontWeight:current?700:400,textAlign:"center",maxWidth:44,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Dates */}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <div>
          <div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>Start</div>
          <div style={{fontSize:12,fontWeight:600,color:C.text}}>{project.startDate||"—"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>Delivery</div>
          <div style={{fontSize:12,fontWeight:600,color:C.orange}}>{project.deliveryDate||"—"}</div>
        </div>
      </div>
      {/* Milestones */}
      {project.milestones?.length>0&&(
        <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Milestones</div>
          {project.milestones.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",fontSize:11}}>
              <span style={{color:C.textSec}}>◆ {m.label}</span>
              <span style={{color:C.textMuted,fontFamily:"monospace",fontSize:10}}>{m.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Project Cards ────────────────────────────────────────────────────────────

function ProjectStripCard({project,onClick,onDelete,isClient}){
  const bg=project.portalSettings?.bgImageUrl;
  const meta=LIFECYCLE_META[project.status]||LIFECYCLE_META.inquiry;
  const openComments=(project.clientComments||[]).filter(c=>!c.resolved).length;
  const [confirmDel,setConfirmDel]=useState(false);
  return (
    <div onClick={onClick}
      style={{position:"relative",height:260,borderRadius:20,overflow:"hidden",cursor:"pointer",
        border:"1px solid rgba(255,255,255,0.07)",marginBottom:16,flexShrink:0,
        transition:"transform 0.2s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.2s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 24px 64px rgba(0,0,0,0.7)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
      {bg
        ?<img src={bg} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
        :<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#0D0D18 0%,#161628 50%,#0A1020 100%)"}}/>
      }
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,0.92) 100%)"}}/>
      <div style={{position:"absolute",top:18,left:18,right:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.9)",
          borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600,letterSpacing:"-0.01em"}}>
          {meta.icon} {meta.label}
        </span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {openComments>0&&<span style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:600}}>
            {openComments} msg
          </span>}
          {!isClient&&onDelete&&(confirmDel
            ?<span style={{display:"inline-flex",gap:6,alignItems:"center"}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setConfirmDel(false)} style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.7)",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12}}>Cancel</button>
              <button onClick={()=>onDelete(project.id)} style={{background:"rgba(180,30,30,0.7)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,69,58,0.5)",color:"#fff",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>Delete</button>
            </span>
            :<button onClick={e=>{e.stopPropagation();setConfirmDel(true);}} style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:13,lineHeight:1}}>🗑</button>
          )}
        </div>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 24px"}}>
        <h3 style={{margin:"0 0 8px",fontSize:26,fontWeight:700,color:"#fff",
          textShadow:"0 2px 16px rgba(0,0,0,0.9)",lineHeight:1.1,letterSpacing:"-0.03em",
          fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif"}}>
          {project.title}
        </h3>
        <div style={{display:"flex",alignItems:"center",gap:16,fontSize:13,color:"rgba(255,255,255,0.6)",letterSpacing:"-0.01em"}}>
          <span>{project.startDate||"—"} → {project.deliveryDate||"—"}</span>
          {!isClient&&<span style={{marginLeft:"auto",color:"rgba(255,255,255,0.5)"}}>{project.client}</span>}
          {!isClient&&<span style={{color:"rgba(255,255,255,0.35)"}}>{fmtCurrency(project.budget)}</span>}
        </div>
      </div>
    </div>
  );
}

function ProjectGridCard({project,onOpen,onDelete,isClient}){
  const bg=project.portalSettings?.bgImageUrl;
  const meta=LIFECYCLE_META[project.status]||LIFECYCLE_META.inquiry;
  const [hov,setHov]=useState(false);
  const [confirmDel,setConfirmDel]=useState(false);
  const openComments=(project.clientComments||[]).filter(c=>!c.resolved).length;
  return (
    <div onClick={()=>onOpen("overview")}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{position:"relative",borderRadius:20,overflow:"hidden",cursor:"pointer",
        border:`1px solid ${hov?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.07)"}`,
        transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1),border-color 0.2s,box-shadow 0.25s",
        transform:hov?"translateY(-6px) scale(1.01)":"none",
        boxShadow:hov?"0 24px 64px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05)":"0 4px 20px rgba(0,0,0,0.3)",
        aspectRatio:"4/5"}}>
      {bg
        ?<img src={bg} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
        :<div style={{position:"absolute",inset:0,background:"linear-gradient(145deg,#0D0D1A 0%,#151528 40%,#0A1018 100%)"}}/>
      }
      <div style={{position:"absolute",inset:0,background:hov
        ?"linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.1) 30%,rgba(0,0,0,0.92) 100%)"
        :"linear-gradient(to bottom,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,0.85) 100%)"}}/>
      <div style={{position:"absolute",top:14,left:14}}>
        <span style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
          border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.9)",
          borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600,letterSpacing:"-0.01em"}}>
          {meta.icon} {meta.label}
        </span>
      </div>
      {openComments>0&&<div style={{position:"absolute",top:14,right:14}}>
        <span style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(16px)",
          border:"1px solid rgba(255,255,255,0.2)",color:"#fff",
          borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600}}>
          {openComments} 💬
        </span>
      </div>}
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px 18px 20px"}}>
        <div style={{fontSize:17,fontWeight:700,color:"#fff",
          textShadow:"0 2px 12px rgba(0,0,0,0.9)",marginBottom:5,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:"-0.03em",
          fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif"}}>
          {project.title}
        </div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:"-0.01em"}}>
          {project.deliveryDate||"—"}{!isClient&&` · ${project.client}`}
        </div>
      </div>
      {hov&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)"}} onClick={e=>{if(confirmDel)e.stopPropagation();}}>
        {confirmDel
          ?<>
            <div style={{fontSize:14,color:"#fff",fontWeight:600,marginBottom:4,textAlign:"center",padding:"0 20px"}}>Delete "{project.title}"?</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:12}}>This cannot be undone.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={e=>{e.stopPropagation();setConfirmDel(false);}} style={{background:"rgba(255,255,255,0.1)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"9px 20px",color:"rgba(255,255,255,0.8)",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={e=>{e.stopPropagation();onDelete&&onDelete(project.id);}} style={{background:"rgba(255,69,58,0.35)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,69,58,0.5)",borderRadius:10,padding:"9px 20px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Delete</button>
            </div>
          </>
          :[
            {label:"Open",icon:"→",tab:"overview"},
            ...(isClient?[
              {label:"Messages",icon:"✉",tab:"comments"},
              {label:"Deliverables",icon:"▶",tab:"post"},
            ]:[
              {label:"Messages",icon:"✉",tab:"comments"},
              {label:"Deliverables",icon:"▶",tab:"documents"},
              {label:"Review",icon:"✨",tab:"post"},
            ]),
          ].map(a=>(
            <button key={a.tab} onClick={e=>{e.stopPropagation();onOpen(a.tab);}}
              style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.22)",borderRadius:12,padding:"9px 22px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8,minWidth:140,justifyContent:"center",letterSpacing:"-0.01em",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.24)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";}}>
              <span>{a.icon}</span>{a.label}
            </button>
          )).concat(!isClient&&onDelete?[
            <button key="delete" onClick={e=>{e.stopPropagation();setConfirmDel(true);}}
              style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:"9px 22px",color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8,minWidth:140,justifyContent:"center"}}>
              <span>🗑</span>Delete
            </button>
          ]:[])
        }
      </div>}
    </div>
  );
}

function ProjectActivityFeed({project}){
  const events=[];
  (project.posts||[]).forEach(p=>{
    events.push({type:"asset",name:p.name,date:p.uploader?p.uploader:"",status:p.status,who:p.uploader||"Team",icon:"🎬",color:C.cyan});
  });
  (project.clientComments||[]).forEach(c=>{
    events.push({type:"comment",name:(c.text||"Comment").slice(0,60),date:"",status:c.resolved?"resolved":"open",who:c.author||"Client",icon:"💬",color:c.resolved?C.green:C.yellow});
  });
  Object.entries(project.documents||{}).forEach(([cat,items])=>{
    (items||[]).forEach(d=>{
      events.push({type:"doc",name:d.name,date:d.date||"",status:d.status,who:d.uploader||"Team",icon:"📄",color:C.cyan});
    });
  });
  Object.entries(project.creative||{}).forEach(([cat,items])=>{
    (items||[]).forEach(d=>{
      events.push({type:"creative",name:d.name,date:d.date||"",status:d.status,who:d.uploader||"Team",icon:"🎨",color:C.purple||C.cyan});
    });
  });
  events.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  if(!events.length) return (
    <div style={{textAlign:"center",padding:"60px 0",color:C.textMuted}}>
      <div style={{fontSize:36,marginBottom:12}}>◎</div>
      <div style={{fontSize:14,color:C.textSec,fontWeight:600,marginBottom:6}}>No activity yet</div>
      <div style={{fontSize:12}}>Files uploaded, comments, and approvals will appear here.</div>
    </div>
  );
  return (
    <div>
      {events.map((ev,i)=>(
        <div key={i} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:`1px solid ${C.border}25`}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:ev.color+"20",border:`1px solid ${ev.color}40`,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15}}>
            {ev.icon}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,color:C.text,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {ev.type==="comment"?"Comment: ":""}
              <span style={{fontWeight:600}}>{ev.name}</span>
            </div>
            <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{ev.who}{ev.date?` · ${ev.date}`:""}</div>
          </div>
          <Badge status={ev.status} small/>
        </div>
      ))}
    </div>
  );
}

// ─── Project Detail ───────────────────────────────────────────────────────────

function ProjectDetail({project,onUpdate,currentUser,onBack,onDelete,onPreviewAsClient,onOpenWhiteGlove,initTab}){
  const isClient=ROLES[currentUser.role].isClient;
  const canApprove=ROLES[currentUser.role].canApprove;
  const canSeeInternal=ROLES[currentUser.role].canSeeInternal;

  const internalTabs=[
    {id:"overview",  label:"Overview",     icon:"◈"},
    {id:"updates",   label:"Updates",      icon:"◎"},
    {id:"producer",  label:"Producer",     icon:"🎬"},
    {id:"creative",  label:"Creative",     icon:"🎨"},
    {id:"crew",      label:"Crew",         icon:"👥"},
    {id:"post",      label:"Post / VFX",   icon:"✨"},
    {id:"wrap",      label:"Wrap",         icon:"📦"},
    {id:"documents", label:"Deliverables", icon:"▣"},
    {id:"comments",  label:"Comments",     icon:"💬"},
  ];
  const clientTabs=[
    {id:"overview",  label:"Overview",     icon:"◈"},
    {id:"updates",   label:"Updates",      icon:"◎"},
    {id:"documents", label:"Deliverables", icon:"▣"},
    {id:"creative",  label:"Creative",     icon:"🎨"},
    {id:"post",      label:"Review",       icon:"✨"},
    {id:"comments",  label:"Messages",     icon:"💬"},
  ];
  const tabs=isClient?clientTabs:internalTabs;
  const [tab,setTab]=useState(initTab||"overview");

  const up=(field,val)=>onUpdate({...project,[field]:val});
  const [showUpload,setShowUpload]=useState(false);
  const [confirmDeleteProject,setConfirmDeleteProject]=useState(false);
  const handleUpload=(section,category,uploaded,meta)=>{
    const now=Date.now();
    if(section==="documents"){
      const newDocs=uploaded.map(({file,url},i)=>({id:`doc${now+i}`,name:file.name,status:"pending",uploader:currentUser.name,date:new Date().toISOString().slice(0,10),shared:false,esig:false,mimeType:file.type,previewUrl:url,notes:meta.notes}));
      up("documents",{...project.documents,[category]:[...(project.documents[category]||[]),...newDocs]});
    } else if(section==="creative"){
      const newItems=uploaded.map(({file,url},i)=>({id:`cr${now+i}`,name:file.name,status:"pending",shared:false,uploader:currentUser.name,mimeType:file.type,previewUrl:url,notes:meta.notes}));
      up("creative",{...project.creative,[category]:[...(project.creative[category]||[]),...newItems]});
    } else if(section==="post"){
      const newPosts=uploaded.map(({file,url},i)=>({id:`pa${now+i}`,type:file.type.startsWith("video")?"video":"board",name:file.name,version:meta.version||"v01",status:"pending",uploader:currentUser.name,duration:file.type.startsWith("video")?120:undefined,editNotes:meta.notes||"",shared:false,comments:[],mimeType:file.type,previewUrl:url}));
      up("posts",[...project.posts,...newPosts]);
    } else if(section==="video"){
      const newPosts=uploaded.map(({file,url,key,jobId,hlsBase},i)=>({
        id:`pv${now+i}`,type:"video",name:file.name,version:meta.version||"v01",
        status:"pending",uploader:currentUser.name,duration:120,
        editNotes:meta.notes||"",shared:false,comments:[],
        mimeType:file.type||"video/mp4",previewUrl:url,s3Key:key||null,
        targetFormat:meta.format||"original",quality:meta.quality||"web",
        encodingStatus:jobId?"queued":"none",encodingJobId:jobId||null,
        encodingProgress:0,hlsUrl:jobId?null:url,hlsBase:hlsBase||null,
      }));
      up("posts",[...project.posts,...newPosts]);
    } else if(section==="wrap"){
      const newItems=uploaded.map(({file,url},i)=>({id:`w${now+i}`,name:file.name,status:"pending",date:new Date().toISOString().slice(0,10),mimeType:file.type,previewUrl:url,notes:meta.notes}));
      up("wrap",{...project.wrap,[category]:[...(project.wrap[category]||[]),...newItems]});
    }
  };

  const bg=project.portalSettings?.bgImageUrl;
  const heroMeta=LIFECYCLE_META[project.status]||LIFECYCLE_META.inquiry;

  return <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
    {/* ─── Hero Banner ─────────────────────────────────────────────── */}
    <div style={{position:"relative",height:240,flexShrink:0,overflow:"visible"}}>
      {/* Background — clipped separately so dropdown can escape hero bounds */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",borderRadius:"inherit"}}>
        {bg
          ?<img src={bg} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
          :<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#060610 0%,#131328 50%,#0A0A1E 100%)"}}/>
        }
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0.92) 100%)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0) 60%)"}}/>
      </div>
      {/* Top bar: back + actions */}
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={onBack} style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.85)",cursor:"pointer",fontSize:12,padding:"5px 14px",borderRadius:6,fontWeight:500}}>← All Projects</button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {(currentUser.role==="admin"||currentUser.role==="producer")&&<Btn variant="primary" onClick={()=>onOpenWhiteGlove&&onOpenWhiteGlove()} style={{fontSize:11,padding:"5px 12px",background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.2)"}}>⚙ White Glove Setup</Btn>}
          {(currentUser.role==="admin"||currentUser.role==="producer")&&project.clientId&&
            <Btn variant="ghost" onClick={()=>onPreviewAsClient&&onPreviewAsClient(project.clientId)}
              style={{fontSize:11,padding:"5px 12px",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.15)"}}>👁 Preview as Client</Btn>}
          {!isClient&&(currentUser.role==="admin"||currentUser.role==="producer")&&(
            project.frameioUrl
              ?<div style={{display:"flex",gap:5,alignItems:"center",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(10px)",border:"1px solid rgba(91,184,246,0.35)",borderRadius:7,padding:"4px 10px"}}>
                <a href={project.frameioUrl} target="_blank" rel="noopener noreferrer" style={{color:"#5BB8F6",fontSize:11,fontWeight:700,textDecoration:"none"}}>↗ Frame.io</a>
                <button onClick={()=>up("frameioUrl","")} title="Clear" style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:12,padding:"0 2px",lineHeight:1}}>✕</button>
              </div>
              :<input value={project.frameioUrl||""} onChange={e=>up("frameioUrl",e.target.value)} placeholder="Paste Frame.io link…"
                style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"5px 12px",color:"rgba(255,255,255,0.7)",fontSize:11,outline:"none",width:200}}/>
          )}
          {!isClient&&<Btn variant="cyan" onClick={()=>setShowUpload(true)} style={{fontSize:11,padding:"5px 12px"}}>⬆ Upload</Btn>}
          {currentUser.role==="admin"&&onDelete&&(
            confirmDeleteProject
              ?<span style={{display:"inline-flex",gap:6,alignItems:"center",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(10px)",border:"1px solid rgba(220,60,60,0.4)",borderRadius:7,padding:"4px 10px"}}>
                <span style={{fontSize:11,color:"#ff8888"}}>Delete project?</span>
                <button onClick={()=>setConfirmDeleteProject(false)} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.6)",borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:11}}>Cancel</button>
                <button onClick={()=>{onDelete(project.id);onBack();}} style={{background:"rgba(180,40,40,0.5)",border:"1px solid rgba(220,60,60,0.5)",color:"#ff6666",borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:11,fontWeight:700}}>Delete Forever</button>
              </span>
              :<button onClick={()=>setConfirmDeleteProject(true)} style={{background:"rgba(0,0,0,0.35)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,100,100,0.7)",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11}}>🗑</button>
          )}
        </div>
      </div>
      {/* Bottom: title + meta + status pill */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px 24px 16px"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12}}>
          <div style={{flex:1,minWidth:0}}>
            <h2 style={{margin:"0 0 6px",fontSize:26,fontWeight:800,color:"#fff",
              textShadow:"0 2px 12px rgba(0,0,0,0.9)",lineHeight:1.15,letterSpacing:"-0.02em",
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {project.title}
            </h2>
            <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.7)"}}>{project.client}</span>
              {!isClient&&<span style={{fontSize:12,color:"rgba(255,255,255,0.55)"}}>Producer: {project.producer}</span>}
              <span style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>📅 {project.startDate||"—"} → {project.deliveryDate||"—"}</span>
              {!isClient&&<span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>💰 {fmtCurrency(project.budget)}</span>}
            </div>
          </div>
          {(currentUser.role==="admin"||currentUser.role==="producer")
            ?<StatusDropdown stage={project.status} onChange={s=>up("status",s)}/>
            :<LifecyclePill stage={project.status}/>}
        </div>
      </div>
    </div>
    {/* ─── Tab bar ─────────────────────────────────────────────────── */}
    <div style={{background:"rgba(10,10,15,0.8)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"0 24px",flexShrink:0,display:"flex",gap:0,overflowX:"auto"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)}
          style={{background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"#5B7FFF":"transparent"}`,
            color:tab===t.id?"#fff":"rgba(255,255,255,0.4)",padding:"13px 16px",cursor:"pointer",fontSize:14,
            fontWeight:tab===t.id?600:400,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6,
            letterSpacing:"-0.01em",transition:"color 0.15s",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif"}}>
          {t.icon} {t.label}
        </button>
      ))}
    </div>

    <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
      {tab==="overview"&&<div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20,alignItems:"start"}}>
        {/* Left column */}
        <div>
          {/* Visual timeline */}
          <ProjectTimeline project={project}/>
          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
            {[
              {label:"Stage",val:LIFECYCLE_META[project.status]?.label,color:LIFECYCLE_META[project.status]?.color||C.text,icon:LIFECYCLE_META[project.status]?.icon},
              {label:"Delivery",val:project.deliveryDate,color:C.text,icon:"🎯"},
              ...(isClient?[]:[{label:"Budget",val:fmtCurrency(project.budget),color:C.green,icon:"💰"}]),
            ].map(s=>(
              <div key={s.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:10,color:C.textMuted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.label}</div>
                <div style={{fontSize:15,fontWeight:700,color:s.color,display:"flex",alignItems:"center",gap:6}}>{s.icon&&<span>{s.icon}</span>}{s.val}</div>
              </div>
            ))}
          </div>
          {/* Documents + Creative counts */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>Documents</div>
              {Object.entries(project.documents||{}).map(([cat,items])=>(
                <div key={cat} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${C.border}28`}}>
                  <span style={{fontSize:12,color:C.textSec,textTransform:"capitalize"}}>{cat}</span>
                  <span style={{fontSize:12,fontWeight:600,color:C.text}}>{items.length}</span>
                </div>
              ))}
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>Creative</div>
              {Object.entries(project.creative||{}).map(([cat,items])=>(
                <div key={cat} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${C.border}28`}}>
                  <span style={{fontSize:12,color:C.textSec,textTransform:"capitalize"}}>{cat.replace(/([A-Z])/g," $1")}</span>
                  <span style={{fontSize:12,fontWeight:600,color:C.text}}>{items.length}</span>
                </div>
              ))}
            </div>
          </div>
          {canSeeInternal&&project.internalNotes&&(
            <div style={{background:"#0A0A12",border:`1px solid ${C.orange}30`,borderRadius:10,padding:"12px 16px"}}>
              <div style={{fontSize:10,color:C.orange,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.07em"}}>🔒 Internal Notes</div>
              <p style={{margin:0,fontSize:13,color:C.textSec}}>{project.internalNotes}</p>
            </div>
          )}
        </div>
        {/* Right: Quick Actions */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 16px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Quick Actions</div>
          {[
            {label:"Send Message",icon:"✉",color:C.cyan,onClick:()=>setTab("comments")},
            {label:"View Deliverables",icon:"▶",color:C.blue||C.cyan,onClick:()=>setTab("documents")},
            {label:"Upload Files",icon:"⬆",color:C.orange,onClick:()=>setShowUpload(true),hide:isClient},
            {label:"Customize Portal",icon:"🎨",color:C.purple||C.cyan,onClick:()=>setShowPortalCustomize(true),hide:isClient||(currentUser.role!=="admin"&&currentUser.role!=="producer")},
          ].filter(a=>!a.hide).map(a=>(
            <button key={a.label} onClick={a.onClick}
              style={{display:"flex",alignItems:"center",gap:10,background:a.color+"12",border:`1px solid ${a.color}30`,
                borderRadius:8,padding:"10px 14px",cursor:"pointer",color:a.color,fontSize:12,fontWeight:600,textAlign:"left",width:"100%"}}
              onMouseEnter={e=>{e.currentTarget.style.background=a.color+"20";e.currentTarget.style.borderColor=a.color+"55";}}
              onMouseLeave={e=>{e.currentTarget.style.background=a.color+"12";e.currentTarget.style.borderColor=a.color+"30";}}>
              <span style={{fontSize:14}}>{a.icon}</span>{a.label}
            </button>
          ))}
          {/* Project stats */}
          <div style={{marginTop:8,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Stats</div>
            {[
              {label:"Assets",val:project.posts?.length||0,icon:"🎬"},
              {label:"Docs",val:Object.values(project.documents||{}).flat().length,icon:"📁"},
              {label:"Comments",val:(project.clientComments||[]).filter(c=>!c.resolved).length,icon:"💬"},
            ].map(s=>(
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}>
                <span style={{fontSize:12,color:C.textSec}}>{s.icon} {s.label}</span>
                <span style={{fontSize:13,fontWeight:700,color:C.text}}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {tab==="updates"&&<ProjectActivityFeed project={project}/>}

      {tab==="documents"&&<DocumentsPanel docs={project.documents} onUpdate={d=>up("documents",d)} isClient={isClient} canApprove={canApprove}/>}
      {tab==="creative"&&<CreativePanel creative={project.creative} onUpdate={d=>up("creative",d)} isClient={isClient} canApprove={canApprove}/>}
      {tab==="crew"&&<CrewPanel crew={project.crew} talent={project.talent} callsheets={project.callsheets||[]} onUpdateCrew={c=>up("crew",c)} onUpdateTalent={t=>up("talent",t)} onUpdateCallsheets={cs=>up("callsheets",cs)} isClient={isClient} projectTitle={project.title}/>}
      {tab==="producer"&&<ProducerSection producer={project.producer_data||(typeof project.producer==="object"?project.producer:{vendors:[],permits:[],rentals:[],travel:[],productionNotes:"",postNotes:""})} onUpdate={d=>up("producer_data",d)} isClient={isClient}/>}
      {tab==="post"&&<PostPanel posts={project.posts} onUpdate={p=>up("posts",p)} isClient={isClient} canApprove={canApprove}/>}
      {tab==="wrap"&&<WrapPanel wrap={project.wrap} onUpdate={w=>up("wrap",w)} isClient={isClient}/>}
      {tab==="comments"&&<ClientComments comments={project.clientComments} onUpdate={c=>up("clientComments",c)} currentUser={currentUser}/>}
    </div>
    {showUpload&&<UploadModal project={project} onClose={()=>setShowUpload(false)} onUpload={handleUpload}/>}
  </div>;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App(){
  const [user,setUser]=useState(null);
  const [logoUrl,setLogoUrl]=useState(null);
  const logoRef=useRef(null);
  const [projects,setProjects]=useState(SEED_PROJECTS);
  const [selectedId,setSelectedId]=useState(null);
  const [initialTab,setInitialTab]=useState("overview");
  const openProject=(id,tab="overview")=>{setSelectedId(id);setInitialTab(tab);};
  const [nav,setNav]=useState("projects");
  const [filterStage,setFilterStage]=useState("all");
  const [showNewProject,setShowNewProject]=useState(false);
  const [np,setNp]=useState({title:"",client:"",producer:"",deliveryDate:"",budget:"",status:"inquiry"});
  const [viewMode,setViewMode]=useState(()=>{const v=localStorage.getItem("framex_view_mode")||"grid";return v==="strip"?"list":v;});
  const switchView=(m)=>{setViewMode(m);localStorage.setItem("framex_view_mode",m);};
  const [wgSettings,setWgSettings]=useState(()=>{try{return JSON.parse(localStorage.getItem("framex_wg_settings")||"{}");}catch{return{};}});
  const [showWG,setShowWG]=useState(false);
  const [wgProject,setWgProject]=useState(null);

  if(!user) return <SignIn onSignIn={setUser} logoUrl={logoUrl}/>;

  const isClient=ROLES[user.role].isClient;
  const selected=projects.find(p=>p.id===selectedId);

  const updateProject=(updated)=>setProjects(ps=>ps.map(p=>p.id===updated.id?updated:p));
  const deleteProject=(id)=>{setProjects(ps=>ps.filter(p=>p.id!==id));setSelectedId(null);};

  const handlePreviewAsClient=(userOrId)=>{
    const u=typeof userOrId==="string"?DEMO_USERS.find(u=>u.id===userOrId):userOrId;
    if(u) setUser(u);
  };

  if(isClient) return <ClientPortal user={user} projects={projects} onUpdateProject={updateProject} onSignOut={()=>setUser(null)} logoUrl={logoUrl} onLogoChange={setLogoUrl} clientBranding={wgSettings[user.company]||{}}/>;

  const createProject=()=>{
    if(!np.title.trim())return;
    const p={id:Date.now(),title:np.title,client:np.client||"—",clientId:null,status:np.status,producer:np.producer||user.name,
      startDate:new Date().toISOString().slice(0,10),deliveryDate:np.deliveryDate||"TBD",budget:parseInt(np.budget)||0,
      documents:{contracts:[],budgets:[],estimates:[],invoices:[],schedules:[]},
      creative:{pitchDecks:[],moodBoards:[],locationScouts:[],storyboards:[]},
      crew:[],talent:[],callsheets:[],
      producer_data:{vendors:[],permits:[],rentals:[],travel:[],productionNotes:"",postNotes:""},
      wrap:{finalInvoices:[],expenseReports:[],signedContracts:[],releases:[],deliverables:[],wrapNotes:""},
      clientComments:[],internalNotes:"",posts:[],portalSettings:{}};
    setProjects(ps=>[...ps,p]);
    setNp({title:"",client:"",producer:"",deliveryDate:"",budget:"",status:"inquiry"});
    setShowNewProject(false);
  };

  const visibleProjects=isClient
    ? projects.filter(p=>p.clientId===user.id||p.client===user.company)
    : filterStage==="all"?projects:projects.filter(p=>p.status===filterStage);

  // Project detail view
  if(selected) return (
    <div style={{height:"100vh",background:C.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',sans-serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{position:"relative",height:56,flexShrink:0,overflow:"hidden"}}>
        {(user.role==="admin"||user.role==="producer")&&<>
          <video autoPlay loop muted playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:0}}>
            <source src={FF_BG_VIDEO} type="video/mp4"/>
          </video>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(0,0,0,0.92) 0%,rgba(10,0,30,0.7) 50%,rgba(0,0,0,0.92) 100%)",zIndex:1}}/>
        </>}
        <div style={{position:"relative",zIndex:2,height:"100%",background:(user.role==="admin"||user.role==="producer")?"transparent":"rgba(10,10,15,0.95)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid rgba(139,47,255,0.25)",display:"flex",alignItems:"center",padding:"0 24px",gap:14}}>
          <img src={logoUrl||FF_LOGO} alt="Full Flux" style={{height:38,objectFit:"contain",cursor:"pointer"}} onClick={()=>logoRef.current?.click()}/>
          <input ref={logoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setLogoUrl(ev.target.result);r.readAsDataURL(f);}}}/>
          <div style={{width:1,height:20,background:"rgba(255,255,255,0.1)"}}/>
          <button onClick={()=>setSelectedId(null)} style={{background:"none",border:"none",color:"#2B8EFF",cursor:"pointer",fontSize:13,padding:"4px 0",display:"flex",alignItems:"center",gap:4,fontFamily:"inherit"}}>‹ Projects</button>
          <div style={{width:1,height:16,background:"rgba(255,255,255,0.1)"}}/>
          <span style={{fontSize:14,fontWeight:600,color:"#fff",letterSpacing:"-0.02em"}}>{selected.title}</span>
          <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:11,color:ROLES[user.role].color,background:ROLES[user.role].color+"18",border:`1px solid ${ROLES[user.role].color}30`,borderRadius:6,padding:"3px 10px",fontWeight:600}}>{ROLES[user.role].label}</span>
            <Avatar name={user.name} size={28}/>
            <button onClick={()=>setUser(null)} title="Sign out" style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:15,padding:"4px"}}>⏏</button>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflow:"hidden"}}>
        <ProjectDetail key={selected.id} project={selected} onUpdate={updateProject} currentUser={user} initTab={initialTab} onBack={()=>setSelectedId(null)}
          onDelete={deleteProject}
          onOpenWhiteGlove={()=>{setWgProject(selected);setShowWG(true);}}
          onPreviewAsClient={handlePreviewAsClient}/>
      </div>
      {showWG&&<WhiteGlovePanel allProjects={projects} initialProject={wgProject} onSettings={(k,st)=>setWgSettings(prev=>({...prev,[k]:st}))} onClose={()=>setShowWG(false)} onPreviewAsClient={handlePreviewAsClient} onProjectUpdate={updateProject}/>}
    </div>
  );

  // Projects dashboard
  return (
    <div style={{height:"100vh",background:C.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',sans-serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Top bar with video bg for admin/producer */}
      <div style={{position:"relative",height:64,flexShrink:0,overflow:"hidden"}}>
        {(user.role==="admin"||user.role==="producer")&&<>
          <video autoPlay loop muted playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:0}}>
            <source src={FF_BG_VIDEO} type="video/mp4"/>
          </video>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(0,0,0,0.92) 0%,rgba(10,0,30,0.75) 50%,rgba(0,0,0,0.92) 100%)",zIndex:1}}/>
        </>}
        <div style={{position:"relative",zIndex:2,height:"100%",background:(user.role==="admin"||user.role==="producer")?"transparent":"rgba(10,10,15,0.95)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid rgba(139,47,255,0.2)",display:"flex",alignItems:"center",padding:"0 24px",gap:16}}>
          <input ref={logoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setLogoUrl(ev.target.result);r.readAsDataURL(f);}}}/>
          <img src={logoUrl||FF_LOGO} alt="Full Flux" style={{height:44,objectFit:"contain",cursor:"pointer"}} onClick={()=>logoRef.current?.click()}/>
          <div style={{width:1,height:26,background:"rgba(255,255,255,0.1)"}}/>
          <span style={{fontSize:16,fontWeight:600,color:"#fff",letterSpacing:"-0.02em"}}>{isClient?"Client Portal":"Projects"}</span>
          <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
            {!isClient&&<Btn variant="primary" onClick={()=>setShowNewProject(true)} style={{fontSize:13,padding:"8px 16px",borderRadius:10}}>+ New Project</Btn>}
            {(user.role==="admin"||user.role==="producer")&&<Btn variant="ghost" onClick={()=>{setWgProject(null);setShowWG(true);}} style={{fontSize:12,padding:"6px 12px"}}>⚙ White Glove</Btn>}
            <span style={{fontSize:11,color:ROLES[user.role].color,background:ROLES[user.role].color+"18",border:`1px solid ${ROLES[user.role].color}30`,borderRadius:6,padding:"3px 10px",fontWeight:600}}>{ROLES[user.role].label}</span>
            <Avatar name={user.name} size={30}/>
            <button onClick={()=>setUser(null)} title="Sign out" style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:16,padding:"4px"}}>⏏</button>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:24}}>

        {/* Client portal header */}
        {isClient&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 22px",marginBottom:20}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <Avatar name={user.name} size={44}/>
            <div><div style={{fontSize:18,fontWeight:700,color:C.text}}>{user.name}</div>
            <div style={{fontSize:13,color:C.textSec}}>{user.company}</div>
            <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>Client Portal · {visibleProjects.length} active project{visibleProjects.length!==1?"s":""}</div></div>
          </div>
        </div>}

        {/* Project grid */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,minHeight:24}}>
          <div>
            {!isClient&&filterStage!=="all"&&<>
              <span style={{fontSize:12,fontWeight:700,color:LIFECYCLE_META[filterStage].color}}>{LIFECYCLE_META[filterStage].icon} {LIFECYCLE_META[filterStage].label}</span>
              <button onClick={()=>setFilterStage("all")} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:11,marginLeft:10}}>✕ Clear filter</button>
            </>}
          </div>
          <ViewToggle value={viewMode} onChange={switchView}/>
        </div>

        {visibleProjects.length===0&&<div style={{textAlign:"center",padding:"80px 0",color:C.textMuted}}>
          <div style={{fontSize:48,marginBottom:16}}>📂</div>
          <p>{isClient?"No projects shared with you yet.":"No projects in this stage."}</p>
        </div>}

        {viewMode==="list"
          ?<div>{visibleProjects.map(p=><ProjectStripCard key={p.id} project={p} onClick={()=>openProject(p.id)} onDelete={deleteProject} isClient={isClient}/>)}</div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
            {visibleProjects.map(p=><ProjectGridCard key={p.id} project={p} onOpen={tab=>openProject(p.id,tab)} onDelete={deleteProject} isClient={isClient}/>)}
          </div>
        }
      </div>

      {/* New Project Modal */}
      {showWG&&<WhiteGlovePanel allProjects={projects} initialProject={wgProject} onSettings={(k,st)=>setWgSettings(prev=>({...prev,[k]:st}))} onClose={()=>setShowWG(false)} onPreviewAsClient={handlePreviewAsClient} onProjectUpdate={updateProject}/>}
      {showNewProject&&<Modal title="New Project" onClose={()=>setShowNewProject(false)}>
        <Input label="Project Title" value={np.title} onChange={e=>setNp(p=>({...p,title:e.target.value}))} placeholder="Dragon Awakening — VFX Package"/>
        <Input label="Client" value={np.client} onChange={e=>setNp(p=>({...p,client:e.target.value}))} placeholder="Paramount Pictures"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Lead Producer" value={np.producer} onChange={e=>setNp(p=>({...p,producer:e.target.value}))} placeholder={user.name}/>
          <Input label="Delivery Date" value={np.deliveryDate} onChange={e=>setNp(p=>({...p,deliveryDate:e.target.value}))} type="date"/>
          <Input label="Budget (£)" value={np.budget} onChange={e=>setNp(p=>({...p,budget:e.target.value}))} placeholder="250000" type="number"/>
          <div><label style={{fontSize:10,color:C.textMuted,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Starting Stage</label>
            <select value={np.status} onChange={e=>setNp(p=>({...p,status:e.target.value}))} style={{width:"100%",background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 10px",color:C.text,fontSize:13,outline:"none"}}>
              {LIFECYCLE.map(s=><option key={s} value={s}>{LIFECYCLE_META[s].icon} {LIFECYCLE_META[s].label}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
          <Btn variant="ghost" onClick={()=>setShowNewProject(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={createProject}>Create Project</Btn>
        </div>
      </Modal>}
    </div>
  );
}
