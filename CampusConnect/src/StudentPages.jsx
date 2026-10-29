import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Clock, Mail, UserRound, Heart, Camera, LogOut, Pencil, XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { api } from "./api";
import { getStudentProfile } from "./studentProfile";

const purple = "#5B4FE8";
const muted = "#7A7F91";
const border = "#EEEFF5";
const card = { background: "#fff", border: `1px solid ${border}`, borderRadius: 16 };
const field = { width: "100%", padding: "11px 12px", border: "1px solid #E6E7F0", borderRadius: 10, fontSize: 13.5, outline: "none", background: "#fff" };

function PageHeading({ title, subtitle }) {
  return <div style={{ marginBottom: 22 }}><h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{title}</h1><p style={{ margin: "7px 0 0", color: muted, fontSize: 14 }}>{subtitle}</p></div>;
}

export function RegistrationsPage({ navigate = () => {} }) {
  const [profile, setProfile] = useState(() => getStudentProfile({ ask: false }));
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const load = async (email) => {
    if (!email) return;
    setLoading(true);
    try { const data = await api.getRegistrations(email); setRegistrations(Array.isArray(data) ? data : []); setNotice(""); }
    catch (e) { setNotice(e.message.includes("Failed to fetch") ? "Could not connect to the backend. Start the backend and try again." : e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (profile?.email) load(profile.email); }, [profile?.email]);
  const cancel = async (entry) => {
    const event = entry.eventId;
    const eventId = event?._id || entry.eventId?._id;
    if (!eventId || !profile?.email) return;
    if (!window.confirm(`Cancel your registration for "${event.title}"?`)) return;
    setBusy(String(eventId));
    try { await api.cancelRegistration(eventId, { participantEmail: profile.email }); setRegistrations(prev => prev.filter(r => String(r.eventId?._id || r.eventId) !== String(eventId))); setNotice("Your event registration has been cancelled."); }
    catch (e) { setNotice(e.message || "Could not cancel this registration."); }
    finally { setBusy(""); }
  };
  return <div>
    <PageHeading title="My Registrations" subtitle="Keep track of the campus events you have signed up for."/>
    {!profile ? <div style={{ ...card, padding: 28, textAlign: "center" }}><CalendarDays size={38} color={purple}/><h3>Set up your student profile first</h3><p style={{ color: muted, fontSize: 14 }}>Your registrations are linked to your email address.</p><button onClick={() => navigate("/profile")} style={primaryButton}>Create profile <ArrowRight size={15}/></button></div> :
    <>
      <div style={{ ...card, padding: 16, display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Avatar profile={profile} size={46}/><div style={{ flex: 1 }}><div style={{ fontWeight: 750 }}>{profile.name}</div><div style={{ color: muted, fontSize: 12.5 }}>{profile.email}</div></div><span style={{ background: "#EEF0FE", color: purple, padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{registrations.length} event{registrations.length === 1 ? "" : "s"}</span>
      </div>
      {notice && <Notice text={notice} onClose={() => setNotice("")}/>}
      {loading ? <p style={{ color: muted, padding: 20 }}>Loading your registrations…</p> : registrations.length === 0 ? <div style={{ ...card, padding: 34, textAlign: "center" }}><CalendarDays size={38} color={purple}/><h3 style={{ marginBottom: 6 }}>No registrations yet</h3><p style={{ color: muted, fontSize: 14 }}>When you register for an event, it will appear here.</p><button onClick={() => navigate("/events")} style={primaryButton}>Explore events <ArrowRight size={15}/></button></div> :
      <div style={{ display: "grid", gap: 14 }}>{registrations.map((entry) => { const event = entry.eventId && typeof entry.eventId === "object" ? entry.eventId : null; const id = event?._id || entry.eventId; if (!event) return <div key={entry._id} style={{ ...card, padding: 18, color: muted }}>This event is no longer available. Refresh the page to update your list.</div>; return <div key={entry._id || id} style={{ ...card, padding: 18, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ width: 56, height: 56, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 14, background: "#EEF0FE", color: purple }}><CalendarDays size={25}/></div>
        <div style={{ flex: 1, minWidth: 190 }}><span style={{ color: purple, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{event.category || "Campus event"}</span><h3 style={{ margin: "4px 0 7px", fontSize: 16 }}>{event.title}</h3><div style={{ display: "flex", gap: 12, flexWrap: "wrap", color: muted, fontSize: 12.5 }}><span><CalendarDays size={13} style={iconInline}/>{event.date || "Date TBA"}</span><span><Clock size={13} style={iconInline}/>{event.time || "Time TBA"}</span><span><MapPin size={13} style={iconInline}/>{event.location || "Location TBA"}</span></div></div>
        <button disabled={busy === String(id)} onClick={() => cancel(entry)} style={dangerButton}>{busy === String(id) ? "Cancelling…" : <><XCircle size={15}/> Cancel registration</>}</button>
      </div>; })}</div>}
    </>}
  </div>;
}

export function ProfilePage({ navigate = () => {} }) {
  const [profile, setProfile] = useState(() => getStudentProfile({ ask: false }) || { name: "", email: "", interests: [], photo: "", course: "" });
  const [editing, setEditing] = useState(!profile.name);
  const [notice, setNotice] = useState("");
  const [interestText, setInterestText] = useState((profile.interests || []).join(", "));
  const interests = ["Technology", "Coding", "Design", "Entrepreneurship", "Photography", "Music", "Arts", "Volunteering", "Sports", "Literature"];
  const save = (e) => {
    e.preventDefault();
    const name = profile.name.trim(), email = profile.email.trim().toLowerCase();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) { setNotice("Please enter your name and a valid email address."); return; }
    const updated = { ...profile, name, email, interests: interestText.split(",").map(x => x.trim()).filter(Boolean) };
    try { localStorage.setItem("campusconnect-profile", JSON.stringify(updated)); localStorage.setItem("campusconnect-name", name); setProfile(updated); window.dispatchEvent(new Event("campusconnect-profile-updated")); setEditing(false); setNotice("Profile saved on this device."); }
    catch { setNotice("Unable to save your profile. Check browser storage settings."); }
  };
  const uploadPhoto = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { setNotice("Please choose an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setNotice("Please choose an image smaller than 2 MB."); return; }
    const reader = new FileReader(); reader.onload = () => { const updated = { ...profile, photo: reader.result }; setProfile(updated); try { localStorage.setItem("campusconnect-profile", JSON.stringify(updated)); setNotice("Profile picture updated."); } catch { setNotice("The image is too large to save in browser storage."); } }; reader.readAsDataURL(file);
  };
  const logout = () => { if (!window.confirm("Log out from this device? Your event registrations saved in the backend will not be deleted.")) return; localStorage.removeItem("campusconnect-profile"); localStorage.removeItem("campusconnect-name"); setProfile({ name: "", email: "", interests: [], photo: "", course: "" }); window.dispatchEvent(new Event("campusconnect-profile-updated")); setInterestText(""); setEditing(true); setNotice("You have been logged out on this device."); navigate("/"); };
  return <div>
    <PageHeading title="My Profile" subtitle="Manage your student details, interests and profile picture."/>
    {notice && <Notice text={notice} onClose={() => setNotice("")}/>}
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(260px, .9fr)", gap: 18, alignItems: "start" }}>
      <section style={{ ...card, overflow: "hidden" }}>
        <div style={{ height: 110, background: "linear-gradient(120deg,#4B3FD1,#9C8CFF)" }}/>
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ marginTop: -42, display: "flex", alignItems: "end", gap: 14, flexWrap: "wrap" }}><Avatar profile={profile} size={84}/><div style={{ paddingBottom: 7, flex: 1 }}><h2 style={{ margin: "0 0 4px", fontSize: 21 }}>{profile.name || "Your name"}</h2><div style={{ color: muted, fontSize: 13 }}>{profile.course || "Student"}{profile.email ? ` · ${profile.email}` : ""}</div></div><label style={{ ...secondaryButton, cursor: "pointer" }}><Camera size={15}/> Change photo<input type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }}/></label></div>
          <div style={{ borderTop: `1px solid ${border}`, marginTop: 22, paddingTop: 20 }}>
            {editing ? <form onSubmit={save} style={{ display: "grid", gap: 14 }}>
              <label style={labelStyle}>Full name<input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Enter your name" style={field} required/></label>
              <label style={labelStyle}>Email address<input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="you@college.edu" style={field} required/></label>
              <label style={labelStyle}>Course / year (optional)<input value={profile.course || ""} onChange={e => setProfile({ ...profile, course: e.target.value })} placeholder="e.g. B.Sc Computer Science, Year 2" style={field}/></label>
              <label style={labelStyle}>Interests <span style={{ fontWeight: 400, color: muted }}>(separate with commas)</span><textarea value={interestText} onChange={e => setInterestText(e.target.value)} placeholder="Coding, Design, Music..." rows={3} style={{ ...field, resize: "vertical" }}/></label>
              <div style={{ display: "flex", gap: 9 }}><button type="submit" style={primaryButton}>Save profile</button>{profile.name && <button type="button" onClick={() => { setProfile(getStudentProfile({ ask: false }) || profile); setInterestText((getStudentProfile({ ask: false })?.interests || []).join(", ")); setEditing(false); }} style={secondaryButton}>Cancel</button>}</div>
            </form> : <>
              <InfoRow icon={UserRound} label="Full name" value={profile.name || "Not added yet"}/><InfoRow icon={Mail} label="Email address" value={profile.email || "Not added yet"}/><InfoRow icon={Heart} label="Interests" value={profile.interests?.length ? profile.interests.join(", ") : "Add your interests to help personalize your campus experience"}/><InfoRow icon={CalendarDays} label="Member since" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "CampusConnect student"}/>
              <button onClick={() => setEditing(true)} style={{ ...primaryButton, marginTop: 12 }}><Pencil size={15}/> Edit profile</button>
            </>}
          </div>
        </div>
      </section>
      <section style={{ ...card, padding: 22 }}>
        <h3 style={{ margin: "0 0 5px", fontSize: 16 }}>Your interests</h3><p style={{ color: muted, fontSize: 12.5, margin: "0 0 15px" }}>Choose ideas to get started. Add or remove them in Edit profile.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{interests.map((item) => { const active = (profile.interests || []).some(x => x.toLowerCase() === item.toLowerCase()); return <button key={item} onClick={() => { const next = active ? profile.interests.filter(x => x.toLowerCase() !== item.toLowerCase()) : [...(profile.interests || []), item]; const updated = { ...profile, interests: next }; setProfile(updated); setInterestText(next.join(", ")); try { localStorage.setItem("campusconnect-profile", JSON.stringify(updated)); window.dispatchEvent(new Event("campusconnect-profile-updated")); } catch {} }} style={{ border: `1px solid ${active ? purple : border}`, background: active ? "#EEF0FE" : "#fff", color: active ? purple : "#565B6B", padding: "8px 10px", borderRadius: 999, fontSize: 12, cursor: "pointer", fontWeight: 650 }}>{active ? "✓ " : "+ "}{item}</button>; })}</div>
        <div style={{ borderTop: `1px solid ${border}`, marginTop: 22, paddingTop: 18 }}><h3 style={{ margin: "0 0 6px", fontSize: 15 }}>Account</h3><p style={{ color: muted, fontSize: 12.5, lineHeight: 1.5 }}>Your profile is currently stored in this browser. This demo does not use a secure login system yet.</p><button onClick={logout} style={dangerButton}><LogOut size={15}/> Log out</button></div>
      </section>
    </div>
  </div>;
}

export function Avatar({ profile, size = 40 }) {
  const initials = (profile?.name || "Student").split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join("");
  return <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", overflow: "hidden", background: "#FDEBEF", color: purple, fontWeight: 800, fontSize: size * .3, border: "3px solid #fff", boxShadow: "0 2px 8px #1f243015" }}>{profile?.photo ? <img src={profile.photo} alt="Student profile" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : initials}</div>;
}
function Notice({ text, onClose }) { return <div role="status" style={{ background: "#EEF0FE", color: purple, padding: "11px 13px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{text}<button onClick={onClose} style={{ float: "right", border: 0, background: "transparent", cursor: "pointer" }}>✕</button></div>; }
function InfoRow({ icon: Icon, label, value }) { return <div style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${border}` }}><div style={{ width: 34, height: 34, borderRadius: 10, background: "#F5F6FB", display: "grid", placeItems: "center", color: purple }}><Icon size={16}/></div><div style={{ minWidth: 0 }}><div style={{ color: muted, fontSize: 11.5, marginBottom: 4 }}>{label}</div><div style={{ fontSize: 13.5, overflowWrap: "anywhere" }}>{value}</div></div></div>; }
const iconInline = { verticalAlign: "-2px", marginRight: 4 };
const primaryButton = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: purple, color: "#fff", border: 0, padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" };
const secondaryButton = { display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", color: "#565B6B", border: `1px solid ${border}`, padding: "9px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 700 };
const dangerButton = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#FFF1F2", color: "#BE123C", border: "1px solid #FFE4E6", padding: "10px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer" };
const labelStyle = { display: "grid", gap: 7, fontSize: 12.5, fontWeight: 700, color: "#45495A" };
