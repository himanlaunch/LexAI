import { useState, useEffect, useRef } from "react";
import {
  Scale,
  FileText,
  ShieldCheck,
  Briefcase,
  Globe,
  Building2,
  X,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Copy,
  Download,
  ArrowRight,
} from "lucide-react";

const C = {
  blue:    "#0071e3",
  blueDk:  "#0077ed",
  dark:    "#1d1d1f",
  gray:    "#6e6e73",
  grayLt:  "#f5f5f7",
  white:   "#ffffff",
  border:  "#d2d2d7",
  green:   "#34c759",
};

const SYS = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Helvetica, Arial, sans-serif`;

type ServiceKey = "Patents" | "Trademarks" | "Contracts" | "Privacy & Compliance" | "Startup Docs" | "Business Formation";

const services: { icon: React.ReactNode; label: ServiceKey; desc: string }[] = [
  { icon: <Scale size={24} />,      label: "Patents",               desc: "Utility, design & provisional applications" },
  { icon: <Globe size={24} />,       label: "Trademarks",            desc: "Registration, monitoring & enforcement" },
  { icon: <FileText size={24} />,    label: "Contracts",             desc: "Drafting, review & negotiation support" },
  { icon: <ShieldCheck size={24} />, label: "Privacy & Compliance",  desc: "GDPR, CCPA & data governance" },
  { icon: <Briefcase size={24} />,   label: "Startup Docs",          desc: "Cap tables, SAFEs & term sheets" },
  { icon: <Building2 size={24} />,   label: "Business Formation",    desc: "LLC, Corp & partnership structures" },
];

type Field = { id: string; label: string; placeholder: string; type?: "text" | "select" | "textarea"; options?: string[] };

const serviceFields: Record<ServiceKey, { title: string; subtitle: string; fields: Field[] }> = {
  "Patents": {
    title: "Patent Application",
    subtitle: "We'll draft a detailed provisional patent application ready for USPTO filing.",
    fields: [
      { id: "title",       label: "Invention Title",        placeholder: "e.g. AI-powered contract analysis system", type: "text" },
      { id: "type",        label: "Application Type",       placeholder: "",  type: "select", options: ["Provisional Patent", "Utility Patent", "Design Patent"] },
      { id: "inventors",   label: "Inventor(s)",            placeholder: "e.g. Jane Smith, John Doe", type: "text" },
      { id: "description", label: "Describe Your Invention", placeholder: "What problem does it solve? How does it work? What makes it novel?", type: "textarea" },
    ],
  },
  "Trademarks": {
    title: "Trademark Application",
    subtitle: "We'll run a clearance search and prepare a complete USPTO trademark application.",
    fields: [
      { id: "mark",   label: "Mark Name",            placeholder: "e.g. LexAI", type: "text" },
      { id: "owner",  label: "Owner / Applicant",    placeholder: "e.g. LexAI Inc.", type: "text" },
      { id: "goods",  label: "Goods & Services",     placeholder: "e.g. AI-powered legal document software, Class 42", type: "text" },
      { id: "use",    label: "Use Status",            placeholder: "",  type: "select", options: ["Already in use in commerce", "Intent to use"] },
    ],
  },
  "Contracts": {
    title: "Contract Drafting",
    subtitle: "We'll draft a complete, jurisdiction-appropriate contract tailored to your terms.",
    fields: [
      { id: "type",     label: "Contract Type",     placeholder: "", type: "select", options: ["NDA / Confidentiality", "Service Agreement", "Employment Agreement", "Vendor Agreement", "Software License", "Partnership Agreement"] },
      { id: "partyA",   label: "Party A",           placeholder: "Your full legal name or company", type: "text" },
      { id: "partyB",   label: "Party B",           placeholder: "Other party's full legal name or company", type: "text" },
      { id: "terms",    label: "Key Terms & Notes", placeholder: "Any specific clauses, payment terms, IP ownership, limitations, jurisdiction...", type: "textarea" },
    ],
  },
  "Privacy & Compliance": {
    title: "Privacy Policy & Compliance",
    subtitle: "We'll generate a GDPR & CCPA-compliant privacy policy and data governance documentation.",
    fields: [
      { id: "company",      label: "Company Name",         placeholder: "e.g. Acme Corp", type: "text" },
      { id: "jurisdiction", label: "Primary Jurisdiction", placeholder: "", type: "select", options: ["United States (CCPA)", "European Union (GDPR)", "United Kingdom (UK GDPR)", "Canada (PIPEDA)", "Global (Multi-jurisdiction)"] },
      { id: "dataTypes",    label: "Data Types Collected", placeholder: "e.g. name, email, payment info, browsing data, location...", type: "text" },
      { id: "notes",        label: "Additional Details",   placeholder: "Do you use cookies, third-party analytics, advertising? Any special categories of data?", type: "textarea" },
    ],
  },
  "Startup Docs": {
    title: "Startup Documentation",
    subtitle: "We'll generate founder-ready documents for your startup's current stage.",
    fields: [
      { id: "docType",  label: "Document Type",   placeholder: "", type: "select", options: ["Founders Agreement", "SAFE Note", "IP Assignment Agreement", "Offer Letter", "Advisor Agreement", "Vesting Schedule"] },
      { id: "company",  label: "Company Name",    placeholder: "e.g. Stackr Inc.", type: "text" },
      { id: "parties",  label: "Parties Involved", placeholder: "e.g. Jane Smith (CEO, 60%), John Doe (CTO, 40%)", type: "text" },
      { id: "notes",    label: "Key Terms",       placeholder: "Vesting cliff, equity splits, special provisions, governing state...", type: "textarea" },
    ],
  },
  "Business Formation": {
    title: "Business Formation",
    subtitle: "We'll prepare your formation documents and operating agreement.",
    fields: [
      { id: "entity",  label: "Entity Type",      placeholder: "", type: "select", options: ["LLC", "C-Corporation", "S-Corporation", "Partnership", "Sole Proprietorship"] },
      { id: "name",    label: "Business Name",    placeholder: "e.g. Horizon Labs LLC", type: "text" },
      { id: "state",   label: "State of Formation", placeholder: "", type: "select", options: ["Delaware", "Wyoming", "California", "New York", "Texas", "Nevada", "Florida", "Other"] },
      { id: "owners",  label: "Owners / Members",  placeholder: "e.g. Jane Smith 70%, John Doe 30%", type: "text" },
    ],
  },
};

const sampleDocs: Record<ServiceKey, string> = {
  "Patents": `PROVISIONAL PATENT APPLICATION

