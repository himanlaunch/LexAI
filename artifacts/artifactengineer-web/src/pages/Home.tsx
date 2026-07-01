import { useState, useEffect } from "react";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { C, SYS, services, practiceAreas } from "@/lib/constants";
import { useInView } from "@/hooks/use-in-view";
import { Sparkles, ArrowRight, ChevronRight, CheckCircle2, Star } from "lucide-react";
import { Link } from "wouter";

const testimonials = [
  {
    name: "Sarah Chen",
    title: "CTO, Horizon Labs",
    quote: "Filed our provisional patent in 40 minutes. Our attorney would have taken 3 weeks and charged $4,000.",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    title: "Founder, Stackr",
    quote: "The trademark clearance search + application process was shockingly fast. Genuinely impressed.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    title: "Head of Legal, Meridian",
    quote: "We replaced $80k/year in outside counsel spend on routine contracts. The quality is indistinguishable.",
    rating: 5,
  },
];

const stats = [
  { value: "34+", label: "Legal Services", sub: "Across 8 practice areas" },
  { value: "96%", label: "Max Savings", sub: "vs. traditional firms" },
  { value: "Minutes", label: "Turnaround", sub: "Not weeks or months" },
  { value: "100%", label: "Your Control", sub: "Specialized AI per service" },
];

const starterKit = [
  {
    stage: "Day 1",
    color: "#0071e3",
    docs: [
      { name: "IP Assignment Agreement",  hours: 3.5, desc: "Transfer IP from founders to the company before investors look" },
      { name: "Co-founder Agreement",     hours: 4.5, desc: "Roles, equity splits, vesting, and decision-making in writing" },
      { name: "Founder Vesting Schedule", hours: 3.0, desc: "4-year vesting with 1-year cliff — standard for any VC raise" },
    ],
  },
  {
    stage: "First Hire",
    color: "#34c759",
    docs: [
      { name: "Non-Disclosure Agreement", hours: 1.5, desc: "Protect trade secrets before any conversation with employees or contractors" },
      { name: "Offer Letter",             hours: 1.5, desc: "At-will offer with compensation, equity, and start date" },
      { name: "Contractor Agreement",     hours: 2.5, desc: "Work-for-hire clause that assigns all IP to the company" },
    ],
  },
  {
    stage: "First Investor",
    color: "#5856d6",
    docs: [
      { name: "Terms of Service & Privacy Policy", hours: 5.0, desc: "Required by app stores and investors — GDPR/CCPA compliant" },
      { name: "Stock Option Plan (ESOP)",           hours: 5.5, desc: "409A-ready option pool documentation for equity compensation" },
      { name: "Board Consents & State Compliance",  hours: 2.5, desc: "Annual board resolutions, registered agent filings, and state reports" },
    ],
  },
];

const kitDocs = starterKit.flatMap(s => s.docs.map(d => ({ ...d, stage: s.stage, color: s.color })));

const RATE_MIN = 300;
const RATE_MAX = 700;

