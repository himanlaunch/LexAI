import { Link } from "wouter";
import { C, SYS } from "@/lib/constants";

export function Footer() {
  const cols = [
    {
      title: "Services",
      links: [
        { label: "Patents", href: "/documents?type=IP%20Assignment%20Agreement" },
        { label: "Trademarks", href: "/services" },
        { label: "Contracts", href: "/documents?type=Non-Disclosure%20Agreement" },
        { label: "Privacy & Compliance", href: "/compliance" },
        { label: "Startup Docs", href: "/documents" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/" },
        { label: "Careers", href: "/dashboard" },
        { label: "Blog", href: "/services" },
        { label: "Press", href: "/" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/documents?type=Terms%20of%20Service" },
        { label: "Privacy Policy", href: "/documents?type=Privacy%20Policy" },
        { label: "Cookie Policy", href: "/documents?type=Privacy%20Policy" },
      ],
    },
  ];

  return (
    <footer style={{ backgroundColor: C.dark, color: "rgba(255,255,255,0.7)", padding: "64px 24px 36px" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg viewBox="0 0 32 32" fill="none" style={{ width: 26, height: 26 }}>
                <rect width="32" height="32" rx="6" fill="rgba(255,255,255,0.12)" />
                <path d="M8 24L13 8h2l3 10 3-10h2l5 16h-3l-3-10-3 10h-2l-3-10-3 10H8z" fill="white" />
              </svg>
              <span style={{ fontFamily: SYS, fontWeight: 600, fontSize: 17, color: C.white, letterSpacing: -0.3 }}>Agentlamy</span>
            </div>
            <p style={{ fontFamily: SYS, fontSize: 13, lineHeight: 1.6, maxWidth: 240, color: "rgba(255,255,255,0.45)", letterSpacing: "-0.1px" }}>
              The power of a full-service law firm at a fraction of the cost. Powered by specialized AI.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 16, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{col.title}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} style={{ fontFamily: SYS, fontSize: 13, letterSpacing: "-0.1px", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                    >{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 12 }}>
          <div style={{ fontFamily: SYS, fontSize: 12, letterSpacing: "-0.1px", color: "rgba(255,255,255,0.35)" }}>© 2026 Agentlamy Inc. All rights reserved.</div>
          <div style={{ fontFamily: SYS, fontSize: 12, letterSpacing: "-0.1px", color: "rgba(255,255,255,0.35)" }}>Made with specialized AI. Not a law firm.</div>
        </div>
      </div>
    </footer>
  );
}