Title: [Invention Title]
Filing Type: Provisional Patent Application
Inventor(s): [Inventor Names]
Filing Date: May 3, 2026

CROSS-REFERENCE TO RELATED APPLICATIONS
This is a non-provisional application claiming priority to no prior applications.

FIELD OF THE INVENTION
The present invention relates generally to the field of [technology domain], and more particularly to methods and systems for [core function of invention].

BACKGROUND
There is a need in the art for improved solutions to [problem statement]. Existing approaches suffer from [key limitations], which the present invention addresses.

SUMMARY OF THE INVENTION
The invention provides a novel [system/method/apparatus] comprising:
• [Core component 1] configured to [function]
• [Core component 2] operative to [function]
• [Core component 3] adapted to [function]

DETAILED DESCRIPTION OF PREFERRED EMBODIMENTS
In one preferred embodiment, the invention operates as follows: [Detailed technical description based on your input...]

CLAIMS
1. A method for [core function], the method comprising: [claim language...]
2. The method of claim 1, wherein [additional limitation]...
3. A system for [core function], the system comprising: [claim language...]

ABSTRACT
[A concise summary of the invention will be inserted here based on the description provided.]

───────────────────────────
PREPARED BY LEXAI • NOT LEGAL ADVICE
This draft is for review purposes. Consult a registered patent attorney before filing.`,

  "Trademarks": `UNITED STATES PATENT AND TRADEMARK OFFICE
TRADEMARK APPLICATION

Mark: [MARK NAME]
Application Type: Use in Commerce / Intent to Use
Owner: [Owner / Applicant]
Filing Date: May 3, 2026

IDENTIFICATION OF GOODS AND SERVICES
International Class: [Class Number]
Description: [Goods & Services description]

DATES OF USE
Date of First Use Anywhere: [Date]
Date of First Use in Commerce: [Date]

SPECIMEN
[Description of specimen showing the mark in use — e.g., screenshot of website, product label]

DECLARATION
The undersigned, being hereby warned that willful false statements and the like so made are punishable by fine or imprisonment, or both, under 18 U.S.C. § 1001, and that such willful false statements may jeopardize the validity of the application or document or any resulting registration, declares that all statements made of his/her own knowledge are true; and all statements made on information and belief are believed to be true.

SIGNATURE: _____________________________
DATE: May 3, 2026

