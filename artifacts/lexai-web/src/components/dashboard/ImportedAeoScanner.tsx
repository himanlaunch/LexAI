import { useState, type FormEvent } from "react";
import { Bot, BrainCircuit, CheckCircle2, Globe2, Loader2, SearchCheck } from "lucide-react";
import { C, SYS } from "@/lib/constants";

type ScanResult = {
  url: string;
  host: string;
  title: string;
  description: string;
  scores: {
    overall: number;
    discovery: number;
    agent: number;
    market: number;
  };
  signals: Array<{
    label: string;
    ok: boolean;
    detail: string;
  }>;
};

const readinessLanes = [
  {
    icon: SearchCheck,
    title: "AEO crawl",
    text: "Robots.txt, llms.txt, token budgets, markdown paths",
    color: C.blue,
  },
  {
    icon: Bot,
    title: "Agent usability",
    text: "Capability signals, API hints, conversion paths",
    color: "#5856d6",
  },
  {
    icon: BrainCircuit,
    title: "Market visibility",
    text: "Answer-share, local queries, competitor deltas",
    color: C.green,
  },
];

function scoreColor(score: number) {
  if (score >= 75) return C.green;
  if (score >= 50) return "#ff9500";
  return "#ff3b30";
}

function splitCompetitors(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ImportedAeoScanner() {
  const [url, setUrl] = useState("");
  const [area, setArea] = useState("");
  const [focus, setFocus] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/imported-web/public-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          area,
          focus,
          competitors: splitCompetitors(competitors),
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "The scan could not be completed.");
      }

      setResult(payload.result as ScanResult);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "The scan could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ marginBottom: 44 }} data-testid="section-imported-aeo-scanner">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: SYS, fontSize: 12, fontWeight: 600, color: C.blue, marginBottom: 8, letterSpacing: 0, textTransform: "uppercase" }}>
            Imported from web deployment
          </div>
          <h2 style={{ fontFamily: SYS, fontSize: 24, fontWeight: 700, color: C.dark, margin: "0 0 6px", lineHeight: 1.2, letterSpacing: 0 }}>
            AEO and LLM Visibility Audit
          </h2>
          <p style={{ fontFamily: SYS, fontSize: 15, color: C.gray, lineHeight: 1.5, maxWidth: 640, margin: 0, letterSpacing: 0 }}>
            Run a quick public-site readiness scan for AI assistants, agent crawlers, and market visibility signals.
          </p>
        </div>
        {result ? (
          <div style={{ minWidth: 104, borderRadius: 8, padding: "12px 14px", backgroundColor: C.white, border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontFamily: SYS, color: C.gray, fontSize: 12, marginBottom: 4, letterSpacing: 0 }}>Score</div>
            <strong style={{ fontFamily: SYS, color: scoreColor(result.scores.overall), fontSize: 28, lineHeight: 1, letterSpacing: 0 }}>
              {result.scores.overall}%
            </strong>
          </div>
        ) : null}
      </div>

      <div style={{ backgroundColor: C.white, borderRadius: 8, padding: 24, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(180px, 0.7fr) minmax(180px, 0.7fr)", gap: 12, marginBottom: 12 }}>
            <label style={{ position: "relative", display: "block" }}>
              <Globe2 size={17} style={{ position: "absolute", left: 14, top: 14, color: C.gray }} />
              <input
                aria-label="Website URL"
                required
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                style={{
                  width: "100%",
                  height: 46,
                  boxSizing: "border-box",
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  padding: "0 14px 0 42px",
                  fontFamily: SYS,
                  fontSize: 14,
                  outlineColor: C.blue,
                }}
              />
            </label>
            <input
              aria-label="Geography"
              placeholder="Market or geography"
              value={area}
              onChange={(event) => setArea(event.target.value)}
              style={{
                height: 46,
                boxSizing: "border-box",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                padding: "0 14px",
                fontFamily: SYS,
                fontSize: 14,
                outlineColor: C.blue,
              }}
            />
            <input
              aria-label="Industry or product"
              placeholder="Industry or service"
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              style={{
                height: 46,
                boxSizing: "border-box",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                padding: "0 14px",
                fontFamily: SYS,
                fontSize: 14,
                outlineColor: C.blue,
              }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "start" }}>
            <textarea
              aria-label="Competitor URLs"
              placeholder="Optional competitor URLs, one per line"
              rows={3}
              value={competitors}
              onChange={(event) => setCompetitors(event.target.value)}
              style={{
                width: "100%",
                resize: "vertical",
                boxSizing: "border-box",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                padding: 14,
                fontFamily: SYS,
                fontSize: 14,
                outlineColor: C.blue,
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 46,
                minWidth: 128,
                border: "none",
                borderRadius: 8,
                backgroundColor: loading ? C.gray : C.blue,
                color: C.white,
                fontFamily: SYS,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? <Loader2 className="spin" size={16} /> : <SearchCheck size={16} />}
              {loading ? "Scanning" : "Scan URL"}
            </button>
          </div>
          {error ? (
            <p style={{ fontFamily: SYS, color: "#ff3b30", fontSize: 13, margin: "12px 0 0", letterSpacing: 0 }} role="alert">
              {error}
            </p>
          ) : null}
        </form>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginTop: 20 }}>
          {readinessLanes.map((lane) => {
            const Icon = lane.icon;
            return (
              <article key={lane.title} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, backgroundColor: C.grayLt }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: `${lane.color}18`, color: lane.color, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} />
                  </span>
                  <h3 style={{ fontFamily: SYS, fontSize: 15, fontWeight: 700, color: C.dark, margin: 0, letterSpacing: 0 }}>
                    {lane.title}
                  </h3>
                </div>
                <p style={{ fontFamily: SYS, fontSize: 13, color: C.gray, lineHeight: 1.45, margin: 0, letterSpacing: 0 }}>
                  {lane.text}
                </p>
              </article>
            );
          })}
        </div>

        {result ? (
          <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <div>
                <h3 style={{ fontFamily: SYS, fontSize: 17, fontWeight: 700, color: C.dark, margin: "0 0 4px", letterSpacing: 0 }}>
                  {result.title}
                </h3>
                <p style={{ fontFamily: SYS, fontSize: 13, color: C.gray, margin: 0, letterSpacing: 0 }}>
                  {result.host} - {result.description}
                </p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
              {[
                ["AEO crawl", result.scores.discovery],
                ["Agent utility", result.scores.agent],
                ["Market fit", result.scores.market],
              ].map(([label, value]) => (
                <div key={label} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                  <div style={{ fontFamily: SYS, color: C.gray, fontSize: 12, marginBottom: 6, letterSpacing: 0 }}>{label}</div>
                  <strong style={{ fontFamily: SYS, color: scoreColor(Number(value)), fontSize: 22, letterSpacing: 0 }}>{value}%</strong>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {result.signals.map((signal) => (
                <div key={signal.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                  <CheckCircle2 size={18} style={{ color: signal.ok ? C.green : "#ff9500", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong style={{ fontFamily: SYS, fontSize: 13, color: C.dark, letterSpacing: 0 }}>{signal.label}</strong>
                    <p style={{ fontFamily: SYS, color: C.gray, fontSize: 12, lineHeight: 1.4, margin: "3px 0 0", letterSpacing: 0 }}>{signal.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 760px) {
          [data-testid="section-imported-aeo-scanner"] form > div:first-of-type,
          [data-testid="section-imported-aeo-scanner"] form > div:nth-of-type(2) {
            grid-template-columns: 1fr !important;
          }

          [data-testid="section-imported-aeo-scanner"] button[type="submit"] {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
