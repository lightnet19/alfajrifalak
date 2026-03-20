/**
 * hilal.js — Kalkulasi Hilal & Render Laporan
 * Algoritma: Jean Meeus — Astronomical Algorithms 2nd ed.
 * Al-Fajri v2.3 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js
 */
'use strict';

const MON3=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

// ══════════════════════════════════════════════════════
//  KALKULASI HILAL
// ══════════════════════════════════════════════════════
function calcHilal(hYear, hMonth, lat, lng, elev, tz) {
  const markaz = document.getElementById('inpMarkaz').value || '—';

  // 1. Cari new moon JDE untuk hMonth/hYear
  const approxGreg = jdG(hijriToJD(hYear, hMonth, 1) - 15);
  let bestK = kFromYM(approxGreg.year, approxGreg.month), bestDiff = 999;
  for (let dk=-1; dk<=2; dk++) {
    const jde=newMoonJDE(bestK+dk), h=jdToHijri(jde);
    const diff=Math.abs((h.year-hYear)*12+(h.month-(hMonth-1)));
    if (diff<bestDiff) { bestDiff=diff; bestK=bestK+dk; }
  }

  const jdeTDT  = newMoonJDE(bestK);
  const gregI   = jdG(jdeTDT);
  const dT_s    = deltaT(gregI.year + gregI.month/12);
  const jdIjtima = jdeTDT - dT_s/86400;  // TDT → UT

  // 2. Tentukan hari rukyat
  const gregI2  = jdG(jdIjtima);
  const obsBase = jd(gregI2.year, gregI2.month, gregI2.day);
  const ss0     = calcSunSet(obsBase, lat, lng, tz, elev);
  const obsJD   = (ss0 && jdIjtima > ss0) ? obsBase+1 : obsBase;

  // 3. Waktu terbenam hari rukyat
  const jdSunset  = calcSunSet(obsJD, lat, lng, tz, elev);
  if (!jdSunset) return { error:'Matahari tidak terbenam pada tanggal ini.' };
  const jdMoonset = calcMoonSet(obsJD, lat, lng, tz, elev);

  // 4. Posisi benda langit saat matahari terbenam
  const sunG  = sunPos(jdSunset);
  const moonG = moonPos(jdSunset);
  const sunT  = topoCorrect(sunG,  lat, lng, elev, jdSunset);
  const moonT = topoCorrect(moonG, lat, lng, elev, jdSunset);
  const sunH     = toHoriz(sunT.RA,  sunT.Dec,  lat, lng, jdSunset);
  const moonH    = toHoriz(moonT.RA, moonT.Dec, lat, lng, jdSunset);
  const moonGeoH = toHoriz(moonG.RA, moonG.Dec, lat, lng, jdSunset);

  // 5. Tinggi hilal berbagai jenis
  const altMoonGeo     = moonGeoH.alt;
  const altSunAirless  = sunH.alt;
  const altMoonAirless = moonH.alt;
  const SD = moonT.SD;
  const altMoonApparent = altMoonAirless + refraction(altMoonAirless);
  const dip = horizDip(elev);            // 1.76√h/60 derajat
  const altMoonMari = altMoonApparent + dip;

  // 6. Elongasi
  const elongGeo  = elongation(moonG.RA, moonG.Dec, sunG.RA,  sunG.Dec);
  const elongTopo = elongation(moonT.RA, moonT.Dec, sunT.RA,  sunT.Dec);

  // 7. Lebar hilal, illuminasi, nurul hilal
  const W_arcsec   = moonT.SD*2*3600*Math.pow(Math.sin(elongTopo*D2R/2),2);
  const W_arcmin   = W_arcsec/60;
  const illuminasi = (1-Math.cos(elongGeo*D2R))/2*100;
  const nurulHilal = W_arcsec*Math.PI/648000;

  // 8. Ijtima toposentrik (cari elongasi minimum)
  let jdIjtimaT=jdIjtima, minE=999;
  for (let dt=-0.3; dt<=0.3; dt+=0.002) {
    const jt=jdIjtima+dt, s2=sunPos(jt), m2=moonPos(jt);
    const st2=topoCorrect(s2,lat,lng,elev,jt), mt2=topoCorrect(m2,lat,lng,elev,jt);
    const e2=elongation(mt2.RA,mt2.Dec,st2.RA,st2.Dec);
    if (e2<minE) { minE=e2; jdIjtimaT=jt; }
  }

  // 9. Waktu lokal dari JD
  const lt = j => ((j-(Math.floor(j+0.5)-0.5))*24)+tz;
  const sunsetLT    =lt(jdSunset);
  const moonsetLT   =jdMoonset?lt(jdMoonset):null;
  const ijtimaGeoLT =lt(jdIjtima),  ijtimaGeoUT =ijtimaGeoLT-tz;
  const ijtimaTopoLT=lt(jdIjtimaT), ijtimaTopoUT=ijtimaTopoLT-tz;
  const bestTimeLT  =moonsetLT?(sunsetLT+moonsetLT)/2:sunsetLT+0.1;
  const lamaHilal   =moonsetLT?moonsetLT-sunsetLT:0;
  const umurHilal   =sunsetLT-ijtimaGeoLT;

  // 10. Arc of Vision (ARCV)
  const ARCV = altMoonApparent - altSunAirless;

  // 11. Kriteria visibilitas
  const irnu_vis = altMoonMari>=3.0 && elongGeo>=6.4;
  const irnu_mar = altMoonMari>=2.0 && elongGeo>=4.0;
  const wujud    = jdIjtima<jdSunset && (jdMoonset?jdMoonset>jdSunset:false);
  const qOdeh    = ARCV-((-0.1018*W_arcmin**3)+(0.7319*W_arcmin**2)-(6.3226*W_arcmin)+7.1651);
  const qYallop  = (ARCV-(11.8371-6.3226*W_arcmin+0.7319*W_arcmin**2-0.1018*W_arcmin**3))/10;

  // 12. Posisi & keadaan hilal
  const posisiDeg = Math.abs(moonT.Dec-sunT.Dec);
  const posisiDir = moonT.Dec>sunT.Dec?'Utara':'Selatan';
  const keadaan   = moonT.Dec>0?'Miring ke Utara':'Miring ke Selatan';

  // 13. Azimuth saat hilal terbenam
  const mms  = jdMoonset?moonPos(jdMoonset):moonG;
  const tmms = jdMoonset?topoCorrect(mms,lat,lng,elev,jdMoonset):moonT;
  const moonHMs = toHoriz(tmms.RA,tmms.Dec,lat,lng,jdMoonset||jdSunset);

  // 14. Prediksi hari pertama (kriteria IRNU)
  let predJD=null;
  for (let d=0; d<=4; d++) {
    const to=obsJD+d, ts=calcSunSet(to,lat,lng,tz,elev);
    if (!ts) continue;
    const tm=moonPos(ts), tsun=sunPos(ts);
    const tmt=topoCorrect(tm,lat,lng,elev,ts);
    const tmh=toHoriz(tmt.RA,tmt.Dec,lat,lng,ts);
    const tmar=tmh.alt+refraction(tmh.alt)+horizDip(elev);
    const telG=elongation(tm.RA,tm.Dec,tsun.RA,tsun.Dec);
    if (tmar>=3.0&&telG>=6.4) { predJD=to; break; }
    if (d>=3&&!predJD) predJD=to+1;
  }
  const predGreg = predJD?jdG(predJD+0.5):null;
  const predWtn  = predJD?weton(predJD+0.5):'—';

  return {
    markaz,hYear,hMonth,lat,lng,elev,tz,
    jdIjtima,jdSunset,dT_s,
    ijtimaGeoLT,ijtimaGeoUT,ijtimaTopoLT,ijtimaTopoUT,
    sunsetLT,moonsetLT,bestTimeLT,lamaHilal,umurHilal,
    sunG,moonG,sunT,moonT,sunH,moonH,
    altMoonGeo,altSunAirless,altMoonAirless,altMoonApparent,altMoonMari,
    SD, HP:moonT.HP,
    elongGeo,elongTopo,W_arcsec,W_arcmin,illuminasi,nurulHilal,ARCV,
    qOdeh,qYallop,irnu_vis,irnu_mar,wujud,
    posisiDeg,posisiDir,keadaan,moonHMs,
    ijtimaGreg : jdG(jdIjtima),
    obsGreg    : jdG(obsJD+0.5),
    wetonIjtima: weton(jdIjtima+tz/24),
    wetonObs   : weton(obsJD+0.5),
    sunAtIjtima   : sunPos(jdIjtima),
    moonAtIjtimaT : moonPos(jdIjtimaT),
    predGreg, predWtn
  };
}

