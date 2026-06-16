import { useState } from "react";
import { Link } from "wouter";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { C, SYS } from "@/lib/constants";
import { useInView } from "@/hooks/use-in-view";
import {
  CheckCircle2, Circle, ChevronRight, DollarSign,
  Users, TrendingUp, Sparkles, ChevronDown,
} from "lucide-react";

interface FundraisingStep {
  id: string;
  number: number;
  title: string;
  description: string;
  whyItMatters: string;
  lawFirmCost: string;
  lawFirmCostNum: number;
  documentType: string;
  tag: string;
}

const steps: FundraisingStep[] = [
  {
    id: "valuation-409a",
    number: 1,
    title: "409A Valuation",
    description: "An independent appraisal of your company's common stock fair market value, required by the IRS before issuing equity to employees.",
    whyItMatters: "Skipping this step exposes your employees to unexpected tax liability. Every option grant issued without a current 409A is a ticking IRS audit risk.",
    lawFirmCost: "$3,000–$5,000",
    lawFirmCostNum: 4000,
    documentType: "409A Valuation Summary",
    tag: "Required first",
  },
  {
    id: "board-consent-authorize",
    number: 2,
    title: "Board Consent — Authorize Financing",
    description: "A written board resolution formally authorizing the company to raise capital, issue SAFEs or preferred stock, and engage legal counsel for the round.",
    whyItMatters: "Without this consent, SAFEs and stock issuances are technically unauthorized. Investors and future counsel will request it during due diligence.",
    lawFirmCost: "$1,000–$2,500",
    lawFirmCostNum: 1750,
    documentType: "Board Consent — Authorize Financing",
    tag: "Corporate governance",
  },
  {
    id: "safe-agreement",
    number: 3,
    title: "SAFE Agreement",
    description: "A Simple Agreement for Future Equity converts to preferred stock at the next priced round. Specify investor name, investment amount, valuation cap, and optional discount rate.",
    whyItMatters: "The SAFE is the backbone of your seed round. YC's post-money SAFE is now the standard — make sure you're using the right version with accurate terms.",
    lawFirmCost: "$2,000–$5,000 per investor",
    lawFirmCostNum: 3500,
    documentType: "SAFE Agreement",
    tag: "Core document",
  },
  {
    id: "safe-side-letter",
    number: 4,
    title: "SAFE Side Letter",
    description: "A supplemental letter granting investors additional rights such as pro-rata participation in future rounds and MFN (Most Favored Nation) provisions.",
    whyItMatters: "Sophisticated angels and micro-VCs often require pro-rata rights as a condition of investing. Ignoring this can cost you the check or create disputes at Series A.",
    lawFirmCost: "$1,500–$3,000 per investor",
    lawFirmCostNum: 2000,
    documentType: "SAFE Side Letter",
    tag: "Investor rights",
  },
  {
    id: "cap-table-update",
    number: 5,
    title: "Cap Table Update",
    description: "An updated capitalization table reflecting all SAFE holders, their amounts, valuation caps, and pro-forma ownership percentages on a fully diluted basis.",
    whyItMatters: "Investors will ask for this before wiring money. Sending an outdated or incorrect cap table creates friction and raises red flags about founder diligence.",
    lawFirmCost: "$500–$1,500",
    lawFirmCostNum: 1000,
    documentType: "Cap Table Summary",
    tag: "Financial document",
  },
  {
    id: "stockholder-consent",
    number: 6,
    title: "Stockholder Consent / Written Consent",
    description: "A written consent of existing stockholders approving the financing terms, updated charter amendments, and any new rights granted to SAFE holders.",
    whyItMatters: "Required by your certificate of incorporation and DGCL. Missing this step leaves your round technically unclosed and creates liability for future counsel.",
    lawFirmCost: "$1,000–$2,000",
    lawFirmCostNum: 1500,
    documentType: "Stockholder Written Consent",
    tag: "Corporate governance",
  },
  {
    id: "closing-board-consent",
    number: 7,
    title: "Closing Board Consent",
    description: "Final board resolution ratifying the closing of the financing round, approving the final list of SAFE investors, amounts, and confirming all documents are executed.",
    whyItMatters: "Officially closes the round. Required before depositing investor funds and issuing any receipts. Your bank may ask for this document.",
    lawFirmCost: "$1,000–$2,500",
    lawFirmCostNum: 1750,
    documentType: "Closing Board Consent",
    tag: "Closing document",
  },
];

