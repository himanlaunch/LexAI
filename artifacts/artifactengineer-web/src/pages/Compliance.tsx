import { useState } from "react";
import { Link } from "wouter";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { C, SYS } from "@/lib/constants";
import { useInView } from "@/hooks/use-in-view";
import { Calendar, ChevronRight, AlertCircle, RefreshCw, FileText } from "lucide-react";

type Frequency = "Monthly" | "Quarterly" | "Annual" | "One-time";

interface ComplianceItem {
  id: string;
  name: string;
  description: string;
  frequency: Frequency;
  typicalDueDate: string;
  jurisdictions: string[];
  lawFirmCost: string;
  category: string;
  urgency: "high" | "medium" | "low";
  documentType: string;
}

const ALL_STATES = "All states";

const complianceItems: ComplianceItem[] = [
  // Annual — all states
  {
    id: "board-resolutions",
    name: "Annual Board Resolutions",
    description: "Documenting board-approved decisions on officer appointments, compensation, and key corporate actions. Required to maintain good standing and pierce the corporate veil protection.",
    frequency: "Annual",
    typicalDueDate: "Dec 31 (fiscal year end)",
    jurisdictions: [ALL_STATES],
    lawFirmCost: "$800–$2,000",
    category: "Corporate Governance",
    urgency: "high",
    documentType: "Board Resolutions",
  },
  {
    id: "registered-agent",
    name: "Registered Agent Renewal",
    description: "Annual renewal of your registered agent service to maintain a legal point of contact in your state of incorporation for receiving official correspondence and legal notices.",
    frequency: "Annual",
    typicalDueDate: "Incorporation anniversary",
    jurisdictions: [ALL_STATES],
    lawFirmCost: "$200–$500",
    category: "State Compliance",
    urgency: "high",
    documentType: "Registered Agent Authorization",
  },
  {
    id: "delaware-franchise-tax",
    name: "Delaware Franchise Tax Report",
    description: "All Delaware corporations must file an annual franchise tax report and pay the associated tax. Calculated using the Authorized Shares Method or Assumed Par Value Method.",
    frequency: "Annual",
    typicalDueDate: "Mar 1",
    jurisdictions: ["DE"],
    lawFirmCost: "$500–$1,500",
    category: "State Compliance",
    urgency: "high",
    documentType: "Delaware Franchise Tax Filing",
  },
  {
    id: "ca-statement-of-info",
    name: "Statement of Information (CA)",
    description: "California requires corporations and LLCs to file a Statement of Information annually (or biennially for LLCs). Covers principal business address, officers, and registered agent.",
    frequency: "Annual",
    typicalDueDate: "Within 90 days of incorporation, then annually",
    jurisdictions: ["CA"],
    lawFirmCost: "$150–$400",
    category: "State Compliance",
    urgency: "medium",
    documentType: "CA Statement of Information",
  },
  {
    id: "federal-tax-return",
    name: "Federal Corporate Tax Return",
    description: "Annual federal income tax return for your entity. C-Corps file Form 1120, S-Corps file Form 1120-S. Extensions available to Oct 15.",
    frequency: "Annual",
    typicalDueDate: "Apr 15 (or Oct 15 with extension)",
    jurisdictions: [ALL_STATES],
    lawFirmCost: "$2,000–$8,000",
    category: "Tax",
    urgency: "high",
    documentType: "Corporate Tax Preparation Checklist",
  },
  {
    id: "foreign-qualification",
    name: "Foreign Qualification Renewal",
    description: "If your company operates in states other than your state of incorporation, you must maintain foreign qualification registrations in each state where you have a business presence.",
    frequency: "Annual",
    typicalDueDate: "Varies by state",
    jurisdictions: ["CA", "NY", "TX", "WA", "FL"],
    lawFirmCost: "$300–$800 per state",
    category: "State Compliance",
    urgency: "medium",
    documentType: "Foreign Qualification Application",
  },
  {
    id: "ny-biennial",
    name: "New York Biennial Statement",
    description: "New York requires all corporations and LLCs to file a Biennial Statement every two years with the Department of State to keep registration current.",
    frequency: "Annual",
    typicalDueDate: "By anniversary month (biennial)",
    jurisdictions: ["NY"],
    lawFirmCost: "$200–$500",
    category: "State Compliance",
    urgency: "medium",
    documentType: "NY Biennial Statement",
  },
  {
    id: "annual-report",
    name: "Annual Report Filing",
    description: "Most states require corporations and LLCs to file an annual report updating business address, officer information, and confirming the entity is still active.",
    frequency: "Annual",
    typicalDueDate: "Varies by state (typically Jan–Apr)",
    jurisdictions: [ALL_STATES],
    lawFirmCost: "$150–$600",
    category: "State Compliance",
    urgency: "medium",
    documentType: "Annual Report",
  },
  {
    id: "1099-nec",
    name: "1099-NEC Filing (Contractors)",
    description: "File Form 1099-NEC for any contractor or vendor paid $600 or more during the calendar year. Copy B must be sent to contractors by Jan 31.",
    frequency: "Annual",
    typicalDueDate: "Jan 31",
    jurisdictions: [ALL_STATES],
    lawFirmCost: "$50–$200 per form",
    category: "Tax",
    urgency: "high",
    documentType: "1099-NEC Preparation Checklist",
  },
  // Quarterly
  {
    id: "estimated-taxes",
    name: "Quarterly Estimated Tax Payments",
    description: "Federal and state estimated income tax payments to avoid underpayment penalties. Applies to pass-through entities, S-Corps, and founders drawing salary.",
    frequency: "Quarterly",
    typicalDueDate: "Apr 15 · Jun 15 · Sep 15 · Jan 15",
    jurisdictions: [ALL_STATES],
    lawFirmCost: "$200–$600/quarter",
    category: "Tax",
    urgency: "high",
    documentType: "Estimated Tax Payment Guide",
  },
  {
    id: "payroll-tax",
    name: "Payroll Tax Deposits",
    description: "If you have employees, federal payroll taxes (FICA, federal income tax withholding) must be deposited either monthly or semi-weekly depending on your payroll size.",
    frequency: "Monthly",
    typicalDueDate: "15th of following month (monthly depositors)",
    jurisdictions: [ALL_STATES],
    lawFirmCost: "$300–$800/quarter",
    category: "Tax",
    urgency: "high",
    documentType: "Payroll Compliance Checklist",
  },
  {
    id: "sales-tax",
    name: "Sales Tax Return",
    description: "If you sell taxable goods or services, you must collect and remit sales tax to states where you have nexus. Frequency depends on sales volume — monthly or quarterly.",
    frequency: "Quarterly",
    typicalDueDate: "Last day of month following quarter",
    jurisdictions: ["CA", "NY", "TX", "WA", "FL", "IL"],
    lawFirmCost: "$200–$500/quarter",
    category: "Tax",
    urgency: "medium",
    documentType: "Sales Tax Nexus Analysis",
  },
  // One-time / ongoing
  {
    id: "w9-collection",
    name: "W-9 Collection from Vendors",
    description: "Collect Form W-9 from any vendor or contractor before making first payment. Required to issue 1099s at year-end and protects you from backup withholding liability.",
    frequency: "One-time",
    typicalDueDate: "Before first payment",
    jurisdictions: [ALL_STATES],
    lawFirmCost: "$50–$150 per vendor",
    category: "Tax",
    urgency: "low",
    documentType: "W-9 Request Template",
  },
  {
    id: "equity-grants",
    name: "83(b) Election Filing",
    description: "Founders receiving restricted stock subject to vesting must file an 83(b) election within 30 days of grant to elect to be taxed at grant-date value (usually near zero).",
    frequency: "One-time",
    typicalDueDate: "Within 30 days of stock grant",
    jurisdictions: [ALL_STATES],
    lawFirmCost: "$500–$1,500",
    category: "Corporate Governance",
    urgency: "high",
    documentType: "83(b) Election Letter",
  },
  {
    id: "boi-report",
    name: "Beneficial Ownership Report (BOI)",
    description: "Under the Corporate Transparency Act, most small businesses must file a Beneficial Ownership Information report with FinCEN. New companies must file within 90 days of formation.",
    frequency: "One-time",
    typicalDueDate: "Within 90 days of formation",
    jurisdictions: [ALL_STATES],
    lawFirmCost: "$300–$800",
    category: "Federal Compliance",
    urgency: "high",
    documentType: "BOI Report",
  },
];

