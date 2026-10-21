"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100svh", overflow: "hidden", color: "#f8fafc", background: "radial-gradient(ellipse at 82% 8%,rgba(16,185,129,.2),transparent 32%),radial-gradient(ellipse at 5% 85%,rgba(14,165,233,.12),transparent 35%),#071827", fontFamily: "Inter,Arial,sans-serif" }}>
      <header style={{ maxWidth: 1120, margin: "0 auto", padding: "18px clamp(18px,5vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, color: "#fff", textDecoration: "none", fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, letterSpacing: "-1px" }}>
          <span style={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 50, color: "#05251e", background: "linear-gradient(145deg,#6ee7b7,#10b981)", fontSize: 25 }}>↗</span>
          <span>Ride<span style={{ color: "#34d399" }}>Mitra</span></span>
        </Link>
        <span style={{ color: "#9fb4c5", fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>DRIVE · EARN · GROW</span>
      </header>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(34px,7vh,76px) clamp(18px,5vw,48px) 36px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", alignItems: "center", gap: "clamp(28px,6vw,72px)" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(52,211,153,.3)", borderRadius: 999, padding: "9px 14px", background: "rgba(16,185,129,.1)", color: "#6ee7b7", fontSize: 12, fontWeight: 800, letterSpacing: 1.5 }}><span style={{ width: 7, height: 7, borderRadius: 10, background: "#34d399" }} /> DRIVER PARTNER APP</div>
          <h1 style={{ margin: "24px 0 18px", fontSize: "clamp(42px,8vw,76px)", lineHeight: .99, letterSpacing: "-3px", fontWeight: 900 }}>More rides.<br /><span style={{ color: "#34d399" }}>More earnings.</span><br />Together.</h1>
          <p style={{ maxWidth: 470, color: "#b3c4d2", fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.8 }}>Your workday, your rides, your earnings. Sign in to your RideMitra driver account and manage your trips from one simple mobile-friendly dashboard.</p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 12, marginTop: 30, maxWidth: 420 }}>
            <Link href="/driver/login" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 56, padding: "15px 20px", borderRadius: 15, background: "linear-gradient(100deg,#10b981,#34d399)", color: "#05251e", textDecoration: "none", fontWeight: 900, boxShadow: "0 12px 32px rgba(16,185,129,.2)" }}>DRIVER SIGN IN <span style={{ marginLeft: 10 }}>→</span></Link>
            <p style={{ margin: "4px 0 0", color: "#8ca2b4", fontSize: 12 }}>Secure access for RideMitra driver partners</p>
          </div>
        </div>
        <div style={{ position: "relative", maxWidth: 470, width: "100%", justifySelf: "center" }}>
          <div style={{ position: "absolute", inset: "10% 8%", background: "rgba(16,185,129,.17)", filter: "blur(45px)", borderRadius: 40 }} />
          <div style={{ position: "relative", border: "1px solid #294357", borderRadius: 30, padding: 15, background: "linear-gradient(145deg,#102638,#081724)", boxShadow: "0 30px 90px rgba(0,0,0,.35)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 8px 18px" }}><strong style={{ fontSize: 14 }}>Driver dashboard</strong><span style={{ borderRadius: 99, background: "rgba(52,211,153,.13)", color: "#6ee7b7", padding: "7px 10px", fontSize: 11, fontWeight: 800 }}>● CAPTAIN MODE</span></div>
            <div style={{ minHeight: 230, borderRadius: 22, overflow: "hidden", position: "relative", background: "radial-gradient(circle at 55% 48%,rgba(16,185,129,.19),transparent 30%),linear-gradient(135deg,#112c3d,#0a1c2a)" }}>
              <svg viewBox="0 0 360 240" role="img" aria-label="Stylized driver route map" style={{ width: "100%", height: "100%", minHeight: 230, position: "absolute", inset: 0 }}>
                <g stroke="#29485a" strokeWidth="2" fill="none"><path d="M-20 40 L100 90 L140 20 L230 70 L390 20"/><path d="M-20 155 L80 125 L145 185 L240 135 L390 180"/><path d="M55 -20 L90 70 L60 150 L115 260"/><path d="M210 -20 L190 55 L245 105 L210 260"/><path d="M310 -20 L270 60 L315 125 L290 260"/></g>
                <path d="M70 175 C90 155 120 160 140 132 S195 110 210 90 S255 75 285 58" stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeDasharray="7 7" fill="none"/>
                <circle cx="70" cy="175" r="8" fill="#6ee7b7"/><circle cx="285" cy="58" r="9" fill="#fb7185"/><circle cx="285" cy="58" r="17" stroke="#fb7185" strokeOpacity=".35" strokeWidth="2" fill="none"/>
              </svg>
              <div style={{ position: "absolute", left: 16, bottom: 14, color: "#d7e7ef", fontSize: 12 }}>Every trip moves you forward</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, marginTop: 12 }}>
              <div style={{ borderRadius: 17, padding: 16, background: "#142e40", border: "1px solid #28465a" }}><div style={{ color: "#9db2c2", fontSize: 12 }}>Ride tools</div><div style={{ marginTop: 7, fontWeight: 850 }}>Requests & trips</div></div>
              <div style={{ borderRadius: 17, padding: 16, background: "#142e40", border: "1px solid #28465a" }}><div style={{ color: "#9db2c2", fontSize: 12 }}>Your account</div><div style={{ marginTop: 7, fontWeight: 850 }}>Earnings & profile</div></div>
            </div>
          </div>
          <p style={{ textAlign: "center", color: "#8ca2b4", fontSize: 11, marginTop: 14 }}>Designed for phones, tablets and desktop</p>
        </div>
      </section>
      <footer style={{ maxWidth: 1120, margin: "20px auto 0", padding: "22px clamp(18px,5vw,48px) calc(24px + env(safe-area-inset-bottom))", borderTop: "1px solid #1b3446", color: "#8298aa", fontSize: 12, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }}><span>© RideMitra Driver Partner</span><span>DRIVE · EARN · GROW</span></footer>
      <style>{`*{box-sizing:border-box}html,body{margin:0;min-width:320px}a:focus-visible{outline:3px solid #6ee7b7;outline-offset:4px}@media(max-width:480px){header{align-items:flex-start!important}header>span{max-width:120px;text-align:right;line-height:1.6}}`}</style>
    </main>
  );
}