// ══════════════════════════════════════════════════════
//  RENDER LAPORAN
// ══════════════════════════════════════════════════════
function renderHilalReport(r) {
  if (r.error) {
    document.getElementById('hilalOut').innerHTML=`<span style="color:var(--red)">${r.error}</span>`;
    return;
  }
  const SEP='═'.repeat(60);
  const row=(k,v,c)=>`<span style="color:var(--text3)">${k}${'.'.repeat(Math.max(1,32-k.length))}:</span> <span class="hv ${c||''}">${v}</span>\n`;
  const sec=t=>`<span style="color:var(--gold)">── ${t} ──</span>\n`;
  const sep=()=>`<span style="color:var(--text3)">${SEP}</span>\n`;

  const latStr=`${r.lat<0?'S':'N'} ${dmsU(Math.abs(r.lat))}`;
  const lngStr=`${r.lng<0?'W':'E'} ${dmsU(Math.abs(r.lng))}`;
  const pred  =r.predGreg?`${r.predWtn}, ${r.predGreg.day} ${MON3[r.predGreg.month-1]} ${r.predGreg.year} M`:'—';
  const lhH=Math.floor(r.lamaHilal), lhM=Math.floor((r.lamaHilal-lhH)*60), lhS=((r.lamaHilal-lhH)*60-lhM)*60;
  const uhH=Math.floor(r.umurHilal), uhM=Math.floor((r.umurHilal-uhH)*60), uhS=((r.umurHilal-uhH)*60-uhM)*60;
  const hijI=jdToHijri(r.jdIjtima);

  let h=`<span style="display:block;text-align:center;font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--gold2)">Awal Bulan ${HM[r.hMonth-1]} ${r.hYear} H</span>\n`;
  h+=`<span style="display:block;text-align:center;color:var(--text2);font-size:.72rem">Al-Fajri v2.3 — Lembaga Falakiyah PCNU Kencong | Jean Meeus (${MLR.length}+${MB.length} Suku)</span>\n`;
  h+=sep();
  h+=row('Markaz',r.markaz)+row('Lintang',latStr)+row('Bujur',lngStr);
  h+=row('Elevasi',r.elev.toFixed(1)+' mdpl')+row('Zona Waktu','UTC+'+r.tz);
  h+=sep()+sec('DATA IJTIMA');
  h+=row('Tanggal Ijtima Geo',`${r.wetonIjtima}, ${r.ijtimaGreg.day} ${MON3[r.ijtimaGreg.month-1]} ${r.ijtimaGreg.year} M`,'gd');
  h+=row('Ijtima Hijriyah Geo',`${hijI.day} ${HM[hijI.month-1]} ${hijI.year} H`);
  h+=row('Bujur Ijtima Geo',dms(r.sunAtIjtima.sunLon))+row('Bujur Ijtima Topo',dms(r.moonAtIjtimaT.lon));
  h+='\n';
  h+=row('Is Visible?',r.irnu_vis?'👁  VISIBLE':'✗  Not Visible',r.irnu_vis?'g':'r');
  h+=row('JD Ijtima',r.jdIjtima.toFixed(9))+row('JD Sunset',r.jdSunset.toFixed(9));
  h+=row('DeltaT',r.dT_s.toFixed(2)+' s');
  h+='\n';
  h+=row('Jam Ijtima Geo LT',fmtF(r.ijtimaGeoLT))+row('Jam Ijtima Geo UT',fmtF(r.ijtimaGeoUT));
  h+=row('Jam Ijtima Topo LT',fmtF(r.ijtimaTopoLT))+row('Jam Ijtima Topo UT',fmtF(r.ijtimaTopoUT));
  h+=sep()+sec('WAKTU TERBENAM');
  h+=row('Matahari Terbenam',fmtF(r.sunsetLT)+' LT','gd');
  h+=row('Hilal Terbenam',r.moonsetLT?fmtF(r.moonsetLT)+' LT':'—','gd');
  h+=sep()+sec('POSISI BENDA LANGIT (TOPO AT SUNSET)');
  h+=row('Bujur Hilal Topo',dms(r.moonG.lon))+row('Lintang Hilal Topo',dms(r.moonG.lat));
  h+=row('Bujur Matahari Topo',dms(r.sunT.lambda||r.sunG.sunLon));
  h+=row('Hilal RA Topo Hour',hms(r.moonT.RA/15))+row('Hilal Topo Decli',dms(r.moonT.Dec));
  h+=row('Sun RA Topo Hour',hms(r.sunT.RA/15))+row('Sun Topo Decli',dms(r.sunT.Dec));
  h+=sep()+sec('TINGGI HILAL');
  h+=row('T. Hilal Hakiki/Geo',dms(r.altMoonGeo),'gd')+row('T. Airless Topo Sun',dms(r.altSunAirless))+'\n';
  h+=row('T. Hilal Topo Airless Upper',dms(r.altMoonAirless+r.SD));
  h+=row('T. Hilal Topo Airless Center',dms(r.altMoonAirless),'gd');
  h+=row('T. Hilal Topo Airless Lower',dms(r.altMoonAirless-r.SD))+'\n';
  h+=row('T. Hilal Topo Apparent Upper',dms(r.altMoonApparent+r.SD));
  h+=row('T. Hilal Topo Apparent Center',dms(r.altMoonApparent),'gd');
  h+=row('T. Hilal Topo Apparent Lower',dms(r.altMoonApparent-r.SD))+'\n';
  h+=row("T. Hilal Mar'i Upper",dms(r.altMoonMari+r.SD));
  h+=row("T. Hilal Mar'i Center",dms(r.altMoonMari),'gd');
  h+=row("T. Hilal Mar'i Lower",dms(r.altMoonMari-r.SD));
  h+=sep()+sec('AZIMUTH & ELONGASI');
  h+=row('Az. Matahari',dmsU(r.sunH.az))+row('Az. Hilal',dmsU(r.moonH.az));
  h+=row('Elongasi Hilal Geo',dms(r.elongGeo),'gd')+row('Elongasi Hilal Topo',dms(r.elongTopo));
  h+=sep()+sec('PARAMETER HILAL');
  h+=row('Best Time',fmtF(r.bestTimeLT)+' LT');
  h+=row('Lama Hilal',`${pZ(lhH)} h ${pZ(lhM)} m ${lhS.toFixed(2).padStart(5,'0')} s`);
  h+=row('Umur Hilal',`${pZ(uhH)}h ${pZ(uhM)}m ${uhS.toFixed(2).padStart(5,'0')}s`);
  h+=row('Az. Ghurub Hilal',dmsU(r.moonHMs.az));
  h+=row('Semidiameter Hilal',dms(r.SD))+row('Horizontal Plx Hilal',dms(r.HP));
  h+=row('Posisi Hilal',`${dmsU(r.posisiDeg)} ${r.posisiDir} Matahari`)+row('Keadaan Hilal',r.keadaan);
  h+=sep()+sec('FOTOMETRI & VISIBILITAS');
  h+=row('Illuminasi Hilal',r.illuminasi.toFixed(2)+' %','gd');
  h+=row('Lebar Hilal (W)',`${dmsU(r.W_arcsec/3600)} (${r.W_arcsec.toFixed(2)}″)`);
  h+=row('Nurul Hilal',r.nurulHilal.toFixed(8));
  h+=row('Range q Odeh',r.qOdeh.toFixed(3),r.qOdeh>=2?'g':r.qOdeh>=-0.96?'a':'r');
  h+=row('ARCV',r.ARCV.toFixed(4)+'°')+row('Jarak Bumi-Bulan',r.moonG.dist.toFixed(2)+' km');
  h+=sep()+sec('KRITERIA VISIBILITAS');
  h+=row("IRNU/NU (Mar'i≥3°,Elong≥6.4°)",r.irnu_vis?'✓ TERPENUHI':'✗ Tidak Terpenuhi',r.irnu_vis?'g':r.irnu_mar?'a':'r');
  h+=row('Wujudul Hilal',r.wujud?'✓ TERPENUHI':'✗ Tidak Terpenuhi',r.wujud?'g':'r');
  h+=row('Odeh',r.qOdeh>=5.65?'A — Mudah':r.qOdeh>=2?'B — Terlihat':r.qOdeh>=-0.96?'C — Marginal':'D — Tidak',r.qOdeh>=2?'g':r.qOdeh>=-0.96?'a':'r');
  h+='\n'+row('Prediksi Kri. IRNU',pred,'gd');
  h+=sep()+`<span style="display:block;text-align:center;color:var(--text3);font-size:.68rem">Al-Fajri v2.3 — Jean Meeus — Lembaga Falakiyah PCNU Kencong</span>`;
  document.getElementById('hilalOut').innerHTML=h;

  // Kartu kriteria
  document.getElementById('hilalCritDiv').style.display='block';
  const crits=[
    {name:'IRNU / NU (LF-PBNU 2022)',desc:"T. Mar'i ≥ 3° DAN Elongasi Geo ≥ 6.4°",
     res:r.irnu_vis?'Terlihat (Visible)':r.irnu_mar?'Batas (Marginal)':'Tidak Terlihat',
     cls:r.irnu_vis?'v':r.irnu_mar?'m':'x',
     det:`T. Mar'i: ${dms(r.altMoonMari)} | Elong: ${dms(r.elongGeo)}`},
    {name:'Wujudul Hilal',desc:'Ijtima sebelum sunset & bulan terbenam setelah matahari',
     res:r.wujud?'Wujud — Terpenuhi':'Tidak Wujud',cls:r.wujud?'v':'x',
     det:`Ijtima: ${fmtF(r.ijtimaGeoLT)} | Sunset: ${fmtF(r.sunsetLT)}`},
    {name:'Odeh 2006',desc:'Berdasarkan ARCV dan Lebar Hilal (W)',
     res:r.qOdeh>=5.65?'A — Mudah':r.qOdeh>=2?'B — Terlihat':r.qOdeh>=-0.96?'C — Marginal':'D — Tidak',
     cls:r.qOdeh>=2?'v':r.qOdeh>=-0.96?'m':'x',
     det:`q=${r.qOdeh.toFixed(3)} | ARCV=${r.ARCV.toFixed(3)}° | W=${r.W_arcmin.toFixed(4)}'`},
    {name:'Yallop 1997',desc:'Berdasarkan ARCV dan Best Time',
     res:r.qYallop>0.216?'A':r.qYallop>=-0.014?'B':r.qYallop>=-0.160?'C':r.qYallop>=-0.232?'D':'E',
     cls:r.qYallop>=-0.014?'v':r.qYallop>=-0.160?'m':'x',det:`q=${r.qYallop.toFixed(5)}`}
  ];
  document.getElementById('hilalCritCards').innerHTML=crits.map(c=>
    `<div class="ccard"><div class="cname">${c.name}</div><div class="cres ${c.cls}">${c.res}</div><div class="cdet">${c.desc}<br>${c.det}</div></div>`
  ).join('');
}

// ── Entry point ────────────────────────────────────────
function doCalcHilal() {
  const hYear=+document.getElementById('hilalYear').value;
  const hMonth=+document.getElementById('hilalMonth').value;
  document.getElementById('hilalOut').innerHTML=
    `<span style="color:var(--text2)">Menghitung...<span class="sp"></span></span>`;
  document.getElementById('hilalCritDiv').style.display='none';
  setTimeout(()=>{
    try { renderHilalReport(calcHilal(hYear,hMonth,LAT,LNG,ELEV,TZ)); }
    catch(e) { document.getElementById('hilalOut').innerHTML=`<span style="color:var(--red)">Error: ${e.message}</span>`; console.error(e); }
  },30);
}