function SavingsCalculator({ visible }: { visible: boolean }) {
  const [rate, setRate] = useState(450);
  const totalAtRate = kitDocs.reduce((sum, d) => sum + Math.round(d.hours * rate), 0);

  return (
    <div style={{
      marginTop: 40,
      backgroundColor: C.white,
      borderRadius: 20,
      padding: "32px 28px",
      boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.6s ease 0.25s, transform 0.6s ease 0.25s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 20, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 18, letterSpacing: "-0.4px", color: C.dark, marginBottom: 4 }}>
            See exactly what you save
          </div>
          <div style={{ fontFamily: SYS, fontSize: 13, color: C.gray, letterSpacing: "-0.1px" }}>
            Typical attorney cost range per document. artifactengineer: always $0.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const }}>
          <div style={{ fontFamily: SYS, fontSize: 13, color: C.gray, letterSpacing: "-0.1px", whiteSpace: "nowrap" as const }}>
            Your attorney rate: <span style={{ fontWeight: 600, color: C.dark }}>${rate}/hr</span>
          </div>
          <input
            type="range"
            min={RATE_MIN} max={RATE_MAX} step={25}
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            style={{ width: 140, accentColor: C.blue, cursor: "pointer" }}
            data-testid="input-rate-slider"
          />
          <div style={{ display: "flex", gap: 6, fontFamily: SYS, fontSize: 11, color: C.gray }}>
            <span>${RATE_MIN}</span>
            <span style={{ opacity: 0.4 }}>—</span>
            <span>${RATE_MAX}</span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto" as const }}>
        <table style={{ width: "100%", borderCollapse: "collapse" as const, fontFamily: SYS }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th style={{ textAlign: "left" as const, fontWeight: 600, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: C.gray, padding: "0 0 12px", paddingRight: 16 }}>Document</th>
              <th style={{ textAlign: "right" as const, fontWeight: 600, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: C.gray, padding: "0 0 12px", paddingRight: 16, whiteSpace: "nowrap" as const }}>Law Firm (typical range)</th>
              <th style={{ textAlign: "right" as const, fontWeight: 600, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: "#34c759", padding: "0 0 12px", whiteSpace: "nowrap" as const }}>artifactengineer</th>
            </tr>
          </thead>
          <tbody>
            {kitDocs.map((doc, i) => {
              const low = Math.round(doc.hours * RATE_MIN);
              const high = Math.round(doc.hours * RATE_MAX);
              return (
                <tr key={i} style={{ borderBottom: i < kitDocs.length - 1 ? `1px solid ${C.grayLt}` : "none" }}>
                  <td style={{ padding: "11px 16px 11px 0", verticalAlign: "middle" as const }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        display: "inline-block",
                        fontSize: 10, fontWeight: 600, letterSpacing: "0.02em",
                        color: doc.color, backgroundColor: `${doc.color}14`,
                        borderRadius: 6, padding: "2px 7px",
                        whiteSpace: "nowrap" as const,
                      }}>{doc.stage}</span>
                      <span style={{ fontSize: 14, color: C.dark, letterSpacing: "-0.1px" }}>{doc.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px 11px 0", textAlign: "right" as const, fontSize: 14, fontWeight: 500, color: C.gray, whiteSpace: "nowrap" as const }}>
                    ${low.toLocaleString()}–${high.toLocaleString()}
                  </td>
                  <td style={{ padding: "11px 0", textAlign: "right" as const, fontSize: 14, fontWeight: 600, color: "#34c759", whiteSpace: "nowrap" as const }}>
                    $0
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: 20,
        background: "linear-gradient(135deg, rgba(0,113,227,0.06) 0%, rgba(88,86,214,0.06) 100%)",
        border: `1.5px solid rgba(0,113,227,0.15)`,
        borderRadius: 14, padding: "18px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: C.blue, marginBottom: 4 }}>
            Your estimated savings
          </div>
          <div style={{ fontFamily: SYS, fontSize: 13, color: C.gray, letterSpacing: "-0.1px" }}>
            Full kit via law firm at <strong style={{ color: C.dark }}>${rate}/hr</strong> vs. artifactengineer
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontFamily: SYS, fontSize: 13, color: C.gray, textDecoration: "line-through", letterSpacing: "-0.1px" }}>
            ${totalAtRate.toLocaleString()}
          </div>
          <div style={{ fontFamily: SYS, fontSize: 32, fontWeight: 700, letterSpacing: "-1px", color: C.blue }}>
            ${totalAtRate.toLocaleString()} saved
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,113,227,0.07) 0%, transparent 60%), ${C.white}`,
      paddingTop: 120, paddingBottom: 80, minHeight: "80vh",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(0,0,0,0.05)", borderRadius: 980, padding: "5px 14px", marginBottom: 36,
          fontFamily: SYS, fontSize: 12, fontWeight: 500, color: C.dark, letterSpacing: -0.1,
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.green, display: "inline-block" }} />
          34+ AI Legal Services · One Platform
        </div>

        <h1 style={{
          fontFamily: SYS,
          fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.06,
          letterSpacing: "-1px", color: C.dark, margin: "0 0 10px",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 0.55s ease 0.05s, transform 0.55s ease 0.05s",
        }}>
          The power of a full-service law firm.
        </h1>
        <h1 style={{
          fontFamily: SYS,
          fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.06,
          letterSpacing: "-1px", color: C.blue, margin: "0 0 24px",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
        }}>
          A fraction of the cost.
        </h1>

        <p style={{
          fontFamily: SYS, fontSize: 19, color: C.gray,
          lineHeight: 1.55, maxWidth: 560, margin: "0 auto 40px", letterSpacing: "-0.2px",
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.65s ease 0.15s, transform 0.65s ease 0.15s",
        }}>
          Patents, trademarks, contracts, privacy compliance, startup docs — every legal need covered by specialized AI. Save 60–96% vs. traditional attorneys.
        </p>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" as const,
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
        }}>
          <Link href="/documents" style={{
            display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
            fontFamily: SYS, fontSize: 17, fontWeight: 400, letterSpacing: "-0.2px",
            color: C.white, backgroundColor: C.blue,
            border: "none", borderRadius: 980, padding: "14px 28px", cursor: "pointer",
            transition: "background-color 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blueDk; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blue; }}
            data-testid="link-start-document"
          >
            <Sparkles size={16} />
            Start a Document
          </Link>
          <Link href="/services" style={{
            fontFamily: SYS, fontSize: 17, fontWeight: 400, letterSpacing: "-0.2px", textDecoration: "none",
            color: C.blue, backgroundColor: "transparent",
            border: `1.5px solid ${C.blue}`, borderRadius: 980, padding: "14px 28px", cursor: "pointer",
            transition: "opacity 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.75"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
            data-testid="link-view-services"
          >
            View All 34 Services
          </Link>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} style={{ backgroundColor: C.grayLt, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "72px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            textAlign: "center", padding: "16px 8px",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
          }}>
            <div style={{ fontFamily: SYS, fontSize: "clamp(40px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-1.5px", color: C.dark, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: SYS, fontWeight: 600, fontSize: 15, letterSpacing: "-0.2px", color: C.dark, marginTop: 8 }}>{s.label}</div>
            <div style={{ fontFamily: SYS, fontSize: 13, letterSpacing: "-0.1px", color: C.gray, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesSection() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} style={{ backgroundColor: C.white, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: SYS, fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: C.blue, marginBottom: 12 }}>Foundational Platform</div>
          <h2 style={{
            fontFamily: SYS, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.8px", color: C.dark, margin: "0 0 14px",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}>
            Every practice area, covered
          </h2>
          <p style={{
            fontFamily: SYS, fontSize: 17, letterSpacing: "-0.2px", color: C.gray, maxWidth: 520, margin: "0 auto",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.55s ease 0.05s, transform 0.55s ease 0.05s",
          }}>
            Specialized AI agents trained on each domain — not a one-size-fits-all model.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {services.map((svc, i) => (
            <div key={i} style={{
              backgroundColor: C.white,
              borderRadius: 18, padding: "28px 24px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "transform 0.2s, box-shadow 0.2s",
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)",
              transitionDelay: `${i * 0.06}s`,
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(-3px) scale(1.01)";
                el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(0) scale(1)";
                el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              }}
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
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 44 }}>
          <Link href="/services" style={{
            fontFamily: SYS, fontSize: 14, letterSpacing: "-0.1px", color: C.blue,
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4,
          }} data-testid="link-view-all-services">
            View all 34 services <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function StarterKitSection() {
  const { ref, visible } = useInView(0.1);
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section ref={ref} style={{ backgroundColor: C.grayLt, padding: "96px 24px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(0,113,227,0.08)", borderRadius: 980, padding: "5px 14px", marginBottom: 16,
            fontFamily: SYS, fontSize: 12, fontWeight: 500, color: C.blue, letterSpacing: 0,
            opacity: visible ? 1 : 0, transition: "opacity 0.5s ease",
          }}>
            For newly incorporated startups
          </div>
          <h2 style={{
            fontFamily: SYS, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.8px", color: C.dark, margin: "0 0 14px",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s",
          }}>
            Startup Starter Kit
          </h2>
          <p style={{
            fontFamily: SYS, fontSize: 17, letterSpacing: "-0.2px", color: C.gray, maxWidth: 540, margin: "0 auto",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s",
          }}>
            9 documents every founder needs — drafted by AI in minutes, not billed by the hour. Law firms charge $8,000–$15,000 for this stack. You won't.
          </p>
        </div>

        <div style={{
          display: "flex", gap: 8, justifyContent: "center", marginBottom: 40,
          opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.15s",
        }}>
          {starterKit.map((stage, i) => (
            <button key={i} onClick={() => setActiveStage(i)} style={{
              fontFamily: SYS, fontSize: 14, fontWeight: activeStage === i ? 600 : 400,
              letterSpacing: "-0.1px",
              color: activeStage === i ? C.white : C.dark,
              backgroundColor: activeStage === i ? stage.color : "rgba(0,0,0,0.06)",
              border: "none", borderRadius: 980, padding: "8px 20px", cursor: "pointer",
              transition: "background-color 0.2s, color 0.2s",
            }} data-testid={`btn-stage-${i}`}>
              {stage.stage}
            </button>
          ))}
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
        }}>
          {starterKit[activeStage].docs.map((doc, i) => (
            <div key={i} style={{
              backgroundColor: C.white, borderRadius: 16, padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex", alignItems: "flex-start", gap: 14,
              transition: "box-shadow 0.2s",
              cursor: "pointer",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                backgroundColor: `${starterKit[activeStage].color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: starterKit[activeStage].color,
              }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontFamily: SYS, fontWeight: 600, fontSize: 15, letterSpacing: "-0.2px", color: C.dark, marginBottom: 4 }}>
                  {doc.name}
                </div>
                <div style={{ fontFamily: SYS, fontSize: 13, letterSpacing: "-0.1px", color: C.gray, lineHeight: 1.5 }}>
                  {doc.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <SavingsCalculator visible={visible} />

        <div style={{
          marginTop: 20, background: C.white, borderRadius: 16, padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          opacity: visible ? 1 : 0, transition: "opacity 0.65s ease 0.25s",
        }}>
          <div>
            <div style={{ fontFamily: SYS, fontWeight: 600, fontSize: 16, letterSpacing: "-0.3px", color: C.dark }}>
              Get all 9 documents — complete kit
            </div>
            <div style={{ fontFamily: SYS, fontSize: 13, color: C.gray, marginTop: 3, letterSpacing: "-0.1px" }}>
              Law firms charge $8,000–$15,000. artifactengineer does it in minutes.
            </div>
          </div>
          <Link href="/documents" style={{
            textDecoration: "none",
            fontFamily: SYS, fontSize: 15, fontWeight: 400, letterSpacing: "-0.1px",
            color: C.white, backgroundColor: C.blue,
            border: "none", borderRadius: 980, padding: "12px 24px", cursor: "pointer",
            whiteSpace: "nowrap" as const,
            transition: "background-color 0.2s", display: "inline-block",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blueDk; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blue; }}
            data-testid="btn-get-full-kit"
          >
            Get the Full Kit
          </Link>
        </div>
      </div>
    </section>
  );
}

