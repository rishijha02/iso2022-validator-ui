import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const SHOW_ABOUT_LINK = false;

const links = [
  { to: "/validator", label: "Validator" },
  { to: "/message-generator", label: "Message Generator" },
  { to: "/developer-tools", label: "Developer Tools" },
];

export default function SiteNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [labsOpen, setLabsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const { pathname } = useLocation();
  const labsActive = ["/open-banking-lab", "/payment-lab", "/payment-rail-explorer", "/cards-lab"].includes(pathname);
  const resourcesActive = ["/documentation", "/supported-messages"].includes(pathname);

  useEffect(() => {
    const closeDropdownsOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".site-nav-dropdown")) return;
      setLabsOpen(false);
      setResourcesOpen(false);
    };
    const closeDropdownsOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLabsOpen(false);
        setResourcesOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeDropdownsOnOutsideClick);
    document.addEventListener("keydown", closeDropdownsOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeDropdownsOnOutsideClick);
      document.removeEventListener("keydown", closeDropdownsOnEscape);
    };
  }, []);

  // Keep focused authentication and admin workspaces free of the public-site menu.
  if (["/login", "/signup", "/admin/blogs"].includes(pathname)) return null;

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
        <NavLink to="/" end className={({ isActive }) => isActive ? "is-active" : undefined} onClick={() => setMenuOpen(false)}>Home</NavLink>
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
        <div className={`site-nav-dropdown${labsActive ? " is-active" : ""}${labsOpen ? " is-open" : ""}`} onMouseEnter={() => setLabsOpen(true)} onMouseLeave={() => setLabsOpen(false)}>
          <button type="button" className="site-nav-dropdown-trigger" aria-expanded={labsOpen} onClick={() => { setLabsOpen(true); setResourcesOpen(false); }}>Labs <span aria-hidden="true">⌄</span></button>
          {labsOpen && <div className="site-nav-dropdown-menu">
            <NavLink to="/open-banking-lab" onClick={() => { setMenuOpen(false); setLabsOpen(false); }}>Open Banking Lab</NavLink>
            <NavLink to="/payment-lab" onClick={() => { setMenuOpen(false); setLabsOpen(false); }}>Payment Simulator</NavLink>
            <NavLink to="/payment-rail-explorer" onClick={() => { setMenuOpen(false); setLabsOpen(false); }}>Payment Rail Explorer</NavLink>
            <NavLink to="/cards-lab" onClick={() => { setMenuOpen(false); setLabsOpen(false); }}>Cards Lab</NavLink>
          </div>}
        </div>
        <div className={`site-nav-dropdown${resourcesActive ? " is-active" : ""}${resourcesOpen ? " is-open" : ""}`} onMouseEnter={() => setResourcesOpen(true)} onMouseLeave={() => setResourcesOpen(false)}>
          <button type="button" className="site-nav-dropdown-trigger" aria-expanded={resourcesOpen} onClick={() => { setResourcesOpen(true); setLabsOpen(false); }}>Resources <span aria-hidden="true">⌄</span></button>
          {resourcesOpen && <div className="site-nav-dropdown-menu">
            <NavLink to="/supported-messages" onClick={() => { setMenuOpen(false); setResourcesOpen(false); }}>Supported Messages</NavLink>
            <NavLink to="/documentation" onClick={() => { setMenuOpen(false); setResourcesOpen(false); }}>Documentation</NavLink>
          </div>}
        </div>
        {SHOW_ABOUT_LINK && <NavLink to="/about" className={({ isActive }) => isActive ? "is-active" : undefined} onClick={() => setMenuOpen(false)}>About</NavLink>}
        <div className="site-auth-actions">
          <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
          <Link to="/signup" className="site-signup" onClick={() => setMenuOpen(false)}>Sign up</Link>
        </div>
      </nav>
    </header>
  );
}
