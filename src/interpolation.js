import * as d3 from 'd3-shape'

const CURVES = {
  'Linear': d3.curveLinear,
  'Natural cubic': d3.curveNatural,
  'Catmull-Rom': d3.curveCatmullRom,
  'Monotone X': d3.curveMonotoneX,
  'Cardinal (t=0)': d3.curveCardinal.tension(0),
  'Cardinal (t=0.5)': d3.curveCardinal.tension(0.5),
  'Basis': d3.curveBasis,
}

export function getCurveInterpolator(name) {
  return CURVES[name] || d3.curveNatural
}

export function getInterpolationNames() {
  return Object.keys(CURVES)
}

export function curvePath(coords, curveName) {
  const curve = getCurveInterpolator(curveName)
  const line = d3.line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(curve)
  return line(coords)
}
