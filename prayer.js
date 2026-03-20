/* ═══════════════════════════════════════
   Al-Fajri — style.css
   Lembaga Falakiyah PCNU Kencong
═══════════════════════════════════════ */
:root {
  --bg:     #06090f;
  --bg1:    #0b0f1a;
  --bg2:    #0f1524;
  --card:   rgba(11,15,26,.93);
  --border: rgba(180,145,70,.14);
  --bord2:  rgba(180,145,70,.30);
  --gold:   #c8a44a;
  --gold2:  #e6c46a;
  --gdim:   rgba(200,164,74,.10);
  --text:   #ddd8cc;
  --text2:  #9a9082;
  --text3:  #5a5448;
  --green:  #52b882;
  --red:    #d85c5c;
  --amber:  #e8a030;
  --mono:   'JetBrains Mono', monospace;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }

/* ── Stars ── */
.star-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.star { position: absolute; border-radius: 50%; background: #fff; animation: tw var(--d,3s) ease-in-out infinite; }
@keyframes tw { 0%,100%{opacity:var(--a,.3)} 50%{opacity:.03} }

/* ── Layout ── */
.wrap { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 0 16px 64px; }

/* ── Header ── */
header { text-align: center; padding: 46px 0 30px; }
.logo-ring { width: 80px; height: 80px; border-radius: 50%; border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; position: relative; animation: sp 80s linear infinite; }
.logo-ring::before { content: ''; position: absolute; inset: 9px; border-radius: 50%; border: 1px dashed rgba(200,164,74,.18); }
@keyframes sp { to { transform: rotate(360deg); } }
.logo-moon { font-size: 30px; animation: spr 80s linear infinite; }
@keyframes spr { to { transform: rotate(-360deg); } }
h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.9rem,5vw,2.8rem); font-weight: 300; letter-spacing: .18em; color: var(--gold2); }
.hd-sub { font-size: .70rem; letter-spacing: .18em; text-transform: uppercase; color: var(--text3); margin-top: 4px; }
.hd-org { font-family: 'Noto Naskh Arabic', serif; font-size: .94rem; color: var(--text2); margin-top: 6px; }
.gold-rule { width: 78px; height: 1px; background: linear-gradient(90deg,transparent,var(--gold),transparent); margin: 13px auto 0; }

/* ── Location bar ── */
.loc-bar { background: var(--bg2); border: 1px solid var(--border); border-radius: 15px; padding: 12px 17px; margin-bottom: 18px; display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.loc-bar > label { font-size: .67rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); white-space: nowrap; }
.loc-fields { display: flex; gap: 7px; flex: 1; flex-wrap: wrap; }
.lf { background: rgba(255,255,255,.035); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: .82rem; padding: 7px 9px; width: 110px; outline: none; transition: border-color .2s; }
.lf.lg { width: 168px; }
.lf:focus { border-color: var(--gold); }
.lf::placeholder { color: var(--text3); }
.btn-g { background: linear-gradient(135deg,#c8a44a,#7a5c10); border: none; border-radius: 8px; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; padding: 8px 14px; cursor: pointer; transition: opacity .2s, transform .1s; white-space: nowrap; }
.btn-g:hover { opacity: .82; transform: translateY(-1px); }
#locSt { font-size: .73rem; color: var(--text3); margin-bottom: 17px; padding-left: 3px; }

/* ── Tabs ── */
.tabs { display: flex; gap: 3px; background: var(--bg1); border: 1px solid var(--border); border-radius: 13px; padding: 4px; margin-bottom: 20px; overflow-x: auto; }
.tab { flex: 1; min-width: max-content; padding: 7px 11px; border-radius: 9px; border: none; background: transparent; color: var(--text2); font-family: 'Plus Jakarta Sans', sans-serif; font-size: .69rem; letter-spacing: .1em; text-transform: uppercase; cursor: pointer; transition: all .2s; white-space: nowrap; }
.tab.active { background: var(--gdim); color: var(--gold2); border: 1px solid var(--bord2); }

/* ── Panel ── */
.panel { display: none; animation: fu .3s ease; }
.panel.active { display: block; }
@keyframes fu { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }

/* ── Card ── */
.card { background: var(--card); border: 1px solid var(--border); border-radius: 15px; padding: 20px; margin-bottom: 15px; }
.card-hd { font-family: 'Cormorant Garamond', serif; font-size: .98rem; font-weight: 400; color: var(--gold); letter-spacing: .1em; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.card-hd::after { content: ''; flex: 1; height: 1px; background: var(--border); }

/* ── Action row ── */
.act-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 13px; justify-content: flex-end; }
.act-btn { display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,.033); border: 1px solid var(--border); border-radius: 7px; color: var(--text2); font-family: 'Plus Jakarta Sans', sans-serif; font-size: .68rem; letter-spacing: .09em; text-transform: uppercase; padding: 7px 11px; cursor: pointer; transition: all .2s; }
.act-btn:hover { background: var(--gdim); border-color: var(--bord2); color: var(--gold2); }
.act-btn.ok { border-color: var(--green); color: var(--green); }

/* ── Countdown ── */
.countdown { text-align: center; padding: 18px 0 4px; }
.cd-lbl { font-size: .65rem; letter-spacing: .18em; text-transform: uppercase; color: var(--text3); margin-bottom: 5px; }
.cd-time { font-family: 'Cormorant Garamond', serif; font-size: 2.6rem; font-weight: 300; color: var(--gold2); letter-spacing: .05em; }
.cd-next { font-size: .74rem; color: var(--text2); margin-top: 3px; }

/* ── Prayer grid ── */
.pg { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px,1fr)); gap: 8px; }
.pi { background: rgba(255,255,255,.024); border: 1px solid var(--border); border-radius: 12px; padding: 14px 10px; text-align: center; transition: border-color .2s; position: relative; overflow: hidden; }
.pi.now { border-color: var(--gold); background: var(--gdim); }
.pi.now::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg,transparent,var(--gold),transparent); }
.pi-name { font-size: .62rem; letter-spacing: .15em; text-transform: uppercase; color: var(--text3); margin-bottom: 6px; }
.pi-ar { font-family: 'Noto Naskh Arabic', serif; font-size: 1.02rem; color: var(--gold2); margin-bottom: 6px; }
.pi-time { font-family: 'Cormorant Garamond', serif; font-size: 1.62rem; font-weight: 300; color: var(--text); line-height: 1; }

