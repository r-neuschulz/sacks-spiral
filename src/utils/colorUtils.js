import chroma from 'chroma-js'
import { Vibrant } from 'node-vibrant/browser'

/**
 * Extracts the dominant color from a canvas element using node-vibrant.
 * Returns a hex string or null.
 */
export async function extractDominantColor(canvas) {
  if (!canvas?.width || !canvas?.height) return null
  try {
    const url = canvas.toDataURL('image/png')
    const palette = await Vibrant.from(url).getPalette()
    return palette.Vibrant?.hex ?? palette.Muted?.hex ?? null
  } catch {
    return null
  }
}

function darken(hex, factor) {
  return chroma.mix(hex, '#000000', 1 - factor, 'rgb')
}

/**
 * Derives theme CSS variable values from a base accent color.
 * Glass variables use darker variants of the accent for sufficient contrast.
 */
export function accentToThemeVariables(hex) {
  if (!hex) return {}
  const c = chroma(hex)
  const [r, g, b] = c.rgb()
  const deep = darken(hex, 0.08).rgb()
  const bg = darken(hex, 0.18).rgb()
  const bgHover = darken(hex, 0.28).rgb()
  const border = darken(hex, 0.28).rgb()
  const hsl = c.css('hsl').match(/[\d.]+/g)
  const hslStr = hsl ? `${hsl[0]} ${hsl[1]}% ${hsl[2]}%` : null
  const vars = {
    '--theme-accent': hex,
    '--theme-accent-rgb': `${r}, ${g}, ${b}`,
    '--theme-accent-muted': c.alpha(0.5).css(),
    '--theme-accent-subtle': c.alpha(0.2).css(),
    '--glass-bg': `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, 0.5)`,
    '--glass-bg-deep': `rgba(${deep[0]}, ${deep[1]}, ${deep[2]}, 0.88)`,
    '--glass-bg-hover': `rgba(${bgHover[0]}, ${bgHover[1]}, ${bgHover[2]}, 0.65)`,
    '--glass-bg-dropdown': `rgba(${deep[0]}, ${deep[1]}, ${deep[2]}, 0.98)`,
    '--glass-border': `rgba(${border[0]}, ${border[1]}, ${border[2]}, 0.75)`,
  }
  if (hslStr) {
    vars['--primary'] = hslStr
    vars['--primary-foreground'] = '220 18% 8%'
  }
  return vars
}
