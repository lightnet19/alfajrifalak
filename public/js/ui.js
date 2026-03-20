/**
 * ui.js — Panel render functions + countdown
 * Al-Fajri v2.1
 */
'use strict';

const _pCache = { result: null };

// ── PRAYER TIMES ─────────────────────────────────
function renderPrayer() {
  const now = new Date();
  const p = prayerTimes(now.getFullYear(), now.getMonth()+1, now.getDate(), LAT, LNG, TZ, ELEV);
  _pCache.result = p;

  const prayers = [
    { name:'Imsak',   ar:'إمساك',      t: p.imsak   },
    { name:'Subuh',   ar:'الصُّبح',    t: p.fajr    },
    { name:'Syuruq',  ar:'الشُّرُوق', t: p.syuruq  },
    { name:'Dzuhur',  ar:'الظُّهر',    t: p.dhuhr   },
    { name:'Ashar',   ar:'الْعَصر',    t: p.ashr    },
    { name:'Maghrib', ar:'الْمَغرِب',  t: p.maghrib },
    { name:"Isya'",   ar:'الْعِشاء',   t: p.isya    }
  ];

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const mins = prayers.map(x => {
    if (x.t === '—') return -1;
    const [h, m] = x.t.split(':').map(Number);
    return h * 60 + m;
  });

  // curIdx = last prayer whose time has already passed
  let curIdx = -1;
  for (let i = 0; i < mins.length; i++) {
    if (mins[i] !== -1 && mins[i] <= nowMin) curIdx = i;
  }

  document.getElementById('prayerGrid').innerHTML = prayers.map((pr, i) => `
    <div class="pi ${i === curIdx ? 'now' : ''}">
      <div class="pi-name">${pr.name}</div>
      <div class="pi-ar">${pr.ar}</div>
      <div class="pi-time">${pr.t}</div>
    </div>`).join('');

  document.getElementById('sunData').innerHTML = [
    { n:'Deklinasi',   v: p.dec.toFixed(4) + '°' },
    { n:'Eq. of Time', v: p.eqt.toFixed(4) + ' mnt' },
    { n:'Kulminasi',   v: fmtHM(p.noonRaw) }
  ].map(x => `
    <div class="pi">
      <div class="pi-name">${x.n}</div>
      <div class="pi-time" style="font-size:1.15rem">${x.v}</div>
    </div>`).join('');
}

// ── COUNTDOWN ────────────────────────────────────
// FIX: compare in seconds (not minutes) for accurate HH:MM:SS
// FIX: d <= 0 wraps to next day — correct for post-Isya period
function tickCountdown() {
  const now = new Date();
  const p = _pCache.result ||
    prayerTimes(now.getFullYear(), now.getMonth()+1, now.getDate(), LAT, LNG, TZ, ELEV);

  const prayers5 = [
    { n:'Subuh',   t: p.fajr    },
    { n:'Dzuhur',  t: p.dhuhr   },
    { n:'Ashar',   t: p.ashr    },
    { n:'Maghrib', t: p.maghrib },
    { n:"Isya'",   t: p.isya    }
  ];

  const nowSec = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
  const secs = prayers5.map(x => {
    if (x.t === '—') return Infinity;
    const [h, m] = x.t.split(':').map(Number);
    return h * 3600 + m * 60;
  });

  let nextIdx = 0, minDiff = 86400;
  for (let i = 0; i < secs.length; i++) {
    let d = secs[i] - nowSec;
    if (d <= 0) d += 86400;   // already past → count to tomorrow
    if (d < minDiff) { minDiff = d; nextIdx = i; }
  }

  const h  = Math.floor(minDiff / 3600);
  const mn = Math.floor((minDiff % 3600) / 60);
  const s  = minDiff % 60;
  document.getElementById('cdVal').textContent  = `${pZ(h)}:${pZ(mn)}:${pZ(s)}`;
  document.getElementById('cdNext').textContent = `Menuju ${prayers5[nextIdx].n} (${prayers5[nextIdx].t})`;
}

