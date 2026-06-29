import { useState, useRef } from "react";
import ClientPortal from './ClientPortal';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:"#08080B",surface:"#0F0F14",card:"#141419",
  border:"#252530",borderHover:"#383848",
  orange:"#FF5500",orangeLow:"#FF550018",
  cyan:"#00C2FF",cyanLow:"#00C2FF15",
  green:"#00E676",greenLow:"#00E67615",
  yellow:"#FFD600",yellowLow:"#FFD60015",
  red:"#FF3D3D",redLow:"#FF3D3D15",
  purple:"#B57BFF",purpleLow:"#B57BFF15",
  teal:"#00FFB8",tealLow:"#00FFB815",
  pink:"#FF6EC7",pinkLow:"#FF6EC715",
  text:"#EEEEF5",textSec:"#8A8A9A",textMuted:"#484858",
};

const STATUS_META = {
  approved:  {label:"Approved",      color:C.green,  bg:C.greenLow},
  in_review: {label:"In Review",     color:C.yellow, bg:C.yellowLow},
  pending:   {label:"Pending",       color:C.textSec,bg:"#1E1E28"},
  changes:   {label:"Changes Req.",  color:C.red,    bg:C.redLow},
  locked:    {label:"Locked",        color:C.purple, bg:C.purpleLow},
  draft:     {label:"Draft",         color:C.textMuted,bg:"#141419"},
  signed:    {label:"Signed",        color:C.cyan,   bg:C.cyanLow},
  sent:      {label:"Sent",          color:C.teal,   bg:C.tealLow},
  inquiry:   {label:"Inquiry",       color:C.pink,   bg:C.pinkLow},
  awarded:   {label:"Awarded",       color:C.orange, bg:C.orangeLow},
  wrap:      {label:"Wrap",          color:C.purple, bg:C.purpleLow},
  archived:  {label:"Archived",      color:C.textMuted,bg:"#1A1A22"},
};

const LIFECYCLE = ["inquiry","awarded","pre","prod","vfx3d","post","wrap","archived"];
const LIFECYCLE_META = {
  inquiry: {label:"Inquiry",      color:C.pink,   icon:"📬"},
  awarded: {label:"Awarded",      color:C.orange, icon:"🏆"},
  pre:     {label:"Pre-Pro",      color:C.purple, icon:"🎭"},
  prod:    {label:"Production",   color:C.yellow, icon:"🎥"},
  vfx3d:   {label:"3D VFX",       color:C.teal,   icon:"🧊"},
  post:    {label:"Post",         color:C.cyan,   icon:"✨"},
  wrap:    {label:"Wrap",         color:C.green,  icon:"📦"},
  archived:{label:"Archived",     color:C.textMuted,icon:"🗃"},
};

