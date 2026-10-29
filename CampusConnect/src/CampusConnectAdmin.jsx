import { useState, useEffect } from "react";
import { api } from "./api";
import {
  GraduationCap, LayoutDashboard, CalendarDays, Users, LogOut, Plus,
  Pencil, Trash2, X, Clock, MapPin, Search, Lock, Mail, Eye, EyeOff,
  AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";

const ADMIN_EMAIL = "admin@campusconnect.edu";
const ADMIN_PASSWORD = "campus2025";

const CATEGORY_STYLES = {
  Event: { fg: "#5B4FE8", bg: "#EEF0FE" },
  Hackathon: { fg: "#0F9D58", bg: "#EAF8F0" },
  Workshop: { fg: "#2563EB", bg: "#EAF1FF" },
  "Club Meet": { fg: "#9333EA", bg: "#F3EAFE" },
  News: { fg: "#E23F63", bg: "#FDEBEF" },
};
const CATEGORIES = Object.keys(CATEGORY_STYLES);

const SEED_EVENTS = [
  { id: "e1", title: "TechNova 2026", category: "Event", date: "2026-09-12", time: "10:00 AM", location: "Main Auditorium", description: "A day of technology talks, demos & student showcases." },
  { id: "e2", title: "CodeSprint 2026", category: "Hackathon", date: "2026-09-20", time: "9:00 AM", location: "Innovation Lab", description: "24-hour coding challenge. Build. Solve. Win." },
  { id: "e3", title: "AI in Everyday Life", category: "Workshop", date: "2026-09-25", time: "2:00 PM", location: "Seminar Hall", description: "Hands-on session on AI tools and trends." },
];

function fmtDate(iso) {
  if (!iso) return { mon: "—", day: "—" };
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return { mon: "—", day: "—" };
  return {
    mon: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(d.getDate()).padStart(2, "0"),
  };
}

export default function CampusConnectAdmin() {
  const [session, setSession] = useState(null); // null | 'admin'
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = localStorage.getItem("admin-session");
        if (res === "admin") setSession("admin");
      } catch {
        // no session saved yet
      }
      setBooted(true);
    })();
  }, []);

  if (!booted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F6FB" }}>
        <Loader2 size={26} color="#5B4FE8" className="spin" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return session === "admin" ? (
    <AdminDashboard
      onLogout={async () => {
try {
  localStorage.removeItem("admin-session");
} catch (error) {
  console.error("Failed to remove admin session:", error);
}        setSession(null);
      }}
    />
  ) : (
    <LoginScreen
      onSuccess={async () => {
try {
  localStorage.setItem("admin-session", "admin");
} catch (error) {
  console.error("Failed to save admin session:", error);
}        setSession("admin");
      }}
    />
  );
}

/* ---------------- LOGIN ---------------- */

function LoginScreen({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        onSuccess();
      } else {
        setError("Incorrect email or password. Try the demo credentials below.");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#4B3FD1 0%,#6C5CE7 55%,#9C8CFF 100%)",
      fontFamily: "'Inter', system-ui, sans-serif", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 400, background: "#fff", borderRadius: 20,
        padding: "36px 32px", boxShadow: "0 30px 60px -20px rgba(30,20,90,0.35)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: "#5B4FE8",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
          }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#2A2560" }}>CampusConnect</div>
          <div style={{ fontSize: 13, color: "#9297A8", marginTop: 2 }}>Admin sign in</div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Email</label>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Mail size={16} color="#9297A8" style={inputIconStyle} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@campusconnect.edu"
              required
              style={inputStyle}
            />
          </div>

          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <Lock size={16} color="#9297A8" style={inputIconStyle} />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ ...inputStyle, paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              {showPw ? <EyeOff size={16} color="#9297A8" /> : <Eye size={16} color="#9297A8" />}
            </button>
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 8, background: "#FDEBEF", color: "#C0364F",
              borderRadius: 10, padding: "10px 12px", fontSize: 12.5, marginTop: 10, marginBottom: 6,
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", marginTop: 18, background: "#5B4FE8", color: "#fff", border: "none",
              borderRadius: 10, padding: "13px 0", fontWeight: 700, fontSize: 14.5,
              cursor: loading ? "default" : "pointer", opacity: loading ? 0.75 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{
          marginTop: 22, background: "#F5F6FB", borderRadius: 10, padding: "12px 14px",
          fontSize: 12, color: "#7A7F91", lineHeight: 1.6,
        }}>
          <strong style={{ color: "#565B6B" }}>Demo credentials</strong><br />
          Email: admin@campusconnect.edu<br />
          Password: campus2025
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const labelStyle = { fontSize: 12.5, fontWeight: 600, color: "#565B6B", marginBottom: 6, display: "block" };
const inputIconStyle = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" };
const inputStyle = {
  width: "100%", padding: "11px 14px 11px 40px", borderRadius: 10, border: "1px solid #E6E7F0",
  fontSize: 14, outline: "none", boxSizing: "border-box", background: "#FBFBFD",
};

