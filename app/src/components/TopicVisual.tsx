// ─── Small illustrations / infographics shown inside the intro topic cards ────
// Every visual reacts to the mouse or a finger dragged across it.

import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

type Lang = 'cs' | 'en'
type Text = { cs: string; en: string }
type Pt = { x: number; y: number }

// Stable pseudo-random points for star fields
function points(seed: number, n: number) {
  let x = seed
  const rnd = () => ((x = (x * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
  return Array.from({ length: n }, () => ({ x: rnd() * 200, y: rnd() * 100, b: rnd() }))
}

const SKY_STARS = points(3, 110)
const PARK_STARS = points(11, 160)

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function lerpColor(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

// Pointer position in the SVG's own viewBox coordinates (null when not hovering)
function useSvgPointer() {
  const ref = useRef<SVGSVGElement>(null)
  const [pos, setPos] = useState<Pt | null>(null)
  const update = (e: PointerEvent<SVGSVGElement>) => {
    const m = ref.current?.getScreenCTM()
    if (!m) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    setPos({ x: p.x, y: p.y })
  }
  const clear = () => setPos(null)
  return { pos, bind: { ref, onPointerMove: update, onPointerDown: update, onPointerLeave: clear, onPointerCancel: clear } }
}

// ─── Card stats (overlaid on the picture) ────────────────────────────────────

const STATS: Record<string, { value: Text; label: Text; pos: string }> = {
  skyglow: {
    pos: 'self-start', value: { cs: '>100×', en: '>100×' },
    label: { cs: 'jasnější obloha v centru velkoměsta', en: 'brighter sky in a big city centre' },
  },
  wildlife: {
    pos: 'self-center', value: { cs: 'až 1/3', en: 'up to 1/3' },
    label: { cs: 'hmyzu přilákaného k lampě do rána uhyne', en: 'of insects drawn to a lamp die by morning' },
  },
  health: {
    pos: 'self-center', value: { cs: '2A', en: '2A' },
    label: { cs: 'noční práce je podle WHO pravděpodobně karcinogenní', en: 'night shift work is probably carcinogenic (WHO)' },
  },
  lighting: {
    pos: 'self-center', value: { cs: '0 %', en: '0%' },
    label: { cs: 'světla jde z plně cloněné lampy do oblohy', en: 'of light goes skyward from a full-cutoff lamp' },
  },
  darksky: {
    pos: 'self-end', value: { cs: '200+', en: '200+' },
    label: { cs: 'certifikovaných míst tmavé oblohy na světě', en: 'certified dark-sky places worldwide' },
  },
}

// Visuals drawn as a night-sky "picture" panel (the rest are plain charts / icon grids).
// Full-bleed ones fill the panel behind the text; the others sit to the right of it.
const PICTURES = new Set(['skyglow', 'wildlife', 'health', 'lighting', 'darksky'])
const FULL_BLEED = new Set(['skyglow', 'darksky'])

const shadow = { textShadow: '0 1px 6px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)' }

export default function TopicVisual({ id, lang }: { id: string; lang: Lang }) {
  if (!PICTURES.has(id)) {
    return (
      <Interactive className="h-full flex items-center justify-center">
        <Visual id={id} lang={lang} />
      </Interactive>
    )
  }
  const stat = STATS[id]
  const fullBleed = FULL_BLEED.has(id)
  return (
    <Interactive className="relative h-full rounded-lg overflow-hidden bg-[#060816] flex">
      {fullBleed && <Visual id={id} lang={lang} />}
      {stat && (
        <div className={`relative ${stat.pos} max-w-[42%] flex-shrink-0 px-4 py-3 pointer-events-none`} style={shadow}>
          <div className="text-3xl font-bold text-amber-400 leading-none">{stat.value[lang]}</div>
          <div className="hidden [@media(min-width:1024px)_and_(min-height:950px)]:block text-slate-100 text-sm leading-snug mt-1">{stat.label[lang]}</div>
        </div>
      )}
      {!fullBleed && (
        <div className="flex-1 min-w-0 h-full p-2 flex items-center justify-center">
          <Visual id={id} lang={lang} />
        </div>
      )}
    </Interactive>
  )
}

// Lets a finger drag across the visual without scrolling the page, and keeps a
// drag from counting as a tap that would open the card's detail.
function Interactive({ className, children }: { className: string; children: ReactNode }) {
  const start = useRef<Pt | null>(null)
  const dragged = useRef(false)
  return (
    <div
      className={className}
      style={{ touchAction: 'none' }}
      onPointerDown={e => {
        // touch pointers are implicitly captured by the touched element; release so
        // hover effects follow the finger across elements
        const t = e.target as Element
        if (t.hasPointerCapture?.(e.pointerId)) t.releasePointerCapture(e.pointerId)
        start.current = { x: e.clientX, y: e.clientY }
        dragged.current = false
      }}
      onPointerMove={e => {
        if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) dragged.current = true
      }}
      onPointerUp={() => { start.current = null }}
      onClickCapture={e => {
        if (dragged.current) {
          e.stopPropagation()
          dragged.current = false
        }
      }}
    >
      {children}
    </div>
  )
}

function Visual({ id, lang }: { id: string; lang: Lang }) {
  switch (id) {
    case 'skyglow':   return <Skyglow />
    case 'energy':    return <Energy lang={lang} />
    case 'types':     return <Types lang={lang} />
    case 'wildlife':  return <Wildlife lang={lang} />
    case 'health':    return <Health lang={lang} />
    case 'astronomy': return <Astronomy lang={lang} />
    case 'lighting':  return <Lighting lang={lang} />
    case 'darksky':   return <DarkSky />
    case 'action':    return <Action lang={lang} />
    default:          return null
  }
}

const svgCls = 'w-full h-full max-h-full'

// ─── Individual visuals ────────────────────────────────────────────────────────

const WINDOWS = [[125, 72], [142, 66], [144, 72], [160, 76], [178, 78], [108, 80], [134, 84], [170, 90]]

// Pointer "switches the lights off" around it, revealing the natural starry sky
function Skyglow() {
  const { pos, bind } = useSvgPointer()
  const near = (x: number, y: number) => pos !== null && Math.hypot(x - pos.x, y - pos.y) < 30
  return (
    <svg {...bind} viewBox="0 0 200 100" className="absolute inset-0 w-full h-full cursor-crosshair" preserveAspectRatio="xMaxYMax slice">
      <defs>
        <radialGradient id="tv-dome" gradientUnits="userSpaceOnUse" cx="145" cy="100" r="105">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#b45309" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#060816" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tv-hole">
          <stop offset="0%" stopColor="#000" />
          <stop offset="55%" stopColor="#000" />
          <stop offset="100%" stopColor="#fff" />
        </radialGradient>
        <mask id="tv-glow-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="100">
          <rect width="200" height="100" fill="#fff" />
          {pos && <circle cx={pos.x} cy={pos.y} r="34" fill="url(#tv-hole)" />}
        </mask>
      </defs>
      {/* natural sky: every star visible */}
      <rect width="200" height="100" fill="#03040c" />
      {SKY_STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={0.5 + s.b * 0.8} fill="#fff" opacity={0.5 + s.b * 0.5} />
      ))}
      {/* light-polluted sky on top, with a hole around the pointer */}
      <g mask="url(#tv-glow-mask)">
        <rect width="200" height="100" fill="#060816" />
        {SKY_STARS.map((s, i) => {
          // stars fade out under the light dome
          const d = Math.hypot(s.x - 145, (s.y - 100) * 1.3)
          const op = clamp((d - 70) / 50, 0, 1) * (0.4 + s.b * 0.6)
          return op > 0.05 && <circle key={i} cx={s.x} cy={s.y} r={0.5 + s.b * 0.7} fill="#fff" opacity={op} />
        })}
        <rect width="200" height="100" fill="url(#tv-dome)" />
      </g>
      <path d="M95 100 V84 H105 V76 H114 V88 H122 V68 H131 V80 H139 V62 H149 V78 H157 V72 H167 V86 H175 V74 H185 V90 H196 V100 Z" fill="#0b0b14" />
      {WINDOWS.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="2" height="2" fill={near(x, y) ? '#1e293b' : '#fcd34d'} />
      ))}
    </svg>
  )
}