const TOTAL_LAW_FIRM_EST = steps.reduce((s, st) => s + st.lawFirmCostNum, 0);

function formatDollar(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function StepCard({
  step,
  done,
  onToggle,
}: {
  step: FundraisingStep;
  done: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  function handleCheck() {
    setExpanded(false);
    onToggle();
  }

  function handleUncheck() {
    setExpanded(true);
    onToggle();
  }

  return (
    <div
      style={{
        backgroundColor: C.white,
        borderRadius: 16,
        border: `1px solid ${done ? "#34c75930" : C.border}`,
        overflow: "hidden",
        transition: "border-color 0.25s, box-shadow 0.25s",
        boxShadow: done ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
      }}
      data-testid={`step-card-${step.id}`}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "20px 24px", cursor: "pointer",
          backgroundColor: done ? "rgba(52,199,89,0.04)" : C.white,
        }}
        onClick={() => {
          if (!done) setExpanded(e => !e);
        }}
      >
        {/* Number / check */}
        <button
          onClick={e => { e.stopPropagation(); done ? handleUncheck() : handleCheck(); }}
          style={{
            width: 32, height: 32, borderRadius: "50%",
            border: done ? "none" : `1.5px solid ${C.border}`,
            backgroundColor: done ? C.green : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
            transition: "background-color 0.2s, border-color 0.2s",
          }}
          data-testid={`check-${step.id}`}
        >
          {done
            ? <CheckCircle2 size={18} color={C.white} strokeWidth={2.5} />
            : <Circle size={18} color={C.border} strokeWidth={1.5} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
            <span style={{
              fontFamily: SYS, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
              color: done ? C.green : C.blue,
              backgroundColor: done ? "rgba(52,199,89,0.12)" : "rgba(0,113,227,0.10)",
              borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" as const,
            }}>
              Step {step.number}
            </span>
            <span style={{
              fontFamily: SYS, fontSize: 11, fontWeight: 500, color: C.gray, letterSpacing: "-0.05px",
            }}>{step.tag}</span>
          </div>
          <div style={{
            fontFamily: SYS, fontSize: 16, fontWeight: 600, letterSpacing: "-0.3px",
            color: done ? C.gray : C.dark, marginTop: 4,
            textDecoration: done ? "line-through" : "none",
            textDecorationColor: "#d2d2d7",
          }}>
            {step.title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontFamily: SYS, fontSize: 11, color: C.gray, letterSpacing: "-0.05px" }}>Law firm</div>
            <div style={{ fontFamily: SYS, fontSize: 13, fontWeight: 600, color: C.dark, letterSpacing: "-0.1px" }}>{step.lawFirmCost}</div>
          </div>
          {!done && (
            <ChevronDown
              size={16}
              style={{
                color: C.gray,
                transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.2s",
              }}
            />
          )}
        </div>
      </div>

      {/* Expanded body */}
      {!done && expanded && (
        <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${C.grayLt}` }}>
          <p style={{ fontFamily: SYS, fontSize: 14, letterSpacing: "-0.1px", color: C.gray, lineHeight: 1.6, margin: "16px 0 12px" }}>
            {step.description}
          </p>
          <div style={{
            backgroundColor: "rgba(0,113,227,0.05)", borderRadius: 10, padding: "12px 16px",
            marginBottom: 16, borderLeft: `3px solid ${C.blue}`,
          }}>
            <div style={{ fontFamily: SYS, fontSize: 11, fontWeight: 600, color: C.blue, letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 4 }}>
              Why it matters
            </div>
            <p style={{ fontFamily: SYS, fontSize: 13, letterSpacing: "-0.1px", color: C.dark, lineHeight: 1.55, margin: 0 }}>
              {step.whyItMatters}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <div style={{ fontFamily: SYS, fontSize: 11, color: C.gray, letterSpacing: "-0.05px" }}>Law firm cost</div>
                <div style={{ fontFamily: SYS, fontSize: 14, fontWeight: 600, color: C.dark }}>{step.lawFirmCost}</div>
              </div>
              <div>
                <div style={{ fontFamily: SYS, fontSize: 11, color: C.gray, letterSpacing: "-0.05px" }}>LexAI cost</div>
                <div style={{ fontFamily: SYS, fontSize: 14, fontWeight: 700, color: C.green }}>$0</div>
              </div>
            </div>
            <Link
              href={`/documents?type=${encodeURIComponent(step.documentType)}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontFamily: SYS, fontSize: 13, fontWeight: 500, letterSpacing: "-0.1px",
                color: C.white, backgroundColor: C.blue, textDecoration: "none",
                padding: "8px 18px", borderRadius: 980,
                transition: "background-color 0.2s",
                whiteSpace: "nowrap" as const,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blueDk; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blue; }}
              data-testid={`generate-${step.id}`}
            >
              <Sparkles size={13} /> Generate with LexAI
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function RoundSummary({
  totalRaise, setTotalRaise,
  investors, setInvestors,
  doneIds,
}: {
  totalRaise: string; setTotalRaise: (v: string) => void;
  investors: string; setInvestors: (v: string) => void;
  doneIds: Set<string>;
}) {
  const doneCount = doneIds.size;
  const doneSubtotal = steps
    .filter(s => doneIds.has(s.id))
    .reduce((sum, s) => sum + s.lawFirmCostNum, 0);
  const remainingTotal = TOTAL_LAW_FIRM_EST - doneSubtotal;
  const pctDone = Math.round((doneCount / steps.length) * 100);

  return (
    <div style={{ position: "sticky" as const, top: 80 }}>
      <div style={{
        backgroundColor: C.white, borderRadius: 20, padding: "28px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: `1px solid ${C.border}`,
      }}>
        <div style={{ fontFamily: SYS, fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", color: C.dark, marginBottom: 24 }}>
          Round Summary
        </div>

        {/* Editable fields */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ fontFamily: SYS, fontSize: 11, fontWeight: 600, color: C.gray, letterSpacing: "0.04em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>
              Total Raise
            </label>
            <div style={{ position: "relative" as const }}>
              <span style={{ position: "absolute" as const, left: 12, top: "50%", transform: "translateY(-50%)", color: C.gray }}>
                <DollarSign size={14} />
              </span>
              <input
                type="text"
                placeholder="e.g. 500,000"
                value={totalRaise}
                onChange={e => setTotalRaise(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box" as const,
                  fontFamily: SYS, fontSize: 15, fontWeight: 600, color: C.dark,
                  backgroundColor: C.grayLt, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "10px 12px 10px 32px",
                  outline: "none",
                }}
                data-testid="input-total-raise"
              />
            </div>
          </div>
          <div>
            <label style={{ fontFamily: SYS, fontSize: 11, fontWeight: 600, color: C.gray, letterSpacing: "0.04em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>
              Number of Investors
            </label>
            <div style={{ position: "relative" as const }}>
              <span style={{ position: "absolute" as const, left: 12, top: "50%", transform: "translateY(-50%)", color: C.gray }}>
                <Users size={14} />
              </span>
              <input
                type="number"
                min={1}
                placeholder="e.g. 3"
                value={investors}
                onChange={e => setInvestors(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box" as const,
                  fontFamily: SYS, fontSize: 15, fontWeight: 600, color: C.dark,
                  backgroundColor: C.grayLt, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "10px 12px 10px 32px",
                  outline: "none",
                }}
                data-testid="input-investors"
              />
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: SYS, fontSize: 12, color: C.gray, letterSpacing: "-0.05px" }}>Progress</span>
            <span style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, color: C.dark }}>{doneCount}/{steps.length} steps</span>
          </div>
          <div style={{ height: 6, backgroundColor: C.grayLt, borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3, backgroundColor: C.green,
              width: `${pctDone}%`, transition: "width 0.4s ease",
            }} />
          </div>
        </div>

        {/* Cost comparison */}
        <div style={{
          backgroundColor: C.grayLt, borderRadius: 14, padding: "18px",
          marginBottom: 20,
        }}>
          <div style={{ fontFamily: SYS, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: C.gray, marginBottom: 14 }}>
            Cost Comparison
          </div>

          {/* Full round row */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: SYS, fontSize: 13, color: C.gray }}>Full round (law firm)</span>
            <span style={{ fontFamily: SYS, fontSize: 14, fontWeight: 600, color: C.gray, textDecoration: "line-through", textDecorationColor: "#ff3b30" }}>
              ~${TOTAL_LAW_FIRM_EST.toLocaleString()}
            </span>
          </div>

          {/* Completed steps subtotal — only show when steps are done */}
          {doneCount > 0 && (
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: SYS, fontSize: 13, color: C.green, fontWeight: 500 }}>
                {doneCount} step{doneCount !== 1 ? "s" : ""} saved
              </span>
              <span style={{ fontFamily: SYS, fontSize: 14, fontWeight: 600, color: C.green }}>
                ~${doneSubtotal.toLocaleString()}
              </span>
            </div>
          )}

          {/* Remaining */}
          {doneCount > 0 && doneCount < steps.length && (
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: SYS, fontSize: 13, color: C.gray }}>Remaining steps</span>
              <span style={{ fontFamily: SYS, fontSize: 14, fontWeight: 600, color: C.dark }}>
                ~${remainingTotal.toLocaleString()}
              </span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: SYS, fontSize: 13, fontWeight: 600, color: C.dark }}>LexAI total</span>
            <span style={{ fontFamily: SYS, fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px", color: C.green }}>$0</span>
          </div>
        </div>

        {/* Savings callout */}
        <div style={{
          backgroundColor: "rgba(0,113,227,0.06)", borderRadius: 12, padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
        }}>
          <TrendingUp size={16} style={{ color: C.blue, flexShrink: 0 }} />
          <div style={{ fontFamily: SYS, fontSize: 13, color: C.dark, letterSpacing: "-0.1px", lineHeight: 1.4 }}>
            {doneCount === 0
              ? <>You save approximately <strong style={{ color: C.blue }}>${TOTAL_LAW_FIRM_EST.toLocaleString()}</strong> vs. a law firm on this full round.</>
              : <>Already saved <strong style={{ color: C.green }}>${doneSubtotal.toLocaleString()}</strong> on {doneCount} completed step{doneCount !== 1 ? "s" : ""}.</>
            }
          </div>
        </div>

        <Link
          href="/documents"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontFamily: SYS, fontSize: 14, fontWeight: 500, letterSpacing: "-0.1px",
            color: C.white, backgroundColor: C.blue, textDecoration: "none",
            border: "none", borderRadius: 980, padding: "12px 20px", cursor: "pointer",
            transition: "background-color 0.2s", width: "100%", boxSizing: "border-box" as const,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blueDk; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = C.blue; }}
          data-testid="btn-get-all-documents"
        >
          Get all {steps.length} documents <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export function Fundraising() {
  const { ref, visible } = useInView(0.05);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [totalRaise, setTotalRaise] = useState("");
  const [investors, setInvestors] = useState("");

  function toggleDone(id: string) {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div style={{ fontFamily: SYS, overflowX: "hidden", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />

      <main style={{ flex: 1, paddingTop: 100, paddingBottom: 96, backgroundColor: C.grayLt }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* Header */}
          <div ref={ref} style={{
            paddingTop: 32, paddingBottom: 48,
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(0,113,227,0.08)", borderRadius: 980, padding: "5px 14px", marginBottom: 16,
              fontFamily: SYS, fontSize: 12, fontWeight: 500, color: C.blue,
            }}>
              <TrendingUp size={12} /> Complete seed round in 7 steps
            </div>
            <h1 style={{ fontFamily: SYS, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, letterSpacing: "-1px", color: C.dark, margin: "0 0 14px", lineHeight: 1.08 }}>
              Fundraising Suite
            </h1>
            <p style={{ fontFamily: SYS, fontSize: 17, letterSpacing: "-0.2px", color: C.gray, maxWidth: 560, lineHeight: 1.55, margin: 0 }}>
              Every document your seed round requires — in the right order. Check off each step as you complete it, and generate the documents instantly with LexAI.
            </p>
          </div>

          {/* Two-column layout */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 32,
            alignItems: "start",
          }} className="fundraising-grid">
            {/* Steps column */}
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {steps.map(step => (
                <StepCard
                  key={step.id}
                  step={step}
                  done={done.has(step.id)}
                  onToggle={() => toggleDone(step.id)}
                />
              ))}

              {/* Bottom completion CTA */}
              {done.size === steps.length && (
                <div style={{
                  backgroundColor: C.green, borderRadius: 16, padding: "28px",
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" as const,
                  boxShadow: "0 4px 20px rgba(52,199,89,0.25)",
                }}>
                  <CheckCircle2 size={28} color={C.white} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: SYS, fontSize: 17, fontWeight: 700, color: C.white, marginBottom: 4 }}>
                      Round complete!
                    </div>
                    <div style={{ fontFamily: SYS, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                      All 7 steps checked off. Review your documents and prepare for closing.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <RoundSummary
              totalRaise={totalRaise} setTotalRaise={setTotalRaise}
              investors={investors} setInvestors={setInvestors}
              doneIds={done}
            />
          </div>

        </div>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .fundraising-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
