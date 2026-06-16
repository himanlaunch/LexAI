import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { C, SYS, services, practiceAreas } from "@/lib/constants";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export function Services() {
  return (
    <div style={{ fontFamily: SYS, overflowX: "hidden", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />
      
      <main style={{ flex: 1, paddingTop: 120, paddingBottom: 96, backgroundColor: C.grayLt }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ marginBottom: 64 }}>
            <h1 style={{ fontFamily: SYS, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-1px", color: C.dark, margin: "0 0 16px", lineHeight: 1.1 }}>
              All Legal Services
            </h1>
            <p style={{ fontFamily: SYS, fontSize: 19, letterSpacing: "-0.2px", color: C.gray, maxWidth: 640, lineHeight: 1.55, margin: 0 }}>
              Purpose-built AI agents trained on specific legal domains. Choose the service you need to start generating, reviewing, or analyzing your documents.
            </p>
          </div>

          <div style={{ marginBottom: 80 }}>
            <div style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: C.gray, marginBottom: 24 }}>
              Core Services
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {services.map((svc, i) => (
                <Link key={i} href="/documents" style={{
                  backgroundColor: C.white,
                  borderRadius: 18, padding: "28px 24px",
                  cursor: "pointer",
                  display: "block",
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.transform = "translateY(-3px) scale(1.01)";
                    el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.transform = "translateY(0) scale(1)";
                    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  }}
                  data-testid={`card-service-${i}`}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(0,113,227,0.10)", display: "flex", alignItems: "center", justifyContent: "center", color: C.blue, marginBottom: 16 }}>
                    {svc.icon}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ fontFamily: SYS, fontWeight: 600, fontSize: 17, letterSpacing: "-0.3px", color: C.dark, marginBottom: 4 }}>{svc.label}</div>
                      <div style={{ fontFamily: SYS, fontSize: 14, letterSpacing: "-0.1px", color: C.gray, lineHeight: 1.45 }}>{svc.desc}</div>
                    </div>
                    <ChevronRight size={18} style={{ color: C.border, flexShrink: 0, marginTop: 2 }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: C.gray, marginBottom: 24 }}>
              Practice Areas
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {practiceAreas.map((area, i) => (
                <Link key={i} href="/documents" style={{
                  backgroundColor: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "16px 20px", cursor: "pointer",
                  fontFamily: SYS, fontSize: 15, fontWeight: 500, letterSpacing: "-0.1px", color: C.dark,
                  textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 10,
                  transition: `background-color 0.2s, border-color 0.2s`,
                }}
                  onMouseEnter={e => { 
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(0,113,227,0.04)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,113,227,0.3)";
                  }}
                  onMouseLeave={e => { 
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.white; 
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = C.border; 
                  }}
                  data-testid={`card-practice-area-${i}`}
                >
                  <CheckCircle2 size={16} style={{ color: C.green, flexShrink: 0 }} />
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