CLEARANCE SEARCH SUMMARY
• Federal register: No confusingly similar marks found in Class [X]
• Common law search: Minimal conflicting uses identified
• Domain availability: Available (.com, .io)
• Recommendation: Proceed with filing

───────────────────────────
PREPARED BY LEXAI • NOT LEGAL ADVICE`,

  "Contracts": `[CONTRACT TYPE]

This Agreement is entered into as of May 3, 2026 ("Effective Date") by and between:

Party A: [Party A Name]
Party B: [Party B Name]

RECITALS
WHEREAS, the parties desire to enter into this Agreement to set forth their respective rights and obligations with respect to [subject matter];

NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, the parties agree as follows:

1. SERVICES / OBLIGATIONS
   Party B shall perform the following services / obligations:
   [Description based on your key terms...]

2. COMPENSATION
   In consideration of the services rendered, Party A shall pay Party B [payment terms] within [timeline] of invoice.

3. INTELLECTUAL PROPERTY
   All work product, inventions, and deliverables created by Party B in connection with this Agreement shall be the exclusive property of Party A.

4. CONFIDENTIALITY
   Each party agrees to maintain in confidence all non-public information received from the other party and to use such information solely in connection with this Agreement.

5. TERM AND TERMINATION
   This Agreement shall commence on the Effective Date and continue for [term], unless earlier terminated. Either party may terminate this Agreement upon [notice period] written notice.

6. LIMITATION OF LIABILITY
   In no event shall either party be liable for indirect, incidental, or consequential damages.

7. GOVERNING LAW
   This Agreement shall be governed by the laws of [Jurisdiction].

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

PARTY A: _________________________ Date: _______
PARTY B: _________________________ Date: _______

───────────────────────────
PREPARED BY LEXAI • NOT LEGAL ADVICE`,

  "Privacy & Compliance": `PRIVACY POLICY

Last Updated: May 3, 2026
Effective Date: May 3, 2026

[Company Name] ("Company," "we," "our," or "us") is committed to protecting your personal information.

1. INFORMATION WE COLLECT
   We collect the following categories of personal information:
   • [Data types listed] — collected when you [use our service / register / etc.]
   • Usage Data: Log files, IP addresses, browser type, pages visited

2. HOW WE USE YOUR INFORMATION
   We use the information we collect to:
   • Provide, operate, and improve our services
   • Communicate with you about your account or our services
   • Comply with legal obligations

3. SHARING YOUR INFORMATION
   We do not sell your personal information. We may share information with:
   • Service providers who assist in operating our platform
   • Legal authorities when required by law

4. YOUR RIGHTS
   Depending on your jurisdiction, you may have the right to:
   • Access the personal data we hold about you
   • Request correction or deletion of your data
   • Opt out of certain data processing activities
   [GDPR / CCPA specific rights based on jurisdiction...]

5. COOKIES & TRACKING
   We use cookies and similar tracking technologies to [purpose].

6. DATA RETENTION
   We retain your personal data for as long as necessary to provide our services and comply with legal obligations.

7. CONTACT US
   For privacy-related inquiries: privacy@[company].com

───────────────────────────
PREPARED BY LEXAI • GDPR & CCPA COMPLIANT TEMPLATE
Not legal advice. Review with counsel before publishing.`,

  "Startup Docs": `[DOCUMENT TYPE]

Effective Date: May 3, 2026

PARTIES
This Agreement is entered into by and between:
[Parties / Founders listed]

Company: [Company Name]

1. ROLES AND RESPONSIBILITIES
   Each party's role, title, and primary responsibilities are set forth as follows:
   [Party roles and responsibilities based on your input...]

2. EQUITY AND VESTING
   Equity shall be allocated as follows:
   [Equity splits and vesting schedule details...]

   Standard 4-year vesting with 1-year cliff:
   • 25% vests after 12 months of continuous service
   • Remaining 75% vests monthly over the following 36 months

3. DECISION MAKING
   Major decisions require [unanimous / majority] approval of the founders. Day-to-day operations may be managed by [designated founder].

4. INTELLECTUAL PROPERTY
   Each founder hereby assigns to the Company all right, title, and interest in any IP created in connection with the Company's business.

5. NON-COMPETE & NON-SOLICITATION
   During the term of this Agreement and for [period] thereafter, each founder agrees not to [compete / solicit] as further described herein.

6. DISPUTE RESOLUTION
   Any disputes shall first be resolved through good-faith negotiation, followed by mediation, and then binding arbitration.

