import { Link } from "wouter";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { C, SYS } from "@/lib/constants";
import { ImportedAeoScanner } from "@/components/dashboard/ImportedAeoScanner";
import { Activity, Clock, FileText, Calendar, ChevronRight, TrendingUp, AlertCircle, BarChart2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Dashboard() {
  const { configured, loading, user, profile } = useAuth();

  return (
    <div style={{ fontFamily: SYS, overflowX: "hidden", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />
      
      <main style={{ flex: 1, paddingTop: 120, paddingBottom: 96, backgroundColor: C.grayLt }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontFamily: SYS, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-1px", color: C.dark, margin: "0 0 12px", lineHeight: 1.1 }}>
              Your Dashboard
            </h1>
            <p style={{ fontFamily: SYS, fontSize: 17, letterSpacing: "-0.2px", color: C.gray, maxWidth: 540, lineHeight: 1.55, margin: 0 }}>
              Overview of your legal matters, generated documents, and accumulated savings.
            </p>
          </div>

          <div style={{
            backgroundColor: C.white, borderRadius: 16, padding: "22px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)", border: `1px solid ${C.border}`,
            marginBottom: 24,
          }}>
            <div style={{ fontFamily: SYS, fontSize: 16, fontWeight: 600, color: C.dark, marginBottom: 6 }}>
              Supabase account
            </div>
            <div style={{ fontFamily: SYS, fontSize: 14, color: C.gray, lineHeight: 1.5 }}>
              {!configured
                ? "Supabase is linked, but the public auth keys are not available to this build yet."
                : loading
                  ? "Checking your Supabase session..."
                  : user
                    ? `Signed in as ${profile?.email || user.email || "your Supabase user"}. Profile sync is connected to Supabase Postgres.`
                    : "Sign in to connect your dashboard to Supabase Auth and Supabase Postgres."}
            </div>
            {!user && configured && !loading ? (
              <Link href="/auth" style={{
                display: "inline-block", marginTop: 14, fontFamily: SYS, fontSize: 14, fontWeight: 500,
                color: C.white, backgroundColor: C.blue, borderRadius: 980, padding: "8px 18px", textDecoration: "none",
              }}>
                Sign In
              </Link>
            ) : null}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 48 }}>
            {[
              { label: "Documents Generated", value: "0", icon: <FileText size={20} /> },
              { label: "Active Matters", value: "0", icon: <Activity size={20} /> },
              { label: "Money Saved", value: "$0", icon: <Clock size={20} /> },
            ].map((stat, i) => (
              <div key={i} style={{
                backgroundColor: C.white, borderRadius: 16, padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                border: `1px solid ${C.border}`,
              }} data-testid={`card-stat-${i}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, color: C.gray }}>
                  {stat.icon}
                  <div style={{ fontFamily: SYS, fontSize: 14, fontWeight: 500, letterSpacing: "-0.1px" }}>{stat.label}</div>
                </div>
                <div style={{ fontFamily: SYS, fontSize: 36, fontWeight: 700, letterSpacing: "-1px", color: C.dark, lineHeight: 1 }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <ImportedAeoScanner />

          {/* Compliance Calendar entry card */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: SYS, fontSize: 18, fontWeight: 600, letterSpacing: "-0.3px", color: C.dark, marginBottom: 20 }}>
              Tools &amp; Resources
            </div>
            <Link href="/fundraising" style={{ textDecoration: "none" }} data-testid="card-fundraising">
              <div
                style={{
                  backgroundColor: C.white, borderRadius: 16, padding: "28px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", gap: 20, marginBottom: 12,
                  transition: "transform 0.18s, box-shadow 0.18s", cursor: "pointer",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 28px rgba(0,0,0,0.09)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(88,86,214,0.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#5856d6", flexShrink: 0 }}>
                  <BarChart2 size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SYS, fontSize: 17, fontWeight: 600, letterSpacing: "-0.3px", color: C.dark, marginBottom: 4 }}>
                    Fundraising Suite
                  </div>
                  <div style={{ fontFamily: SYS, fontSize: 14, color: C.gray, letterSpacing: "-0.1px", lineHeight: 1.45 }}>
                    7-step guided seed round — SAFE agreements, board consents, cap table, and more.
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" as const }}>
                    {[
                      { label: "7 Steps", icon: <TrendingUp size={11} />, color: "#5856d6" },
                      { label: "~$15,500 saved", icon: <BarChart2 size={11} />, color: C.green },
                    ].map((tag, i) => (
                      <span key={i} style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontFamily: SYS, fontSize: 11, fontWeight: 500, letterSpacing: "-0.05px",
                        color: tag.color, backgroundColor: `${tag.color}18`,
                        borderRadius: 6, padding: "3px 8px",
                      }}>
                        {tag.icon} {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight size={20} style={{ color: C.border, flexShrink: 0 }} />
              </div>
            </Link>

            <Link href="/compliance" style={{ textDecoration: "none" }} data-testid="card-compliance">
              <div
                style={{
                  backgroundColor: C.white, borderRadius: 16, padding: "28px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", gap: 20,
                  transition: "transform 0.18s, box-shadow 0.18s", cursor: "pointer",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 28px rgba(0,0,0,0.09)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(0,113,227,0.10)", display: "flex", alignItems: "center", justifyContent: "center", color: C.blue, flexShrink: 0 }}>
                  <Calendar size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SYS, fontSize: 17, fontWeight: 600, letterSpacing: "-0.3px", color: C.dark, marginBottom: 4 }}>
                    Compliance Calendar
                  </div>
                  <div style={{ fontFamily: SYS, fontSize: 14, color: C.gray, letterSpacing: "-0.1px", lineHeight: 1.45 }}>
                    15 recurring legal deadlines tracked — Annual filings, quarterly taxes, state reports, and more.
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" as const }}>
                    {[
                      { label: "5 High Priority", icon: <AlertCircle size={11} />, color: "#ff3b30" },
                      { label: "Annual · Quarterly · Monthly", icon: <TrendingUp size={11} />, color: C.blue },
                    ].map((tag, i) => (
                      <span key={i} style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontFamily: SYS, fontSize: 11, fontWeight: 500, letterSpacing: "-0.05px",
                        color: tag.color, backgroundColor: `${tag.color}18`,
                        borderRadius: 6, padding: "3px 8px",
                      }}>
                        {tag.icon} {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight size={20} style={{ color: C.border, flexShrink: 0 }} />
              </div>
            </Link>
          </div>

          <div>
            <div style={{ fontFamily: SYS, fontSize: 18, fontWeight: 600, letterSpacing: "-0.3px", color: C.dark, marginBottom: 20 }}>
              Recent Activity
            </div>
            <div style={{
              backgroundColor: C.white, borderRadius: 16, padding: "64px 24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)", border: `1px solid ${C.border}`,
              textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center"
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: C.grayLt, display: "flex", alignItems: "center", justifyContent: "center", color: C.gray, marginBottom: 20 }}>
                <Activity size={28} />
              </div>
              <div style={{ fontFamily: SYS, fontSize: 17, fontWeight: 600, letterSpacing: "-0.3px", color: C.dark, marginBottom: 8 }}>
                No recent activity
              </div>
              <div style={{ fontFamily: SYS, fontSize: 15, letterSpacing: "-0.1px", color: C.gray, maxWidth: 360, margin: "0 auto 24px", lineHeight: 1.5 }}>
                You haven't generated any documents or started any legal matters yet.
              </div>
              <Link href="/documents" style={{
                fontFamily: SYS, fontSize: 15, fontWeight: 500, letterSpacing: "-0.1px",
                color: C.white, backgroundColor: C.blue,
                border: "none", borderRadius: 980, padding: "10px 24px", cursor: "pointer",
                textDecoration: "none",
                transition: "background-color 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blueDk; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blue; }}
                data-testid="btn-start-matter"
              >
                Start New Matter
              </Link>
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