/* ── Hijri calendar ── */
.hc { text-align: center; padding: 7px 0; }
.hday { font-family: 'Cormorant Garamond', serif; font-size: clamp(3.2rem,9vw,5rem); font-weight: 300; color: var(--gold2); line-height: 1; }
.hmon { font-family: 'Noto Naskh Arabic', serif; font-size: 1.5rem; color: var(--text); margin: 5px 0 2px; }
.hyr { font-size: .88rem; color: var(--text2); letter-spacing: .13em; }
.hgreg { font-size: .8rem; color: var(--text3); margin-top: 9px; }
.cal-g { display: grid; grid-template-columns: repeat(7,1fr); gap: 3px; margin-top: 9px; }
.cal-c { text-align: center; padding: 5px 2px; border-radius: 7px; font-size: .8rem; color: var(--text2); }
.cal-c.td { background: var(--gdim); border: 1px solid var(--gold); color: var(--gold2); }
.cal-hd { font-size: .59rem; letter-spacing: .07em; color: var(--text3); text-align: center; padding: 4px; }

/* ── Moon ── */
.mwrap { display: flex; align-items: center; justify-content: center; gap: 28px; flex-wrap: wrap; padding: 7px 0; }
.ph-bar { height: 3px; background: rgba(255,255,255,.07); border-radius: 3px; overflow: hidden; margin-top: 11px; }
.ph-fill { height: 100%; background: linear-gradient(90deg,var(--gold),var(--gold2)); border-radius: 3px; transition: width .6s ease; }

/* ── Compass / Qibla ── */
.qwrap { display: flex; align-items: center; justify-content: center; gap: 28px; flex-wrap: wrap; padding: 7px 0; }
.compass { width: 186px; height: 186px; border-radius: 50%; flex-shrink: 0; border: 1.5px solid var(--gold); position: relative; background: radial-gradient(circle,rgba(200,164,74,.05) 0%,transparent 70%); }
.compass::before { content: ''; position: absolute; inset: 9px; border-radius: 50%; border: 1px dashed rgba(200,164,74,.13); }
.cpd { position: absolute; font-size: .63rem; font-weight: 600; color: var(--text2); transform: translate(-50%,-50%); }
.cpd.n { top:10%;left:50%;color:var(--red); } .cpd.s { top:90%;left:50%; } .cpd.e { top:50%;left:90%; } .cpd.w { top:50%;left:10%; }
.cpneedle { position: absolute; top: 50%; left: 50%; width: 3px; height: 68px; margin-left: -1.5px; margin-top: -60px; transform-origin: bottom center; transition: transform .9s cubic-bezier(.34,1.56,.64,1); border-radius: 3px 3px 0 0; background: linear-gradient(180deg,var(--gold2),rgba(200,164,74,.14)); }
.cpneedle::after { content: '🕋'; position: absolute; top: -21px; left: 50%; transform: translateX(-50%); font-size: 15px; }
.cpcen { position: absolute; top:50%;left:50%; width:9px;height:9px; background:var(--gold); border-radius:50%; transform:translate(-50%,-50%); }
.qdr { margin-bottom: 10px; }
.qdl { font-size: .63rem; letter-spacing: .11em; text-transform: uppercase; color: var(--text3); margin-bottom: 2px; }
.qdv { font-family: 'Cormorant Garamond', serif; font-size: 1.38rem; font-weight: 300; color: var(--text); }
.qdv span { font-size: .76rem; color: var(--text2); margin-left: 2px; }