7. GOVERNING LAW
   This Agreement shall be governed by the laws of [State / Jurisdiction].

SIGNATURES:
[Founder 1]: _________________________ Date: _______
[Founder 2]: _________________________ Date: _______

───────────────────────────
PREPARED BY LEXAI • NOT LEGAL ADVICE`,

  "Business Formation": `[ENTITY TYPE] OPERATING AGREEMENT / FORMATION DOCUMENTS

[Company Name]
State of Formation: [State]
Effective Date: May 3, 2026

ARTICLE I — FORMATION
The undersigned hereby form a [Entity Type] under the laws of the State of [State].

Name: [Company Name]
Principal Office: [Address]
Registered Agent: [Registered Agent Name and Address]

ARTICLE II — MEMBERS / SHAREHOLDERS
The following persons are initial members/shareholders with the ownership interests set forth below:

[Owner Name 1] — [Ownership %]
[Owner Name 2] — [Ownership %]

ARTICLE III — MANAGEMENT
The [LLC/Company] shall be [member-managed / manager-managed]. Day-to-day operations shall be directed by the [Manager / Board].

ARTICLE IV — CAPITAL CONTRIBUTIONS
Initial capital contributions:
[Member/Shareholder contributions listed...]

ARTICLE V — ALLOCATIONS AND DISTRIBUTIONS
Profits and losses shall be allocated among the Members in proportion to their respective ownership interests. Distributions shall be made at such times as the Members shall determine.

ARTICLE VI — TRANSFER OF INTERESTS
No Member may transfer their interest in the Company without prior written approval of [unanimous / majority] of the other Members.

ARTICLE VII — DISSOLUTION
The Company shall be dissolved upon: (i) unanimous written consent; (ii) judicial dissolution; or (iii) as required by applicable law.

ARTICLE VIII — GOVERNING LAW
This Agreement shall be governed by the laws of the State of [State].

SIGNATURES:
[Member 1]: _________________________ Date: _______
[Member 2]: _________________________ Date: _______