// ── HIJRI CALENDAR ───────────────────────────────
function renderHijri() {
  const now = new Date();
  const j0  = jd(now.getFullYear(), now.getMonth()+1, now.getDate());
  const h   = jdH(j0);

  document.getElementById('hijriDisp').innerHTML = `
    <div class="hday">${h.day}</div>
    <div class="hmon">${HM_AR[h.month-1]}</div>
    <div class="hyr">${HM[h.month-1]} ${h.year} H</div>
    <div class="hgreg">${now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>`;

  const firstJD   = hJ(h.year, h.month, 1);
  const firstGreg = jdG(firstJD);
  const wd    = new Date(firstGreg.year, firstGreg.month-1, firstGreg.day).getDay();
  const total = (h.month % 2 === 1 || (h.month === 12 && isHLeap(h.year))) ? 30 : 29;

  let cal = `<div style="font-family:'Cormorant Garamond',serif;font-size:1.05rem;color:var(--gold2);text-align:center;margin-bottom:9px">${HM[h.month-1]} ${h.year} H</div>`;
  cal += `<div class="cal-g">`;
  ['Ahd','Sen','Sel','Rab','Kam','Jum','Sab'].forEach(d => cal += `<div class="cal-h">${d}</div>`);
  for (let i = 0; i < wd; i++) cal += `<div></div>`;
  for (let d = 1; d <= total; d++) cal += `<div class="cal-c ${d===h.day?'td':''}">${d}</div>`;
  cal += `</div>`;
  document.getElementById('hijriCal').innerHTML = cal;
}

// ── MOON PHASE ───────────────────────────────────
function moonPhaseCalc(jd0) {
  const k0 = Math.floor((jd0 - 2451550.1) / 29.53058853);
  let latest = 0;
  for (let k = k0-1; k <= k0+2; k++) {
    const nm = newMoonJDE(k);
    if (nm <= jd0 && nm > latest) latest = nm;
  }
  const age   = jd0 - latest;
  const cycle = age / 29.53058853;
  const illum = Math.round((1 - Math.cos(cycle * 2 * Math.PI)) / 2 * 1000) / 10;
  const names = ['Bulan Baru','Sabit Awal','Kuartal Pertama','Cembung Awal',
                 'Purnama','Cembung Akhir','Kuartal Akhir','Sabit Akhir'];
  return { age, illum, phaseName: names[Math.floor(((cycle%1)+0.0625)*8)%8], cyclePos: cycle%1 };
}

function drawMoon(canvas, p) {
  const ctx = canvas.getContext('2d'), W = canvas.width, cx = W/2, cy = W/2, r = W/2-3;
  ctx.clearRect(0,0,W,W);
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle='#0b0f1a'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.clip();
  const g = ctx.createRadialGradient(cx,cy,r*.1,cx,cy,r);
  g.addColorStop(0,'rgba(255,242,190,.97)'); g.addColorStop(.7,'rgba(215,185,115,.85)'); g.addColorStop(1,'rgba(155,125,65,.55)');
  if (p < 0.5) {
    const xt = cx + r*(1-4*p)*(p<0.25?1:-1);
    ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI/2,Math.PI/2);
    ctx.bezierCurveTo(xt,cy+r,xt,cy-r,cx,cy-r); ctx.closePath();
    ctx.fillStyle=g; ctx.fill();
  } else {
    const p2=p-.5, xt=cx+r*(1-4*p2)*(p2<0.25?-1:1);
    ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI/2,-Math.PI/2);
    ctx.bezierCurveTo(xt,cy-r,xt,cy+r,cx,cy+r); ctx.closePath();
    ctx.fillStyle=g; ctx.fill();
  }
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.strokeStyle='rgba(200,164,74,.3)'; ctx.lineWidth=1.5; ctx.stroke();
}

