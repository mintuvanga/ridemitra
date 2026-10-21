"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100svh", overflow: "hidden", color: "#f8fafc", background: "radial-gradient(ellipse at 85% 8%, rgba(16,185,129,.22), transparent 32%), radial-gradient(ellipse at 0% 70%, rgba(14,165,233,.13), transparent 34%), #071827", fontFamily: "Inter, Arial, sans-serif" }}>
      <header style={{ maxWidth: 1120, margin: "0 auto", padding: "18px clamp(18px,5vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, color: "#fff", textDecoration: "none", fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, letterSpacing: "-1px" }}>
          <span style={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 50, color: "#05251e", background: "linear-gradient(145deg,#6ee7b7,#10b981)", fontSize: 25 }}>↗</span>
          <span>Ride<span style={{ color: "#34d399" }}>Mitra</span></span>
        </Link>
        <span style={{ color: "#9fb4c5", fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>DRIVE · EARN · GROW</span>
      </header>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(36px,8vh,82px) clamp(18px,5vw,48px) 34px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", alignItems: "center", gap: "clamp(28px,6vw,72px)" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(52,211,153,.3)", borderRadius: 999, padding: "9px 14px", background: "rgba(16,185,129,.1)", color: "#6ee7b7", fontSize: 12, fontWeight: 800, letterSpacing: 1.5 }}><span style={{ width: 7, height: 7, borderRadius: 10, background: "#34d399" }} /> YOUR JOURNEY STARTS HERE</div>
          <h1 style={{ margin: "24px 0 18px", fontSize: "clamp(42px,8vw,76px)", lineHeight: .99, letterSpacing: "-3px", fontWeight: 900 }}>More rides.<br /><span style={{ color: "#34d399" }}>More earnings.</span><br />Together.</h1>
          <p style={{ maxWidth: 470, color: "#b3c4d2", fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.8 }}>Your RideMitra partner space. Sign in to manage your driver account or continue to your rider account from any device.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,190px),1fr))", gap: 12, marginTop: 30, maxWidth: 490 }}>
            <Link href="/driver/login" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 54, padding: "14px 18px", borderRadius: 15, background: "linear-gradient(100deg,#10b981,#34d399)", color: "#05251e", textDecoration: "none", fontWeight: 900, boxShadow: "0 12px 32px rgba(16,185,129,.2)" }}>Driver sign in <span style={{ marginLeft: 9 }}>→</span></Link>
            <Link href="/rider/login" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 54, padding: "14px 18px", borderRadius: 15, border: "1px solid #345065", background: "#102638", color: "#f8fafc", textDecoration: "none", fontWeight: 800 }}>Rider sign in <span style={{ marginLeft: 9 }}>→</span></Link>
          </div>
          <p style={{ marginTop: 19, color: "#8ca2b4", fontSize: 13 }}>New to RideMitra? <Link href="/signup" style={{ color: "#6ee7b7", fontWeight: 800 }}>Create an account</Link></p>
        </div>
        <div style={{ position: "relative", maxWidth: 470, width: "100%", justifySelf: "center" }}>
          <div style={{ position: "absolute", inset: "10% 8%", background: "rgba(16,185,129,.17)", filter: "blur(45px)", borderRadius: 40 }} />
          <div style={{ position: "relative", border: "1px solid #294357", borderRadius: 30, padding: 15, background: "linear-gradient(145deg,#102638,#081724)", boxShadow: "0 30px 90px rgba(0,0,0,.35)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 8px 18px" }}><strong style={{ fontSize: 14 }}>Partner dashboard</strong><span style={{ borderRadius: 99, background: "rgba(52,211,153,.13)", color: "#6ee7b7", padding: "7px 10px", fontSize: 11, fontWeight: 800 }}>● READY TO GO</span></div>
            <div style={{ minHeight: 210, borderRadius: 22, overflow: "hidden", position: "relative", background: "radial-gradient(circle at 55% 48%,rgba(16,185,129,.19),transparent 30%), linear-gradient(135deg,#112c3d,#0a1c2a)" }}>
              <svg viewBox="0 0 360 220" role="img" aria-label="Stylized route map illustration" style={{ width: "100%", height: "100%", minHeight: 210, position: "absolute", inset: 0 }}>
                <g stroke="#29485a" strokeWidth="2" fill="none"><path d="M-20 40 L100 90 L140 20 L230 70 L390 20"/><path d="M-20 155 L80 125 L145 185 L240 135 L390 180"/><path d="M55 -20 L90 70 L60 150 L115 240"/><path d="M210 -20 L190 55 L245 105 L210 240"/><path d="M310 -20 L270 60 L315 125 L290 240"/></g>
                <path d="M70 155 C90 135 120 140 140 112 S195 90 210 70 S255 55 285 38" stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeDasharray="7 7" fill="none"/>
                <circle cx="70" cy="155" r="8" fill="#6ee7b7"/><circle cx="285" cy="38" r="9" fill="#fb7185"/><circle cx="285" cy="38" r="17" stroke="#fb7185" strokeOpacity=".35" strokeWidth="2" fill="none"/>
              </svg>
              <div style={{ position: "absolute", left: 16, bottom: 14, color: "#d7e7ef", fontSize: 12 }}>Your next trip begins with RideMitra</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, marginTop: 12 }}>
              <div style={{ borderRadius: 17, padding: 16, background: "#142e40", border: "1px solid #28465a" }}><div style={{ color: "#9db2c2", fontSize: 12 }}>Driver tools</div><div style={{ marginTop: 7, fontWeight: 850 }}>Rides & requests</div></div>
              <div style={{ borderRadius: 17, padding: 16, background: "#142e40", border: "1px solid #28465a" }}><div style={{ color: "#9db2c2", fontSize: 12 }}>Account</div><div style={{ marginTop: 7, fontWeight: 850 }}>Earnings & profile</div></div>
            </div>
          </div>
          <p style={{ textAlign: "center", color: "#8ca2b4", fontSize: 11, marginTop: 14 }}>A mobile-friendly preview of the RideMitra partner experience</p>
        </div>
      </section>
      <footer style={{ maxWidth: 1120, margin: "20px auto 0", padding: "22px clamp(18px,5vw,48px) calc(24px + env(safe-area-inset-bottom))", borderTop: "1px solid #1b3446", color: "#8298aa", fontSize: 12, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }}><span>© RideMitra</span><span>Built for phones, tablets and desktop</span></footer>
      <style>{`*{box-sizing:border-box} html,body{margin:0;min-width:320px} a:focus-visible{outline:3px solid #6ee7b7;outline-offset:4px} @media(max-width:480px){header{align-items:flex-start!important} header>span{max-width:110px;text-align:right;line-height:1.6} }`}</style>
    </main>
  );
}
