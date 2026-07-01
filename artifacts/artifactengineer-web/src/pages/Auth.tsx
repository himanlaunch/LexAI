import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { C, SYS } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

export function Auth() {
  const [, navigate] = useLocation();
  const { configured, user, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setSubmitting(true);

    try {
      await signInWithEmail(email);
      setStatus("Check your email for the secure sign-in link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send sign-in link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: SYS, minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: C.grayLt }}>
      <Nav />
      <main style={{ flex: 1, paddingTop: 124, paddingBottom: 80 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: 32, boxShadow: "0 10px 32px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(0,113,227,0.1)", color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <ShieldCheck size={25} />
            </div>
            <h1 style={{ margin: "0 0 10px", color: C.dark, fontSize: 34, lineHeight: 1.1, letterSpacing: "-0.7px" }}>
              Sign in to artifactengineer
            </h1>
            <p style={{ margin: "0 0 26px", color: C.gray, fontSize: 16, lineHeight: 1.55 }}>
              Use Supabase Auth to access your dashboard and save account details.
            </p>

            {!configured ? (
              <div style={{ backgroundColor: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa", borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 1.45 }}>
                Supabase is linked, but the browser keys are not available to this build yet. Add or expose `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, or let Vite read the linked `NEXT_PUBLIC_SUPABASE_*` keys.
              </div>
            ) : user ? (
              <div>
                <div style={{ color: C.dark, fontSize: 16, marginBottom: 18 }}>
                  You are signed in as {user.email}.
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  style={{ backgroundColor: C.blue, color: C.white, border: 0, borderRadius: 980, padding: "12px 22px", fontWeight: 600, cursor: "pointer" }}
                >
                  Open Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.gray, marginBottom: 8 }}>
                  Email address
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 12, padding: "0 14px", marginBottom: 16, backgroundColor: C.white }}>
                  <Mail size={18} color={C.gray} />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    required
                    placeholder="you@company.com"
                    style={{ flex: 1, border: 0, outline: 0, padding: "14px 10px", fontSize: 16, fontFamily: SYS }}
                    data-testid="input-auth-email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: "100%", backgroundColor: submitting ? C.gray : C.blue, color: C.white, border: 0, borderRadius: 980, padding: "13px 22px", fontWeight: 600, cursor: submitting ? "default" : "pointer" }}
                  data-testid="btn-auth-email"
                >
                  {submitting ? "Sending..." : "Send secure sign-in link"}
                </button>
              </form>
            )}

            {status && <p style={{ color: C.green, margin: "16px 0 0", fontSize: 14 }}>{status}</p>}
            {error && <p style={{ color: "#c2410c", margin: "16px 0 0", fontSize: 14 }}>{error}</p>}
            <Link href="/documents" style={{ display: "inline-block", color: C.blue, marginTop: 22, textDecoration: "none", fontSize: 14 }}>
              Continue without signing in
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