───────────────────────────
PREPARED BY LEXAI • NOT LEGAL ADVICE
File Articles of Organization / Incorporation with the Secretary of State separately.`,
};

type Step = "select" | "form" | "generating" | "result";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DocumentBuilder({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>("select");
  const [selectedService, setSelectedService] = useState<ServiceKey | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("select");
        setSelectedService(null);
        setFormValues({});
        setProgress(0);
        setCopied(false);
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    if (step !== "generating") return;
    setProgress(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const steps = [12, 28, 45, 63, 78, 91, 100];
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (i < steps.length) {
        setProgress(steps[i]);
        i++;
        const t = setTimeout(tick, 380 + Math.random() * 260);
        timers.push(t);
      } else {
        const t = setTimeout(() => { if (!cancelled) setStep("result"); }, 400);
        timers.push(t);
      }
    };
    const initial = setTimeout(tick, 300);
    timers.push(initial);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [step]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSelect = (svc: ServiceKey) => {
    setSelectedService(svc);
    setFormValues({});
    setStep("form");
  };

  const handleSubmit = () => {
    setStep("generating");
  };

  const handleCopy = () => {
    if (navigator.clipboard && docText) {
      navigator.clipboard.writeText(docText).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const config = selectedService ? serviceFields[selectedService] : null;
  const docText = selectedService ? sampleDocs[selectedService] : "";

  const allFilled = config
    ? config.fields.every((f) => (formValues[f.id] || "").trim().length > 0)
    : false;

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.48)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        @keyframes shimmer {
          0% { background-position: -400px 0 }
          100% { background-position: 400px 0 }
        }
        .doc-textarea { resize: vertical; min-height: 90px; }
        .doc-field:focus { outline: none; border-color: #0071e3 !important; box-shadow: 0 0 0 3px rgba(0,113,227,0.15) !important; }
        .doc-result-pre { white-space: pre-wrap; word-break: break-word; }
      `}</style>

      <div style={{
        background: C.white,
        borderRadius: 20,
        width: "100%",
        maxWidth: step === "result" ? 680 : 720,
        maxHeight: "90vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        animation: "slideUp 0.25s ease",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step !== "select" && (
              <button
                onClick={() => {
                  if (step === "form") setStep("select");
                  if (step === "result") setStep("form");
                }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.gray, padding: 4, borderRadius: 8,
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.dark)}
                onMouseLeave={e => (e.currentTarget.style.color = C.gray)}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <div style={{ fontFamily: SYS, fontWeight: 600, fontSize: 16, letterSpacing: "-0.3px", color: C.dark }}>
                {step === "select" && "Start a Document"}
                {step === "form" && (config?.title ?? "")}
                {step === "generating" && "Generating your document…"}
                {step === "result" && "Document ready"}
              </div>
              <div style={{ fontFamily: SYS, fontSize: 12, color: C.gray, marginTop: 1, letterSpacing: "-0.1px" }}>
                {step === "select" && "Choose a legal service to get started"}
                {step === "form" && config?.subtitle}
                {step === "generating" && "Our AI is drafting your document"}
                {step === "result" && "Review, copy, or download your draft"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(0,0,0,0.07)", border: "none", cursor: "pointer",
              borderRadius: "50%", width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.gray, flexShrink: 0,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.07)"; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{
          display: "flex", gap: 6, padding: "12px 24px 0",
          flexShrink: 0,
        }}>
          {(["select", "form", "generating", "result"] as Step[]).map((s, i) => {
            const current = ["select", "form", "generating", "result"].indexOf(step);
            const idx = i;
            const done = idx < current;
            const active = idx === current;
            return (
              <div key={s} style={{
                height: 3, flex: 1, borderRadius: 3,
                backgroundColor: done ? C.blue : active ? C.blue : C.border,
                opacity: done ? 0.4 : active ? 1 : 0.25,
                transition: "background-color 0.3s, opacity 0.3s",
              }} />
            );
          })}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* STEP 1: Select service */}
          {step === "select" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {services.map((svc, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(svc.label)}
                  style={{
                    background: C.white, border: `1.5px solid ${C.border}`,
                    borderRadius: 16, padding: "20px 18px",
                    cursor: "pointer", textAlign: "left",
                    transition: "border-color 0.2s, box-shadow 0.2s, transform 0.15s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = C.blue;
                    el.style.boxShadow = "0 4px 16px rgba(0,113,227,0.12)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = C.border;
                    el.style.boxShadow = "none";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    backgroundColor: "rgba(0,113,227,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: C.blue, marginBottom: 14,
                  }}>
                    {svc.icon}
                  </div>
                  <div style={{ fontFamily: SYS, fontWeight: 600, fontSize: 15, letterSpacing: "-0.2px", color: C.dark, marginBottom: 4 }}>
                    {svc.label}
                  </div>
                  <div style={{ fontFamily: SYS, fontSize: 12, letterSpacing: "-0.1px", color: C.gray, lineHeight: 1.45 }}>
                    {svc.desc}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14, color: C.blue }}>
                    <span style={{ fontFamily: SYS, fontSize: 12, fontWeight: 500 }}>Start</span>
                    <ArrowRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: Form */}
          {step === "form" && config && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {config.fields.map((field) => (
                <div key={field.id}>
                  <label style={{
                    display: "block",
                    fontFamily: SYS, fontSize: 13, fontWeight: 600, letterSpacing: "-0.1px",
                    color: C.dark, marginBottom: 7,
                  }}>
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      className="doc-field doc-textarea"
                      value={formValues[field.id] ?? ""}
                      onChange={e => setFormValues(v => ({ ...v, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        fontFamily: SYS, fontSize: 14, letterSpacing: "-0.1px", color: C.dark,
                        border: `1.5px solid ${C.border}`, borderRadius: 10,
                        padding: "11px 14px", background: C.grayLt,
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className="doc-field"
                      value={formValues[field.id] ?? ""}
                      onChange={e => setFormValues(v => ({ ...v, [field.id]: e.target.value }))}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        fontFamily: SYS, fontSize: 14, letterSpacing: "-0.1px", color: formValues[field.id] ? C.dark : C.gray,
                        border: `1.5px solid ${C.border}`, borderRadius: 10,
                        padding: "11px 14px", background: C.grayLt, cursor: "pointer",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                        appearance: "none", WebkitAppearance: "none",
                      }}
                    >
                      <option value="" disabled>Select an option…</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      className="doc-field"
                      type="text"
                      value={formValues[field.id] ?? ""}
                      onChange={e => setFormValues(v => ({ ...v, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        fontFamily: SYS, fontSize: 14, letterSpacing: "-0.1px", color: C.dark,
                        border: `1.5px solid ${C.border}`, borderRadius: 10,
                        padding: "11px 14px", background: C.grayLt,
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: Generating */}
          {step === "generating" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 32 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: `conic-gradient(${C.blue} ${progress * 3.6}deg, rgba(0,113,227,0.1) 0deg)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.4s ease",
                position: "relative",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: C.white,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Sparkles size={22} color={C.blue} />
                </div>
              </div>

              <div style={{ width: "100%", maxWidth: 400 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: SYS, fontSize: 13, fontWeight: 600, color: C.dark }}>Drafting document…</span>
                  <span style={{ fontFamily: SYS, fontSize: 13, color: C.gray }}>{progress}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(0,113,227,0.1)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    background: `linear-gradient(90deg, ${C.blue}, #5856d6)`,
                    width: `${progress}%`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 400 }}>
                {[
                  { label: "Analyzing requirements", done: progress > 20 },
                  { label: "Applying jurisdiction-specific provisions", done: progress > 45 },
                  { label: "Drafting clauses and structure", done: progress > 70 },
                  { label: "Running compliance checks", done: progress > 90 },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: item.done ? `${C.green}20` : "rgba(0,0,0,0.05)",
                      transition: "background 0.3s",
                    }}>
                      {item.done
                        ? <CheckCircle2 size={13} color={C.green} />
                        : <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.border }} />
                      }
                    </div>
                    <span style={{
                      fontFamily: SYS, fontSize: 13, letterSpacing: "-0.1px",
                      color: item.done ? C.dark : C.gray,
                      transition: "color 0.3s",
                    }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Result */}
          {step === "result" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(52,199,89,0.08)", border: `1px solid rgba(52,199,89,0.2)`,
                borderRadius: 12, padding: "12px 16px",
              }}>
                <CheckCircle2 size={18} color={C.green} />
                <div>
                  <div style={{ fontFamily: SYS, fontSize: 13, fontWeight: 600, color: C.dark }}>
                    Your {selectedService} document is ready
                  </div>
                  <div style={{ fontFamily: SYS, fontSize: 12, color: C.gray, marginTop: 1 }}>
                    Review this draft carefully. Consult an attorney before executing.
                  </div>
                </div>
              </div>

              <div style={{
                background: C.grayLt, borderRadius: 12,
                border: `1px solid ${C.border}`,
                padding: "20px",
                maxHeight: 320, overflowY: "auto",
              }}>
                <pre className="doc-result-pre" style={{
                  fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace",
                  fontSize: 12, lineHeight: 1.65, color: C.dark, margin: 0,
                }}>
                  {docText}
                </pre>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                <button
                  onClick={handleCopy}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    fontFamily: SYS, fontSize: 14, fontWeight: 500, letterSpacing: "-0.1px",
                    color: copied ? C.green : C.dark,
                    background: "none", border: `1.5px solid ${copied ? C.green : C.border}`,
                    borderRadius: 980, padding: "10px 20px", cursor: "pointer",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                >
                  {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    fontFamily: SYS, fontSize: 14, fontWeight: 500, letterSpacing: "-0.1px",
                    color: C.dark,
                    background: "none", border: `1.5px solid ${C.border}`,
                    borderRadius: 980, padding: "10px 20px", cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.dark; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
                >
                  <Download size={15} /> Download .docx
                </button>
                <button
                  onClick={() => { setStep("select"); setSelectedService(null); setFormValues({}); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    fontFamily: SYS, fontSize: 14, fontWeight: 400, letterSpacing: "-0.1px",
                    color: C.blue,
                    background: "none", border: "none",
                    padding: "10px 4px", cursor: "pointer",
                    marginLeft: "auto",
                  }}
                >
                  Start another document
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {step === "form" && (
          <div style={{
            padding: "16px 24px",
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
            display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center",
          }}>
            <span style={{ fontFamily: SYS, fontSize: 12, color: C.gray }}>
              {Object.values(formValues).filter(v => v.trim()).length} / {config?.fields.length} fields filled
            </span>
            <button
              onClick={handleSubmit}
              disabled={!allFilled}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                fontFamily: SYS, fontSize: 15, fontWeight: 400, letterSpacing: "-0.1px",
                color: C.white,
                backgroundColor: allFilled ? C.blue : C.border,
                border: "none", borderRadius: 980,
                padding: "11px 24px", cursor: allFilled ? "pointer" : "not-allowed",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={e => { if (allFilled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blueDk; }}
              onMouseLeave={e => { if (allFilled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blue; }}
            >
              <Sparkles size={15} />
              Generate Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
