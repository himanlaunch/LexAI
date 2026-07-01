const SYS = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Helvetica, Arial, sans-serif`;

export function LandingPage() {
  return (
    <div style={{
      fontFamily: SYS,
      minHeight: "100vh",
      background: "#f5f5f7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: "48px 40px",
        maxWidth: 520,
        width: "100%",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(0,0,0,0.06)",
          borderRadius: 980,
          padding: "6px 16px",
          marginBottom: 24,
          fontSize: 12,
          fontWeight: 600,
          color: "#6e6e73",
          letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
        }}>
          Retired · Prototype
        </div>

        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.6px",
          color: "#1d1d1f",
          margin: "0 0 12px",
        }}>
          Landing Page (v0)
        </h1>

        <p style={{
          fontSize: 16,
          color: "#6e6e73",
          lineHeight: 1.55,
          letterSpacing: "-0.1px",
          margin: "0 0 28px",
        }}>
          This was an early prototype landing page used before the four design exploration variants (artifactengineer-v1 through artifactengineer-v4) were created. The Apple Style variant was selected and graduated to the main app.
        </p>

        <div style={{
          background: "#f5f5f7",
          borderRadius: 12,
          padding: "16px 20px",
          fontSize: 13,
          color: "#6e6e73",
          letterSpacing: "-0.1px",
          lineHeight: 1.5,
        }}>
          Superseded by AppleStyle variant · See the live landing page at <strong style={{ color: "#1d1d1f" }}>artifactengineer-web /</strong>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
