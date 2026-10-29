import { useState, useEffect } from "react";
import {
  GraduationCap, Home, Calendar, Users, PenSquare, Trophy, Newspaper,
  Image as ImageIcon, FileText, MessageSquare, Heart, CalendarDays,
  Search, Bell, Mail, Bookmark, ChevronDown, ArrowRight, Flame, UserRound, CalendarCheck,
  MapPin, Code2, Camera, BookOpen, Rocket, Music, Drama, Megaphone,
  Sparkles, Loader2, CalendarX,
} from "lucide-react";
import { EventsPage, ClubsPage, WorkshopsPage, HackathonsPage, NewsPage, GalleryPage, ResourcesPage, DiscussionsPage, InterestsPage, CalendarPage } from "./CampusPages";
import { api } from "./api";
import { getStudentProfile } from "./studentProfile";
import { RegistrationsPage, ProfilePage, Avatar } from "./StudentPages";

const navItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Calendar, label: "Events" },
  { icon: Users, label: "Clubs" },
  { icon: PenSquare, label: "Workshops" },
  { icon: Trophy, label: "Hackathons" },
  { icon: Newspaper, label: "Campus News" },
  { icon: ImageIcon, label: "Gallery" },
  { icon: FileText, label: "Resources" },
  { icon: MessageSquare, label: "Discussions" },
  { icon: Heart, label: "My Interests" },
  { icon: CalendarDays, label: "Calendar" },
  { icon: CalendarCheck, label: "My Registrations" },
  { icon: UserRound, label: "Profile" },
];

// Same categories/colors the admin panel uses, so a category always looks the same everywhere.
const CATEGORY_STYLES = {
  Event: { fg: "#5B4FE8", bg: "#EEF0FE", grad: "linear-gradient(135deg,#3b1f6b,#7c2ae8 60%,#c026d3)" },
  Hackathon: { fg: "#0F9D58", bg: "#EAF8F0", grad: "linear-gradient(135deg,#0f2027,#203a43 60%,#2c5364)" },
  Workshop: { fg: "#2563EB", bg: "#EAF1FF", grad: "linear-gradient(135deg,#1e293b,#334155 60%,#64748b)" },
  "Club Meet": { fg: "#9333EA", bg: "#F3EAFE", grad: "linear-gradient(135deg,#78350f,#b45309 60%,#f59e0b)" },
  News: { fg: "#E23F63", bg: "#FDEBEF", grad: "linear-gradient(135deg,#5c1a2b,#9d1f43 60%,#e23f63)" },
};

const SEED_EVENTS = [
  { id: "e1", title: "TechNova 2026", category: "Event", date: "2026-09-12", time: "10:00 AM", location: "Main Auditorium", description: "A day of technology talks, demos & student showcases." },
  { id: "e2", title: "CodeSprint 2026", category: "Hackathon", date: "2026-09-20", time: "9:00 AM", location: "Innovation Lab", description: "24-hour coding challenge. Build. Solve. Win." },
  { id: "e3", title: "AI in Everyday Life", category: "Workshop", date: "2026-09-25", time: "2:00 PM", location: "Seminar Hall", description: "Hands-on session on AI tools and trends." },
  { id: "e4", title: "Photography Walk", category: "Club Meet", date: "2026-09-28", time: "5:00 PM", location: "Campus Garden", description: "Open photo walk for all students." },
];

const clubs = [
  { icon: Code2, name: "Coding Club", members: "120+ Members", bg: "#EAF1FF", fg: "#2563EB" },
  { icon: Camera, name: "Photography Club", members: "85+ Members", bg: "#EAF8F0", fg: "#16A34A" },
  { icon: BookOpen, name: "Literary Club", members: "70+ Members", bg: "#EFF3FF", fg: "#4F46E5" },
  { icon: Rocket, name: "Entrepreneurship Cell", members: "95+ Members", bg: "#F3EAFE", fg: "#9333EA" },
  { icon: Music, name: "Music Club", members: "60+ Members", bg: "#FDEAF1", fg: "#DB2777" },
  { icon: Drama, name: "Drama Club", members: "40+ Members", bg: "#FFF1E6", fg: "#EA580C" },
];

const announcements = [
  { icon: Camera, bg: "#EAF1FF", fg: "#2563EB", title: "Photography Club", text: "Photo walk this Sunday! Don't forget your cameras.", time: "2h ago" },
  { icon: Rocket, bg: "#F3EAFE", fg: "#9333EA", title: "Entrepreneurship Cell", text: "Applications open for E-Cell Campus Ambassador Program.", time: "1d ago" },
  { icon: Newspaper, bg: "#FDEBEF", fg: "#E23F63", title: "Campus News", text: "Our college team won 1st place in Smart India Hackathon!", time: "2d ago" },
];