const FREQUENCIES: Frequency[] = ["Annual", "Quarterly", "Monthly", "One-time"];
const FREQ_COLORS: Record<Frequency, string> = {
  "Annual":    "#0071e3",
  "Quarterly": "#5856d6",
  "Monthly":   "#34c759",
  "One-time":  "#ff9500",
};

const URGENCY_COLORS: Record<string, string> = {
  high:   "#ff3b30",
  medium: "#ff9500",
  low:    "#34c759",
};

const US_STATES: Record<string, string> = {
  "All states": "All states",
  DE: "Delaware",
  CA: "California",
  NY: "New York",
  TX: "Texas",
  WA: "Washington",
  FL: "Florida",
  IL: "Illinois",
};

function FrequencyBadge({ freq }: { freq: Frequency }) {
  const color = FREQ_COLORS[freq];
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      color, backgroundColor: `${color}18`, borderRadius: 6, padding: "2px 8px",
      whiteSpace: "nowrap" as const, fontFamily: SYS,
    }}>{freq}</span>
  );
}

function UrgencyDot({ urgency }: { urgency: string }) {
  return (
    <span style={{
      width: 7, height: 7, borderRadius: "50%",
      backgroundColor: URGENCY_COLORS[urgency] || C.gray,
      display: "inline-block", flexShrink: 0,
    }} title={`Priority: ${urgency}`} />
  );
}