function Energy({ lang }: { lang: Lang }) {
  const [hover, setHover] = useState<'waste' | 'useful' | null>(null)
  const r = 34
  const c = 2 * Math.PI * r
  const seg = (key: 'waste' | 'useful') => ({
    onPointerEnter: () => setHover(key),
    onPointerLeave: () => setHover(null),
    strokeWidth: hover === key ? 19 : 14,
    opacity: hover && hover !== key ? 0.35 : 1,
    style: { transition: 'stroke-width 150ms, opacity 150ms', cursor: 'pointer' },
  })
  const center = hover === 'useful'
    ? { value: lang === 'cs' ? '70 %' : '70%', label: lang === 'cs' ? 'užitečně' : 'useful', color: '#cbd5e1' }
    : { value: lang === 'cs' ? '30 %' : '30%', label: lang === 'cs' ? 'zbytečně' : 'wasted', color: '#fbbf24' }
  const legend = (key: 'waste' | 'useful', swatch: string, text: string) => (
    <li className={`flex items-center gap-1.5 transition-opacity ${hover && hover !== key ? 'opacity-40' : ''}`}
      onPointerEnter={() => setHover(key)} onPointerLeave={() => setHover(null)}>
      <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${swatch}`} />{text}
    </li>
  )
  return (
    <div className="h-full flex items-center gap-3">
      <svg viewBox="0 0 100 100" className="h-full max-h-28 w-auto overflow-visible">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#334155" pointerEvents="stroke" {...seg('useful')} />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#fbbf24" pointerEvents="stroke"
          strokeDasharray={`${c * 0.3 - 2} ${c}`} transform="rotate(-90 50 50)" {...seg('waste')} />
        <text x="50" y="52" textAnchor="middle" fill={center.color} fontSize="17" fontWeight="700">{center.value}</text>
        <text x="50" y="64" textAnchor="middle" fill="#94a3b8" fontSize="8">{center.label}</text>
      </svg>
      <ul className="text-sm text-slate-400 space-y-1.5">
        {legend('waste', 'bg-amber-400', lang === 'cs' ? 'zbytečně do oblohy a okolí' : 'wasted to sky and surroundings')}
        {legend('useful', 'bg-slate-600', lang === 'cs' ? 'užitečné světlo' : 'useful light')}
        <li className="pt-1 text-slate-300">{lang === 'cs' ? 'V USA to stojí asi 3 mld. USD ročně.' : 'In the USA this costs about 3 bn USD a year.'}</li>
      </ul>
    </div>
  )
}

function Types({ lang }: { lang: Lang }) {
  const [hover, setHover] = useState<number | null>(null)
  const items: { label: Text; desc: Text; icon: ReactNode }[] = [
    { label: { cs: 'Záře oblohy', en: 'Skyglow' }, desc: { cs: 'Rozsvícená obloha nad městy, viditelná i desítky kilometrů daleko.', en: 'A glowing sky over towns, visible tens of kilometres away.' }, icon: (
      <>
        <path d="M6 36 Q30 2 54 36" fill="#b45309" opacity="0.5" />
        <path d="M18 36 V26 H24 V30 H30 V22 H36 V28 H42 V36 Z" fill="#0b0b14" />
      </>) },
    { label: { cs: 'Oslnění', en: 'Glare' }, desc: { cs: 'Příliš jasné světlo, které oslepuje a snižuje bezpečnost.', en: 'Light so bright it dazzles and reduces safety.' }, icon: (
      <>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4
          return <line key={i} x1={30 + Math.cos(a) * 7} y1={20 + Math.sin(a) * 7} x2={30 + Math.cos(a) * 16} y2={20 + Math.sin(a) * 16} stroke="#fde68a" strokeWidth="1.5" />
        })}
        <circle cx="30" cy="20" r="5" fill="#fef3c7" />
      </>) },
    { label: { cs: 'Světlo do oken', en: 'Light trespass' }, desc: { cs: 'Světlo tam, kde ho nikdo nechce, třeba v ložnici.', en: 'Light where nobody wants it, such as in a bedroom.' }, icon: (
      <>
        <path d="M34 36 V18 L45 10 L56 18 V36 Z" fill="#334155" />
        <rect x="41" y="22" width="7" height="7" fill="#fcd34d" />
        <rect x="9" y="12" width="2" height="24" fill="#64748b" />
        <path d="M11 12 L44 22 L44 29 Z" fill="#fbbf24" opacity="0.35" />
        <circle cx="11" cy="12" r="3" fill="#fde68a" />
      </>) },
    { label: { cs: 'Světelný nepořádek', en: 'Clutter' }, desc: { cs: 'Změť barevných a blikajících světel na jednom místě.', en: 'A jumble of coloured and flashing lights in one place.' }, icon: (
      <>
        {[[10, 12, '#f472b6'], [22, 26, '#60a5fa'], [30, 10, '#fbbf24'], [40, 22, '#34d399'], [50, 12, '#f87171'], [16, 32, '#fde68a'], [46, 32, '#a78bfa'], [30, 30, '#f8fafc']].map(([x, y, c], i) => (
          <circle key={i} cx={x as number} cy={y as number} r="3" fill={c as string} />
        ))}
      </>) },
  ]
  return (
    <div className="relative w-full">
      <div className="grid grid-cols-4 gap-2 w-full">
        {items.map((it, i) => (
          <div key={it.label.en}
            onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}
            className={`flex flex-col items-center gap-1 rounded-lg py-1 transition-all ${hover === i ? 'bg-slate-700/50 scale-110' : ''} ${hover !== null && hover !== i ? 'opacity-40' : ''}`}>
            <svg viewBox="0 0 60 40" className="w-full max-w-16">{it.icon}</svg>
            <span className="text-slate-400 text-[11px] leading-tight text-center">{it.label[lang]}</span>
          </div>
        ))}
      </div>
      {hover !== null && (
        <p className="absolute left-0 right-0 bottom-0 z-10 rounded-lg bg-slate-900/95 border border-slate-600 px-2 py-1 text-slate-200 text-xs leading-snug text-center pointer-events-none">
          {items[hover].desc[lang]}
        </p>
      )}
    </div>
  )
}

const INSECTS = Array.from({ length: 18 }, (_, i) => {
  const a = i * 2.4
  const r = 10 + (i % 4) * 7
  return { x: 100 + Math.cos(a) * r * 1.4, y: 30 + Math.sin(a) * r * 0.8 }
})

// Pointer x sets the lamp's colour temperature: cold white lamps attract far more insects
function Wildlife({ lang }: { lang: Lang }) {
  const { pos, bind } = useSvgPointer()
  const t = pos ? clamp((pos.x - 30) / 140, 0, 1) : 0.35
  const kelvin = Math.round((6500 - t * 4700) / 100) * 100
  const lamp = lerpColor('#e6eeff', '#ff9a3c', t)
  const count = Math.round(18 - t * 15)
  return (
    <svg {...bind} viewBox="0 0 200 100" className={`${svgCls} cursor-ew-resize`}>
      <defs>
        <radialGradient id="tv-lamp">
          <stop offset="0%" stopColor={lamp} stopOpacity="0.7" />
          <stop offset="100%" stopColor={lamp} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="100" fill="transparent" />
      <circle cx="100" cy="30" r="45" fill="url(#tv-lamp)" />
      <rect x="98.5" y="32" width="3" height="68" fill="#64748b" />
      <circle cx="100" cy="30" r="6" fill={lamp} />
      {INSECTS.slice(0, count).map((p, i) => (
        <g key={i}>
          <animateTransform attributeName="transform" type="rotate" from="0 100 30" to={`${i % 2 ? 360 : -360} 100 30`}
            dur={`${2.5 + (i % 5) * 0.8}s`} repeatCount="indefinite" />
          <g transform={`translate(${p.x} ${p.y}) rotate(${i * 40})`}>
            <ellipse cx="-1.6" cy="0" rx="1.8" ry="1" fill="#cbd5e1" />
            <ellipse cx="1.6" cy="0" rx="1.8" ry="1" fill="#cbd5e1" />
          </g>
        </g>
      ))}
      {[[20, 20], [34, 14], [28, 30], [170, 18], [182, 28]].map(([x, y], i) => (
        <path key={i} d={`M${x - 5} ${y - 2} Q${x - 2} ${y - 3} ${x} ${y} Q${x + 2} ${y - 3} ${x + 5} ${y - 2}`} fill="none" stroke="#94a3b8" strokeWidth="1.2" />
      ))}
      <text x="108" y="70" fill={lamp} fontSize="10" fontWeight="700">{kelvin.toLocaleString(lang === 'cs' ? 'cs-CZ' : 'en-US')} K</text>
      <text x="108" y="80" fill="#94a3b8" fontSize="7">{lang === 'cs' ? 'hmyz u lampy' : 'insects at the lamp'}: {count}</text>
    </svg>
  )
}

// Qualitative melatonin profile; h = hours after 18:00
const hX = (h: number) => 20 + (h / 14) * 175
const melDark = (h: number) => 78 - 62 * Math.exp(-(((h - 9) / 3.2) ** 2))
const melLit = (h: number) => 78 - 26 * Math.exp(-(((h - 10.5) / 2.4) ** 2))
const curve = (f: (h: number) => number) =>
  Array.from({ length: 57 }, (_, i) => {
    const h = (i * 14) / 56
    return `${i ? 'L' : 'M'}${hX(h).toFixed(1)} ${f(h).toFixed(1)}`
  }).join(' ')
const DARK_PATH = curve(melDark)
const LIT_PATH = curve(melLit)

function Health({ lang }: { lang: Lang }) {
  const { pos, bind } = useSvgPointer()
  const h = pos ? clamp((pos.x - 20) / 175, 0, 1) * 14 : null
  const clock = h === null ? '' : (() => {
    const total = Math.round(((18 + h) % 24) * 4) / 4
    const hh = Math.floor(total) % 24
    const mm = Math.round((total - Math.floor(total)) * 60)
    return `${hh}:${mm.toString().padStart(2, '0')}`
  })()
  return (
    <div className="h-full w-full flex flex-col min-h-0">
      <svg {...bind} viewBox="0 0 200 92" className="w-full flex-1 min-h-0 cursor-crosshair">
        <rect width="200" height="92" fill="transparent" />
        <line x1="20" y1="80" x2="195" y2="80" stroke="#475569" strokeWidth="0.8" />
        {[[0, '18:00'], [6, '0:00'], [12, '6:00']].map(([hh, label]) => (
          <text key={label} x={hX(hh as number)} y="90" textAnchor="middle" fill="#64748b" fontSize="8">{label}</text>
        ))}
        <text x="4" y="45" fill="#64748b" fontSize="7" transform="rotate(-90 8 45)">melatonin</text>
        <path d={DARK_PATH} fill="none" stroke="#7dd3fc" strokeWidth="2" />
        <path d={LIT_PATH} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" />
        {h !== null && (
          <g pointerEvents="none">
            <line x1={hX(h)} y1="8" x2={hX(h)} y2="80" stroke="#94a3b8" strokeWidth="0.6" />
            <circle cx={hX(h)} cy={melDark(h)} r="2.8" fill="#7dd3fc" stroke="#060816" strokeWidth="1" />
            <circle cx={hX(h)} cy={melLit(h)} r="2.8" fill="#fbbf24" stroke="#060816" strokeWidth="1" />
            <text x={hX(h)} y="6" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="700">{clock}</text>
          </g>
        )}
      </svg>
      <div className="flex gap-4 text-[11px] text-slate-400 justify-center">
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-sky-300" />{lang === 'cs' ? 've tmě' : 'in darkness'}</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-amber-400" />{lang === 'cs' ? 'se světlem v noci' : 'with light at night'}</span>
      </div>
    </div>
  )
}

function Astronomy({ lang }: { lang: Lang }) {
  const [hover, setHover] = useState<number | null>(null)
  const rows: { label: Text; pct: number; ratio: Text }[] = [
    { label: { cs: 'Svět', en: 'World' }, pct: 33, ratio: { cs: '1 ze 3', en: '1 in 3' } },
    { label: { cs: 'Evropa', en: 'Europe' }, pct: 60, ratio: { cs: '6 z 10', en: '6 in 10' } },
    { label: { cs: 'Severní Amerika', en: 'North America' }, pct: 80, ratio: { cs: '8 z 10', en: '8 in 10' } },
  ]
  return (
    <div className="w-full">
      <div className="text-slate-400 text-xs mb-1.5">{lang === 'cs' ? 'Podíl lidí, kteří z domova nevidí Mléčnou dráhu' : 'Share of people who cannot see the Milky Way from home'}</div>
      <div className="space-y-1">
        {rows.map((r, i) => (
          <div key={r.label.en}
            onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}
            className={`flex items-center gap-2 rounded px-1 transition-all ${hover === i ? 'bg-slate-700/50' : ''} ${hover !== null && hover !== i ? 'opacity-40' : ''}`}>
            <span className="w-28 text-slate-300 text-xs flex-shrink-0">{r.label[lang]}</span>
            <div className="flex-1 h-3 rounded bg-slate-700/60 overflow-hidden">
              <div className={`h-full rounded transition-colors ${hover === i ? 'bg-amber-300' : 'bg-amber-400'}`} style={{ width: `${r.pct}%` }} />
            </div>
            <span className="w-14 text-right text-white text-sm font-semibold tabular-nums whitespace-nowrap">
              {hover === i ? r.ratio[lang] : `${r.pct} %`}
            </span>
          </div>
        ))}
      </div>
      <div className="text-slate-500 text-[10px] mt-1">Falchi et al. 2016</div>
    </div>
  )
}

function MiniLamp({ shielded, x, state }: { shielded: boolean; x: number; state: 'active' | 'dim' | 'idle' }) {
  const angles = shielded ? [30, 50, 70, 90, 110, 130, 150] : Array.from({ length: 12 }, (_, i) => i * 30)
  const len = state === 'active' ? 36 : 30
  return (
    <g opacity={state === 'dim' ? 0.3 : 1} style={{ transition: 'opacity 150ms' }}>
      {angles.map(a => {
        const r = (a * Math.PI) / 180
        return <line key={a} x1={x} y1="30" x2={x + Math.cos(r) * len} y2={30 + Math.sin(r) * len}
          stroke={a > 180 ? '#f87171' : '#fbbf24'} strokeWidth={state === 'active' ? 2 : 1.4} strokeLinecap="round" opacity="0.85" />
      })}
      <rect x={x - 1} y="33" width="2" height="62" fill="#64748b" />
      {shielded
        ? <path d={`M${x - 10} 27 H${x + 10} L${x + 7} 32 H${x - 7} Z`} fill="#94a3b8" />
        : <circle cx={x} cy="30" r="5" fill="#fde68a" />}
    </g>
  )
}

function Lighting({ lang }: { lang: Lang }) {
  const { pos, bind } = useSvgPointer()
  const active = pos ? (pos.x < 100 ? 'globe' : 'cutoff') : null
  const state = (key: 'globe' | 'cutoff') => (active === null ? 'idle' : active === key ? 'active' : 'dim')
  const globeLabel = active === 'globe'
    ? (lang === 'cs' ? '✗ ~50 % světla do oblohy' : '✗ ~50% of light to the sky')
    : (lang === 'cs' ? '✗ kulová lampa' : '✗ globe lamp')
  const cutoffLabel = active === 'cutoff'
    ? (lang === 'cs' ? '✓ 0 % světla do oblohy' : '✓ 0% of light to the sky')
    : (lang === 'cs' ? '✓ plná clona' : '✓ full cutoff')
  return (
    <svg {...bind} viewBox="0 0 200 100" className={`${svgCls} cursor-pointer`}>
      <rect width="200" height="100" fill="transparent" />
      <line x1="0" y1="30" x2="200" y2="30" stroke="#475569" strokeDasharray="2 3" strokeWidth="0.6" />
      <MiniLamp shielded={false} x={55} state={state('globe')} />
      <MiniLamp shielded x={145} state={state('cutoff')} />
      <text x="55" y="99" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight={active === 'globe' ? 700 : 400}>{globeLabel}</text>
      <text x="145" y="99" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight={active === 'cutoff' ? 700 : 400}>{cutoffLabel}</text>
    </svg>
  )
}

// Stars near the pointer light up as if seen through binoculars
function DarkSky() {
  const { pos, bind } = useSvgPointer()
  return (
    <svg {...bind} viewBox="0 0 200 100" className="absolute inset-0 w-full h-full cursor-crosshair" preserveAspectRatio="xMidYMax slice">
      <defs>
        <filter id="tv-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <rect width="200" height="100" fill="#03040c" />
      <ellipse cx="100" cy="50" rx="110" ry="11" fill="#c7d2fe" opacity="0.3" filter="url(#tv-blur)" transform="rotate(-25 100 50)" />
      {pos && <circle cx={pos.x} cy={pos.y} r="24" fill="#c7d2fe" opacity="0.08" />}
      {PARK_STARS.map((s, i) => {
        const d = pos ? Math.hypot(s.x - pos.x, s.y - pos.y) : Infinity
        const boost = d < 24 ? 1 - d / 24 : 0
        return (
          <circle key={i} cx={s.x} cy={s.y} r={(0.35 + s.b * 0.8) * (1 + boost * 1.6)}
            fill={boost > 0 ? '#e0e7ff' : '#fff'} opacity={Math.min(1, 0.35 + s.b * 0.65 + boost)} />
        )
      })}
      <path d="M0 100 L0 80 L25 66 L45 78 L70 58 L95 76 L120 62 L150 80 L175 68 L200 78 L200 100 Z" fill="#05050b" />
    </svg>
  )
}

function Action({ lang }: { lang: Lang }) {
  const tips: { icon: string; text: Text }[] = [
    { icon: '⬇️', text: { cs: 'Svítit jen dolů', en: 'Shine downward' } },
    { icon: '🟠', text: { cs: 'Teplá barva do 3 000 K', en: 'Warm colour, max 3,000 K' } },
    { icon: '⏱️', text: { cs: 'Čidlo nebo časovač', en: 'Sensor or timer' } },
    { icon: '🪟', text: { cs: 'Zatáhnout žaluzie', en: 'Close the blinds' } },
  ]
  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      {tips.map(t => (
        <div key={t.text.en} className="flex items-center gap-2 rounded-lg bg-slate-900/50 border border-slate-700/60 px-2 py-1.5 transition-all hover:scale-[1.04] hover:border-amber-400/70 hover:bg-slate-800">
          <span className="text-lg leading-none">{t.icon}</span>
          <span className="text-slate-300 text-xs leading-tight">{t.text[lang]}</span>
        </div>
      ))}
    </div>
  )
}
