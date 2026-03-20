export function getIllumination(elongation) {
  const rad = Math.PI / 180;
  const illumination = (1 + Math.cos(elongation * rad)) / 2;
  return { phaseAngle: elongation, illumination };
}
