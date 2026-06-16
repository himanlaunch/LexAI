import { useRef, useState } from "react";
import { useSearch } from "wouter";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { C, SYS } from "@/lib/constants";
import { FileText, Plus, Sparkles } from "lucide-react";

const sampleDocs = [
  { title: "Non-Disclosure Agreement", category: "Contracts" },
  { title: "Offer Letter", category: "Employment" },
  { title: "IP Assignment Agreement", category: "Intellectual Property" },
  { title: "Co-founder Agreement", category: "Startup Docs" },
  { title: "Terms of Service", category: "Privacy & Compliance" },
  { title: "Privacy Policy", category: "Privacy & Compliance" },
  { title: "Board Resolutions", category: "Corporate Governance" },
  { title: "Registered Agent Authorization", category: "State Compliance" },
  { title: "Delaware Franchise Tax Filing", category: "State Compliance" },
  { title: "CA Statement of Information", category: "State Compliance" },
  { title: "Corporate Tax Preparation Checklist", category: "Tax" },
  { title: "Foreign Qualification Application", category: "State Compliance" },
  { title: "NY Biennial Statement", category: "State Compliance" },
  { title: "Annual Report", category: "State Compliance" },
  { title: "1099-NEC Preparation Checklist", category: "Tax" },
  { title: "Estimated Tax Payment Guide", category: "Tax" },
  { title: "Payroll Compliance Checklist", category: "Tax" },
  { title: "Sales Tax Nexus Analysis", category: "Tax" },
  { title: "W-9 Request Template", category: "Tax" },
  { title: "83(b) Election Letter", category: "Corporate Governance" },
  { title: "BOI Report", category: "Federal Compliance" },
];

