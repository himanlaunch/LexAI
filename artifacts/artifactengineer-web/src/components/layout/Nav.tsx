import { Link } from "wouter";
import { useState, useEffect } from "react";
import { C, SYS } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.72)",
      backdropFilter: "saturate(180%) blur(20px)",
      WebkitBackdropFilter: "saturate(180%) blur(20px)",
      borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
      transition: "border-color 0.3s ease",
    }}>
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textDecoration: "none" }} data-testid="link-home">
          <svg viewBox="0 0 32 32" fill="none" style={{ width: 26, height: 26 }}>
            <rect width="32" height="32" rx="6" fill={C.dark} />
            <path d="M8 24L13 8h2l3 10 3-10h2l5 16h-3l-3-10-3 10h-2l-3-10-3 10H8z" fill="white" />
          </svg>
          <span className="brand-text" style={{ fontFamily: SYS, fontWeight: 600, fontSize: 17, color: C.dark, letterSpacing: -0.3 }}>artifactengineer</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden-mobile">
          <Link href="/services" style={{ fontFamily: SYS, fontSize: 13, fontWeight: 400, color: C.dark, textDecoration: "none", opacity: 0.85, letterSpacing: -0.1 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}
            data-testid="link-services"
          >Services</Link>
          <Link href="/documents" style={{ fontFamily: SYS, fontSize: 13, fontWeight: 400, color: C.dark, textDecoration: "none", opacity: 0.85, letterSpacing: -0.1 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}
            data-testid="link-documents"
          >Documents</Link>
          <Link href="/dashboard" style={{ fontFamily: SYS, fontSize: 13, fontWeight: 400, color: C.dark, textDecoration: "none", opacity: 0.85, letterSpacing: -0.1 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}
            data-testid="link-dashboard"
          >Dashboard</Link>
          <Link href="/compliance" style={{ fontFamily: SYS, fontSize: 13, fontWeight: 400, color: C.dark, textDecoration: "none", opacity: 0.85, letterSpacing: -0.1 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}
            data-testid="link-compliance"
          >Compliance</Link>
          <Link href="/fundraising" style={{ fontFamily: SYS, fontSize: 13, fontWeight: 400, color: C.dark, textDecoration: "none", opacity: 0.85, letterSpacing: -0.1 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}
            data-testid="link-fundraising"
          >Fundraising</Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/dashboard#aeo-scanner" style={{
            fontFamily: SYS, fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
            color: C.blue, backgroundColor: "rgba(0,113,227,0.08)",
            border: `1px solid rgba(0,113,227,0.18)`, borderRadius: 980, padding: "6px 14px",
            cursor: "pointer", textDecoration: "none", transition: "background-color 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(0,113,227,0.13)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(0,113,227,0.08)"; }}
            data-testid="btn-aeo-scanner"
          >AEO</Link>
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              style={{ fontFamily: SYS, fontSize: 13, color: C.blue, background: "transparent", border: 0, padding: 0, cursor: "pointer", fontWeight: 400, letterSpacing: -0.1 }}
              data-testid="btn-logout"
            >
              Log Out
            </button>
          ) : (
            <Link href="/auth" style={{ fontFamily: SYS, fontSize: 13, color: C.blue, textDecoration: "none", fontWeight: 400, letterSpacing: -0.1 }} data-testid="link-login">Log In</Link>
          )}
          <Link href="/documents" style={{
            fontFamily: SYS, fontSize: 13, fontWeight: 400, letterSpacing: -0.1,
            color: C.white, backgroundColor: C.blue,
            border: "none", borderRadius: 980, padding: "6px 16px", cursor: "pointer",
            textDecoration: "none",
            transition: "background-color 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blueDk; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blue; }}
            data-testid="btn-get-started"
          >Get Started</Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .hidden-mobile { display: none !important; } }
        @media (max-width: 420px) {
          .brand-text { font-size: 14px !important; }
          nav [data-testid="btn-get-started"] { padding: 6px 12px !important; }
          nav [data-testid="btn-aeo-scanner"] { padding: 6px 10px !important; }
        }
        @media (max-width: 360px) {
          .brand-text { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