function renderMoon() {
  const now = new Date();
  const j0  = jd(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours(), now.getMinutes());
  const m   = moonPhaseCalc(j0);
  document.getElementById('moonPN').textContent = m.phaseName;
  document.getElementById('moonIl').textContent = `Iluminasi: ${m.illum} %`;
  document.getElementById('moonAg').textContent = `Umur Bulan: ${m.age.toFixed(1)} hari`;
  document.getElementById('moonBF').style.width = m.cyclePos*100 + '%';
  drawMoon(document.getElementById('moonCanvas'), m.cyclePos);

  const icons=['🌑','🌓','🌕','🌗'], names=['Bulan Baru','Kuartal I','Purnama','Kuartal III'];
  const off=[0,7.38221,14.7653,22.1282];
  const k0=Math.floor((j0-2451550.1)/29.53058853);
  const ev=[];
  for (let k=k0; k<=k0+3&&ev.length<4; k++)
    for (let f=0; f<4&&ev.length<4; f++) {
      const jde=newMoonJDE(k)+off[f];
      if (jde>j0) { const d=jdG(jde); ev.push({icon:icons[f],name:names[f],date:`${d.day}/${d.month}/${d.year}`}); }
    }
  document.getElementById('moonFut').innerHTML = ev.map(e=>`
    <div class="pi">
      <div style="font-size:1.5rem;margin-bottom:5px">${e.icon}</div>
      <div class="pi-name">${e.name}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:.98rem;color:var(--gold2);margin-top:6px">${e.date}</div>
    </div>`).join('');
}

// ── QIBLA ────────────────────────────────────────
function renderQibla() {
  const kLat=21.4225, kLng=39.8262, dLng=(kLng-LNG)*D2R;
  const y2 = Math.sin(dLng)*Math.cos(kLat*D2R);
  const x2 = Math.cos(LAT*D2R)*Math.sin(kLat*D2R) - Math.sin(LAT*D2R)*Math.cos(kLat*D2R)*Math.cos(dLng);
  const az  = fix(Math.atan2(y2,x2)*R2D);
  const dLat=(kLat-LAT)*D2R, dL2=(kLng-LNG)*D2R;
  const a = Math.sin(dLat/2)**2 + Math.cos(LAT*D2R)*Math.cos(kLat*D2R)*Math.sin(dL2/2)**2;
  const dist = Math.round(2*6371*Math.asin(Math.sqrt(a)));
  const dirs = ['U','UBL','BL','BBL','B','BSD','SD','SSD','S','STG','TG','TTG','T','TLR','LR','ULR'];
  document.getElementById('cpN').style.transform = `rotate(${az}deg)`;
  document.getElementById('qAz').innerHTML  = `${az.toFixed(2)}<span>° dari Utara</span>`;
  document.getElementById('qDir').textContent  = dirs[Math.round(az/22.5)%16];
  document.getElementById('qDist').innerHTML   = `${dist.toLocaleString('id-ID')}<span>km</span>`;
}

// ── KONVERSI ─────────────────────────────────────
function renderKonversi() {
  const now = new Date();
  const y=now.getFullYear(), m=now.getMonth()+1, d=now.getDate();
  document.getElementById('convM').value     = `${y}-${pZ(m)}-${pZ(d)}`;
  document.getElementById('todayJD').textContent = jd(y,m,d).toFixed(5);
  convM2H();
  document.getElementById('convM').oninput    = convM2H;
  document.getElementById('convHD').oninput   = convH2M;
  document.getElementById('convHMo').onchange = convH2M;
  document.getElementById('convHY').oninput   = convH2M;
  document.getElementById('convJD').oninput   = () => {
    const v = +document.getElementById('convJD').value; if(!v) return;
    const g = jdG(v);
    document.getElementById('convJDR').textContent =
      new Date(g.year,g.month-1,g.day).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
      + ` ${pZ(g.hour)}:${pZ(g.minute)} UT`;
  };
}
function convM2H() {
  const v=document.getElementById('convM').value; if(!v) return;
  const [y,m,d]=v.split('-').map(Number), h=jdH(jd(y,m,d));
  document.getElementById('convHR').textContent  = `${h.day} ${HM[h.month-1]} ${h.year} H`;
  document.getElementById('convHAr').textContent = `${h.day} ${HM_AR[h.month-1]} ${h.year}`;
}
function convH2M() {
  const d=+document.getElementById('convHD').value, m=+document.getElementById('convHMo').value, y=+document.getElementById('convHY').value;
  if(!d||!m||!y) return;
  const g=jdG(hJ(y,m,d));
  document.getElementById('convMR').textContent =
    new Date(g.year,g.month-1,g.day).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
}

