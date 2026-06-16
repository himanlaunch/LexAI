import { useRef, useState } from "react";
import { useSearch } from "wouter";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { C, SYS } from "@/lib/constants";
import { Copy, Download, FileText, LoaderCircle, Plus, Search, Sparkles } from "lucide-react";

type DocumentTemplate = {
  title: string;
  category: string;
};

type GeneratedDocument = {
  documentType: string;
  category: string;
  provider: string;
  content: string;
};

type ResearchResult = {
  sourceUrl: string;
  provider: string;
  companyName: string;
  jurisdiction: string;
  summary: string;
  discoveredFacts: string[];
  additionalContext: string;
  error?: string;
  details?: string;
};

type GenerationOverrides = {
  companyName?: string;
  jurisdiction?: string;
  additionalContext?: string;
};

type DownloadFormat = "txt" | "docx" | "pdf";

const sampleDocs: DocumentTemplate[] = [
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

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  fontFamily: SYS,
  fontSize: 14,
  color: C.dark,
  backgroundColor: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "11px 12px",
  outline: "none",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontFamily: SYS, fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 7 }}>
      {children}
    </label>
  );
}

export function Documents() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const prefillType = params.get("type") ?? "";

  const prefillDoc = prefillType
    ? sampleDocs.find(d => d.title.toLowerCase() === prefillType.toLowerCase())
    : null;

  const [selectedDoc, setSelectedDoc] = useState<DocumentTemplate | null>(prefillDoc ?? null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("Delaware, United States");
  const [additionalContext, setAdditionalContext] = useState("");
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [generationError, setGenerationError] = useState("");
  const [researchError, setResearchError] = useState("");
  const [generatingTitle, setGeneratingTitle] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const highlightedRowRef = useRef<HTMLDivElement>(null);

  const isGenerating = generatingTitle.length > 0;
  const isBusy = isGenerating || isResearching;

  function scrollToHighlighted() {
    highlightedRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (prefillDoc) setSelectedDoc(prefillDoc);
  }

  function startDocument(doc = sampleDocs[0]) {
    setSelectedDoc(doc);
    setGeneratedDocument(null);
    setGenerationError("");
    setResearchError("");
  }

  async function generateDocument(doc = selectedDoc, overrides: GenerationOverrides = {}) {
    if (!doc || isGenerating) return;

    const resolvedCompanyName = overrides.companyName ?? companyName;
    const resolvedJurisdiction = overrides.jurisdiction ?? jurisdiction;
    const resolvedAdditionalContext = overrides.additionalContext ?? additionalContext;

    setSelectedDoc(doc);
    setGeneratedDocument(null);
    setGenerationError("");
    setGeneratingTitle(doc.title);

    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: doc.title,
          category: doc.category,
          companyName: resolvedCompanyName || "[Company Name]",
          jurisdiction: resolvedJurisdiction || "Delaware, United States",
          additionalContext: resolvedAdditionalContext,
        }),
      });

      const data = await response.json().catch(() => null) as
        | (GeneratedDocument & { error?: string; details?: string })
        | null;

      if (!response.ok) {
        throw new Error(data?.details || data?.error || `Generation failed with status ${response.status}`);
      }

      if (!data?.content) {
        throw new Error("The generator returned an empty document.");
      }

      setGeneratedDocument({
        documentType: data.documentType,
        category: data.category,
        provider: data.provider,
        content: data.content,
      });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Document generation failed.");
    } finally {
      setGeneratingTitle("");
    }
  }

  async function researchUrlAndGenerate() {
    const targetDoc = selectedDoc ?? sampleDocs[0];
    const normalizedWebsiteUrl = websiteUrl.trim();

    if (!normalizedWebsiteUrl || isBusy) return;

    setSelectedDoc(targetDoc);
    setResearchError("");
    setGenerationError("");
    setGeneratedDocument(null);
    setIsResearching(true);

    try {
      const response = await fetch("/api/documents/research-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedWebsiteUrl,
          documentType: targetDoc.title,
          category: targetDoc.category,
        }),
      });

      const data = await response.json().catch(() => null) as ResearchResult | null;

      if (!response.ok) {
        throw new Error(data?.details || data?.error || `Website research failed with status ${response.status}`);
      }

      if (!data) {
        throw new Error("Website research returned an empty response.");
      }

      const nextCompanyName = data.companyName || companyName;
      const nextJurisdiction = data.jurisdiction || jurisdiction || "Delaware, United States";
      const nextAdditionalContext = [
        data.additionalContext,
        additionalContext ? `User notes:\n${additionalContext}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      setCompanyName(nextCompanyName);
      setJurisdiction(nextJurisdiction);
      setAdditionalContext(nextAdditionalContext);
      setIsResearching(false);

      await generateDocument(targetDoc, {
        companyName: nextCompanyName,
        jurisdiction: nextJurisdiction,
        additionalContext: nextAdditionalContext,
      });
    } catch (error) {
      setResearchError(error instanceof Error ? error.message : "Website research failed.");
      setIsResearching(false);
    }
  }

  async function copyDraft() {
    if (!generatedDocument) return;
    await navigator.clipboard?.writeText(generatedDocument.content);
  }

  async function downloadDraft(format: DownloadFormat) {
    if (!generatedDocument) return;

    const baseName = generatedDocument.documentType.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "document";

    if (format === "txt") {
      const blob = new Blob([generatedDocument.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const response = await fetch("/api/documents/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        format,
        title: generatedDocument.documentType,
        content: generatedDocument.content,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      setGenerationError(data?.error || `Unable to export ${format.toUpperCase()} file.`);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${baseName}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ fontFamily: SYS, overflowX: "hidden", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />

      <main style={{ flex: 1, paddingTop: 120, paddingBottom: 96, backgroundColor: C.grayLt }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px" }}>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: prefillDoc ? 24 : 48 }}>
            <div>
              <h1 style={{ fontFamily: SYS, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-1px", color: C.dark, margin: "0 0 12px", lineHeight: 1.1 }}>
                Your Documents
              </h1>
              <p style={{ fontFamily: SYS, fontSize: 17, letterSpacing: "-0.2px", color: C.gray, maxWidth: 560, lineHeight: 1.55, margin: 0 }}>
                Generate a first draft with Agentlamy, then review missing details before using it.
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
                onClick={() => {
                  scrollToHighlighted();
                  void generateDocument(prefillDoc);
                }}
                disabled={isBusy}
                style={{
                  fontFamily: SYS, fontSize: 13, fontWeight: 500, letterSpacing: "-0.1px",
                  color: C.white, backgroundColor: C.blue,
                  border: "none", borderRadius: 980, padding: "8px 20px", cursor: isBusy ? "default" : "pointer",
                  transition: "background-color 0.2s", whiteSpace: "nowrap" as const, opacity: isBusy ? 0.72 : 1,
                }}
                onMouseEnter={e => { if (!isBusy) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blueDk; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blue; }}
                data-testid="btn-generate-prefill"
              >
                {generatingTitle === prefillDoc.title ? "Generating..." : "Generate Now"}
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
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap" as const, marginBottom: 22 }}>
                <div>
                  <div style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, color: C.blue, letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                    Document workspace
                  </div>
                  <h2 style={{ fontFamily: SYS, fontSize: 24, fontWeight: 700, color: C.dark, letterSpacing: "-0.5px", margin: "0 0 8px" }}>
                    {selectedDoc.title}
                  </h2>
                  <p style={{ fontFamily: SYS, fontSize: 14, color: C.gray, lineHeight: 1.5, letterSpacing: "-0.1px", margin: 0, maxWidth: 600 }}>
                    Add the core facts and generate a structured first draft. Keep placeholders for anything you are not sure about yet.
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
                  {isResearching ? "Researching" : isGenerating ? "Working" : "Ready"}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Research from website URL</FieldLabel>
                <div style={{ display: "flex", gap: 10, alignItems: "stretch", flexWrap: "wrap" as const }}>
                  <input
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") void researchUrlAndGenerate();
                    }}
                    placeholder="Paste a company website URL, then search"
                    style={{ ...inputStyle, flex: "1 1 280px", minWidth: 0 }}
                    data-testid="input-website-url"
                  />
                  <button
                    onClick={() => void researchUrlAndGenerate()}
                    disabled={isBusy || !websiteUrl.trim()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontFamily: SYS,
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.white,
                      backgroundColor: C.dark,
                      border: "none",
                      borderRadius: 10,
                      padding: "0 18px",
                      minHeight: 44,
                      cursor: isBusy || !websiteUrl.trim() ? "default" : "pointer",
                      opacity: isBusy || !websiteUrl.trim() ? 0.55 : 1,
                    }}
                    data-testid="btn-research-url"
                  >
                    {isResearching ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}
                    {isResearching ? "Searching" : "Search"}
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                <div>
                  <FieldLabel>Company name</FieldLabel>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Agentlamy Inc." style={inputStyle} data-testid="input-company-name" />
                </div>
                <div>
                  <FieldLabel>Jurisdiction</FieldLabel>
                  <input value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} placeholder="e.g. Delaware, United States" style={inputStyle} data-testid="input-jurisdiction" />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <FieldLabel>Special terms or context</FieldLabel>
                <textarea
                  value={additionalContext}
                  onChange={e => setAdditionalContext(e.target.value)}
                  placeholder="Add parties, dates, deal terms, privacy requirements, compensation terms, or anything the draft should include."
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" as const, lineHeight: 1.5 }}
                  data-testid="input-additional-context"
                />
              </div>

              {researchError && (
                <div style={{ marginTop: 16, border: "1px solid rgba(255,149,0,0.24)", backgroundColor: "rgba(255,149,0,0.08)", borderRadius: 12, padding: "13px 14px", color: "#995c00", fontFamily: SYS, fontSize: 13, lineHeight: 1.45 }} data-testid="research-error">
                  {researchError}
                </div>
              )}

              {generationError && (
                <div style={{ marginTop: 16, border: "1px solid rgba(255,59,48,0.22)", backgroundColor: "rgba(255,59,48,0.07)", borderRadius: 12, padding: "13px 14px", color: "#b42318", fontFamily: SYS, fontSize: 13, lineHeight: 1.45 }} data-testid="generation-error">
                  {generationError}
                </div>
              )}

              <button
                onClick={() => void generateDocument()}
                disabled={isBusy}
                style={{
                  marginTop: 18,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: SYS,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "-0.1px",
                  color: C.white,
                  backgroundColor: C.blue,
                  border: "none",
                  borderRadius: 980,
                  padding: "11px 18px",
                  cursor: isBusy ? "default" : "pointer",
                  opacity: isBusy ? 0.72 : 1,
                }}
                data-testid="btn-generate-draft"
              >
                {isBusy ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isResearching ? "Researching website" : isGenerating ? `Generating ${generatingTitle}` : "Generate Draft"}
              </button>
            </section>
          )}

          {generatedDocument && (
            <section style={{ marginBottom: 32, backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }} data-testid="generated-document">
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
                <div>
                  <div style={{ fontFamily: SYS, fontSize: 12, color: C.gray, marginBottom: 3 }}>Generated with {generatedDocument.provider}</div>
                  <div style={{ fontFamily: SYS, fontSize: 17, fontWeight: 700, color: C.dark }}>{generatedDocument.documentType}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => void copyDraft()} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: SYS, fontSize: 13, fontWeight: 600, color: C.blue, backgroundColor: "transparent", border: `1px solid ${C.blue}`, borderRadius: 980, padding: "8px 12px", cursor: "pointer" }} data-testid="btn-copy-draft">
                    <Copy size={14} /> Copy
                  </button>
                  <button onClick={() => void downloadDraft("txt")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: SYS, fontSize: 13, fontWeight: 600, color: C.blue, backgroundColor: "transparent", border: `1px solid ${C.blue}`, borderRadius: 980, padding: "8px 12px", cursor: "pointer" }} data-testid="btn-download-txt">
                    <Download size={14} /> TXT
                  </button>
                  <button onClick={() => void downloadDraft("docx")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: SYS, fontSize: 13, fontWeight: 600, color: C.white, backgroundColor: C.blue, border: `1px solid ${C.blue}`, borderRadius: 980, padding: "8px 12px", cursor: "pointer" }} data-testid="btn-download-docx">
                    <Download size={14} /> DOCX
                  </button>
                  <button onClick={() => void downloadDraft("pdf")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: SYS, fontSize: 13, fontWeight: 600, color: C.white, backgroundColor: C.dark, border: `1px solid ${C.dark}`, borderRadius: 980, padding: "8px 12px", cursor: "pointer" }} data-testid="btn-download-pdf">
                    <Download size={14} /> PDF
                  </button>
                </div>
              </div>
              <pre style={{ margin: 0, padding: 22, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 13, lineHeight: 1.6, color: C.dark, backgroundColor: "rgba(0,0,0,0.015)" }}>
                {generatedDocument.content}
              </pre>
            </section>
          )}

          <div style={{ backgroundColor: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(0,0,0,0.01)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: SYS, fontSize: 13, fontWeight: 600, color: C.gray, letterSpacing: "0.02em", textTransform: "uppercase" }}>Templates</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {sampleDocs.map((doc, i) => {
                const isHighlighted = prefillDoc && doc.title === prefillDoc.title;
                const isRowGenerating = generatingTitle === doc.title;
                return (
                  <div key={doc.title} ref={isHighlighted ? highlightedRowRef : undefined} style={{
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

                    <button onClick={() => void generateDocument(doc)} disabled={isBusy} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontFamily: SYS, fontSize: 13, fontWeight: 500, letterSpacing: "-0.1px",
                      color: isHighlighted ? C.white : C.blue,
                      backgroundColor: isHighlighted ? C.blue : "transparent",
                      border: `1.5px solid ${C.blue}`, borderRadius: 980, padding: "6px 16px", cursor: isBusy ? "default" : "pointer",
                      transition: "opacity 0.2s", whiteSpace: "nowrap", opacity: isBusy && !isRowGenerating ? 0.45 : 1,
                    }}
                      onMouseEnter={e => { if (!isBusy) (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = isBusy && !isRowGenerating ? "0.45" : "1"; }}
                      data-testid={`btn-generate-${i}`}
                    >
                      {isRowGenerating && <LoaderCircle size={13} className="animate-spin" />}
                      {isRowGenerating ? "Generating" : "Generate"}
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
