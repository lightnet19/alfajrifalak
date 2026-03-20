/**
 * hilal.js — Hilal calculation + report rendering + criteria
 * Al-Fajri | Lembaga Falakiyah PCNU Kencong
 */
'use strict';

function calcHilal(hYear, hMonth, lat, lng, elev, tz) {
  const markaz = document.getElementById('inpMarkaz').value || '—';
  const approx = jdToGreg(hijriToJD(hYear, hMonth, 1) - 15);
  let bestK = kFromDate(approx.year, approx.month), bestDiff = 999;
  for (let dk = -1; dk <= 2; dk++) {
    const jde = newMoonJDE(bestK + dk), h = jdToHijri(jde);
    const diff = Math.abs((h.year-hYear)*12 + (h.month-(hMonth-1)));
    if (diff < bestDiff) { bestDiff = diff; bestK = bestK + dk; }
  }
  const jdeTDT = newMoonJDE(bestK);
  const gregI = jdToGreg(jdeTDT);
  const dT_s = deltaT(gregI.year + gregI.month/12);
  const jdIjtima = jdeTDT - dT_s/86400;
  const gregI2 = jdToGreg(jdIjtima);
  const obsBase = jd(gregI2.year, gregI2.month, gregI2.day);
  const ss0 = calcSunSet(obsBase, lat, lng, tz, elev);
  const obsJD = (ss0 && jdIjtima > ss0) ? obsBase + 1 : obsBase;
  const jdSunset = calcSunSet(obsJD, lat, lng, tz, elev);
  if (!jdSunset) return { error: 'Matahari tidak terbenam.' };
  const jdMoonset = calcMoonSet(obsJD, lat, lng, tz, elev);
  const sunG = sunPos(jdSunset), moonG = moonPos(jdSunset);
  const sunT = topoCorrect(sunG, lat, lng, elev, jdSunset);
  const moonT = topoCorrect(moonG, lat, lng, elev, jdSunset);
  const sunH = toHoriz(sunT.RA, sunT.Dec, lat, lng, jdSunset);
  const moonH = toHoriz(moonT.RA, moonT.Dec, lat, lng, jdSunset);
  const moonGeoH = toHoriz(moonG.RA, moonG.Dec, lat, lng, jdSunset);
  const altMoonGeo = moonGeoH.alt;
  const altSunAirless = sunH.alt;
  const altMoonAirless = moonH.alt;
  const altMoonApparent = altMoonAirless + refraction(altMoonAirless);
  const horizDip = 0.0353 * Math.sqrt(elev / 1000) * R2D;
  const altMoonMari = altMoonApparent + horizDip;
  const SD = moonT.SD, HP = moonT.HP;
  const elongGeo = elongation(moonG.RA, moonG.Dec, sunG.RA, sunG.Dec);
  const elongTopo = elongation(moonT.RA, moonT.Dec, sunT.RA, sunT.Dec);
  const W_arcsec = (SD*2)*3600*Math.pow(Math.sin(elongTopo*D2R/2), 2);
  const illuminasi = (1 - Math.cos(elongGeo*D2R))/2*100;
  const W_arcmin = W_arcsec/60;
  const nurulHilal = W_arcsec*Math.PI/180/3600;
  let jdIjtimaT = jdIjtima, minE = 999;
  for (let dt = -0.3; dt <= 0.3; dt += 0.002) {
    const jt = jdIjtima+dt, s2=sunPos(jt), m2=moonPos(jt);
    const st2=topoCorrect(s2,lat,lng,elev,jt), mt2=topoCorrect(m2,lat,lng,elev,jt);
    const e2 = elongation(mt2.RA,mt2.Dec,st2.RA,st2.Dec);
    if (e2 < minE) { minE = e2; jdIjtimaT = jt; }
  }
  const jdToLT = j => ((j-(Math.floor(j+0.5)-0.5))*24)+tz;
  const sunsetLT=jdToLT(jdSunset), moonsetLT=jdMoonset?jdToLT(jdMoonset):null;
  const ijtimaGeoLT=jdToLT(jdIjtima), ijtimaTopoLT=jdToLT(jdIjtimaT);
  const bestTimeLT=moonsetLT?(sunsetLT+moonsetLT)/2:sunsetLT+0.1;
  const lamaHilal=moonsetLT?moonsetLT-sunsetLT:0;
  const umurHilal=sunsetLT-ijtimaGeoLT;
  const ARCV=altMoonApparent-altSunAirless;
  const irnu_vis=altMoonMari>=3.0&&elongGeo>=6.4, irnu_mar=altMoonMari>=2.0&&elongGeo>=4.0;
  const wujud=jdIjtima<jdSunset&&(jdMoonset?jdMoonset>jdSunset:false);
  const qOdeh=ARCV-((-0.1018*W_arcmin**3)+(0.7319*W_arcmin**2)-(6.3226*W_arcmin)+7.1651);
  const qYallop=(ARCV-(11.8371-6.3226*W_arcmin+0.7319*W_arcmin**2-0.1018*W_arcmin**3))/10;
  let moonHAtMoonset=moonH;
  if (jdMoonset) { const mm=moonPos(jdMoonset),mt=topoCorrect(mm,lat,lng,elev,jdMoonset); moonHAtMoonset=toHoriz(mt.RA,mt.Dec,lat,lng,jdMoonset); }
  const posisiDeg=Math.abs(moonT.Dec-sunT.Dec), posisiDir=moonT.Dec>sunT.Dec?'Utara':'Selatan';
  const keadaan=moonT.Dec>=0?'Miring ke Utara':'Miring ke Selatan';
  let predJD=null,predGreg=null,predWtn='—';
  for (let d=0;d<=4;d++) {
    const tObs=obsJD+d, tSS=calcSunSet(tObs,lat,lng,tz,elev); if(!tSS)continue;
    const tM=moonPos(tSS),tS=sunPos(tSS),tMT=topoCorrect(tM,lat,lng,elev,tSS);
    const tMH=toHoriz(tMT.RA,tMT.Dec,lat,lng,tSS);
    const tMar=tMH.alt+refraction(tMH.alt)+0.0353*Math.sqrt(elev/1000)*R2D;
    const tElG=elongation(tM.RA,tM.Dec,tS.RA,tS.Dec);
    if(tMar>=3.0&&tElG>=6.4){predJD=tObs;break;}
    if(d>=3&&!predJD)predJD=tObs+1;
  }
  if(predJD){predGreg=jdToGreg(predJD+0.5);predWtn=getWeton(predJD+0.5);}
  return {
    markaz,hYear,hMonth,lat,lng,elev,tz,jdIjtima,jdSunset,dT_s,
    ijtimaGeoLT,ijtimaGeoUT:ijtimaGeoLT-tz,ijtimaTopoLT,ijtimaTopoUT:ijtimaTopoLT-tz,
    sunsetLT,moonsetLT,bestTimeLT,lamaHilal,umurHilal,
    sunG,moonG,sunT,moonT,sunH,moonH,altMoonGeo,altSunAirless,altMoonAirless,altMoonApparent,altMoonMari,
    SD,HP,elongGeo,elongTopo,W_arcsec,W_arcmin,illuminasi,nurulHilal,ARCV,
    qOdeh,qYallop,irnu_vis,irnu_mar,wujud,posisiDeg,posisiDir,keadaan,moonHAtMoonset,
    ijtimaGreg:jdToGreg(jdIjtima),obsGreg:jdToGreg(obsJD+0.5),
    sunAtIjtima:sunPos(jdIjtima),moonAtIjtimaT:moonPos(jdIjtimaT),
    wetonIjtima:getWeton(jdIjtima+tz/24),predGreg,predWtn
  };
}