function PracticeAreasSection() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} style={{ backgroundColor: C.dark, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div className="practice-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: SYS, fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Practice Areas</div>
            <h2 style={{
              fontFamily: SYS, fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.8px", color: C.white, margin: "0 0 18px", lineHeight: 1.1,
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}>
              8 practice areas. One unified platform.
            </h2>
            <p style={{
              fontFamily: SYS, fontSize: 17, letterSpacing: "-0.2px", color: "rgba(255,255,255,0.6)", lineHeight: 1.55, margin: "0 0 32px",
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.55s ease 0.06s, transform 0.55s ease 0.06s",
            }}>
              From startup formation to enterprise compliance, every legal matter handled by purpose-trained AI — no generalist models.
            </p>
            <Link href="/services" style={{
              fontFamily: SYS, fontSize: 15, fontWeight: 400, letterSpacing: "-0.1px",
              color: C.dark, backgroundColor: C.white,
              border: "none", borderRadius: 980, padding: "12px 24px", cursor: "pointer", textDecoration: "none", display: "inline-block",
              transition: "opacity 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
              data-testid="link-explore-services"
            >
              Explore Services
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {practiceAreas.map((area, i) => (
              <div key={i} style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "12px 16px", cursor: "pointer",
                fontFamily: SYS, fontSize: 14, fontWeight: 400, letterSpacing: "-0.1px", color: "rgba(255,255,255,0.85)",
                display: "flex", alignItems: "center", gap: 8,
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.45s ease ${i * 0.05}s, transform 0.45s ease ${i * 0.05}s, background-color 0.2s`,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,0.08)"; }}
              >
                <CheckCircle2 size={13} style={{ color: C.green, flexShrink: 0 }} />
                {area}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .practice-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function Testimonials() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} style={{ backgroundColor: C.grayLt, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{
            fontFamily: SYS, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.8px", color: C.dark, margin: 0,
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}>
            Trusted by teams that move fast
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              backgroundColor: C.white,
              borderRadius: 18, padding: "28px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)",
              transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
            }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} fill={C.blue} stroke="none" />
                ))}
              </div>
              <p style={{ fontFamily: SYS, fontSize: 15, letterSpacing: "-0.1px", color: C.dark, lineHeight: 1.55, margin: "0 0 20px" }}>
                "{t.quote}"
              </p>
              <div>
                <div style={{ fontFamily: SYS, fontWeight: 600, fontSize: 14, letterSpacing: "-0.1px", color: C.dark }}>{t.name}</div>
                <div style={{ fontFamily: SYS, fontSize: 13, color: C.gray, marginTop: 2 }}>{t.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} style={{ backgroundColor: C.white, padding: "96px 24px", borderTop: `1px solid ${C.border}` }}>
      <div style={{
        maxWidth: 640, margin: "0 auto", textAlign: "center",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.55s ease, transform 0.55s ease",
      }}>
        <h2 style={{ fontFamily: SYS, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.8px", color: C.dark, margin: "0 0 16px", lineHeight: 1.1 }}>
          Ready to get started?
        </h2>
        <p style={{ fontFamily: SYS, fontSize: 17, letterSpacing: "-0.2px", color: C.gray, margin: "0 0 36px", lineHeight: 1.55 }}>
          Join thousands of founders, startups, and enterprises using artifactengineer to handle their legal work faster and for far less.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const }}>
          <Link href="/documents" style={{
            display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
            fontFamily: SYS, fontSize: 17, fontWeight: 400, letterSpacing: "-0.2px",
            color: C.white, backgroundColor: C.blue,
            border: "none", borderRadius: 980, padding: "14px 28px", cursor: "pointer",
            transition: "background-color 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blueDk; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blue; }}
            data-testid="btn-start-free"
          >
            <Sparkles size={16} /> Start for Free
          </Link>
          <Link href="/services" style={{
            textDecoration: "none",
            fontFamily: SYS, fontSize: 17, fontWeight: 400, letterSpacing: "-0.2px",
            color: C.blue, backgroundColor: "transparent",
            border: `1.5px solid ${C.blue}`, borderRadius: 980, padding: "14px 28px", cursor: "pointer",
            transition: "opacity 0.2s", display: "inline-block",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.75"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
            data-testid="btn-view-services"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Home() {
  return (
    <div style={{ fontFamily: SYS, overflowX: "hidden" }}>
      <Nav />
      <Hero />
      <Stats />
      <ServicesSection />
      <StarterKitSection />
      <PracticeAreasSection />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
