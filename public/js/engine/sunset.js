export function getSunset(date, lat, lon, tz) {
  const rad = Math.PI / 180;

  const N = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86400000
  );

  const lngHour = lon / 15;

  const t = N + ((18 - lngHour) / 24);

  const M = 0.9856 * t - 3.289;

  let L =
    M +
    1.916 * Math.sin(M * rad) +
    0.020 * Math.sin(2 * M * rad) +
    282.634;

  L = (L + 360) % 360;

  let RA =
    Math.atan(0.91764 * Math.tan(L * rad)) / rad;

  RA = (RA + 360) % 360;

  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;

  RA = RA + (Lquadrant - RAquadrant);
  RA /= 15;

  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));

  const cosH =
    (Math.cos(90.833 * rad) -
      sinDec * Math.sin(lat * rad)) /
    (cosDec * Math.cos(lat * rad));

  const H = Math.acos(cosH) / rad / 15;

  const T = H + RA - (0.06571 * t) - 6.622;

  const UT = T - lngHour;

  return UT + tz;
}