/* ---------------- ADMIN DASHBOARD ---------------- */

function AdminDashboard({ onLogout }) {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState('Events');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (text, kind = 'success') => { setToast({ text, kind }); window.setTimeout(() => setToast(null), 3000); };
  const loadEvents = async () => { const data = await api.getEvents(); setEvents(Array.isArray(data) ? data.map(e => ({ ...e, id: e._id || e.id })) : []); };
  const loadClubs = async () => { const data = await api.getClubs(); setClubs(Array.isArray(data) ? data : []); };
  const loadStudents = async () => { const data = await api.getStudents(); setStudents(Array.isArray(data) ? data : []); };
  const reload = async () => {
    setLoading(true);
    try { await Promise.all([loadEvents(), loadClubs(), loadStudents()]); }
    catch (error) { showToast(`Could not load data: ${error.message}`, 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const handleSave = async (eventData) => {
    setSaving(true);
    try {
      if (eventData.id && /^[a-f0-9]{24}$/i.test(String(eventData.id))) {
        await api.updateEvent(eventData.id, eventData); showToast('Event updated in MongoDB.');
      } else { await api.createEvent(eventData); showToast('Event created in MongoDB.'); }
      await loadEvents(); setModal(null);
    } catch (error) { showToast(`Not saved: ${error.message || 'API unavailable'}`, 'error'); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    setSaving(true);
    try { await api.deleteEvent(id); await loadEvents(); showToast('Event deleted from MongoDB.'); }
    catch (error) { showToast(`Could not delete event: ${error.message}`, 'error'); }
    finally { setSaving(false); setConfirmDelete(null); }
  };
  const addClub = async () => {
    const name = window.prompt('Club name:')?.trim(); if (!name) return;
    const category = window.prompt('Club category (e.g. Technology, Arts):', 'General') || 'General';
    const description = window.prompt('Short club description:', '') || '';
    try { await api.createClub({ name, category, description }); await loadClubs(); showToast('Club added to MongoDB.'); }
    catch (error) { showToast(`Could not add club: ${error.message}`, 'error'); }
  };
  const editClub = async (club) => {
    const name = window.prompt('Club name:', club.name)?.trim(); if (!name) return;
    const category = window.prompt('Club category:', club.category || 'General'); if (category === null) return;
    const description = window.prompt('Club description:', club.description || ''); if (description === null) return;
    try { await api.updateClub(club._id, { name, category, description }); await loadClubs(); showToast('Club updated in MongoDB.'); }
    catch (error) { showToast(`Could not update club: ${error.message}`, 'error'); }
  };
  const deleteClub = async (club) => {
    if (!window.confirm(`Delete ${club.name}? This removes its club record.`)) return;
    try { await api.deleteClub(club._id); await loadClubs(); showToast('Club deleted from MongoDB.'); }
    catch (error) { showToast(`Could not delete club: ${error.message}`, 'error'); }
  };

  const filteredEvents = events.filter(e => `${e.title} ${e.category} ${e.location}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => (a.date || '').localeCompare(b.date || ''));
  const filteredClubs = clubs.filter(c => `${c.name} ${c.category} ${c.description}`.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = students.filter(s => `${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase()));
  const tabButton = (label, Icon) => <button key={label} onClick={() => { setTab(label); setSearch(''); }} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',border:0,borderRadius:10,background:tab===label?'#5B4FE8':'transparent',color:tab===label?'#fff':'#565B6B',fontWeight:600,textAlign:'left',cursor:'pointer',marginBottom:4}}><Icon size={17}/>{label}</button>;

  return <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#F5F6FB', minHeight: '100vh', color: '#1F2430' }}>
    <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
      <aside style={{ width: 240, flexShrink: 0, background: '#fff', borderRight: '1px solid #ECEDF3', minHeight: '100vh', padding: '22px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 24px' }}><div style={{ width: 40, height: 40, borderRadius: 10, background: '#5B4FE8', display: 'grid', placeItems: 'center' }}><GraduationCap size={22} color="#fff" /></div><div><div style={{ fontWeight: 800, fontSize: 16, color: '#2A2560' }}>CampusConnect</div><div style={{ fontSize: 10.5, color: '#9297A8' }}>Admin Panel</div></div></div>
        {tabButton('Dashboard', LayoutDashboard)}{tabButton('Events', CalendarDays)}{tabButton('Clubs', Users)}{tabButton('Students', GraduationCap)}
        <div style={{flex:1}}/><button onClick={onLogout} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,border:'1px solid #F1D6DC',background:'#FDEBEF',color:'#C0364F',fontWeight:600,cursor:'pointer'}}><LogOut size={16}/> Log out</button>
      </aside>
      <main style={{ flex: 1, padding: '26px 28px', minWidth: 0 }}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,marginBottom:22}}><div><h1 style={{fontSize:24,fontWeight:800,margin:0}}>{tab}</h1><p style={{color:'#7A7F91',margin:'4px 0 0',fontSize:13.5}}>{tab==='Dashboard'?'Live overview of data stored in MongoDB.':tab==='Events'?'Create, edit and remove campus events.':tab==='Clubs'?'Manage campus clubs and their details.':'Students who have registered for at least one event.'}</p></div><button onClick={reload} style={{border:'1px solid #E6E7F0',background:'#fff',borderRadius:10,padding:'10px 14px',fontWeight:700,cursor:'pointer'}}>Refresh data</button></div>
        {tab==='Dashboard' ? <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:16}}>{[[CalendarDays,'Events',events.length],[Users,'Clubs',clubs.length],[GraduationCap,'Registered students',students.length]].map(([Icon,label,value])=><button key={label} onClick={()=>setTab(label==='Registered students'?'Students':label)} style={{textAlign:'left',border:'1px solid #EEEFF5',background:'#fff',borderRadius:16,padding:22,cursor:'pointer'}}><Icon color="#5B4FE8" size={24}/><div style={{fontSize:28,fontWeight:800,marginTop:12}}>{value}</div><div style={{color:'#7A7F91',fontSize:13}}>{label}</div></button>)}</div> : <>
          <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}><div style={{position:'relative',maxWidth:360,flex:1}}><Search size={16} color="#9297A8" style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)'}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${tab.toLowerCase()}…`} style={{...inputStyle,paddingLeft:38,width:'100%',boxSizing:'border-box'}}/></div>{tab==='Events'&&<button onClick={()=>setModal('add')} style={{display:'flex',alignItems:'center',gap:8,background:'#5B4FE8',color:'#fff',border:0,borderRadius:10,padding:'11px 18px',fontWeight:700,cursor:'pointer'}}><Plus size={17}/> Add Event</button>}{tab==='Clubs'&&<button onClick={addClub} style={{display:'flex',alignItems:'center',gap:8,background:'#5B4FE8',color:'#fff',border:0,borderRadius:10,padding:'11px 18px',fontWeight:700,cursor:'pointer'}}><Plus size={17}/> Add Club</button>}</div>
          <div style={{background:'#fff',borderRadius:16,border:'1px solid #EEEFF5',overflowX:'auto'}}>{loading?<div style={{padding:40,textAlign:'center',color:'#9297A8'}}><Loader2 size={22}/> Loading data…</div>:
            tab==='Events'? (filteredEvents.length===0?<div style={{padding:45,textAlign:'center',color:'#9297A8'}}>No events found. Use Add Event to create one.</div>:<table style={{width:'100%',borderCollapse:'collapse',fontSize:13.5}}><thead><tr style={{background:'#FAFAFD',textAlign:'left'}}>{['Date','Event','Category','Location','Actions'].map(h=><th key={h} style={{padding:'12px 16px',fontSize:11.5,color:'#9297A8'}}>{h}</th>)}</tr></thead><tbody>{filteredEvents.map(e=>{const {mon,day}=fmtDate(e.date);const cat=CATEGORY_STYLES[e.category]||CATEGORY_STYLES.Event;return <tr key={e.id} style={{borderTop:'1px solid #F1F1F6'}}><td style={{padding:'14px 16px'}}><b>{mon} {day}</b><div style={{fontSize:11,color:'#9297A8'}}>{e.date}</div></td><td style={{padding:'14px 16px'}}><b>{e.title}</b><div style={{fontSize:12,color:'#9297A8'}}>{e.time||'—'}</div></td><td style={{padding:'14px 16px'}}><span style={{background:cat.bg,color:cat.fg,padding:'4px 9px',borderRadius:999,fontSize:11,fontWeight:700}}>{e.category}</span></td><td style={{padding:'14px 16px'}}>{e.location||'—'}</td><td style={{padding:'14px 16px',whiteSpace:'nowrap'}}><button onClick={()=>setModal(e)} style={iconBtnStyle}><Pencil size={15} color="#5B4FE8"/></button><button onClick={()=>setConfirmDelete(e)} style={iconBtnStyle}><Trash2 size={15} color="#C0364F"/></button></td></tr>})}</tbody></table>) :
            tab==='Clubs'? (filteredClubs.length===0?<div style={{padding:45,textAlign:'center',color:'#9297A8'}}>No clubs found. Use Add Club to create one.</div>:<table style={{width:'100%',borderCollapse:'collapse',fontSize:13.5}}><thead><tr style={{background:'#FAFAFD',textAlign:'left'}}>{['Club','Category','Members','Actions'].map(h=><th key={h} style={{padding:'12px 16px',fontSize:11.5,color:'#9297A8'}}>{h}</th>)}</tr></thead><tbody>{filteredClubs.map(c=><tr key={c._id} style={{borderTop:'1px solid #F1F1F6'}}><td style={{padding:'14px 16px'}}><b>{c.name}</b><div style={{fontSize:12,color:'#9297A8'}}>{c.description}</div></td><td style={{padding:'14px 16px'}}>{c.category}</td><td style={{padding:'14px 16px'}}>{c.members||0}</td><td style={{padding:'14px 16px',whiteSpace:'nowrap'}}><button onClick={()=>editClub(c)} style={iconBtnStyle}><Pencil size={15} color="#5B4FE8"/></button><button onClick={()=>deleteClub(c)} style={iconBtnStyle}><Trash2 size={15} color="#C0364F"/></button></td></tr>)}</tbody></table>) :
            (filteredStudents.length===0?<div style={{padding:45,textAlign:'center',color:'#9297A8'}}>No registered students yet. Students appear here after they register for an event.</div>:<table style={{width:'100%',borderCollapse:'collapse',fontSize:13.5}}><thead><tr style={{background:'#FAFAFD',textAlign:'left'}}>{['Student','Email','Registrations','Last activity'].map(h=><th key={h} style={{padding:'12px 16px',fontSize:11.5,color:'#9297A8'}}>{h}</th>)}</tr></thead><tbody>{filteredStudents.map(s=><tr key={s.email} style={{borderTop:'1px solid #F1F1F6'}}><td style={{padding:'14px 16px'}}><b>{s.name}</b></td><td style={{padding:'14px 16px'}}>{s.email}</td><td style={{padding:'14px 16px'}}>{s.registrations}</td><td style={{padding:'14px 16px'}}>{s.lastActivity?new Date(s.lastActivity).toLocaleString():'—'}</td></tr>)}</tbody></table>)
          }</div>
        </>}
      </main>
    </div>
    {modal&&<EventModal initial={modal==='add'?null:modal} onClose={()=>setModal(null)} onSave={handleSave}/>}
    {confirmDelete&&<ConfirmDialog title="Delete this event?" message={`"${confirmDelete.title}" will be removed from the student feed.`} onCancel={()=>setConfirmDelete(null)} onConfirm={()=>handleDelete(confirmDelete.id)}/>}
    {toast&&<div role="status" style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:toast.kind==='error'?'#C0364F':'#1F2430',color:'#fff',padding:'12px 20px',borderRadius:12,fontSize:13.5,fontWeight:600,zIndex:100,boxShadow:'0 12px 30px rgba(0,0,0,0.2)'}}>{toast.kind==='error'?<AlertCircle size={16}/>:<CheckCircle2 size={16}/>} {toast.text}</div>}
    {saving&&<div style={{position:'fixed',top:18,right:18,background:'#fff',borderRadius:10,padding:'8px 14px',fontSize:12,color:'#9297A8',display:'flex',alignItems:'center',gap:6,boxShadow:'0 4px 14px rgba(0,0,0,0.08)'}}><Loader2 size={13}/> Saving…</div>}
  </div>;
}