const ROLES = {
  admin:       {label:"Admin",       color:C.orange, canSeeInternal:true,  canApprove:true,  isClient:false},
  producer:    {label:"Producer",    color:C.yellow, canSeeInternal:true,  canApprove:true,  isClient:false},
  coordinator: {label:"Coordinator", color:C.cyan,   canSeeInternal:true,  canApprove:false, isClient:false},
  vfx_artist:  {label:"VFX Artist",  color:C.teal,   canSeeInternal:true,  canApprove:false, isClient:false},
  accountant:  {label:"Accountant",  color:C.purple, canSeeInternal:true,  canApprove:false, isClient:false},
  client:      {label:"Client",      color:C.green,  canSeeInternal:false, canApprove:true,  isClient:true},
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
    primary:{background:C.orange,border:"none",color:"#fff",fontWeight:700},
    cyan:   {background:C.cyanLow,border:`1px solid ${C.cyan}50`,color:C.cyan,fontWeight:600},
    green:  {background:C.greenLow,border:`1px solid ${C.green}50`,color:C.green,fontWeight:600},
    red:    {background:C.redLow,border:`1px solid ${C.red}50`,color:C.red,fontWeight:600},
    ghost:  {background:"#1E1E2A",border:`1px solid ${C.border}`,color:C.textSec},
    purple: {background:C.purpleLow,border:`1px solid ${C.purple}50`,color:C.purple,fontWeight:600},
    teal:   {background:C.tealLow,border:`1px solid ${C.teal}50`,color:C.teal,fontWeight:600},
    pink:   {background:C.pinkLow,border:`1px solid ${C.pink}50`,color:C.pink,fontWeight:600},
  };
  return <button onClick={onClick} disabled={disabled} style={{borderRadius:7,padding:"7px 14px",cursor:disabled?"default":"pointer",fontSize:12,opacity:disabled?0.5:1,...s[variant],...style}}>{children}</button>;
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
  if(mimeType.startsWith("video/")||["mp4","mov","webm","avi","mkv"].includes(ext))return "video";
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

  return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif",padding:20}}>
    <div style={{width:"100%",maxWidth:420}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        {logoUrl?<img src={logoUrl} alt="Logo" style={{height:52,objectFit:"contain",marginBottom:12}}/>:
          <div style={{display:"inline-flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:42,height:42,background:C.orange,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🎬</div>
            <div style={{textAlign:"left"}}><div style={{fontSize:20,fontWeight:800,color:C.text,letterSpacing:"-0.04em"}}>FRAME<span style={{color:C.orange}}>X</span></div>
            <div style={{fontSize:9,color:C.textMuted,letterSpacing:"0.12em",textTransform:"uppercase"}}>Production Suite</div></div>
          </div>}
        <p style={{margin:0,fontSize:13,color:C.textMuted}}>Sign in to your workspace</p>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:26,marginBottom:14}}>
        <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@studio.com" type="email"/>
        <div style={{marginBottom:16,position:"relative"}}>
          <label style={{fontSize:10,color:C.textMuted,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Password</label>
          <input value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} type={showPass?"text":"password"} placeholder="••••••••"
            style={{width:"100%",background:"#0D0D14",border:`1px solid ${err?C.red+"60":C.border}`,borderRadius:6,padding:"8px 38px 8px 10px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          <button onClick={()=>setShowPass(p=>!p)} style={{position:"absolute",right:10,top:26,background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:13}}>{showPass?"🙈":"👁"}</button>
        </div>
        {err&&<div style={{background:C.redLow,border:`1px solid ${C.red}40`,borderRadius:7,padding:"8px 12px",marginBottom:14,fontSize:12,color:C.red}}>{err}</div>}
        <button onClick={attempt} disabled={loading} style={{width:"100%",background:C.orange,border:"none",color:"#fff",borderRadius:8,padding:"12px",cursor:"pointer",fontSize:14,fontWeight:700}}>{loading?"Signing in…":"Sign In →"}</button>
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
        <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Demo accounts</div>
        {DEMO_USERS.map(u=>(
          <button key={u.id} onClick={()=>onSignIn(u)} style={{display:"flex",alignItems:"center",gap:10,background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",cursor:"pointer",textAlign:"left",width:"100%",marginBottom:6}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=ROLES[u.role].color+"60"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
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

function UploadModal({project,onClose,onUpload}){
  const [section,setSection]=useState("documents");
  const [cat,setCat]=useState("contracts");
  const [files,setFiles]=useState([]);
  const [statuses,setStatuses]=useState({});
  const [isUploading,setIsUploading]=useState(false);
  const [version,setVersion]=useState("v01");
  const [notes,setNotes]=useState("");
  const [dragging,setDragging]=useState(false);
  const fileRef=useRef(null);

  const SECS={
    documents:{label:"Documents",icon:"📁",color:C.cyan,cats:{contracts:"Contracts",budgets:"Budgets",estimates:"Estimates",invoices:"Invoices",schedules:"Schedules"}},
    creative:{label:"Creative",icon:"🎨",color:C.purple,cats:{pitchDecks:"Pitch Decks",moodBoards:"Mood Boards",locationScouts:"Location Scouts",storyboards:"Storyboards"}},
    post:{label:"Post / VFX",icon:"✨",color:C.orange,cats:null},
    wrap:{label:"Wrap",icon:"📦",color:C.green,cats:{finalInvoices:"Final Invoices",expenseReports:"Expense Reports",signedContracts:"Signed Contracts",releases:"Releases",deliverables:"Deliverables"}},
  };
  const sec=SECS[section];
  const changeSection=(s)=>{setSection(s);setCat(Object.keys(SECS[s].cats||{})[0]||"post");};
  const addFiles=(fs)=>setFiles(prev=>[...prev,...Array.from(fs)]);
  const removeFile=(i)=>setFiles(prev=>prev.filter((_,j)=>j!==i));
  const doUpload=async()=>{
    if(!files.length||isUploading)return;
    setIsUploading(true);
    const results=[];
    for(let i=0;i<files.length;i++){
      setStatuses(prev=>({...prev,[i]:"uploading"}));
      const url=await uploadFile(files[i],`${section}/${cat}`);
      setStatuses(prev=>({...prev,[i]:"done"}));
      results.push({file:files[i],url});
    }
    onUpload(section,cat,results,{version,notes});
    onClose();
  };
  const iStyle={background:"#0A0A16",border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"};

  return (
    <div style={{position:"fixed",inset:0,background:"#000000CC",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,width:"100%",maxWidth:560,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
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
          {/* Category picker */}
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
            style={{border:`2px dashed ${dragging?C.cyan:C.border}`,borderRadius:12,padding:"32px 20px",textAlign:"center",cursor:"pointer",background:dragging?C.cyan+"08":C.surface,transition:"all 0.2s"}}>
            <div style={{fontSize:32,marginBottom:8}}>📂</div>
            <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:4}}>Drop files here</div>
            <div style={{fontSize:11,color:C.textMuted}}>or click to browse</div>
            <input ref={fileRef} type="file" multiple style={{display:"none"}} onChange={e=>addFiles(e.target.files)}/>
          </div>
          {/* File list */}
          {files.length>0&&(
            <div>
              <label style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>Selected ({files.length})</label>
              {files.map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"#0A0A16",borderRadius:7,padding:"8px 12px",marginBottom:5}}>
                  <FileIcon name={f.name} mimeType={f.type} size={28} fallback="📄"/>
                  <span style={{flex:1,fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span>
                  <span style={{fontSize:10,color:C.textMuted,flexShrink:0}}>{(f.size/1024/1024).toFixed(1)}MB</span>
                  {statuses[i]==="uploading"&&<span style={{fontSize:10,color:C.cyan,flexShrink:0}}>⬆…</span>}
                  {statuses[i]==="done"&&<span style={{fontSize:10,color:C.green,flexShrink:0}}>✓</span>}
                  {!statuses[i]&&!isUploading&&<button onClick={()=>removeFile(i)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:14,flexShrink:0,padding:2}}>✕</button>}
                </div>
              ))}
            </div>
          )}
          {/* Version + notes */}
          <div style={{display:"flex",gap:12}}>
            {section==="post"&&(
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
            {isUploading?"⬆ Uploading…":`⬆ Upload${files.length>1?` ${files.length} files`:files.length===1?" 1 file":""}`}
          </Btn>
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

  return <div>
    {uploading>0&&<div style={{background:C.cyan+"15",border:`1px solid ${C.cyan}30`,borderRadius:6,padding:"7px 14px",marginBottom:14,fontSize:11,color:C.cyan}}>⬆ Uploading {uploading} file{uploading>1?"s":""}…</div>}
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
          </div>
        ))}
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
  const addComment=(cat,id,text)=>{
    const comment={id:`cmt${Date.now()}`,author:"You",text,date:new Date().toISOString().slice(0,10),resolved:false};
    onUpdate({...creative,[cat]:creative[cat].map(i=>i.id===id?{...i,comments:[...(i.comments||[]),comment]}:i)});
  };
  const [commentInputs,setCommentInputs]=useState({});
  const [previewEntry,setPreviewEntry]=useState(null);

  return <div>
    {uploading>0&&<div style={{background:C.cyan+"15",border:`1px solid ${C.cyan}30`,borderRadius:6,padding:"7px 14px",marginBottom:14,fontSize:11,color:C.cyan}}>⬆ Uploading {uploading} file{uploading>1?"s":""}…</div>}
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
            </div>
            {/* Comments */}
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
      </div>;
    })}
    {previewEntry&&<PreviewModal entry={previewEntry} onClose={()=>setPreviewEntry(null)}/>}
  </div>;
}

// ─── Crew & Talent Panel ──────────────────────────────────────────────────────

function CrewPanel({crew,talent,onUpdateCrew,onUpdateTalent,isClient}){
  const [addingCrew,setAddingCrew]=useState(false);
  const [addingTalent,setAddingTalent]=useState(false);
  const [nc,setNc]=useState({name:"",role:"",email:"",phone:"",rate:"",dietary:"",notes:""});
  const [nt,setNt]=useState({name:"",agent:"",agentEmail:"",rate:"",usage:"",dietary:"",notes:""});

  if(isClient) return <div style={{padding:"40px 0",textAlign:"center",color:C.textMuted}}><div style={{fontSize:40,marginBottom:12}}>🔒</div><p>Crew & talent details are internal only.</p></div>;

  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      {/* Crew */}
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

      {/* Talent */}
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
  </div>;
}

// ─── Producer Section ─────────────────────────────────────────────────────────

function ProducerSection({producer,onUpdate,isClient}){
  if(isClient) return <div style={{padding:"40px 0",textAlign:"center",color:C.textMuted}}><div style={{fontSize:40,marginBottom:12}}>🔒</div><p>Producer details are internal only.</p></div>;

  const addItem=(cat,item)=>onUpdate({...producer,[cat]:[...(producer[cat]||[]),item]});
  const [notes,setNotes]=useState({prod:producer.productionNotes||"",post:producer.postNotes||""});

  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
      {/* Vendors */}
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.orange,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>🏭 Vendors</div>
        {(producer.vendors||[]).map(v=>(
          <div key={v.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{v.name}</div>
            <div style={{fontSize:11,color:C.textMuted}}>{v.type} · {v.cost}</div></div>
            <Badge status={v.status} small/>
          </div>
        ))}
        <Btn variant="ghost" style={{fontSize:11,padding:"5px 10px",width:"100%",marginTop:6}} onClick={()=>addItem("vendors",{id:`v${Date.now()}`,name:"New Vendor",type:"Stage",cost:"TBD",status:"pending"})}>+ Add Vendor</Btn>
      </div>
      {/* Permits */}
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>📋 Permits</div>
        {(producer.permits||[]).map(p=>(
          <div key={p.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{p.location}</div>
            <div style={{fontSize:11,color:C.textMuted}}>{p.date}</div></div>
            <Badge status={p.status} small/>
          </div>
        ))}
        <Btn variant="ghost" style={{fontSize:11,padding:"5px 10px",width:"100%",marginTop:6}} onClick={()=>addItem("permits",{id:`p${Date.now()}`,location:"New Location",date:"TBD",status:"pending"})}>+ Add Permit</Btn>
      </div>
      {/* Rentals */}
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.purple,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>🎬 Rentals</div>
        {(producer.rentals||[]).map(r=>(
          <div key={r.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{r.item}</div>
            <div style={{fontSize:11,color:C.textMuted}}>{r.vendor} · {r.cost}</div></div>
            <Badge status={r.status} small/>
          </div>
        ))}
        <Btn variant="ghost" style={{fontSize:11,padding:"5px 10px",width:"100%",marginTop:6}} onClick={()=>addItem("rentals",{id:`r${Date.now()}`,item:"New Rental",vendor:"",cost:"TBD",status:"pending"})}>+ Add Rental</Btn>
      </div>
      {/* Travel */}
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>✈ Travel</div>
        {(producer.travel||[]).map(t=>(
          <div key={t.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 12px",marginBottom:6}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{t.who} → {t.to}</div>
            <div style={{fontSize:11,color:C.textMuted}}>{t.dates} · {t.cost}</div>
          </div>
        ))}
        <Btn variant="ghost" style={{fontSize:11,padding:"5px 10px",width:"100%",marginTop:6}} onClick={()=>addItem("travel",{id:`tr${Date.now()}`,who:"",to:"",dates:"",cost:"TBD",status:"booked"})}>+ Add Travel</Btn>
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

  return <div>
    {uploading>0&&<div style={{background:C.cyan+"15",border:`1px solid ${C.cyan}30`,borderRadius:6,padding:"7px 14px",marginBottom:14,fontSize:11,color:C.cyan}}>⬆ Uploading {uploading} file{uploading>1?"s":""}…</div>}
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
        {items.map(item=>(
          <div key={item.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
            <FileIcon name={item.name} mimeType={item.mimeType||""} previewUrl={item.previewUrl} size={28} fallback={cat.icon}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
            <div style={{fontSize:10,color:C.textMuted}}>{item.date}</div></div>
            <Badge status={item.status} small/>
            <Btn variant="ghost" onClick={()=>item.previewUrl?setPreviewEntry(item):doDownload(item)} style={{fontSize:10,padding:"4px 8px",opacity:item.previewUrl?1:0.4}}>{item.previewUrl?"👁":"⬇"}</Btn>
          </div>
        ))}
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
  const [uploading,setUploading]=useState(0);
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
      {visible.length===0&&<p style={{color:C.textMuted,textAlign:"center",padding:"40px 0"}}>No assets yet.</p>}
      {visible.map(asset=>(
        <div key={asset.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:7,background:C.cyanLow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎬</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{asset.name}</div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginTop:2}}>
              <span style={{fontSize:10,color:C.textMuted,fontFamily:"monospace"}}>{asset.version}</span>
              {asset.comments.filter(c=>!c.resolved).length>0&&<span style={{fontSize:10,background:C.orangeLow,color:C.orange,borderRadius:8,padding:"1px 6px",border:`1px solid ${C.orange}35`}}>{asset.comments.filter(c=>!c.resolved).length} notes</span>}
              {asset.shared&&isClient&&<span style={{fontSize:10,color:C.green}}>● Shared</span>}
            </div>
          </div>
          <Badge status={asset.status} small/>
          <Btn variant="cyan" onClick={()=>{setPlaying(asset);setT(0);setRunning(false);clearInterval(timerRef.current);}} style={{fontSize:11,padding:"5px 10px"}}>▶ Review</Btn>
          {!isClient&&<button onClick={()=>toggleShare(asset.id)} style={{background:asset.shared?C.greenLow:"#1E1E28",border:`1px solid ${asset.shared?C.green+"50":C.border}`,color:asset.shared?C.green:C.textMuted,borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:10}}>{asset.shared?"👁":"Share"}</button>}
          {canApprove&&<Btn variant="green" onClick={()=>updateStatus(asset.id,"approved")} style={{fontSize:10,padding:"4px 8px"}}>✓</Btn>}
        </div>
      ))}
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
        {playing.previewUrl&&playing.mimeType?.startsWith("video/")
          ?<video src={playing.previewUrl} controls style={{maxWidth:"100%",maxHeight:340,borderRadius:8,background:"#000",display:"block"}}/>
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
  const add=()=>{
    if(!text.trim())return;
    onUpdate([...comments,{id:`cc${Date.now()}`,author:currentUser.name,date:new Date().toISOString().slice(0,10),text,resolved:false}]);
    setText("");
  };
  return <div>
    <div style={{marginBottom:14}}>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} placeholder="Leave a comment or feedback for the team…"
        style={{width:"100%",background:"#0D0D14",border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><Btn variant="primary" onClick={add}>Post Comment</Btn></div>
    </div>
    {comments.length===0&&<p style={{color:C.textMuted,fontSize:13,textAlign:"center",padding:"20px 0"}}>No comments yet.</p>}
    {[...comments].reverse().map(c=>(
      <div key={c.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <Avatar name={c.author} size={28}/><div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.author}</div>
          <div style={{fontSize:10,color:C.textMuted}}>{c.date}</div></div>
          {!c.resolved&&<span style={{marginLeft:"auto",fontSize:10,background:C.yellowLow,color:C.yellow,border:`1px solid ${C.yellow}35`,borderRadius:4,padding:"2px 7px"}}>Open</span>}
          {c.resolved&&<span style={{marginLeft:"auto",fontSize:10,background:C.greenLow,color:C.green,border:`1px solid ${C.green}35`,borderRadius:4,padding:"2px 7px"}}>Resolved</span>}
          {!ROLES[currentUser.role].isClient&&<button onClick={()=>onUpdate(comments.map(x=>x.id===c.id?{...x,resolved:!x.resolved}:x))} style={{background:"none",border:`1px solid ${C.border}`,color:c.resolved?C.green:C.textMuted,borderRadius:4,padding:"2px 7px",cursor:"pointer",fontSize:10}}>{c.resolved?"↩ Reopen":"✓ Resolve"}</button>}
        </div>
        <p style={{margin:0,fontSize:13,color:C.textSec}}>{c.text}</p>
      </div>
    ))}
  </div>;
}

// ─── Project Detail ───────────────────────────────────────────────────────────

function ProjectDetail({project,onUpdate,currentUser,onBack}){
  const isClient=ROLES[currentUser.role].isClient;
  const canApprove=ROLES[currentUser.role].canApprove;
  const canSeeInternal=ROLES[currentUser.role].canSeeInternal;

  const internalTabs=[
    {id:"overview",label:"Overview",icon:"📊"},
    {id:"documents",label:"Documents",icon:"📁"},
    {id:"creative",label:"Creative",icon:"🎨"},
    {id:"crew",label:"Crew & Talent",icon:"👥"},
    {id:"producer",label:"Producer",icon:"🎬"},
    {id:"post",label:"Post / VFX",icon:"✨"},
    {id:"wrap",label:"Wrap",icon:"📦"},
    {id:"comments",label:"Comments",icon:"💬"},
  ];
  const clientTabs=[
    {id:"overview",label:"Overview",icon:"📊"},
    {id:"documents",label:"Documents",icon:"📁"},
    {id:"creative",label:"Creative",icon:"🎨"},
    {id:"post",label:"Review",icon:"✨"},
    {id:"comments",label:"Comments",icon:"💬"},
  ];
  const tabs=isClient?clientTabs:internalTabs;
  const [tab,setTab]=useState("overview");

  const up=(field,val)=>onUpdate({...project,[field]:val});
  const [showUpload,setShowUpload]=useState(false);
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
    } else if(section==="wrap"){
      const newItems=uploaded.map(({file,url},i)=>({id:`w${now+i}`,name:file.name,status:"pending",date:new Date().toISOString().slice(0,10),mimeType:file.type,previewUrl:url,notes:meta.notes}));
      up("wrap",{...project.wrap,[category]:[...(project.wrap[category]||[]),...newItems]});
    }
  };

  return <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
    {/* Project header */}
    <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10,gap:12}}>
        <div style={{flex:1,minWidth:0}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:12,padding:0,marginBottom:6}}>← All Projects</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{project.title}</h2>
          <div style={{display:"flex",gap:10,alignItems:"center",marginTop:4,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:C.textSec}}>{project.client}</span>
            {!isClient&&<span style={{fontSize:12,color:C.textMuted}}>Producer: {project.producer}</span>}
            <span style={{fontSize:12,color:C.textMuted}}>Delivery: {project.deliveryDate}</span>
            {!isClient&&<span style={{fontSize:12,fontWeight:700,color:C.green}}>{fmtCurrency(project.budget)}</span>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          {!isClient&&<Btn variant="cyan" onClick={()=>setShowUpload(true)} style={{fontSize:11,padding:"6px 14px",whiteSpace:"nowrap"}}>⬆ Upload</Btn>}
          <LifecyclePill stage={project.status}/>
        </div>
      </div>
      {canSeeInternal&&<LifecycleBar current={project.status} onChange={s=>up("status",s)} canEdit={!isClient}/>}
      {/* Tabs */}
      <div style={{display:"flex",gap:0,overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?C.orange:"transparent"}`,color:tab===t.id?C.orange:C.textSec,padding:"8px 14px",cursor:"pointer",fontSize:12,fontWeight:tab===t.id?600:400,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
    </div>

    <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
      {tab==="overview"&&<div>
        {/* Overview cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {label:"Status",val:LIFECYCLE_META[project.status]?.label,color:LIFECYCLE_META[project.status]?.color||C.text},
            {label:"Delivery",val:project.deliveryDate,color:C.text},
            ...(isClient?[]:[{label:"Budget",val:fmtCurrency(project.budget),color:C.green}]),
            {label:"Producer",val:project.producer,color:C.text},
          ].map(s=>(
            <div key={s.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontSize:10,color:C.textMuted,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:14,fontWeight:700,color:s.color}}>{s.val}</div>
            </div>
          ))}
        </div>
        {/* Quick stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>Documents</div>
            {Object.entries(project.documents).map(([cat,items])=>(
              <div key={cat} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${C.border}30`}}>
                <span style={{fontSize:12,color:C.textSec,textTransform:"capitalize"}}>{cat}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.text}}>{items.length}</span>
              </div>
            ))}
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>Creative</div>
            {Object.entries(project.creative).map(([cat,items])=>(
              <div key={cat} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${C.border}30`}}>
                <span style={{fontSize:12,color:C.textSec,textTransform:"capitalize"}}>{cat.replace(/([A-Z])/g," $1")}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.text}}>{items.length}</span>
              </div>
            ))}
          </div>
        </div>
        {canSeeInternal&&project.internalNotes&&(
          <div style={{marginTop:14,background:"#0A0A12",border:`1px solid ${C.orange}30`,borderRadius:8,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:C.orange,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.07em"}}>🔒 Internal Notes</div>
            <p style={{margin:0,fontSize:13,color:C.textSec}}>{project.internalNotes}</p>
          </div>
        )}
      </div>}

      {tab==="documents"&&<DocumentsPanel docs={project.documents} onUpdate={d=>up("documents",d)} isClient={isClient} canApprove={canApprove}/>}
      {tab==="creative"&&<CreativePanel creative={project.creative} onUpdate={d=>up("creative",d)} isClient={isClient} canApprove={canApprove}/>}
      {tab==="crew"&&<CrewPanel crew={project.crew} talent={project.talent} onUpdateCrew={c=>up("crew",c)} onUpdateTalent={t=>up("talent",t)} isClient={isClient}/>}
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
  const [nav,setNav]=useState("projects");
  const [filterStage,setFilterStage]=useState("all");
  const [showNewProject,setShowNewProject]=useState(false);
  const [np,setNp]=useState({title:"",client:"",producer:"",deliveryDate:"",budget:"",status:"inquiry"});

  if(!user) return <SignIn onSignIn={setUser} logoUrl={logoUrl}/>;

  const isClient=ROLES[user.role].isClient;
  const selected=projects.find(p=>p.id===selectedId);

  const updateProject=(updated)=>setProjects(ps=>ps.map(p=>p.id===updated.id?updated:p));

  if(isClient) return <ClientPortal user={user} projects={projects} onUpdateProject={updateProject} onSignOut={()=>setUser(null)} logoUrl={logoUrl} onLogoChange={setLogoUrl}/>;

  const createProject=()=>{
    if(!np.title.trim())return;
    const p={id:Date.now(),title:np.title,client:np.client||"—",clientId:null,status:np.status,producer:np.producer||user.name,
      startDate:new Date().toISOString().slice(0,10),deliveryDate:np.deliveryDate||"TBD",budget:parseInt(np.budget)||0,
      documents:{contracts:[],budgets:[],estimates:[],invoices:[],schedules:[]},
      creative:{pitchDecks:[],moodBoards:[],locationScouts:[],storyboards:[]},
      crew:[],talent:[],
      producer_data:{vendors:[],permits:[],rentals:[],travel:[],productionNotes:"",postNotes:""},
      wrap:{finalInvoices:[],expenseReports:[],signedContracts:[],releases:[],deliverables:[],wrapNotes:""},
      clientComments:[],internalNotes:"",posts:[]};
    setProjects(ps=>[...ps,p]);
    setNp({title:"",client:"",producer:"",deliveryDate:"",budget:"",status:"inquiry"});
    setShowNewProject(false);
  };

  const visibleProjects=isClient
    ? projects.filter(p=>p.clientId===user.id||p.client===user.company)
    : filterStage==="all"?projects:projects.filter(p=>p.status===filterStage);

  // Project detail view
  if(selected) return (
    <div style={{height:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{height:50,background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 20px",gap:14,flexShrink:0}}>
        {logoUrl?<img src={logoUrl} alt="Logo" style={{height:28,objectFit:"contain",cursor:"pointer"}} onClick={()=>logoRef.current?.click()}/>:
          <div style={{fontSize:14,fontWeight:800,color:C.text,cursor:"pointer",letterSpacing:"-0.03em"}} onClick={()=>logoRef.current?.click()}>FRAME<span style={{color:C.orange}}>X</span></div>}
        <input ref={logoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setLogoUrl(ev.target.result);r.readAsDataURL(f);}}}/>
        <div style={{width:1,height:20,background:C.border}}/>
        <span style={{fontSize:12,color:C.textSec}}>{selected.title}</span>
        <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:11,color:ROLES[user.role].color,background:ROLES[user.role].color+"18",border:`1px solid ${ROLES[user.role].color}35`,borderRadius:4,padding:"2px 8px",fontWeight:600}}>{ROLES[user.role].label}</span>
          <Avatar name={user.name} size={28}/>
          <button onClick={()=>setUser(null)} title="Sign out" style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:14}}>⏏</button>
        </div>
      </div>
      <div style={{flex:1,overflow:"hidden"}}>
        <ProjectDetail project={selected} onUpdate={updateProject} currentUser={user} onBack={()=>setSelectedId(null)}/>
      </div>
    </div>
  );

  // Projects dashboard
  return (
    <div style={{height:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Top bar */}
      <div style={{height:54,background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 24px",gap:14,flexShrink:0}}>
        <input ref={logoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setLogoUrl(ev.target.result);r.readAsDataURL(f);}}}/>
        {logoUrl
          ?<img src={logoUrl} alt="Logo" style={{height:34,objectFit:"contain",cursor:"pointer"}} onClick={()=>logoRef.current?.click()}/>
          :<div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>logoRef.current?.click()}>
            <div style={{width:30,height:30,background:C.orange,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🎬</div>
            <div><div style={{fontSize:13,fontWeight:800,color:C.text,letterSpacing:"-0.03em"}}>FRAME<span style={{color:C.orange}}>X</span></div>
            <div style={{fontSize:8,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase"}}>click to add logo</div></div>
          </div>}
        <div style={{width:1,height:24,background:C.border}}/>
        <span style={{fontSize:15,fontWeight:700,color:C.text}}>{isClient?"Client Portal":"Project Dashboard"}</span>
        <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
          {!isClient&&<Btn variant="primary" onClick={()=>setShowNewProject(true)}>+ New Project</Btn>}
          <span style={{fontSize:11,color:ROLES[user.role].color,background:ROLES[user.role].color+"18",border:`1px solid ${ROLES[user.role].color}35`,borderRadius:4,padding:"2px 8px",fontWeight:600}}>{ROLES[user.role].label}</span>
          <Avatar name={user.name} size={30}/>
          <button onClick={()=>setUser(null)} title="Sign out" style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:16}}>⏏</button>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:24}}>
        {/* Summary stats — internal only */}
        {!isClient&&<div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:10,marginBottom:22}}>
          {LIFECYCLE.map(stage=>{
            const m=LIFECYCLE_META[stage];
            const count=projects.filter(p=>p.status===stage).length;
            return <div key={stage} onClick={()=>setFilterStage(filterStage===stage?"all":stage)}
              style={{background:filterStage===stage?m.color+"20":C.card,border:`1px solid ${filterStage===stage?m.color+"60":C.border}`,borderRadius:8,padding:"10px 12px",cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{fontSize:16,marginBottom:3}}>{m.icon}</div>
              <div style={{fontSize:10,color:filterStage===stage?m.color:C.textMuted,marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:filterStage===stage?m.color:C.text}}>{count}</div>
            </div>;
          })}
        </div>}

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
        {!isClient&&filterStage!=="all"&&<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span style={{fontSize:12,fontWeight:700,color:LIFECYCLE_META[filterStage].color}}>{LIFECYCLE_META[filterStage].icon} {LIFECYCLE_META[filterStage].label}</span>
          <button onClick={()=>setFilterStage("all")} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:11}}>✕ Clear filter</button>
        </div>}

        {visibleProjects.length===0&&<div style={{textAlign:"center",padding:"80px 0",color:C.textMuted}}>
          <div style={{fontSize:48,marginBottom:16}}>📂</div>
          <p>{isClient?"No projects shared with you yet.":"No projects in this stage."}</p>
        </div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {visibleProjects.map(p=>{
            const sm=LIFECYCLE_META[p.status];
            const openComments=p.clientComments.filter(c=>!c.resolved).length;
            const docs=Object.values(p.documents).flat().length;
            return <div key={p.id} onClick={()=>setSelectedId(p.id)}
              style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:18,cursor:"pointer",transition:"border-color 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=sm.color+"60"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <LifecyclePill stage={p.status}/>
                {openComments>0&&<span style={{fontSize:10,background:C.yellowLow,color:C.yellow,border:`1px solid ${C.yellow}35`,borderRadius:8,padding:"2px 7px"}}>{openComments} comment{openComments!==1?"s":""}</span>}
              </div>
              <h3 style={{margin:"0 0 3px",fontSize:15,fontWeight:700,color:C.text,lineHeight:1.3}}>{p.title}</h3>
              <p style={{margin:"0 0 12px",fontSize:12,color:C.textMuted}}>{p.client}</p>
              {!isClient&&<div style={{display:"flex",gap:12,fontSize:11,color:C.textSec,marginBottom:10}}>
                <span>👤 {p.producer}</span>
                <span>📅 {p.deliveryDate}</span>
              </div>}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",fontSize:10}}>
                <span style={{background:"#1A1A22",color:C.textSec,borderRadius:4,padding:"2px 7px"}}>📁 {docs} docs</span>
                <span style={{background:"#1A1A22",color:C.textSec,borderRadius:4,padding:"2px 7px"}}>🎬 {p.posts.length} assets</span>
                {!isClient&&<span style={{background:"#1A1A22",color:C.textSec,borderRadius:4,padding:"2px 7px"}}>💰 {fmtCurrency(p.budget)}</span>}
              </div>
            </div>;
          })}
        </div>
      </div>

      {/* New Project Modal */}
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
