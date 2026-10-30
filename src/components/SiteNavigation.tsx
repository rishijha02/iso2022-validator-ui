import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const links = [
  { to: "/validator", label: "Validator" },
  { to: "/message-generator", label: "Message Generator" },
  { to: "/developer-tools", label: "Developer Tools" },
  { to: "/open-banking-lab", label: "Open Banking" },
  { to: "/payment-lab", label: "Payments Lab" },
  { to: "/documentation", label: "Documentation" },
  { to: "/supported-messages", label: "Supported Messages" },
];

export default function SiteNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Keep focused authentication and admin workspaces free of the public-site menu.
  // Cards Lab is supplied separately from this ZIP and still owns its legacy header.
  if (["/login", "/signup", "/admin/blogs", "/cards-lab"].includes(pathname)) return null;

  return (
    <header className="site-header">
      <Link to="/" className="site-brand" aria-label="FintechSchema home" onClick={() => setMenuOpen(false)}>
        <span className="site-brand-mark">FS</span>
        <span className="site-brand-copy">
          <strong>FintechSchema</strong>
          <small>Fintech Developer Platform</small>
        </span>
      </Link>

      <button
        className="site-menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="site-primary-navigation"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span /><span /><span />
      </button>

      <nav id="site-primary-navigation" className={`site-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/developer-tools"}
            className={({ isActive }) => isActive || (to === "/developer-tools" && pathname.startsWith(`${to}/`)) ? "is-active" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </NavLink>
        ))}
        <NavLink to="/about" className={({ isActive }) => isActive ? "is-active" : undefined} onClick={() => setMenuOpen(false)}>About</NavLink>
        <div className="site-auth-actions">
          <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
          <Link to="/signup" className="site-signup" onClick={() => setMenuOpen(false)}>Sign up</Link>
        </div>
      </nav>
    </header>
  );
}