// ── IMSAKIYAH ────────────────────────────────────
function renderImsakiyah() {
  const now=new Date(), y=now.getFullYear(), mo=now.getMonth()+1;
  const dInMonth=new Date(y,mo,0).getDate();
  const hFirst=jdH(jd(y,mo,1));
  document.getElementById('imsakTtl').textContent = now.toLocaleDateString('id-ID',{month:'long',year:'numeric'});
  document.getElementById('imsakSub').textContent  = `${HM[hFirst.month-1]} ${hFirst.year} H | ${document.getElementById('inpMarkaz').value}`;
  let html=`<thead><tr><th class="kc">Tgl</th><th class="kc">Hijri</th><th>Imsak</th><th>Subuh</th><th>Syuruq</th><th>Dzuhur</th><th>Ashar</th><th>Maghrib</th><th>Isya</th></tr></thead><tbody>`;
  for(let day=1;day<=dInMonth;day++){
    const p=prayerTimes(y,mo,day,LAT,LNG,TZ,ELEV), h=jdH(jd(y,mo,day));
    html+=`<tr class="${day===now.getDate()?'today-row':''}"><td class="kc">${pZ(day)}/${pZ(mo)}</td><td class="kc">${h.day} ${HM[h.month-1].slice(0,5)}</td><td>${p.imsak}</td><td>${p.fajr}</td><td>${p.syuruq}</td><td>${p.dhuhr}</td><td>${p.ashr}</td><td>${p.maghrib}</td><td>${p.isya}</td></tr>`;
  }
  document.getElementById('imsakTable').innerHTML = html+'</tbody>';
}

// ── EPHEMERIS ────────────────────────────────────
function renderEphemeris() {
  const now=new Date();
  const j0=jd(now.getFullYear(),now.getMonth()+1,now.getDate(),now.getHours()-TZ,now.getMinutes());
  const s=sunPos(j0), m=moonPos(j0), T=(j0-2451545)/36525;
  const rows=[
    ['Bujur Ekliptika (λ)',    fix(s.sunLon).toFixed(6)+'°',  m.lon.toFixed(6)+'°'],
    ['Lintang Ekliptika (β)', '—',                             m.lat.toFixed(6)+'°'],
    ['Asensio Rekta (AR)',     s.RA.toFixed(6)+'°',            m.RA.toFixed(6)+'°'],
    ['Deklinasi (δ)',          s.Dec.toFixed(6)+'°',           m.Dec.toFixed(6)+'°'],
    ['Persamaan Waktu (EqT)', s.EqT.toFixed(6)+' mnt',        '—'],
    ['Jarak Bumi',            s.dist.toFixed(8)+' AU',         m.dist.toFixed(3)+' km'],
    ['Semidiameter',          s.SD.toFixed(6)+'°',             m.SD.toFixed(6)+'°'],
    ['Horizontal Parallax',   s.HP.toFixed(6)+'°',             m.HP.toFixed(6)+'°'],
    ['Miring Ekliptika (ε)',  obliquity(T).toFixed(6)+'°',    '—'],
    ['Julian Day (UT)',        j0.toFixed(6),                  ''],
  ];
  let html=`<thead><tr><th class="kc">Parameter</th><th>☀ Matahari</th><th>🌙 Bulan</th></tr></thead><tbody>`;
  rows.forEach(r=>html+=`<tr><td class="kc">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`);
  document.getElementById('ephTable').innerHTML=html+'</tbody>';
}

// ── Master render ─────────────────────────────────
function renderAll() {
  renderPrayer();
  renderHijri();
  renderMoon();
  renderQibla();
  renderKonversi();
  renderImsakiyah();
  renderEphemeris();
}