/* ── Conversion ── */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
@media(max-width:560px){ .two-col { grid-template-columns: 1fr; } }
.conv-box { background: rgba(255,255,255,.02); border: 1px solid var(--border); border-radius: 12px; padding: 15px; }
.conv-box label { font-size: .64rem; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 8px; }
.conv-box input, .conv-box select { width: 100%; background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 7px; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: .83rem; padding: 8px 10px; outline: none; transition: border-color .2s; margin-bottom: 6px; }
.conv-box input:focus, .conv-box select:focus { border-color: var(--gold); }
.conv-res { font-family: 'Cormorant Garamond', serif; font-size: 1.18rem; color: var(--gold2); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
.conv-ar { font-family: 'Noto Naskh Arabic', serif; font-size: .9rem; color: var(--text2); margin-top: 3px; }

/* ── Data Table ── */
.dtbl { width: 100%; border-collapse: collapse; }
.dtbl th { font-size: .61rem; letter-spacing: .09em; text-transform: uppercase; color: var(--gold); padding: 7px 9px; border-bottom: 1px solid var(--border); text-align: left; white-space: nowrap; }
.dtbl td { font-size: .87rem; padding: 7px 9px; border-bottom: 1px solid rgba(180,145,70,.055); color: var(--text2); font-family: 'Cormorant Garamond', serif; }
.dtbl tr:hover td { background: rgba(200,164,74,.04); }
.dtbl td.kc { color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: .75rem; }
.today-row td { color: var(--gold2) !important; background: var(--gdim) !important; }

/* ── Hilal form ── */
.hform { display: grid; grid-template-columns: repeat(auto-fill,minmax(185px,1fr)); gap: 9px; margin-bottom: 15px; }
.hfg { display: flex; flex-direction: column; gap: 5px; }
.hfg label { font-size: .63rem; letter-spacing: .11em; text-transform: uppercase; color: var(--gold); }
.hfg input, .hfg select { background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: .83rem; padding: 8px 10px; outline: none; transition: border-color .2s; }
.hfg input:focus, .hfg select:focus { border-color: var(--gold); }

/* ── Hilal report ── */
.hrep { background: rgba(4,6,14,.82); border: 1px solid var(--border); border-radius: 13px; padding: 18px; font-family: var(--mono); font-size: .755rem; line-height: 1.88; overflow-x: auto; white-space: pre-wrap; }
.hrsep { color: var(--text3); }
.hrsec { color: var(--gold); font-weight: bold; }
.hrv   { color: var(--text); }
.hrv.g { color: var(--green); }
.hrv.r { color: var(--red); }
.hrv.a { color: var(--amber); }
.hrv.gold { color: var(--gold2); }

/* ── Criteria cards ── */
.cgrid { display: grid; grid-template-columns: repeat(auto-fill,minmax(225px,1fr)); gap: 9px; margin-top: 13px; }
.ccard { background: rgba(255,255,255,.02); border: 1px solid var(--border); border-radius: 12px; padding: 13px; }
.cname { font-size: .63rem; letter-spacing: .11em; text-transform: uppercase; color: var(--text3); margin-bottom: 6px; }
.cres  { font-family: 'Cormorant Garamond', serif; font-size: 1.04rem; }
.cres.v { color: var(--green); } .cres.m { color: var(--amber); } .cres.x { color: var(--red); }
.cdet { font-size: .73rem; color: var(--text2); margin-top: 4px; line-height: 1.5; }

/* ── Spinner ── */
.sp { display: inline-block; width: 15px; height: 15px; border: 2px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: sp .6s linear infinite; vertical-align: middle; margin-left: 7px; }

/* ── Footer ── */
.site-footer { text-align: center; padding: 28px 0 8px; border-top: 1px solid var(--border); margin-top: 14px; }
.ft-n { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 300; color: var(--gold); letter-spacing: .2em; }
.ft-o { font-size: .68rem; letter-spacing: .13em; text-transform: uppercase; color: var(--text2); margin-top: 4px; }
.ft-a { font-family: 'Noto Naskh Arabic', serif; font-size: .85rem; color: var(--text3); margin-top: 3px; }
.ft-c { font-size: .63rem; color: var(--text3); margin-top: 9px; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg1); }
::-webkit-scrollbar-thumb { background: rgba(200,164,74,.2); border-radius: 3px; }

@media(max-width:560px) { .pg { grid-template-columns: repeat(2,1fr); } }

/* Hilal report value classes (alias hv = hrv) */
.hv     { color: var(--text); }
.hv.g   { color: var(--green); }
.hv.r   { color: var(--red); }
.hv.a   { color: var(--amber); }
.hv.gd  { color: var(--gold2); }
