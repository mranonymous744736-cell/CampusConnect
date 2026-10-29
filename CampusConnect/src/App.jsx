import { useEffect, useState } from "react";
import CampusConnectDashboard from "./CampusConnectDashboard";
import CampusConnectAdmin from "./CampusConnectAdmin";

function App() {
  const [path, setPath] = useState(() => window.location.pathname + window.location.search);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname + window.location.search);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextPath) => {
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== nextPath) window.history.pushState({}, "", nextPath);
    setPath(window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (path.startsWith("/admin")) return <CampusConnectAdmin />;
  return <CampusConnectDashboard currentPath={path} navigate={navigate} />;
}

export default App;