export function Documents() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const prefillType = params.get("type") ?? "";

  const prefillDoc = prefillType
    ? sampleDocs.find(d => d.title.toLowerCase() === prefillType.toLowerCase())
    : null;

  const [selectedDoc, setSelectedDoc] = useState(prefillDoc ?? null);
  const highlightedRowRef = useRef<HTMLDivElement>(null);

  function scrollToHighlighted() {
    highlightedRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (prefillDoc) setSelectedDoc(prefillDoc);
  }

  function startDocument(doc = sampleDocs[0]) {
    setSelectedDoc(doc);
  }

  return (
    <div style={{ fontFamily: SYS, overflowX: "hidden", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />
      
      <main style={{ flex: 1, paddingTop: 120, paddingBottom: 96, backgroundColor: C.grayLt }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: prefillDoc ? 24 : 48 }}>
            <div>
              <h1 style={{ fontFamily: SYS, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-1px", color: C.dark, margin: "0 0 12px", lineHeight: 1.1 }}>
                Your Documents
              </h1>
              <p style={{ fontFamily: SYS, fontSize: 17, letterSpacing: "-0.2px", color: C.gray, maxWidth: 540, lineHeight: 1.55, margin: 0 }}>
                Start generating legal documents with AI — fast, accurate, and affordable.
              </p>
            </div>
            <button onClick={() => startDocument()} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: SYS, fontSize: 15, fontWeight: 500, letterSpacing: "-0.1px",
              color: C.white, backgroundColor: C.blue,
              border: "none", borderRadius: 980, padding: "10px 20px", cursor: "pointer",
              transition: "background-color 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blueDk; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blue; }}
              data-testid="btn-new-document"
            >
              <Plus size={16} /> New Document
            </button>
          </div>

          {/* Prefill banner — shown when arriving from the compliance calendar */}
          {prefillDoc && (
            <div style={{
              marginBottom: 32,
              backgroundColor: "rgba(0,113,227,0.07)",
              border: `1.5px solid rgba(0,113,227,0.20)`,
              borderRadius: 14, padding: "18px 22px",
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const,
            }} data-testid="prefill-banner">
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, flexShrink: 0 }}>
                <Sparkles size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SYS, fontSize: 14, fontWeight: 600, color: C.blue, marginBottom: 2, letterSpacing: "-0.1px" }}>
                  Pre-selected from your Compliance Calendar
                </div>
                <div style={{ fontFamily: SYS, fontSize: 13, color: C.dark, letterSpacing: "-0.1px" }}>
                  Generating: <strong>{prefillDoc.title}</strong> · {prefillDoc.category}
                </div>
              </div>
              <button
                onClick={scrollToHighlighted}
                style={{
                  fontFamily: SYS, fontSize: 13, fontWeight: 500, letterSpacing: "-0.1px",
                  color: C.white, backgroundColor: C.blue,
                  border: "none", borderRadius: 980, padding: "8px 20px", cursor: "pointer",
                  transition: "background-color 0.2s", whiteSpace: "nowrap" as const,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blueDk; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blue; }}
                data-testid="btn-generate-prefill"
              >
                Generate Now
              </button>
            </div>
          )}

          {selectedDoc && (
            <section
              style={{
                marginBottom: 32,
                backgroundColor: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "24px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              }}
              data-testid="document-workspace"
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap" as const }}>
                <div>
                  <div style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, color: C.blue, letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                    Document workspace
                  </div>
                  <h2 style={{ fontFamily: SYS, fontSize: 24, fontWeight: 700, color: C.dark, letterSpacing: "-0.5px", margin: "0 0 8px" }}>
                    {selectedDoc.title}
                  </h2>
                  <p style={{ fontFamily: SYS, fontSize: 14, color: C.gray, lineHeight: 1.5, letterSpacing: "-0.1px", margin: 0, maxWidth: 560 }}>
                    This template is ready to generate. The next step is to collect company details, parties, dates, and special terms for a clean first draft.
                  </p>
                </div>
                <span style={{
                  fontFamily: SYS,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.green,
                  backgroundColor: "rgba(52,199,89,0.12)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  letterSpacing: "-0.05px",
                  whiteSpace: "nowrap" as const,
                }}>
                  Ready
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 20 }}>
                {["Company profile", "Key terms", "Review draft"].map((step, i) => (
                  <div key={step} style={{ border: `1px solid ${C.grayLt}`, borderRadius: 12, padding: "14px 16px", backgroundColor: i === 0 ? "rgba(0,113,227,0.04)" : C.white }}>
                    <div style={{ fontFamily: SYS, fontSize: 12, color: C.gray, marginBottom: 4 }}>Step {i + 1}</div>
                    <div style={{ fontFamily: SYS, fontSize: 14, fontWeight: 600, color: C.dark }}>{step}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div style={{ backgroundColor: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(0,0,0,0.01)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: SYS, fontSize: 13, fontWeight: 600, color: C.gray, letterSpacing: "0.02em", textTransform: "uppercase" }}>Templates</div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              {sampleDocs.map((doc, i) => {
                const isHighlighted = prefillDoc && doc.title === prefillDoc.title;
                return (
                  <div key={i} ref={isHighlighted ? highlightedRowRef : undefined} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                    padding: "20px 24px",
                    borderBottom: i < sampleDocs.length - 1 ? `1px solid ${C.grayLt}` : "none",
                    backgroundColor: isHighlighted ? "rgba(0,113,227,0.04)" : "transparent",
                    transition: "background-color 0.2s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = isHighlighted ? "rgba(0,113,227,0.08)" : "rgba(0,113,227,0.02)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = isHighlighted ? "rgba(0,113,227,0.04)" : "transparent"; }}
                    data-testid={`row-document-${i}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: isHighlighted ? C.blue : "rgba(0,113,227,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: isHighlighted ? C.white : C.blue, flexShrink: 0 }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontFamily: SYS, fontWeight: isHighlighted ? 700 : 600, fontSize: 16, letterSpacing: "-0.2px", color: C.dark, marginBottom: 4 }}>
                          {doc.title}
                          {isHighlighted && (
                            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: C.blue, backgroundColor: "rgba(0,113,227,0.12)", borderRadius: 6, padding: "2px 8px", letterSpacing: "0.02em" }}>
                              Selected
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: SYS, fontSize: 13, letterSpacing: "-0.1px", color: C.gray }}>
                          {doc.category}
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => startDocument(doc)} style={{
                      fontFamily: SYS, fontSize: 13, fontWeight: 500, letterSpacing: "-0.1px",
                      color: isHighlighted ? C.white : C.blue,
                      backgroundColor: isHighlighted ? C.blue : "transparent",
                      border: `1.5px solid ${C.blue}`, borderRadius: 980, padding: "6px 16px", cursor: "pointer",
                      transition: "opacity 0.2s", whiteSpace: "nowrap"
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                      data-testid={`btn-generate-${i}`}
                    >
                      Generate
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