function ComplianceCard({ item }: { item: ComplianceItem }) {
  return (
    <div
      style={{
        backgroundColor: C.white, borderRadius: 16, padding: "22px 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform 0.18s, box-shadow 0.18s",
        cursor: "default",
        display: "flex", flexDirection: "column" as const, gap: 12,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
          <UrgencyDot urgency={item.urgency} />
          <FrequencyBadge freq={item.frequency} />
          <span style={{ fontFamily: SYS, fontSize: 11, fontWeight: 500, color: C.gray, letterSpacing: "-0.05px" }}>
            {item.category}
          </span>
        </div>
        <span style={{
          fontFamily: SYS, fontSize: 11, fontWeight: 500, color: C.gray, letterSpacing: "-0.05px",
          whiteSpace: "nowrap" as const, flexShrink: 0,
        }}>
          {item.jurisdictions.includes(ALL_STATES)
            ? "All states"
            : item.jurisdictions.join(", ")}
        </span>
      </div>

      <div>
        <div style={{ fontFamily: SYS, fontWeight: 600, fontSize: 16, letterSpacing: "-0.3px", color: C.dark, marginBottom: 6 }}>
          {item.name}
        </div>
        <div style={{ fontFamily: SYS, fontSize: 13, letterSpacing: "-0.1px", color: C.gray, lineHeight: 1.55 }}>
          {item.description}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4, borderTop: `1px solid ${C.grayLt}`, flexWrap: "wrap" as const }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          <Calendar size={13} style={{ color: C.gray, flexShrink: 0 }} />
          <span style={{ fontFamily: SYS, fontSize: 12, color: C.gray, letterSpacing: "-0.05px" }}>{item.typicalDueDate}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: SYS, fontSize: 12, color: C.gray, letterSpacing: "-0.05px" }}>
            Law firm: <span style={{ color: C.dark, fontWeight: 500 }}>{item.lawFirmCost}</span>
          </span>
          <span style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, color: "#34c759" }}>artifactengineer: $0</span>
        </div>
      </div>

      <Link
        href={`/documents?type=${encodeURIComponent(item.documentType)}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontFamily: SYS, fontSize: 13, fontWeight: 500, letterSpacing: "-0.1px",
          color: C.blue, textDecoration: "none",
          padding: "8px 16px", borderRadius: 980,
          backgroundColor: "rgba(0,113,227,0.08)",
          transition: "background-color 0.2s",
          alignSelf: "flex-start" as const,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(0,113,227,0.14)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(0,113,227,0.08)"; }}
      >
        Generate Document <ChevronRight size={13} />
      </Link>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <h2 style={{ fontFamily: SYS, fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px", color: C.dark, margin: 0 }}>
        {title}
      </h2>
      <span style={{
        fontFamily: SYS, fontSize: 12, fontWeight: 600, color: C.gray,
        backgroundColor: C.grayLt, borderRadius: 980, padding: "3px 10px",
      }}>{count}</span>
    </div>
  );
}

function QuickStatsBar({ items }: { items: ComplianceItem[] }) {
  const high = items.filter(i => i.urgency === "high").length;
  const annual = items.filter(i => i.frequency === "Annual").length;
  const cats = new Set(items.map(i => i.category)).size;

  return (
    <div style={{
      backgroundColor: C.white, borderRadius: 16, padding: "20px 28px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20,
      marginBottom: 48, border: `1px solid ${C.border}`,
    }}>
      {[
        { label: "Total Obligations", value: String(items.length), icon: <FileText size={16} /> },
        { label: "High Priority", value: String(high), icon: <AlertCircle size={16} />, valueColor: "#ff3b30" },
        { label: "Annual Filings", value: String(annual), icon: <RefreshCw size={16} /> },
        { label: "Categories", value: String(cats), icon: <Calendar size={16} /> },
      ].map((stat, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.grayLt, display: "flex", alignItems: "center", justifyContent: "center", color: C.gray, flexShrink: 0 }}>
            {stat.icon}
          </div>
          <div>
            <div style={{ fontFamily: SYS, fontSize: 24, fontWeight: 700, letterSpacing: "-0.8px", color: stat.valueColor ?? C.dark, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontFamily: SYS, fontSize: 12, color: C.gray, letterSpacing: "-0.05px", marginTop: 2 }}>
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompliancePage() {
  const { ref, visible } = useInView(0.05);
  const [incorpState, setIncorpState] = useState<string>(ALL_STATES);
  const [homeState, setHomeState] = useState<string>(ALL_STATES);
  const [selectedFreq, setSelectedFreq] = useState<string>("All");

  const filtered = complianceItems.filter(item => {
    const stateMatch =
      item.jurisdictions.includes(ALL_STATES) ||
      (incorpState !== ALL_STATES && item.jurisdictions.includes(incorpState)) ||
      (homeState !== ALL_STATES && item.jurisdictions.includes(homeState)) ||
      (incorpState === ALL_STATES && homeState === ALL_STATES);
    const freqMatch = selectedFreq === "All" || item.frequency === selectedFreq;
    return stateMatch && freqMatch;
  });

  const grouped = FREQUENCIES.reduce<Record<string, ComplianceItem[]>>((acc, freq) => {
    const items = filtered.filter(i => i.frequency === freq);
    if (items.length) acc[freq] = items;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: SYS, overflowX: "hidden", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />

      <main style={{ flex: 1, paddingTop: 100, paddingBottom: 96, backgroundColor: C.grayLt }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px" }}>

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
              <Calendar size={12} /> Stay legally compliant, automatically
            </div>
            <h1 style={{ fontFamily: SYS, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, letterSpacing: "-1px", color: C.dark, margin: "0 0 14px", lineHeight: 1.08 }}>
              Compliance Calendar
            </h1>
            <p style={{ fontFamily: SYS, fontSize: 17, letterSpacing: "-0.2px", color: C.gray, maxWidth: 560, lineHeight: 1.55, margin: 0 }}>
              Every recurring legal deadline your startup faces — organized by frequency, filtered for your state, with one-click document generation.
            </p>
          </div>

          <QuickStatsBar items={filtered} />

          {/* Filters */}
          <div style={{ display: "flex", gap: 16, marginBottom: 36, flexWrap: "wrap" as const, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: SYS, fontSize: 13, color: C.gray, letterSpacing: "-0.1px", whiteSpace: "nowrap" as const }}>Incorporated in:</span>
              <select
                value={incorpState}
                onChange={e => setIncorpState(e.target.value)}
                style={{
                  fontFamily: SYS, fontSize: 13, color: C.dark,
                  backgroundColor: C.white, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                  outline: "none", appearance: "auto" as const,
                }}
                data-testid="select-incorp-state"
              >
                {Object.entries(US_STATES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: SYS, fontSize: 13, color: C.gray, letterSpacing: "-0.1px", whiteSpace: "nowrap" as const }}>Operating in:</span>
              <select
                value={homeState}
                onChange={e => setHomeState(e.target.value)}
                style={{
                  fontFamily: SYS, fontSize: 13, color: C.dark,
                  backgroundColor: C.white, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                  outline: "none", appearance: "auto" as const,
                }}
                data-testid="select-home-state"
              >
                {Object.entries(US_STATES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              {["All", ...FREQUENCIES].map(freq => (
                <button
                  key={freq}
                  onClick={() => setSelectedFreq(freq)}
                  style={{
                    fontFamily: SYS, fontSize: 13, fontWeight: selectedFreq === freq ? 600 : 400,
                    color: selectedFreq === freq ? C.white : C.dark,
                    backgroundColor: selectedFreq === freq
                      ? (freq === "All" ? C.dark : FREQ_COLORS[freq as Frequency])
                      : "rgba(0,0,0,0.06)",
                    border: "none", borderRadius: 980, padding: "6px 16px", cursor: "pointer",
                    transition: "background-color 0.2s, color 0.2s",
                  }}
                  data-testid={`filter-${freq.toLowerCase()}`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped sections */}
          {Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px", color: C.gray, fontFamily: SYS, fontSize: 16 }}>
              No compliance items match your filters.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 48 }}>
              {Object.entries(grouped).map(([freq, items]) => (
                <div key={freq}>
                  <SectionHeader title={freq} count={items.length} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: 16 }}>
                    {items.map(item => <ComplianceCard key={item.id} item={item} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div style={{
            marginTop: 64, backgroundColor: C.dark, borderRadius: 20, padding: "40px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap" as const, gap: 24,
          }}>
            <div>
              <div style={{ fontFamily: SYS, fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, letterSpacing: "-0.6px", color: C.white, marginBottom: 8 }}>
                Never miss a filing deadline again.
              </div>
              <div style={{ fontFamily: SYS, fontSize: 15, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.1px", maxWidth: 400 }}>
                Generate any compliance document in minutes. No hourly billing, no retainer.
              </div>
            </div>
            <Link
              href="/documents"
              style={{
                fontFamily: SYS, fontSize: 15, fontWeight: 500, letterSpacing: "-0.1px",
                color: C.dark, backgroundColor: C.white,
                border: "none", borderRadius: 980, padding: "13px 28px",
                textDecoration: "none", whiteSpace: "nowrap" as const,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
            >
              Start Generating Documents
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export { CompliancePage as Compliance };