const iconBtnStyle = { background: "#F5F6FB", border: "none", borderRadius: 8, width: 30, height: 30, marginLeft: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };

function SidebarItem({ icon: Icon, label, active, disabled }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10,
      background: active ? "#5B4FE8" : "transparent", color: disabled ? "#C7CAD6" : active ? "#fff" : "#565B6B",
      fontWeight: active ? 600 : 500, fontSize: 14, cursor: disabled ? "default" : "pointer",
    }}>
      <Icon size={18} /> {label} {disabled && <span style={{ marginLeft: "auto", fontSize: 10, background: "#F0F1F6", color: "#9297A8", padding: "2px 6px", borderRadius: 6 }}>soon</span>}
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div style={{ background: highlight ? "#5B4FE8" : "#fff", color: highlight ? "#fff" : "#1F2430", borderRadius: 14, padding: "16px 18px", border: highlight ? "none" : "1px solid #EEEFF5" }}>
      <div style={{ fontSize: 21, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: highlight ? "#DAD6FB" : "#7A7F91", marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ---------------- EVENT MODAL ---------------- */

function EventModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial || { title: "", category: "Event", date: "", time: "", location: "", description: "" }
  );
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.date) errs.date = "Pick a date.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave(form);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{initial ? "Edit Event" : "Add Event"}</h2>
          <button onClick={onClose} style={{ background: "#F5F6FB", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer" }}><X size={16} /></button>
        </div>

        <form onSubmit={submit}>
          <Field label="Title" error={errors.title}>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Cultural Night 2025" style={inputStyleFlat} />
          </Field>

          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Category" style={{ flex: 1 }}>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inputStyleFlat}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Date" error={errors.date} style={{ flex: 1 }}>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} style={inputStyleFlat} />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Time" style={{ flex: 1 }}>
              <input value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="e.g. 7:00 PM" style={inputStyleFlat} />
            </Field>
            <Field label="Location" style={{ flex: 1 }}>
              <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Auditorium" style={inputStyleFlat} />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What should students know?" rows={3} style={{ ...inputStyleFlat, resize: "vertical", fontFamily: "inherit" }} />
          </Field>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #E6E7F0", background: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#5B4FE8", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
              {initial ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children, style }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 11.5, color: "#C0364F", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={{ ...modalStyle, maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FDEBEF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle size={18} color="#C0364F" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{title}</h2>
        </div>
        <p style={{ fontSize: 13.5, color: "#7A7F91", margin: "0 0 20px" }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #E6E7F0", background: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#C0364F", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(20,16,50,0.45)", display: "flex",
  alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20,
};
const modalStyle = {
  background: "#fff", borderRadius: 18, padding: 26, width: "100%",
  boxShadow: "0 30px 60px -20px rgba(0,0,0,0.3)", fontFamily: "'Inter', system-ui, sans-serif",
};
const inputStyleFlat = {
  width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #E6E7F0",
  fontSize: 13.5, outline: "none", boxSizing: "border-box", background: "#FBFBFD",
};
