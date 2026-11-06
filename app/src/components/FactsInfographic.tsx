// ─── Facts & infographic section shown below the introduction ─────────────────

import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

type Lang = 'cs' | 'en'
type Text = { cs: string; en: string }

// ─── Seeded random (stable star fields between renders) ──────────────────────

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Star magnitudes follow N(<m) ∝ 10^(0.45 m) — roughly how star counts grow with
// limiting magnitude — so each brighter Bortle class hides most of the faint stars.
const STAR_FIELD = (() => {
  const rnd = mulberry32(42)
  return Array.from({ length: 220 }, () => ({
    x: rnd() * 100,
    y: rnd() * 60,
    m: 8 + Math.log10(1 - rnd()) / 0.45,
  }))
})()

// Kyba et al. 2023: 250 stars visible at birth → ~100 by age 18
const LOST_STARS = (() => {
  const rnd = mulberry32(7)
  const idx = Array.from({ length: 250 }, (_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return new Set(idx.slice(0, 150))
})()

// ─── Content data ─────────────────────────────────────────────────────────────

const HEAD: Record<string, Text> = {
  title:      { cs: 'Světelné znečištění v číslech', en: 'Light pollution by the numbers' },
  subtitle:   { cs: 'Fakta z vědeckých studií a satelitních měření', en: 'Facts from scientific studies and satellite measurements' },
  world:      { cs: 'Svět pod umělým světlem', en: 'A world under artificial light' },
  stars:      { cs: 'Hvězdy, které mizí', en: 'Disappearing stars' },
  bortle:     { cs: 'Bortleova stupnice: co na obloze uvidíte', en: 'The Bortle scale: what you can see' },
  bortleNote: { cs: 'Ilustrace ukazuje jen hvězdy jasnější než mezní hvězdná velikost dané třídy. Klikněte na třídu a zobrazte ji na obloze.', en: 'Each panel shows only stars brighter than the limiting magnitude of that class. Click a class to display it on the sky.' },
  nelm:       { cs: 'mezní mag.', en: 'limit. mag.' },
  color:      { cs: 'Na barvě světla záleží', en: 'The colour of light matters' },
  shield:     { cs: 'Kam míří světlo', en: 'Where the light goes' },
  nature:     { cs: 'Noc pro život', en: 'Night is for life' },
  timeline:   { cs: 'Jak jsme se učili chránit tmu', en: 'How we learned to protect the dark' },
  sources:    { cs: 'Zdroje', en: 'Sources' },
}

type Stat = { value: Text; label: Text; source: string }

const WORLD_STATS: Stat[] = [
  {
    value: { cs: '83 %', en: '83%' },
    label: { cs: 'světové populace žije pod světelně znečištěnou oblohou', en: 'of the world\'s population lives under light-polluted skies' },
    source: 'Falchi et al. 2016',
  },
  {
    value: { cs: '99 %', en: '99%' },
    label: { cs: 'obyvatel Evropy a USA už nemá přirozeně tmavou noční oblohu', en: 'of people in Europe and the USA no longer have a naturally dark night sky' },
    source: 'Falchi et al. 2016',
  },
  {
    value: { cs: '1/3', en: '1/3' },
    label: { cs: 'lidstva nevidí Mléčnou dráhu. V Evropě je to 60 % lidí, v Severní Americe téměř 80 %', en: 'of humanity cannot see the Milky Way, including 60% of Europeans and nearly 80% of North Americans' },
    source: 'Falchi et al. 2016',
  },
  {
    value: { cs: '+9,6 %', en: '+9.6%' },
    label: { cs: 'ročně zjasňuje noční obloha podle pozorování dobrovolníků z celého světa', en: 'per year: how fast the night sky is brightening, according to volunteer observers worldwide' },
    source: 'Kyba et al. 2023',
  },
  {
    value: { cs: '+2,2 %', en: '+2.2%' },
    label: { cs: 'ročně přibývá umělé osvětlené plochy Země (satelitní měření 2012–2016)', en: 'per year: growth of artificially lit area of Earth (satellite data 2012–2016)' },
    source: 'Kyba et al. 2017',
  },
  {
    value: { cs: '~30 %', en: '~30%' },
    label: { cs: 'venkovního osvětlení v USA svítí zbytečně, což stojí odhadem 3 miliardy USD ročně', en: 'of outdoor lighting in the USA is wasted, costing an estimated 3 billion USD a year' },
    source: 'DarkSky International',
  },
]

const NATURE_STATS: Stat[] = [
  {
    value: { cs: '30 %', en: '30%' },
    label: { cs: 'obratlovců a přes 60 % bezobratlých živočichů je aktivních hlavně v noci', en: 'of vertebrates and over 60% of invertebrates are active mainly at night' },
    source: 'Hölker et al. 2010',
  },
  {
    value: { cs: 'až 1 mld.', en: 'up to 1 bn' },
    label: { cs: 'ptáků ročně zahyne v USA nárazem do budov (odhad 365–988 milionů); tažné ptáky v noci lákají osvětlená okna', en: 'birds die each year in the USA from building collisions (estimate 365–988 million); lit windows lure night migrants' },
    source: 'Loss et al. 2014',
  },
  {
    value: { cs: 'až 1/3', en: 'up to 1/3' },
    label: { cs: 'hmyzu přilákaného k pouliční lampě do rána uhyne vyčerpáním nebo jako kořist', en: 'of insects attracted to a street lamp die by morning from exhaustion or predation' },
    source: 'Eisenbeis 2006',
  },
  {
    value: { cs: '2A', en: '2A' },
    label: { cs: 'Noční práce narušující cirkadiánní rytmus je podle WHO/IARC „pravděpodobně karcinogenní“', en: 'Night shift work disrupting the circadian rhythm is “probably carcinogenic” according to WHO/IARC' },
    source: 'IARC 2007, 2019',
  },
]

const BORTLE: { cls: number; lo: number; hi: number; cs: { name: string; see: string }; en: { name: string; see: string } }[] = [
  { cls: 1, lo: 7.6, hi: 8.0,
    cs: { name: 'Vynikající tmavá lokalita', see: 'Zvířetníkové světlo, protisvit i světélkování atmosféry; galaxie M33 snadno pouhým okem' },
    en: { name: 'Excellent dark site', see: 'Zodiacal light, gegenschein and airglow; galaxy M33 easy with the naked eye' } },
  { cls: 2, lo: 7.1, hi: 7.5,
    cs: { name: 'Typická tmavá lokalita', see: 'Letní Mléčná dráha s bohatou strukturou; mraky jsou jen černé siluety' },
    en: { name: 'Typical dark site', see: 'Highly structured summer Milky Way; clouds are only dark silhouettes' } },
  { cls: 3, lo: 6.6, hi: 7.0,
    cs: { name: 'Venkovská obloha', see: 'Mléčná dráha stále výrazná; u obzoru první světelné kopule' },
    en: { name: 'Rural sky', see: 'Milky Way still striking; first light domes near the horizon' } },
  { cls: 4, lo: 6.1, hi: 6.5,
    cs: { name: 'Přechod venkov – předměstí', see: 'Mléčná dráha viditelná, ale bez jemných detailů; kopule v několika směrech' },
    en: { name: 'Rural/suburban transition', see: 'Milky Way visible but lacks detail; light domes in several directions' } },
  { cls: 5, lo: 5.6, hi: 6.0,
    cs: { name: 'Předměstská obloha', see: 'Mléčná dráha slabá, u obzoru mizí; mraky jsou jasnější než obloha' },
    en: { name: 'Suburban sky', see: 'Milky Way weak, washed out near the horizon; clouds brighter than the sky' } },
  { cls: 6, lo: 5.1, hi: 5.5,
    cs: { name: 'Jasná předměstská obloha', see: 'Mléčná dráha jen slabě v zenitu; obloha u obzoru šedobílá' },
    en: { name: 'Bright suburban sky', see: 'Milky Way only faintly at the zenith; grey-white glow near the horizon' } },
  { cls: 7, lo: 4.6, hi: 5.0,
    cs: { name: 'Přechod předměstí – město', see: 'Mléčná dráha neviditelná; celá obloha šedavá' },
    en: { name: 'Suburban/urban transition', see: 'Milky Way invisible; the whole sky is greyish' } },
  { cls: 8, lo: 4.1, hi: 4.5,
    cs: { name: 'Městská obloha', see: 'Obloha šedá až oranžová, dají se číst novinové titulky; slabší souhvězdí nepoznáte' },
    en: { name: 'City sky', see: 'Grey to orange sky, bright enough to read headlines; fainter constellations unrecognisable' } },
  { cls: 9, lo: 0, hi: 4.0,
    cs: { name: 'Obloha velkoměsta', see: 'Jen Měsíc, planety a několik nejjasnějších hvězd' },
    en: { name: 'Inner-city sky', see: 'Only the Moon, planets and a few of the brightest stars' } },
]

const SPECTRUM_STOPS: [number, string][] = [
  [380, '#61007d'], [420, '#6a00ff'], [450, '#0046ff'], [480, '#00c0ff'], [510, '#00ff5a'],
  [540, '#7dff00'], [570, '#e6ff00'], [590, '#ffc800'], [610, '#ff7a00'], [650, '#ff1a00'], [750, '#610000'],
]

const SPECTRUM_MARKS: { nm: number; label: Text }[] = [
  { nm: 450, label: { cs: 'modrá špička bílých LED', en: 'blue peak of white LEDs' } },
  { nm: 480, label: { cs: 'max. citlivost melanopsinu, potlačuje tvorbu melatoninu', en: 'melanopsin peak, suppresses melatonin' } },
  { nm: 589, label: { cs: 'sodíková výbojka', en: 'sodium lamp' } },
]

// Approximate blackbody colours for the given correlated colour temperatures
const CCT: { k: number; color: string; label: Text; note: Text; ok: boolean }[] = [
  { k: 6500, color: '#fff9fd', ok: false, label: { cs: 'denní bílá', en: 'daylight white' },        note: { cs: 'nejvíce modré, nevhodné venku', en: 'most blue, unsuitable outdoors' } },
  { k: 4000, color: '#ffd1a3', ok: false, label: { cs: 'neutrální bílá', en: 'neutral white' },     note: { cs: 'běžné starší LED lampy', en: 'common older LED lamps' } },
  { k: 3000, color: '#ffb46b', ok: true,  label: { cs: 'teplá bílá', en: 'warm white' },            note: { cs: 'horní hranice dle DarkSky', en: 'DarkSky upper limit' } },
  { k: 2200, color: '#ff9d3f', ok: true,  label: { cs: 'jantarová (PC Amber)', en: 'amber (PC Amber)' }, note: { cs: 'doporučeno v přírodě', en: 'recommended near nature' } },
]

const TIMELINE: { year: string; text: Text }[] = [
  { year: '1879', text: { cs: 'Edison předvádí praktickou žárovku. Začíná éra elektrického osvětlení.', en: 'Edison demonstrates a practical light bulb, and the era of electric lighting begins.' } },
  { year: '1958', text: { cs: 'Flagstaff (Arizona) přijímá první vyhlášku omezující venkovní osvětlení na světě.', en: 'Flagstaff, Arizona adopts the world\'s first outdoor lighting ordinance.' } },
  { year: '1988', text: { cs: 'Vzniká International Dark-Sky Association (dnes DarkSky International).', en: 'The International Dark-Sky Association (now DarkSky International) is founded.' } },
  { year: '2001', text: { cs: 'Flagstaff se stává prvním „městem tmavé oblohy“ na světě.', en: 'Flagstaff becomes the world\'s first International Dark Sky City.' } },
  { year: '2002', text: { cs: 'Česko jako první země na světě zakotvuje světelné znečištění v celostátním zákoně (o ochraně ovzduší).', en: 'Czechia becomes the first country to address light pollution in national law (Clean Air Act).' } },
  { year: '2009', text: { cs: 'Vzniká česko-polská Jizerská oblast tmavé oblohy; později přibyly např. Beskydská a Manětínská.', en: 'The Czech-Polish Izera Dark Sky Park is established; Beskydy and Manětín followed later.' } },
  { year: '2016', text: { cs: 'Vychází Nový světový atlas jasu noční oblohy založený na satelitních datech.', en: 'The New World Atlas of Artificial Night Sky Brightness is published.' } },
  { year: '2023', text: { cs: 'Data projektu Globe at Night ukazují zjasňování oblohy o 9,6 % ročně.', en: 'Globe at Night data reveal the sky brightening by 9.6% per year.' } },
]

const SOURCES = [
  'Falchi F. et al. (2016): The new world atlas of artificial night sky brightness. Science Advances 2, e1600377.',
  'Kyba C. C. M. et al. (2023): Citizen scientists report global rapid reductions in the visibility of stars from 2011 to 2022. Science 379, 265–268.',
  'Kyba C. C. M. et al. (2017): Artificially lit surface of Earth at night increasing in radiance and extent. Science Advances 3, e1701528.',
  'Hölker F. et al. (2010): The dark side of light. Trends in Ecology & Evolution 25, 681–682.',
  'Loss S. R. et al. (2014): Bird–building collisions in the United States. The Condor 116, 8–23.',
  'Eisenbeis G. (2006): Artificial night lighting and insects. In: Ecological Consequences of Artificial Night Lighting, Island Press.',
  'IARC Monographs Vol. 98 (2007) a Vol. 124 (2019): Night shift work.',
  'Bortle J. E. (2001): Introducing the Bortle Dark-Sky Scale. Sky & Telescope, únor 2001.',
  'DarkSky International (dříve IDA): darksky.org',
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, lang: Lang) {
  const s = n.toFixed(1)
  return lang === 'cs' ? s.replace('.', ',') : s
}

function lerpColor(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function FactsInfographic({ lang, onBortle }: { lang: Lang; onBortle: (cls: number) => void }) {
  const tx = (t: Text) => t[lang]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-16 flex flex-col gap-14">

      <header className="text-center">
        <h2 className="text-3xl font-bold text-white">{tx(HEAD.title)}</h2>
        <p className="text-slate-400 mt-1">{tx(HEAD.subtitle)}</p>
      </header>

      {/* ── World stats ── */}
      <Section title={tx(HEAD.world)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORLD_STATS.map(s => <StatTile key={s.label.en} stat={s} lang={lang} accent="#fbbf24" />)}
        </div>
      </Section>

      {/* ── Disappearing stars ── */}
      <Section title={tx(HEAD.stars)}>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <StarGrid label={lang === 'cs' ? '250 hvězd, z nichž 150 zhaslo' : '250 stars, 150 of which have faded'} />
            <div className="flex gap-6 mt-3 text-sm text-slate-400">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-50" />{lang === 'cs' ? 'viditelné v 18 letech' : 'visible at age 18'}</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-700" />{lang === 'cs' ? 'zmizelé' : 'lost'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-5 lg:w-80">
            <p className="text-slate-300 leading-snug">
              {lang === 'cs'
                ? 'Dítě narozené tam, kde je na obloze vidět 250 hvězd, jich ve svých 18 letech uvidí jen asi 100.'
                : 'A child born where 250 stars are visible would see only about 100 by the age of 18.'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat value="×2" label={lang === 'cs' ? 'jas oblohy za 8 let' : 'sky brightness in 8 years'} />
              <MiniStat value="×5" label={lang === 'cs' ? 'jas oblohy za 18 let' : 'sky brightness in 18 years'} />
            </div>
            <p className="text-slate-500 text-xs">{lang === 'cs' ? 'Při tempu +9,6 % ročně. ' : 'At +9.6% per year. '}Kyba et al. 2023</p>
          </div>
        </div>
      </Section>

      {/* ── Bortle scale ── */}
      <Section title={tx(HEAD.bortle)} note={tx(HEAD.bortleNote)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BORTLE.map(b => <BortlePanel key={b.cls} b={b} lang={lang} nelmLabel={tx(HEAD.nelm)} onClick={() => onBortle(b.cls)} />)}
        </div>
        <p className="text-slate-400 text-sm mt-4 leading-snug">
          {lang === 'cs'
            ? 'Na opravdu tmavé obloze uvidíte pouhým okem až několik tisíc hvězd, v centru velkoměsta jen desítky. Jas oblohy se měří v magnitudách na čtvereční úhlovou vteřinu: přirozená obloha má asi 22 mag/″², rozdíl 5 magnitud znamená 100× jasnější oblohu.'
            : 'Under a truly dark sky you can see several thousand stars with the naked eye; in a city centre only a few dozen. Sky brightness is measured in magnitudes per square arcsecond: a natural sky is about 22 mag/″², and a difference of 5 magnitudes means a 100× brighter sky.'}
        </p>
      </Section>

      {/* ── Colour of light ── */}
      <Section title={tx(HEAD.color)}>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 flex flex-col gap-8">
          <Spectrum lang={lang} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CCT.map(c => (
              <div key={c.k} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: c.color, boxShadow: `0 0 18px ${c.color}80` }} />
                <div className="min-w-0">
                  <div className="text-white font-semibold">{c.k.toLocaleString(lang === 'cs' ? 'cs-CZ' : 'en-US')} K</div>
                  <div className="text-slate-300 text-sm leading-tight">{tx(c.label)}</div>
                  <div className={`text-xs leading-tight mt-0.5 ${c.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{c.ok ? '✓' : '✗'} {tx(c.note)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300 leading-snug">
            <Fact value="3×" text={lang === 'cs'
              ? 'víc se v atmosféře rozptýlí modré světlo (450 nm) než oranžové (600 nm). Rayleighův rozptyl roste se 4. mocninou frekvence.'
              : 'more scattering of blue light (450 nm) than orange (600 nm) in the atmosphere. Rayleigh scattering grows with the 4th power of frequency.'} />
            <Fact value="480 nm" text={lang === 'cs'
              ? 'Na modrozelené světlo reagují buňky sítnice s melanopsinem, které řídí vnitřní hodiny a tvorbu melatoninu.'
              : 'Blue-green light triggers melanopsin cells in the retina that drive the body clock and melatonin production.'} />
            <Fact value="UV" text={lang === 'cs'
              ? 'Hmyz nejvíc přitahuje ultrafialové a modré světlo. Teplé jantarové lampy lákají výrazně méně druhů.'
              : 'Insects are most attracted by ultraviolet and blue light. Warm amber lamps attract far fewer species.'} />
          </div>
        </div>
      </Section>

      {/* ── Shielding ── */}
      <Section title={tx(HEAD.shield)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LampCard lang={lang} shielded={false} />
          <LampCard lang={lang} shielded />
        </div>
        <p className="text-slate-400 text-sm mt-4 leading-snug">
          {lang === 'cs'
            ? 'I u cloněného svítidla se část světla odrazí od povrchu zpět k nebi: asfalt odráží asi 10 % světla, čerstvý sníh až 90 %. Proto v zimě se sněhem září města mnohem víc. I proto má smysl svítit jen tolik, kolik je opravdu potřeba.'
            : 'Even with a shielded fixture, some light reflects off the ground back to the sky: asphalt reflects about 10% of light, fresh snow up to 90%. That is why cities glow much more in snowy winters, and why it pays to light only as much as really needed.'}
        </p>
      </Section>

      {/* ── Nature & health ── */}
      <Section title={tx(HEAD.nature)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NATURE_STATS.map(s => <StatTile key={s.label.en} stat={s} lang={lang} accent="#34d399" />)}
        </div>
      </Section>

      {/* ── Timeline ── */}
      <Section title={tx(HEAD.timeline)}>
        {/* one axis: vertical on narrow screens, horizontal (left → right) on wide ones */}
        <ol className="relative grid grid-cols-1 lg:grid-cols-8 lg:gap-x-4">
          <span className="hidden lg:block absolute left-0 right-0 top-[5px] h-px bg-slate-700" />
          {TIMELINE.map(item => (
            <li key={item.year} className="relative pl-6 pb-5 border-l border-slate-700 lg:border-l-0 lg:pl-0 lg:pt-6 lg:pb-0">
              <span className="absolute -left-[5px] top-1.5 lg:left-0 lg:top-0 w-2.5 h-2.5 rounded-full"
                style={{ background: item.year === '2002' || item.year === '2009' ? '#fbbf24' : '#64748b' }} />
              <div className="text-white font-bold lg:text-lg">{item.year}</div>
              <div className="text-slate-400 text-sm leading-snug">{tx(item.text)}</div>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Sources ── */}
      <footer className="border-t border-slate-800 pt-6">
        <h3 className="text-slate-400 text-sm font-semibold mb-2">{tx(HEAD.sources)}</h3>
        <ul className="text-slate-500 text-xs leading-relaxed space-y-0.5">
          {SOURCES.map(s => <li key={s}>{s}</li>)}
        </ul>
      </footer>
    </div>
  )
}

// ─── Building blocks ───────────────────────────────────────────────────────────

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
      {note && <p className="text-slate-500 text-sm mb-3">{note}</p>}
      <div className={note ? '' : 'mt-3'}>{children}</div>
    </section>
  )
}

function StatTile({ stat, lang, accent }: { stat: Stat; lang: Lang; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-5 flex flex-col gap-2">
      <div className="text-4xl font-bold tabular-nums" style={{ color: accent }}>{stat.value[lang]}</div>
      <p className="text-slate-300 text-sm leading-snug flex-1">{stat.label[lang]}</p>
      <p className="text-slate-500 text-xs">{stat.source}</p>
    </div>
  )
}

// Dots swell like under a magnifying glass where the pointer passes
function StarGrid({ label }: { label: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const track = (e: PointerEvent<SVGSVGElement>) => {
    const m = ref.current?.getScreenCTM()
    if (!m) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    setPos({ x: p.x, y: p.y })
  }
  return (
    <svg ref={ref} viewBox="0 0 250 100" className="w-full max-w-2xl overflow-visible" role="img" aria-label={label}
      style={{ touchAction: 'pan-y' }}
      onPointerMove={track} onPointerDown={track} onPointerLeave={() => setPos(null)} onPointerCancel={() => setPos(null)}>
      <rect width="250" height="100" fill="transparent" />
      {Array.from({ length: 250 }, (_, i) => {
        const lost = LOST_STARS.has(i)
        const cx = 5 + (i % 25) * 10
        const cy = 5 + Math.floor(i / 25) * 10
        const d = pos ? Math.hypot(cx - pos.x, cy - pos.y) : Infinity
        const zoom = d < 26 ? 1 + 1.8 * (1 - d / 26) ** 2 : 1
        return (
          <circle key={i} cx={cx} cy={cy} r={(lost ? 1.4 : 2.4) * zoom}
            fill={lost ? (zoom > 1 ? '#475569' : '#334155') : '#f8fafc'}
            style={{ transition: 'r 120ms ease-out' }} />
        )
      })}
    </svg>
  )
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
      <div className="text-2xl font-bold text-amber-400">{value}</div>
      <div className="text-slate-400 text-xs leading-tight">{label}</div>
    </div>
  )
}

function Fact({ value, text }: { value: string; text: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-sky-300 mb-1">{value}</div>
      <p>{text}</p>
    </div>
  )
}

function BortlePanel({ b, lang, nelmLabel, onClick }: {
  b: typeof BORTLE[number]; lang: Lang; nelmLabel: string; onClick: () => void
}) {
  const t = (b.cls - 1) / 8
  const top = lerpColor('#02030a', '#2a2a3d', t)
  const glow = lerpColor('#05060f', '#c9803a', t)
  const nelm = b.cls === 9 ? `≤ ${fmt(b.hi, lang)}` : `${fmt(b.lo, lang)}–${fmt(b.hi, lang)}`
  return (
    <button onClick={onClick}
      className="text-left rounded-2xl border border-slate-700 hover:border-slate-500 bg-slate-800/40 overflow-hidden transition-all active:scale-[0.98]">
      <svg viewBox="0 0 100 60" className="w-full block" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sky${b.cls}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={top} />
            <stop offset="100%" stopColor={glow} />
          </linearGradient>
        </defs>
        <rect width="100" height="60" fill={`url(#sky${b.cls})`} />
        {STAR_FIELD.filter(s => s.m <= b.hi).map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={0.25 + (8 - s.m) * 0.17}
            fill="#fff" opacity={Math.min(1, 0.35 + (b.hi - s.m) * 0.4)} />
        ))}
        <path d="M0 60 L0 55 L8 53 L14 56 L22 52 L30 55 L38 51 L46 54 L55 50 L63 54 L72 52 L80 55 L90 51 L100 54 L100 60 Z" fill="#05050b" />
      </svg>
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-white font-semibold">B{b.cls} · {b[lang].name}</span>
          <span className="text-slate-500 text-xs whitespace-nowrap">{nelmLabel} {nelm}</span>
        </div>
        <p className="text-slate-400 text-sm leading-snug mt-1">{b[lang].see}</p>
      </div>
    </button>
  )
}

function Spectrum({ lang }: { lang: Lang }) {
  const pos = (nm: number) => ((nm - 380) / (750 - 380)) * 100
  const gradient = `linear-gradient(to right, ${SPECTRUM_STOPS.map(([nm, c]) => `${c} ${pos(nm)}%`).join(', ')})`
  return (
    <div>
      <div className="relative h-6 mt-7 rounded-md" style={{ background: gradient }}>
        {SPECTRUM_MARKS.map((m, i) => (
          <span key={m.nm} className="absolute -top-1 -bottom-1 w-0.5 bg-white/90" style={{ left: `${pos(m.nm)}%` }}>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-slate-900 text-[10px] sm:text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
          </span>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>380 nm</span>
        <span>{lang === 'cs' ? 'viditelné světlo' : 'visible light'}</span>
        <span>750 nm</span>
      </div>
      <ol className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-slate-300">
        {SPECTRUM_MARKS.map((m, i) => (
          <li key={m.nm} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white text-slate-900 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
            {m.nm} nm: {m.label[lang]}
          </li>
        ))}
      </ol>
    </div>
  )
}

function LampCard({ lang, shielded }: { lang: Lang; shielded: boolean }) {
  // Rays fan out from the lamp head at (60, 40); shielded fixture only emits below horizontal
  const angles = shielded
    ? [20, 40, 60, 80, 100, 120, 140, 160]
    : Array.from({ length: 16 }, (_, i) => i * 22.5)
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-5 flex gap-5 items-center">
      <svg viewBox="0 0 120 130" className="w-32 flex-shrink-0" role="img"
        aria-label={shielded ? 'full-cutoff fixture' : 'globe lamp'}>
        <line x1="0" y1="40" x2="120" y2="40" stroke="#475569" strokeDasharray="2 3" strokeWidth="0.6" />
        {angles.map(a => {
          const r = (a * Math.PI) / 180
          return <line key={a} x1="60" y1="40" x2={60 + Math.cos(r) * 52} y2={40 + Math.sin(r) * 52}
            stroke={a > 180 ? '#f87171' : '#fbbf24'} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
        })}
        <rect x="58.5" y="44" width="3" height="84" fill="#64748b" />
        {shielded
          ? <path d="M44 36 L76 36 L72 42 L48 42 Z" fill="#94a3b8" />
          : <circle cx="60" cy="40" r="8" fill="#fde68a" />}
      </svg>
      <div>
        <div className="text-3xl font-bold" style={{ color: shielded ? '#34d399' : '#f87171' }}>
          {shielded ? '0 %' : '~50 %'}
        </div>
        <div className="text-white font-semibold">
          {shielded
            ? (lang === 'cs' ? 'Plně cloněné svítidlo' : 'Full-cutoff fixture')
            : (lang === 'cs' ? 'Kulová lampa' : 'Globe lamp')}
        </div>
        <p className="text-slate-400 text-sm leading-snug mt-1">
          {shielded
            ? (lang === 'cs' ? 'světla míří přímo nad vodorovnou rovinu. Svítí jen na cestu, kde je světlo potřeba.' : 'of the light goes above the horizontal. It all lands on the path, where it is needed.')
            : (lang === 'cs' ? 'světla míří nad vodorovnou rovinu, tedy rovnou do oblohy, kde nikomu neslouží.' : 'of the light goes above the horizontal, straight into the sky, where it serves no one.')}
        </p>
      </div>
    </div>
  )
}
