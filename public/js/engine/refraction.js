export function getRefraction(alt) {
  const rad = Math.PI / 180;

  if (alt > -1 && alt < 90) {
    const R =
      1.02 / Math.tan((alt + 10.3 / (alt + 5.11)) * rad);
    return R / 60; // derajat
  }
  return 0;
}
