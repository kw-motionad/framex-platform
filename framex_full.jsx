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
   documents:{contracts:[{id:"doc1",name:"Master_Service_Agreement.pdf",status:"signed",uploader:"Ana P.",date:"2026-04-01",shared:true,esig:true}],budgets:[{id:"doc2",name:"TitanA_Budget_v3.xlsx",status:"approved",uploader:"Mike J.",date:"2026-04-15",shared:false,esig:false}],estimates:[{id:"doc3",name:"VFX_Estimate_v2.pdf",status:"sent",uploader:"Ana P.",date:"2026-04-10",shared:true,esig:false}],invoices:[{id:"doc4",name:"Invoice_001_50pct.pdf",status:"sent",uploader:"Mike J.",date:"2026-05-01",shared:true,esig:false}],schedules:[{id:"doc5",name:"Production_Schedule.pdf",status:"approved",uploader:"Ana P.",date:"2026-04-12",shared:true,esig:false}]},
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
   documents:{contracts:[],budgets:[{id:"doc6",name:"Dragon_Budget_Draft.xlsx",status:"draft",uploader:"Mike J.",date:"2026-06-05",shared:false,esig:false}],estimates:[{id:"doc7",name:"VFX_Estimate_v1.pdf",status:"draft",uploader:"Ana P.",date:"2026-06-04",shared:false,esig:false}],invoices:[],schedules:[]},
   creative:{pitchDecks:[{id:"cr4",name:"Dragon_Pitch_Deck.pdf",status:"approved",shared:true,uploader:"Sarah D.",comments:[]}],moodBoards:[{id:"cr5",name:"Creature_Refs.jpg",status:"in_review",shared:false,uploader:"Jake M.",comments:[]}],locationScouts:[{id:"cr6",name:"Iceland_Recce_Notes.pdf",status:"pending",shared:false,uploader:"Ana P.",comments:[]}],storyboards:[]},
   crew:[],talent:[],
   producer_data:{vendors:[],permits:[],rentals:[],travel:[{id:"tr1",who:"Ana P.",to:"Reykjavik",dates:"Jul 10-12",cost:"£1800",status:"booked"}],productionNotes:"",postNotes:""},
   wrap:{finalInvoices:[],expenseReports:[],signedContracts:[],releases:[],deliverables:[],wrapNotes:""},
   clientComments:[],internalNotes:"Greenlight pending Disney legal review.",
   posts:[],
  },
  {id:3,title:"Neon City Commercial",client:"Netflix",clientId:null,status:"wrap",producer:"Ana P.",startDate:"2026-02-01",deliveryDate:"2026-06-15",budget:210000,
   documents:{contracts:[{id:"doc8",name:"Netflix_Contract.pdf",status:"signed",uploader:"Ana P.",date:"2026-02-01",shared:true,esig:true}],budgets:[{id:"doc9",name:"NeonCity_Final_Budget.xlsx",status:"approved",uploader:"Mike J.",date:"2026-06-01",shared:false,esig:false}],estimates:[],invoices:[{id:"doc10",name:"Final_Invoice_100pct.pdf",status:"sent",uploader:"Mike J.",date:"2026-06-14",shared:true,esig:false}],schedules:[]},
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

// ─── Documents Panel ──────────────────────────────────────────────────────────

function DocumentsPanel({docs,onUpdate,isClient,canApprove}){
  const [esigModal,setEsigModal]=useState(null);
  const [esigName,setEsigName]=useState("");
  const cats=[
    {id:"contracts",label:"Contracts",icon:"📝",color:C.cyan},
    {id:"budgets",label:"Budgets",icon:"💰",color:C.green,hideFromClient:true},
    {id:"estimates",label:"Estimates",icon:"📊",color:C.yellow},
    {id:"invoices",label:"Invoices",icon:"🧾",color:C.orange},
    {id:"schedules",label:"Schedules",icon:"📅",color:C.purple},
  ];
  const visibleCats=isClient?cats.filter(c=>!c.hideFromClient):cats;

  const updateDocStatus=(cat,id,status)=>onUpdate({...docs,[cat]:docs[cat].map(d=>d.id===id?{...d,status}:d)});
  const addDoc=(cat,file)=>{
    const nd={id:`doc${Date.now()}`,name:file.name,status:"pending",uploader:"You",date:new Date().toISOString().slice(0,10),shared:false,esig:false};
    onUpdate({...docs,[cat]:[...(docs[cat]||[]),nd]});
  };
  const signDoc=()=>{
    if(!esigName.trim())return;
    updateDocStatus(esigModal.cat,esigModal.id,"signed");
    setEsigModal(null);setEsigName("");
  };
  const toggleShared=(cat,id)=>onUpdate({...docs,[cat]:docs[cat].map(d=>d.id===id?{...d,shared:!d.shared}:d)});

  const totalDocs=visibleCats.reduce((n,c)=>(docs[c.id]||[]).length+n,0);

  return <div>
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
          <div key={doc.id} style={{background:"#0F0F18",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:18}}>{cat.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
              <div style={{fontSize:10,color:C.textMuted}}>{doc.uploader} · {doc.date}{doc.shared&&!isClient?<span style={{color:C.green,marginLeft:8}}>● Shared with client</span>:null}</div>
            </div>
            <Badge status={doc.status} small/>
            {!isClient&&<button onClick={()=>toggleShared(cat.id,doc.id)} style={{background:doc.shared?C.greenLow:"#1E1E28",border:`1px solid ${doc.shared?C.green+"50":C.border}`,color:doc.shared?C.green:C.textMuted,borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:10,whiteSpace:"nowrap"}}>{doc.shared?"👁 Shared":"Share"}</button>}
            {cat.id==="contracts"&&doc.status!=="signed"&&<Btn variant="cyan" onClick={()=>setEsigModal({...doc,cat:cat.id})} style={{fontSize:10,padding:"4px 10px"}}>✍ Sign</Btn>}
            {canApprove&&doc.status==="pending"&&<Btn variant="green" onClick={()=>updateDocStatus(cat.id,doc.id,"approved")} style={{fontSize:10,padding:"4px 8px"}}>✓</Btn>}
            <Btn variant="ghost" style={{fontSize:10,padding:"4px 8px"}}>⬇</Btn>
          </div>
        ))}
      </div>;
    })}

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
  const addItem=(cat,file)=>{
    const item={id:`cr${Date.now()}`,name:file.name,status:"pending",shared:false,uploader:"You"};
    onUpdate({...creative,[cat]:[...(creative[cat]||[]),item]});
  };
  const updateStatus=(cat,id,status)=>onUpdate({...creative,[cat]:creative[cat].map(i=>i.id===id?{...i,status}:i)});
  const toggleShared=(cat,id)=>onUpdate({...creative,[cat]:creative[cat].map(i=>i.id===id?{...i,shared:!i.shared}:i)});
  const addComment=(cat,id,text)=>{
    const comment={id:`cmt${Date.now()}`,author:"You",text,date:new Date().toISOString().slice(0,10),resolved:false};
    onUpdate({...creative,[cat]:creative[cat].map(i=>i.id===id?{...i,comments:[...(i.comments||[]),comment]}:i)});
  };
  const [commentInputs,setCommentInputs]=useState({});

  return <div>
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
              <span style={{fontSize:16}}>{cat.icon}</span>
              <span style={{fontSize:12,fontWeight:600,color:C.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</span>
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
  const addItem=(cat,file)=>{
    const item={id:`w${Date.now()}`,name:file.name,status:"pending",date:new Date().toISOString().slice(0,10)};
    onUpdate({...wrap,[cat]:[...(wrap[cat]||[]),item]});
  };
  const totalDelivered=(wrap.deliverables||[]).filter(d=>d.status==="delivered").length;

  return <div>
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
            <span style={{fontSize:16}}>{cat.icon}</span>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{item.name}</div>
            <div style={{fontSize:10,color:C.textMuted}}>{item.date}</div></div>
            <Badge status={item.status} small/>
            <Btn variant="ghost" style={{fontSize:10,padding:"4px 8px"}}>⬇</Btn>
          </div>
        ))}
      </div>;
    })}

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
  const addPost=(file)=>{
    onUpdate([...posts,{id:`pa${Date.now()}`,type:file.type.startsWith("video")?"video":"board",name:file.name,version:"v01",status:"pending",uploader:"You",duration:file.type.startsWith("video")?120:undefined,editNotes:"",shared:false,comments:[]}]);
  };

  return <div style={{display:"flex",gap:20,minHeight:0}}>
    {/* Asset list */}
    <div style={{flex:playing?0:1,width:playing?"300px":"100%",flexShrink:0}}>
      {!isClient&&<DropZone onFiles={fs=>fs.forEach(addPost)} accept="video/*,image/*,.pdf" label="Drop video or image files here" color={C.cyan}/>}
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
        <div style={{width:64,height:64,borderRadius:"50%",background:"#16161E",border:`2px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:24}} onClick={togglePlay}>{running?"⏸":"▶"}</div>
        <span style={{fontSize:11,color:C.textMuted,fontFamily:"monospace"}}>{fmtTime(t)} / {fmtTime(dur)}</span>
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

  return <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
    {/* Project header */}
    <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
        <div>
          <button onClick={onBack} style={{background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:12,padding:0,marginBottom:6}}>← All Projects</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:C.text}}>{project.title}</h2>
          <div style={{display:"flex",gap:10,alignItems:"center",marginTop:4}}>
            <span style={{fontSize:12,color:C.textSec}}>{project.client}</span>
            {!isClient&&<span style={{fontSize:12,color:C.textMuted}}>Producer: {project.producer}</span>}
            <span style={{fontSize:12,color:C.textMuted}}>Delivery: {project.deliveryDate}</span>
            {!isClient&&<span style={{fontSize:12,fontWeight:700,color:C.green}}>{fmtCurrency(project.budget)}</span>}
          </div>
        </div>
        <LifecyclePill stage={project.status}/>
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
      producer:{vendors:[],permits:[],rentals:[],travel:[],productionNotes:"",postNotes:""},
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
