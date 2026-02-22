import chroma from 'chroma-js'

export function hexToRgba(hex, alpha) {
  return chroma(hex).alpha(alpha).css()
}

function addShapeToPath(ctx, sx, sy, size, shape) {
  const s = size
  switch (shape) {
    case 'circle':
      ctx.moveTo(sx + s, sy)
      ctx.arc(sx, sy, s, 0, Math.PI * 2)
      break
    case 'rectangle':
      ctx.rect(sx - s, sy - s, s * 2, s * 2)
      break
    case 'triangle': {
      const r = s * 1.2
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI) / 3 - Math.PI / 2
        const px = sx + r * Math.cos(a)
        const py = sy + r * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }
    case 'pentagon': {
      const r = s * 1.1
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5 - Math.PI / 2
        const px = sx + r * Math.cos(a)
        const py = sy + r * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }
    case 'hexagon': {
      const r = s * 1.05
      for (let i = 0; i < 6; i++) {
        const a = (i * 2 * Math.PI) / 6 - Math.PI / 6
        const px = sx + r * Math.cos(a)
        const py = sy + r * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }
    default:
      ctx.moveTo(sx + s, sy)
      ctx.arc(sx, sy, s, 0, Math.PI * 2)
  }
}

export function drawShape(ctx, sx, sy, size, shape) {
  ctx.beginPath()
  addShapeToPath(ctx, sx, sy, size, shape)
  ctx.fill()
}

export function drawShapesBatch(ctx, points, size, shape) {
  if (points.length === 0) return
  ctx.beginPath()
  for (const [sx, sy] of points) {
    addShapeToPath(ctx, sx, sy, size, shape)
  }
  ctx.fill()
}