const avatarColors = ["#F59E0B", "#3B82F6", "#EC4899", "#10B981"];

function fmtDate(iso) {
  if (!iso) return { mon: "—", day: "—" };
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return { mon: "—", day: "—" };
  return {
    mon: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(d.getDate()).padStart(2, "0"),
  };
}

export default function CampusConnectDashboard({ currentPath = "/", navigate = () => {} }) {
  const routePath = currentPath.split("?")[0];
  const [events, setEvents] = useState([]);
  const [clubsFromDb, setClubsFromDb] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [studentProfile, setStudentProfile] = useState(() => getStudentProfile({ ask: false }));

  useEffect(() => {
    const refreshProfile = () => setStudentProfile(getStudentProfile({ ask: false }));
    window.addEventListener("campusconnect-profile-updated", refreshProfile);
    return () => window.removeEventListener("campusconnect-profile-updated", refreshProfile);
  }, []);

  useEffect(() => {
    let alive = true;
    const loadData = async () => {
      try {
        const [eventData, clubData, studentData] = await Promise.all([api.getEvents(), api.getClubs(), api.getStudents()]);
        if (!alive) return;
        setEvents(Array.isArray(eventData) ? eventData.map(e => ({ ...e, id: e._id || e.id })) : []);
        setClubsFromDb(Array.isArray(clubData) ? clubData : []);
        setStudentCount(Array.isArray(studentData) ? studentData.length : 0);
        setLoadError("");
      } catch (error) {
        if (alive) setLoadError("Can't load live campus data. Check that the backend is running.");
      } finally { if (alive) setLoading(false); }
    };
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const upcoming = [...events]
    .filter((e) => !e.date || e.date >= today)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const trending = upcoming.slice(0, 4);
  const sidebarEvents = upcoming.slice(0, 5);

  const counts = {
    events: events.filter((e) => e.category !== "Workshop" && e.category !== "Hackathon").length,
    workshops: events.filter((e) => e.category === "Workshop").length,
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F5F6FB", minHeight: "100vh", color: "#1F2430" }}>
      <div style={{ display: "flex", maxWidth: 1536, margin: "0 auto" }}>
        {/* Sidebar */}
        <aside style={{ width: 260, flexShrink: 0, background: "#fff", borderRight: "1px solid #ECEDF3", minHeight: "100vh", display: "flex", flexDirection: "column", padding: "22px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#5B4FE8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.1, color: "#2A2560" }}>CampusConnect</div>
              <div style={{ fontSize: 11, color: "#9297A8" }}>Your Campus. Your Community.</div>
            </div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {navItems.map((item) => {
              const isActive = (routePath === "/" && item.label === "Home") || routePath === `/${item.label.toLowerCase().replaceAll(" ", "-")}`;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.label === "Home" ? "/" : `/${item.label.toLowerCase().replaceAll(" ", "-")}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 10, border: "none",
                    background: isActive ? "#5B4FE8" : "transparent",
                    color: isActive ? "#fff" : "#565B6B",
                    fontSize: 14.5, fontWeight: isActive ? 600 : 500,
                    cursor: "pointer", textAlign: "left", width: "100%",
                  }}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div style={{
            marginTop: 18, borderRadius: 16, padding: "18px",
            background: "linear-gradient(135deg,#6C5CE7,#4B3FD1)",
            color: "#fff", position: "relative", overflow: "hidden",
          }}>
            <Sparkles size={70} style={{ position: "absolute", right: -14, bottom: -10, opacity: 0.25 }} />
            <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.3 }}>Get Involved.<br />Make an Impact.</div>
            <div style={{ fontSize: 12.5, opacity: 0.9, margin: "8px 0 14px" }}>
              Join clubs, attend events and build your network.
            </div>
            <button style={{
              background: "#fff", color: "#5B4FE8", border: "none",
              borderRadius: 8, padding: "8px 16px", fontWeight: 700,
              fontSize: 13, cursor: "pointer",
            }} onClick={() => navigate("/clubs")}>Explore Now</button>
          </div>

          <button onClick={() => { setStudentProfile(getStudentProfile({ ask: false })); navigate("/profile"); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 8px 0", marginTop: 12, border: 0, borderTop: "1px solid #ECEDF3", background: "transparent", textAlign: "left", cursor: "pointer", width: "100%" }}>
            <Avatar profile={studentProfile || { name: "Student" }} size={38}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{studentProfile?.name || "Set up profile"}</div>
              <div style={{ fontSize: 11.5, color: "#9297A8", overflow: "hidden", textOverflow: "ellipsis" }}>{studentProfile?.email || "View your profile"}</div>
            </div>
            <ChevronDown size={16} color="#9297A8" />
          </button>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: "22px 24px", minWidth: 0 }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <div style={{ flex: 1, position: "relative", maxWidth: 480 }}>
              <Search size={17} color="#9297A8" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && globalSearch.trim()) { const q = encodeURIComponent(globalSearch.trim()); const clubMatch = clubsFromDb.some(c => `${c.name} ${c.category} ${c.description}`.toLowerCase().includes(globalSearch.trim().toLowerCase())); navigate(`${clubMatch ? "/clubs" : "/events"}?search=${q}`); } }}
                placeholder="Search events, clubs, workshops... (press Enter)"
                style={{
                  width: "100%", padding: "12px 16px 12px 44px", borderRadius: 12,
                  border: "1px solid #E6E7F0", background: "#fff", fontSize: 14, outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1 }} />
            <button onClick={() => setActionNotice("Announcements are sample content in this demo.")} title="Announcements" style={{border:0,background:"transparent",cursor:"pointer"}}><IconBadge icon={Bell} count={3} /></button>
            <button onClick={() => setActionNotice("Messaging is not enabled in this demo yet.")} title="Messages" style={{border:0,background:"transparent",cursor:"pointer"}}><IconBadge icon={Mail} count={1} /></button>
            <button onClick={() => navigate("/my-interests")} title="My interests" style={{border:0,background:"transparent",cursor:"pointer"}}><Bookmark size={20} color="#565B6B" /></button>
            <button onClick={() => { setStudentProfile(getStudentProfile({ ask: false })); navigate("/profile"); }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: 0, background: "transparent", textAlign: "left" }}>
              <Avatar profile={studentProfile || { name: "Student" }} size={40}/>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{studentProfile?.name || "Student profile"}</div>
                <div style={{ fontSize: 11.5, color: "#9297A8" }}>{studentProfile?.email || "Set up your account"}</div>
              </div>
              <ChevronDown size={16} color="#9297A8" />
            </button>
          </div>

          {actionNotice && <div role="status" style={{padding:10,marginBottom:14,borderRadius:9,background:"#EEF0FE",color:"#5B4FE8",fontSize:13}}>{actionNotice}<button onClick={() => setActionNotice("")} style={{float:"right",border:0,background:"transparent",cursor:"pointer"}}>✕</button></div>}
          {routePath === "/" ? <>
          {/* Greeting */}
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>Hello, {localStorage.getItem("campusconnect-name") || "Student"}! 👋</h1>
          <p style={{ color: "#7A7F91", margin: "0 0 20px", fontSize: 14.5 }}>
            Discover live events and clubs happening on campus.
          </p>

          {/* Hero */}
          <div style={{
            borderRadius: 20, padding: "34px 40px", marginBottom: 22,
            background: "linear-gradient(120deg,#4B3FD1 0%,#6C5CE7 55%,#9C8CFF 100%)",
            color: "#fff", position: "relative", overflow: "hidden", minHeight: 210,
          }}>
            <div style={{ position: "relative", zIndex: 2, maxWidth: 380 }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Be Active. Be Inspired.</div>
              <div style={{ fontSize: 15, opacity: 0.92, lineHeight: 1.5, marginBottom: 18 }}>
                Your campus is full of opportunities. Find yours today!
              </div>
              <button style={{
                background: "#fff", color: "#4B3FD1", border: "none",
                borderRadius: 10, padding: "11px 22px", fontWeight: 700,
                fontSize: 14, cursor: "pointer",
              }} onClick={() => navigate("/events")}>Explore Events</button>
            </div>
            <svg width="340" height="210" viewBox="0 0 340 210" style={{ position: "absolute", right: 0, bottom: 0, opacity: 0.9 }}>
              <circle cx="170" cy="70" r="46" fill="#ffffff22" />
              <rect x="60" y="90" width="220" height="70" fill="#ffffff14" />
              {[0, 1, 2, 3].map((i) => (
                <g key={i} transform={`translate(${40 + i * 70},95)`}>
                  <circle cx="20" cy="18" r="16" fill="#ffffff33" />
                  <rect x="4" y="36" width="32" height="55" rx="10" fill="#ffffff44" />
                </g>
              ))}
            </svg>
          </div>

          {loadError && <div role="status" style={{padding:12, marginBottom:16, borderRadius:10, background:"#FFF3E0", color:"#8A5A00"}}>{loadError}</div>}
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 22 }}>
            <StatBox icon={Calendar} value={String(upcoming.filter(e => { const d = new Date(`${e.date}T00:00:00`); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length)} label="Upcoming Events" tag="This Month" bg="#EEF0FE" fg="#5B4FE8" onClick={() => navigate("/calendar")} />
            <StatBox icon={Users} value={String(clubsFromDb.length)} label="Active Clubs" tag="Join Now" bg="#EAF8F0" fg="#22A35C" onClick={() => navigate("/clubs")} />
            <StatBox icon={PenSquare} value={String(counts.workshops)} label="Workshops" tag="This Month" bg="#FFF3E0" fg="#E08A1E" onClick={() => navigate("/workshops")} />
            <StatBox icon={Users} value={String(studentCount)} label="Registered Students" tag="View events" bg="#FDEBEF" fg="#E23F63" onClick={() => navigate("/events")} />
          </div>

          {/* Trending */}
          <SectionHeader icon={<Flame size={19} color="#F97316" />} title="Trending Now" cta="View All" onClick={() => navigate("/events")} />
          {loading ? (
            <LoadingBlock />
          ) : trending.length === 0 ? (
            <EmptyBlock text="No upcoming events yet. Check back soon." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 22 }}>
              {trending.map((e) => {
                const cat = CATEGORY_STYLES[e.category] || CATEGORY_STYLES.Event;
                const { mon, day } = fmtDate(e.date);
                return (
                  <div key={e.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #EEEFF5" }}>
                    <div style={{ height: 120, background: cat.grad, position: "relative" }}>
                      <span style={{
                        position: "absolute", top: 10, left: 10, background: cat.fg,
                        color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                      }}>{e.category}</span>
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                        <div style={{ textAlign: "center", lineHeight: 1.1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9297A8" }}>{mon}</div>
                          <div style={{ fontSize: 16, fontWeight: 800 }}>{day}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 2 }}>{e.title}</div>
                          <div style={{ fontSize: 12.5, color: "#7A7F91", lineHeight: 1.35 }}>{e.description}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#7A7F91", paddingTop: 8, borderTop: "1px solid #F1F1F6" }}>
                        <span>{e.time}{e.time && e.location ? "  •  " : ""}{e.location}</span>
                        <Bookmark size={14} color="#B0B4C2" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Explore Clubs */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #EEEFF5", marginBottom: 22 }}>
            <SectionHeader icon={<Users size={19} color="#5B4FE8" />} title="Explore Clubs" cta="View All Clubs" noMargin onClick={() => navigate("/clubs")} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginTop: 16 }}>
              {(clubsFromDb.length ? clubsFromDb : []).map((c) => (
                <div key={c._id || c.name} onClick={() => navigate("/clubs")} style={{
                  border: "1px solid #EEEFF5", borderRadius: 14, padding: "16px 10px",
                  textAlign: "center", cursor: "pointer",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: c.bg, margin: "0 auto 10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Users size={20} color={c.color || "#5B4FE8"} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, color: "#9297A8" }}>{c.members || 0} members</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer bar */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: "18px 22px", border: "1px solid #EEEFF5",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>Want to stay updated?</div>
              <div style={{ fontSize: 12.5, color: "#7A7F91" }}>Follow your favorite clubs and never miss an update!</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button style={{
                background: "#5B4FE8", color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 18px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              }} onClick={() => navigate("/my-interests")}>Manage Interests</button>
              <div style={{ display: "flex" }}>
                {avatarColors.map((c, i) => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: "50%", background: c,
                    border: "2px solid #fff", marginLeft: i === 0 ? 0 : -10,
                  }} />
                ))}
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", background: "#EEF0FE", color: "#5B4FE8",
                  border: "2px solid #fff", marginLeft: -10, fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>+34</div>
              </div>
            </div>
          </div>
          </> : <PageContent key={currentPath} path={routePath} navigate={navigate} />}
        </main>

        {/* Right rail */}
        <aside style={{ width: 340, flexShrink: 0, padding: "22px 24px 22px 0", display: routePath === "/" ? "flex" : "none", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 18, border: "1px solid #EEEFF5" }}>
            <SectionHeader icon={<Users size={18} color="#5B4FE8" />} title="Upcoming Events" cta="View Calendar" small onClick={() => navigate("/calendar")} />
            {loading ? (
              <LoadingBlock small />
            ) : sidebarEvents.length === 0 ? (
              <EmptyBlock small text="Nothing scheduled yet." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
                {sidebarEvents.map((e) => {
                  const cat = CATEGORY_STYLES[e.category] || CATEGORY_STYLES.Event;
                  const { mon, day } = fmtDate(e.date);
                  return (
                    <div key={e.id} style={{ display: "flex", gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, background: cat.bg, flexShrink: 0,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: cat.fg }}>{mon}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: cat.fg }}>{day}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{e.title}</div>
                          <div style={{ fontSize: 11.5, color: "#9297A8", whiteSpace: "nowrap" }}>{e.time}</div>
                        </div>
                        <div style={{ fontSize: 12, color: "#7A7F91" }}>{e.description}</div>
                        {e.location && (
                          <div style={{ fontSize: 11.5, color: "#9297A8", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <MapPin size={11} /> {e.location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={() => navigate("/events")} style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: "#5B4FE8", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", border:0, background:"transparent", padding:0 }}>
              View All Events <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 18, border: "1px solid #EEEFF5" }}>
            <SectionHeader icon={<Bell size={18} color="#5B4FE8" />} title="Announcements" cta="View All" small onClick={() => setActionNotice("Announcements are sample content in this demo.")} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              {announcements.map((a) => (
                <div key={a.title} style={{ display: "flex", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: a.bg, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <a.icon size={16} color={a.fg} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: "#9297A8" }}>{a.time}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#7A7F91", lineHeight: 1.4 }}>{a.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            borderRadius: 16, padding: 20, position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg,#6C5CE7,#4B3FD1)", color: "#fff",
          }}>
            <Megaphone size={64} style={{ position: "absolute", right: -6, bottom: -6, opacity: 0.25, transform: "rotate(-10deg)" }} />
            <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.3 }}>Have an idea for an event?</div>
            <div style={{ fontSize: 12.5, opacity: 0.9, margin: "6px 0 14px" }}>We'd love to hear it!</div>
            <button style={{
              background: "#fff", color: "#5B4FE8", border: "none", borderRadius: 8,
              padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }} onClick={() => navigate("/events")}>Submit Proposal</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PageContent({ path, navigate }) {
  const pages = {
    "/events": EventsPage,
    "/clubs": ClubsPage,
    "/workshops": WorkshopsPage,
    "/hackathons": HackathonsPage,
    "/campus-news": NewsPage,
    "/gallery": GalleryPage,
    "/resources": ResourcesPage,
    "/discussions": DiscussionsPage,
    "/my-interests": InterestsPage,
    "/calendar": CalendarPage,
    "/my-registrations": RegistrationsPage,
    "/profile": ProfilePage,
  };
  const Page = pages[path] || EventsPage;
  return <Page navigate={navigate} />;
}

function IconBadge({ icon: Icon, count }) {
  return (
    <div style={{ position: "relative", cursor: "pointer" }}>
      <Icon size={20} color="#565B6B" />
      {count ? (
        <span style={{
          position: "absolute", top: -6, right: -6, background: "#EF4444", color: "#fff",
          fontSize: 9.5, fontWeight: 700, width: 16, height: 16, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{count}</span>
      ) : null}
    </div>
  );
}

function SectionHeader({ icon, title, cta, small, noMargin, onClick }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: noMargin ? 0 : 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: small ? 15 : 17 }}>
        {icon} {title}
      </div>
      <button onClick={onClick} style={{ fontSize: small ? 12.5 : 13.5, fontWeight: 600, color: "#5B4FE8", cursor: onClick ? "pointer" : "default", border:0, background:"transparent", padding:0 }}>{cta}</button>
    </div>
  );
}

function StatBox({ icon: Icon, value, label, tag, bg, fg, onClick }) {
  return (
    <div onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined} style={{ background: "#fff", borderRadius: 16, padding: "18px 18px", border: "1px solid #EEEFF5", cursor: onClick ? "pointer" : "default" }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
      }}>
        <Icon size={19} color={fg} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#7A7F91", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: fg }}>{tag}</span>
        <ArrowRight size={14} color={fg} />
      </div>
    </div>
  );
}

function LoadingBlock({ small }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: small ? "24px 0" : "40px 0", color: "#9297A8", fontSize: 13 }}>
      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading events…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function EmptyBlock({ small, text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: small ? "22px 0" : "40px 0", color: "#9297A8" }}>
      <CalendarX size={small ? 20 : 26} style={{ opacity: 0.5 }} />
      <span style={{ fontSize: 12.5 }}>{text}</span>
    </div>
  );
}