function renderHilalReport(r) {
  if (r.error) { document.getElementById('hilalOut').innerHTML=`<span style="color:var(--red)">${r.error}</span>`; return; }
  const SEP='═'.repeat(60);
  const latStr=`${r.lat<0?'S':'N'} ${dmsU(Math.abs(r.lat))}`, lngStr=`${r.lng<0?'W':'E'} ${dmsU(Math.abs(r.lng))}`;
  function row(k,v,cls=''){const dots='.'.repeat(Math.max(1,31-k.length));const vc=cls?`<span class="hrv ${cls}">${v}</span>`:`<span class="hrv">${v}</span>`;return`<span style="color:var(--text3)">${k}${dots}</span>${vc}\n`;}
  function sec(t){return`<span class="hrsec">── ${t}</span>\n`;}
  function sep(){return`<span style="color:var(--text3)">${SEP}</span>\n`;}
  const isVis=r.irnu_vis;
  function hParts(h){const hh=Math.floor(h),mm=Math.floor((h-hh)*60),ss=((h-hh)*60-mm)*60;return[hh,mm,ss];}
  const[lhH,lhM,lhS]=hParts(Math.max(0,r.lamaHilal));
  const[uhH,uhM,uhS]=hParts(Math.max(0,r.umurHilal));
  const predStr=r.predGreg?`${r.predWtn}, ${r.predGreg.day} ${MON3[r.predGreg.month-1]} ${r.predGreg.year} M`:'—';
  const odehLbl=r.qOdeh>=5.65?'A — Mudah Terlihat':r.qOdeh>=2?'B — Terlihat':r.qOdeh>=-0.96?'C — Marginal':'D — Tidak Terlihat';
  const odehCls=r.qOdeh>=2?'g':r.qOdeh>=-0.96?'a':'r';
  const html=`<span class="hrsec" style="display:block;text-align:center;font-family:'Cormorant Garamond',serif;font-size:1rem">Awal Bulan ${HM[r.hMonth-1]} ${r.hYear} H</span>
<span style="display:block;text-align:center;color:var(--text2);font-size:.72rem">Al-Fajri — Lembaga Falakiyah PCNU Kencong | Jean Meeus (${MLR.length}+${MB.length} Suku Koreksi)</span>
${sep()}${row('Markaz',r.markaz)}${row('Lintang',latStr)}${row('Bujur',lngStr)}${row('Elevasi',r.elev.toFixed(1)+' mdpl')}${row('Zona Waktu','UTC+'+r.tz)}
${sep()}${sec('DATA IJTIMA')}${row('Tgl Ijtima Geo',`${r.wetonIjtima}, ${r.ijtimaGreg.day} ${MON3[r.ijtimaGreg.month-1]} ${r.ijtimaGreg.year} M`,'gd')}${row('Ijtima Hijriyah Geo',`${jdToHijri(r.jdIjtima).day} ${HM[jdToHijri(r.jdIjtima).month-1]} ${jdToHijri(r.jdIjtima).year} H`)}${row('Bujur Ijtima Geo',dms(r.sunAtIjtima.sunLon))}${row('Bujur Ijtima Topo',dms(r.moonAtIjtimaT.lon))}
${row('Visibilitas',isVis?'👁 VISIBLE':'✗ Not Visible',isVis?'g':'r')}${row('JD Ijtima',r.jdIjtima.toFixed(9))}${row('JD Sunset',r.jdSunset.toFixed(9))}${row('DeltaT',r.dT_s.toFixed(2)+' s')}
${row('Jam Ijtima Geo LT',fmtFull(r.ijtimaGeoLT))}${row('Jam Ijtima Geo UT',fmtFull(r.ijtimaGeoUT))}${row('Jam Ijtima Topo LT',fmtFull(r.ijtimaTopoLT))}${row('Jam Ijtima Topo UT',fmtFull(r.ijtimaTopoUT))}
${sep()}${sec('TERBENAM')}${row('Matahari Terbenam',fmtFull(r.sunsetLT)+' LT','gd')}${row('Hilal Terbenam',r.moonsetLT?fmtFull(r.moonsetLT)+' LT':'—','gd')}
${sep()}${sec('POSISI (TOPO AT SUNSET)')}${row('Bujur Hilal Topo',dms(r.moonG.lon))}${row('Lintang Hilal Topo',dms(r.moonG.lat))}${row('Bujur Matahari Topo',dms(r.sunT.lambda||r.sunG.sunLon))}${row('Hilal RA Topo Hour',hms(r.moonT.RA/15))}${row('Hilal Topo Decli',dms(r.moonT.Dec))}${row('Sun RA Topo Hour',hms(r.sunT.RA/15))}${row('Sun Topo Decli',dms(r.sunT.Dec))}
${sep()}${sec('TINGGI HILAL')}${row('T. Hilal Hakiki/Geo',dms(r.altMoonGeo),'gd')}${row('T. Airless Topo Sun',dms(r.altSunAirless))}
${row('T. Hilal Topo Airless Upper',dms(r.altMoonAirless+r.SD))}${row('T. Hilal Topo Airless Center',dms(r.altMoonAirless),'gd')}${row('T. Hilal Topo Airless Lower',dms(r.altMoonAirless-r.SD))}
${row('T. Hilal Topo Apparent Upper',dms(r.altMoonApparent+r.SD))}${row('T. Hilal Topo Apparent Center',dms(r.altMoonApparent),'gd')}${row('T. Hilal Topo Apparent Lower',dms(r.altMoonApparent-r.SD))}
${row("T. Hilal Mar'i Upper",dms(r.altMoonMari+r.SD))}${row("T. Hilal Mar'i Center",dms(r.altMoonMari),'gd')}${row("T. Hilal Mar'i Lower",dms(r.altMoonMari-r.SD))}
${sep()}${sec('AZIMUTH & ELONGASI')}${row('Az. Matahari',dms(r.sunH.az))}${row('Az. Hilal',dms(r.moonH.az))}${row('Elongasi Hilal Geo',dms(r.elongGeo),'gd')}${row('Elongasi Hilal Topo',dms(r.elongTopo))}
${sep()}${sec('PARAMETER HILAL')}${row('Best Time',fmtFull(r.bestTimeLT)+' LT')}${row('Lama Hilal',`${pZ(lhH)} h ${pZ(lhM)} m ${lhS.toFixed(2).padStart(5,'0')} s`)}${row('Umur Hilal',`${pZ(uhH)}h ${pZ(uhM)}m ${uhS.toFixed(2).padStart(5,'0')}s`)}${row('Az. Ghurub Hilal',dms(r.moonHAtMoonset.az))}${row('Semidiameter Hilal',dms(r.SD))}${row('Horizontal Plx Hilal',dms(r.HP))}${row('Posisi Hilal',`${dmsU(r.posisiDeg)} ${r.posisiDir} Matahari`)}${row('Keadaan Hilal',r.keadaan)}
${sep()}${sec('FOTOMETRI')}${row('Illuminasi Hilal',r.illuminasi.toFixed(2)+' %','gd')}${row('Lebar Hilal (W)',dmsU(r.W_arcsec/3600)+` (${r.W_arcsec.toFixed(2)}″)`)}${row('Nurul Hilal',r.nurulHilal.toFixed(8))}${row('Range q Odeh',r.qOdeh.toFixed(3),odehCls)}${row('ARCV',r.ARCV.toFixed(4)+'°')}${row('Jarak Bumi-Bulan',r.moonG.dist.toFixed(2)+' km')}
${sep()}${sec('KRITERIA VISIBILITAS')}${row("IRNU/NU (T.Mar'i>=3,Elong>=6.4)",r.irnu_vis?'✓ TERPENUHI':'✗ Tidak Terpenuhi',r.irnu_vis?'g':r.irnu_mar?'a':'r')}${row('Wujudul Hilal',r.wujud?'✓ TERPENUHI':'✗ Tidak Terpenuhi',r.wujud?'g':'r')}${row('Odeh 2006',odehLbl,odehCls)}${row('Yallop 1997',(r.qYallop>0.216?'A':r.qYallop>=-0.014?'B':r.qYallop>=-0.160?'C':r.qYallop>=-0.232?'D':'E')+' (q='+r.qYallop.toFixed(4)+')',r.qYallop>=-0.014?'g':r.qYallop>=-0.16?'a':'r')}
${row('Prediksi Kri. IRNU',predStr,'gd')}
${sep()}<span style="display:block;text-align:center;color:var(--text3);font-size:.68rem">Al-Fajri v2.1 — Jean Meeus — Lembaga Falakiyah PCNU Kencong</span>`;
  document.getElementById('hilalOut').innerHTML=html;
  document.getElementById('hilalCritDiv').style.display='block';
  const crits=[
    {name:'IRNU/NU (LF-PBNU 2022)',desc:"T. Mar'i >= 3 DAN Elongasi Geo >= 6.4",res:r.irnu_vis?'Terlihat (Visible)':r.irnu_mar?'Batas (Marginal)':'Tidak Terlihat',cls:r.irnu_vis?'v':r.irnu_mar?'m':'x',det:`T. Mar'i: ${dms(r.altMoonMari)} | Elong: ${dms(r.elongGeo)}`},
    {name:'Wujudul Hilal',desc:'Ijtima sblm sunset & hilal terbenam stlh matahari',res:r.wujud?'Wujud':'Tidak Wujud',cls:r.wujud?'v':'x',det:`Ijtima: ${fmtFull(r.ijtimaGeoLT)} LT | Sunset: ${fmtFull(r.sunsetLT)} LT`},
    {name:'Odeh 2006',desc:'ARCV dan Lebar Hilal (W)',res:odehLbl,cls:odehCls,det:`q=${r.qOdeh.toFixed(3)} | ARCV=${r.ARCV.toFixed(3)} | W=${r.W_arcmin.toFixed(4)}'`},
    {name:'Yallop 1997',desc:'ARCV dan Best Time',res:(r.qYallop>0.216?'A':r.qYallop>=-0.014?'B':r.qYallop>=-0.160?'C':'D/E'),cls:r.qYallop>=-0.014?'v':r.qYallop>=-0.16?'m':'x',det:`q=${r.qYallop.toFixed(5)}`}
  ];
  document.getElementById('hilalCritCards').innerHTML=crits.map(c=>`<div class="ccard"><div class="cname">${c.name}</div><div class="cres ${c.cls}">${c.res}</div><div class="cdet">${c.desc}<br>${c.det}</div></div>`).join('');
}

function doCalcHilal(){
  const hYear=+document.getElementById('hilalYear').value, hMonth=+document.getElementById('hilalMonth').value;
  document.getElementById('hilalOut').innerHTML=`<span style="color:var(--text2)">Menghitung...<span class="sp"></span></span>`;
  document.getElementById('hilalCritDiv').style.display='none';
  setTimeout(()=>{try{renderHilalReport(calcHilal(hYear,hMonth,LAT,LNG,ELEV,TZ));}catch(e){document.getElementById('hilalOut').innerHTML=`<span style="color:var(--red)">Error: ${e.message}</span>`;console.error(e);}},30);
}
