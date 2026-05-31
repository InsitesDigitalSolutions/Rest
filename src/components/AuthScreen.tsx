import { useState } from 'react';
import { User } from '../types';
import { authAdapter } from '../utils/kjv';

interface AuthScreenProps {
  onAuth: (user: User) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<"in" | "up" | "reset">("in"); // in | up | reset
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const bg = "#0A0A0A";
  const surface = "#121212";
  const text = "#FFFFFF";
  const muted = "rgba(255, 255, 255, 0.55)";
  const faint = "rgba(255, 255, 255, 0.3)";
  const gold = "#C5A367";
  const goldGlow = "rgba(197, 163, 103, 0.18)";
  const line = "rgba(255, 255, 255, 0.08)";
  const BRAND = "REST";
  const TAGLINE = "Find Rest in Him";
  const F_thin = "'Helvetica Neue Thin', 'Helvetica Neue-Thin', 'Helvetica Neue-Ultralight', 'Helvetica Neue Ultralight', 'Helvetica Neue', Arial, sans-serif";
  const F = "'Helvetica Neue Light', 'Helvetica Neue-Light', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  const inp = {
    width: "100%",
    padding: "14px 16px",
    background: surface,
    border: `1px solid ${line}`,
    borderRadius: 12,
    color: text,
    fontFamily: F,
    fontSize: 15,
    boxSizing: "border-box" as const,
    marginBottom: 12,
  };

  function submit() {
    setErr("");
    setMsg("");
    try {
      if (mode === "up") {
        if (!name.trim()) throw new Error("Please enter your name.");
        onAuth(authAdapter.signUp(name, email, pass));
      } else if (mode === "in") {
        onAuth(authAdapter.signIn(email, pass));
      } else {
        authAdapter.reset(email);
        setMsg("If an account exists, a reset link has been sent.");
      }
    } catch (e: any) {
      setErr(e.message);
    }
  }

  const lnk = { color: gold, cursor: "pointer", textDecoration: "none" };

  return (
    <div
      id="auth-screen"
      style={{
        minHeight: "100vh",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: F,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        id="auth-background-ellipse"
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "120vw",
          height: "60vh",
          background: `radial-gradient(ellipse, ${goldGlow} 0%, transparent 60%)`,
          pointerEvents: "none"
        }}
      />
      <div id="auth-panel" style={{ maxWidth: 380, width: "100%", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{ fontSize: 44, fontWeight: "100", color: gold, letterSpacing: "0.15em", paddingLeft: "0.15em", fontFamily: F_thin }}>
            {BRAND.toUpperCase()}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, fontWeight: 300, color: muted }}>
            {TAGLINE}
          </div>
        </div>

        {mode === "up" && (
          <input
            id="auth-name-input"
            style={inp}
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        )}
        
        <input
          id="auth-email-input"
          style={inp}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        
        {mode !== "reset" && (
          <input
            id="auth-password-input"
            style={inp}
            type="password"
            placeholder="Password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
          />
        )}

        {err && <div id="auth-error-message" style={{ color: "#E0746A", fontSize: 13, marginBottom: 12 }}>{err}</div>}
        {msg && <div id="auth-success-message" style={{ color: gold, fontSize: 13, marginBottom: 12 }}>{msg}</div>}

        <button
          id="auth-submit-btn"
          onClick={submit}
          style={{
            width: "100%",
            padding: "14px",
            background: gold,
            border: "none",
            borderRadius: 12,
            color: bg,
            fontSize: 16,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: F,
            marginBottom: 12
          }}
        >
          {mode === "up" ? "Create Account" : mode === "in" ? "Sign In" : "Send Reset Link"}
        </button>

        {mode !== "reset" && (
          <button
            id="auth-google-btn"
            onClick={() => onAuth(authAdapter.google())}
            style={{
              width: "100%",
              padding: "13px",
              background: "transparent",
              border: `1px solid ${line}`,
              borderRadius: 12,
              color: text,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: F,
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10
            }}
          >
            <span style={{ fontWeight: 500 }}>G</span> Continue with Google
          </button>
        )}

        <div id="auth-mode-switch" style={{ textAlign: "center", fontSize: 13, color: muted }}>
          {mode === "in" && (
            <>
              New here? <a onClick={() => setMode("up")} style={lnk}>Create account</a> · <a onClick={() => setMode("reset")} style={lnk}>Forgot?</a>
            </>
          )}
          {mode === "up" && (
            <>
              Have an account? <a onClick={() => setMode("in")} style={lnk}>Sign in</a>
            </>
          )}
          {mode === "reset" && (
            <>
              <a onClick={() => setMode("in")} style={lnk}>Back to sign in</a>
            </>
          )}
        </div>
        
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: faint, lineHeight: 1.6 }}>
          Local account on this device. Cloud sync & Google sign-in activate when Firebase is connected.
        </div>
      </div>
    </div>
  );
}
export { authAdapter };
