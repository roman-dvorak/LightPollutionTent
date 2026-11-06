import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { applyState, bortleToLP, resetToIntro } from '../services/skyService'
import FactsInfographic from './FactsInfographic'
import TopicVisual from './TopicVisual'

// ─── Content data ─────────────────────────────────────────────────────────────

type Lang = { title: string; short: string; long: string }
type Topic = { id: string; icon: string; cs: Lang; en: Lang }

const TOPICS: Topic[][] = [
  // Column 1 — Příčiny / Causes
  [
    {
      id: 'skyglow', icon: '🌃',
      cs: {
        title: 'Záře noční oblohy',
        short: 'Světlo rozptýlené v atmosféře rozsvěcuje oblohu nad osídlenými oblastmi.',
        long: 'Záře noční oblohy (skyglow) vzniká, když světlo ze svítidel dopadá na atmosférické molekuly a částice, které ho odrážejí zpět k zemi. Obloha v centrech velkých měst bývá i více než 100× jasnější než přirozená noční obloha.\n\nMléčnou dráhu dnes z místa svého bydliště nemůže spatřit přibližně třetina světové populace. V Evropě ji neuvidí asi 60 % obyvatel, v Severní Americe téměř 80 %.\n\nZáře oblohy přitom světlí i desítky kilometrů daleko od zástavby. Snímky ze satelitů ukazují, jak se světelné záplavy měst slévají v souvislé světelné koberce.',
      },
      en: {
        title: 'Skyglow',
        short: 'Light scattered in the atmosphere brightens the sky above populated areas.',
        long: 'Skyglow occurs when artificial light reflects off atmospheric molecules and particles back toward the ground. The sky over large city centres can be more than 100× brighter than a natural night sky.\n\nAbout one third of the world\'s population can no longer see the Milky Way from where they live. In Europe it is roughly 60% of inhabitants, in North America nearly 80%.\n\nSkyglow spreads tens of kilometres beyond city limits. Satellite imagery shows how light domes from individual cities merge into vast glowing sheets across entire continents.',
      },
    },
    {
      id: 'energy', icon: '⚡',
      cs: {
        title: 'Plýtvání energií',
        short: 'Zhruba 30 % venkovního osvětlení svítí zbytečně, velká část přímo do oblohy.',
        long: 'Svítidla bez clony nebo nasměrovaná špatně posílají světlo do nebe místo na plochy, které mají osvětlovat. Podle odhadu DarkSky International se v USA takto zbytečně prosvítí zhruba 30 % venkovního osvětlení. Jde asi o 3 miliardy dolarů a 21 milionů tun CO₂ ročně.\n\nPřechod na plně cloněná svítidla přitom výrazně snižuje světlo unikající do oblohy, aniž by se zhoršilo osvětlení vozovek a chodníků.\n\nSprávně navržené osvětlení šetří energii, peníze a přitom svítí stejně dobře.',
      },
      en: {
        title: 'Energy waste',
        short: 'Roughly 30% of outdoor lighting is wasted, much of it shining straight into the sky.',
        long: 'Fixtures without shields or poorly aimed send light into the sky instead of onto surfaces that need illuminating. DarkSky International estimates that about 30% of outdoor lighting in the US is wasted. That is roughly 3 billion dollars and 21 million tonnes of CO₂ every year.\n\nSwitching to full-cutoff fixtures greatly reduces the light escaping into the sky without making roads and paths any darker.\n\nWell-designed lighting saves energy and money while performing just as well.',
      },
    },
    {
      id: 'types', icon: '💡',
      cs: {
        title: 'Typy světelného znečištění',
        short: 'Znečištění má čtyři formy: záře oblohy, oslnění, záření do cizího prostoru a světelný nepořádek.',
        long: '• Záře oblohy (skyglow): rozsvícení oblohy nad sídlišti\n• Oslnění (glare): nadměrný jas způsobující vizuální nepohodlí a snížení bezpečnosti\n• Záření do cizího prostoru (light trespass): světlo dopadající tam, kde není žádoucí, např. do oken domů\n• Světelný nepořádek (clutter): nadměrné množství světelných zdrojů různých barev a intenzit\n\nKaždá forma má jiné dopady na životní prostředí, zdraví a bezpečnost a vyžaduje jiná konstrukční řešení.',
      },
      en: {
        title: 'Types of light pollution',
        short: 'LP has four forms: skyglow, glare, light trespass, and clutter.',
        long: '• Skyglow: brightening of the sky over inhabited areas\n• Glare: excessive brightness causing visual discomfort and reduced safety\n• Light trespass: light falling where it is not needed, e.g. into bedroom windows\n• Clutter: excessive groups of lights of varying colours and intensities\n\nEach form has different impacts on environment, health and safety, and requires different engineering solutions.',
      },
    },
  ],
  // Column 2 — Dopady / Effects
  [
    {
      id: 'wildlife', icon: '🦅',
      cs: {
        title: 'Živočichové a příroda',
        short: 'Umělé světlo dezorientuje ptáky, láká hmyz a mate mořské želvičky.',
        long: 'Stěhovaví ptáci se orientují podle hvězd a přirozené polarity oblohy. Záře měst je přitahuje a způsobuje dezorientaci. Odhaduje se, že jen v USA ročně zahyne nárazem do budov 365–988 milionů ptáků.\n\nHmyz přitahovaný světly tráví zbytečně energii, stává se snadnou kořistí a jeho úbytek narušuje celé potravinové řetězce včetně opylování rostlin.\n\nMořské želvičky vylézají z vajíček a přirozeně míří ke světlejšímu horizontu, tedy k moři. Osvětlené pláže je lákají opačným směrem, daleko od vody, kde zahynou.',
      },
      en: {
        title: 'Wildlife and nature',
        short: 'Artificial light disorients birds, lures insects, and confuses sea turtle hatchlings.',
        long: 'Migratory birds navigate by stars and natural sky polarity. City glow attracts them and causes disorientation: an estimated 365–988 million birds die from building collisions each year in the US alone.\n\nInsects drawn to lights waste energy, become easy prey, and their decline disrupts entire food chains including plant pollination.\n\nSea turtle hatchlings emerge from eggs and naturally head toward the brighter horizon, which is the sea. Lit beaches draw them inland instead, where they die.',
      },
    },
    {
      id: 'health', icon: '🧬',
      cs: {
        title: 'Lidské zdraví',
        short: 'Světlo v noci potlačuje melatonin a narušuje spánek, s dlouhodobými zdravotními dopady.',
        long: 'Lidský organismus se vyvíjel v cyklu přirozené denní a noční oblohy. Modrá složka umělého světla (především z LED) potlačuje produkci melatoninu, hormonu regulujícího spánek a imunitu.\n\nChronické narušení spánku zvyšuje riziko obezity, cukrovky 2. typu, kardiovaskulárních onemocnění a depresí. Epidemiologické studie opakovaně nacházejí korelaci mezi světelným znečištěním v místě bydliště a vyšší incidencí rakoviny prsu a prostaty. Mezinárodní agentura pro výzkum rakoviny (IARC) při WHO řadí noční práci narušující cirkadiánní rytmus mezi „pravděpodobně karcinogenní“ faktory (skupina 2A).\n\nSvětelné znečištění se tak týká každého z nás, každou noc.',
      },
      en: {
        title: 'Human health',
        short: 'Light at night suppresses melatonin and disrupts sleep, with long-term health consequences.',
        long: 'The human body evolved with a natural day-night cycle. The blue component of artificial light, especially from LEDs, suppresses melatonin production, the hormone that regulates sleep and immunity.\n\nChronic sleep disruption raises the risk of obesity, type 2 diabetes, cardiovascular disease and depression. Epidemiological studies repeatedly find correlations between residential light pollution and higher rates of breast and prostate cancer. The WHO\'s International Agency for Research on Cancer (IARC) classifies night shift work that disrupts the circadian rhythm as “probably carcinogenic” (Group 2A).\n\nLight pollution affects every one of us, every night.',
      },
    },
    {
      id: 'astronomy', icon: '🔭',
      cs: {
        title: 'Astronomie',
        short: '60 % Evropanů z místa bydliště nevidí Mléčnou dráhu. Observatoře ustupují stále dál.',
        long: 'Astronomie je jediná přírodní věda, kde velká část historicky dostupných pozorování je pro moderní profesionální výzkum prakticky nedostupná. Observatoře jsou vytlačovány do stále odlehlejších lokalit, mnohdy na jiné kontinenty.\n\nSvětelné znečištění zkracuje efektivní observační čas, snižuje dosah přístrojů a zdražuje výzkum. Amatérská astronomie, tradičně základ popularizace vědy, se stává dostupnou jen pro ty, kdo mohou cestovat desítky kilometrů za město.\n\nZároveň hrozí, že celé generace vyrostou, aniž by kdy viděly hvězdnou oblohu takovou, jaká je.',
      },
      en: {
        title: 'Astronomy',
        short: '60% of Europeans cannot see the Milky Way from home. Observatories keep moving further away.',
        long: 'Astronomy is the only natural science where much of what was once routinely observable is now practically inaccessible to modern professional research. Observatories are pushed to ever more remote locations, often on other continents.\n\nLight pollution shortens effective observing time, reduces instrument reach and makes research more expensive. Amateur astronomy, traditionally the foundation of science outreach, is becoming accessible only to those able to drive tens of kilometres from cities.\n\nWhole generations risk growing up never having seen a truly starry sky.',
      },
    },
  ],
  // Column 3 — Řešení / Solutions
  [
    {
      id: 'lighting', icon: '🔆',
      cs: {
        title: 'Správné osvětlení',
        short: 'Clona, teplá barva a stmívání: tři kroky ke snížení světelného znečištění.',
        long: 'Základní principy přátelského osvětlení:\n\n• Svítit dolů: svítidlo s plnou clonou (full-cutoff) nasměruje světlo pouze na plochu pod sebou a nevyzáří nic do nebe\n• Svítit jen tam, kde je třeba: pohybová čidla a časovače zamezí zbytečnému svícení\n• Svítit jen tolik, kolik je třeba: stmívání na nejnižší bezpečnou úroveň\n• Správná barva světla: teplé bílé nebo jantarové LED (nejvýše 3 000 K) jsou méně škodlivé pro organismy a atmosféra je rozptyluje méně než studené bílé světlo\n\nNáhrada starého osvětlení za správně navržená, cloněná a teplá LED svítidla může světelné znečištění výrazně snížit bez jakéhokoli poklesu funkčnosti.',
      },
      en: {
        title: 'Good lighting',
        short: 'Shielding, warm colour and dimming: three steps to reducing light pollution.',
        long: 'Key principles of responsible lighting:\n\n• Shine downward: a full-cutoff fixture directs all light onto the surface below and emits nothing into the sky\n• Shine only where needed: motion sensors and timers prevent unnecessary illumination\n• Shine only as bright as needed: dimming to the minimum safe level\n• Right colour of light: warm white or amber LEDs (3,000 K or less) are less harmful to organisms and scatter less in the atmosphere than cold white light\n\nReplacing old fixtures with well-designed, shielded, warm LED luminaires can greatly reduce light pollution with no loss of functionality.',
      },
    },
    {
      id: 'darksky', icon: '🌌',
      cs: {
        title: 'Tmavá nebe',
        short: 'DarkSky International certifikuje parky a rezervace, kde je noční obloha chráněna před znečištěním.',
        long: 'Organizace DarkSky International (do roku 2023 International Dark-Sky Association, IDA) uděluje certifikáty místům, která aktivně chrání noční oblohu prostřednictvím regulace osvětlení. Celosvětově existuje přes 200 certifikovaných lokalit.\n\nV Evropě patří k nejznámějším rezervace Exmoor a Bannau Brycheiniog (dříve Brecon Beacons) ve Velké Británii, Kerry v Irsku, Pic du Midi ve Francii nebo Westhavelland v Německu. V Česku vyhlašují oblasti tmavé oblohy místní organizace a správy chráněných území. První byla česko-polská Jizerská oblast tmavé oblohy (2009), další jsou například Beskydská nebo Manětínská.\n\nKdyž taková místa navštívíte, uvidíte skutečně hvězdnou oblohu a zároveň podpoříte její ochranu.',
      },
      en: {
        title: 'Dark sky places',
        short: 'DarkSky International certifies parks and reserves where the night sky is protected from light pollution.',
        long: 'DarkSky International (until 2023 the International Dark-Sky Association, IDA) awards certifications to places that actively protect the night sky through lighting regulations. More than 200 certified sites exist worldwide.\n\nWell-known European examples include the Exmoor and Bannau Brycheiniog (formerly Brecon Beacons) reserves in the UK, Kerry in Ireland, Pic du Midi in France and Westhavelland in Germany. In Czechia, dark-sky areas are declared by local organisations and protected-area authorities. The first was the Czech-Polish Izera Dark Sky Park (2009), followed by e.g. Beskydy and Manětín.\n\nVisiting these places gives you the experience of a truly starry sky while directly supporting the preservation of darkness as a natural heritage.',
      },
    },
    {
      id: 'action', icon: '✅',
      cs: {
        title: 'Co mohu udělat?',
        short: 'Každý může přispět: správnou lampou, zatemněnou žaluzií nebo zapojením sousedů.',
        long: 'Doma:\n• Venkovní svítidla nahraďte typy s plnou clonou a teplou barvou světla\n• Zatemněte okna, aby světlo nevnikalo ven a nenarušovalo noční prostředí okolí\n\nVe škole nebo v práci:\n• Navrhněte přechod na stmívatelné osvětlení s pohybovými čidly\n\nV obci:\n• Oslovte zastupitele s žádostí o revizi veřejného osvětlení\n• Zapojte se do projektu Globe at Night a měřte kvalitu oblohy z vaší zahrady\n\nOsvěta:\n• Vezměte děti do hvězdárny nebo na veřejné pozorování oblohy\n• Sdílejte informace o světelném znečištění se sousedy a přáteli',
      },
      en: {
        title: 'What can I do?',
        short: 'Everyone can help: with the right lamp, a good blind, or by getting neighbours involved.',
        long: 'At home:\n• Replace outdoor fixtures with full-cutoff, warm-toned units\n• Use blackout blinds to prevent indoor light from spilling outside\n\nAt school or work:\n• Propose switching to dimmable lighting with motion sensors\n\nIn your community:\n• Contact local officials and request a review of public street lighting\n• Join Globe at Night and measure sky quality from your own garden\n\nAwareness:\n• Bring children to a star party or planetarium\n• Share information about light pollution with neighbours and friends',
      },
    },
  ],
]

const BORTLE_CLASSES = [
  { cls: 1, color: '#000033' },
  { cls: 2, color: '#001a4d' },
  { cls: 3, color: '#003066' },
  { cls: 4, color: '#1a4d80' },
  { cls: 5, color: '#336699' },
  { cls: 6, color: '#4d7f99' },
  { cls: 7, color: '#7a9e7e' },
  { cls: 8, color: '#c4a35a' },
  { cls: 9, color: '#d4812c' },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Introduction() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'cs' ? 'cs' : 'en'
  const [modal,  setModal]  = useState<Topic | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const factsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    resetToIntro().catch(err => console.warn('resetToIntro failed', err))
  }, [])

  async function handleBortle(cls: number) {
    setStatus(t('stel.sending'))
    try {
      await applyState({ lat: 50.08, lon: 14.42, lightPollution: bortleToLP(cls) })
      setStatus(null)
    } catch {
      setStatus(t('stel.error'))
      setTimeout(() => setStatus(null), 3000)
    }
  }

  return (
    <div className="overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100vh - 53px)', touchAction: 'pan-y' }}>
    <div className="flex flex-col" style={{ height: 'max(calc(100vh - 53px), 900px)' }}>

      {/* ── Title row ── */}
        <div className="flex-shrink-0 px-8 pt-6 pb-3">
          <h1 className="text-3xl font-bold text-white">{t('intro.title')}</h1>
          <p className="text-slate-400 mt-1">
            {t('intro.subtitle')}
            <span className="ml-4 text-slate-500 text-sm">👆 {t('intro.touchHint')}</span>
          </p>
        </div>

      {/* ── 3-column topic grid ── */}
      <div className="flex-1 grid grid-cols-3 gap-4 px-8 pb-4 min-h-0">
        {TOPICS.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-2 min-h-0">
            {col.map(topic => (
              <TopicCard
                key={topic.id}
                topic={topic}
                lang={lang}
                onOpen={() => setModal(topic)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* ── Bortle strip ── */}
      <div className="flex-shrink-0 px-8 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-slate-400 text-sm">{t('intro.bortle')}</span>
          <span className="text-slate-600 text-xs">{t('intro.bortleDesc')}</span>
          <button
            onClick={() => factsRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="ml-auto px-3 py-1 rounded-lg border border-amber-700/60 bg-amber-900/20 text-amber-300 text-sm hover:border-amber-500 transition-colors animate-pulse"
          >
            ↓ {t('intro.factsHint')}
          </button>
        </div>
        <div className="flex gap-1.5">
          {BORTLE_CLASSES.map(({ cls, color }) => (
            <button
              key={cls}
              onClick={() => handleBortle(cls)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border border-slate-700 hover:border-slate-500 transition-all hover:scale-105 active:scale-95"
              style={{ background: `${color}30` }}
            >
              <span className="w-5 h-5 rounded-full border border-white/20" style={{ background: color }} />
              <span className="text-white text-xs font-bold">B{cls}</span>
            </button>
          ))}
        </div>
      </div>

    </div>

      {/* ── Facts & infographic ── */}
      <div ref={factsRef} className="border-t border-slate-800">
        <FactsInfographic lang={lang} onBortle={handleBortle} />
      </div>

      {/* ── Info modal ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setModal(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl border border-slate-600 p-10 overflow-y-auto"
            style={{ background: '#0d0d1e', maxHeight: '88vh', touchAction: 'pan-y' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setModal(null)}
              className="absolute top-5 right-5 w-11 h-11 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-2xl leading-none transition-colors"
            >
              ×
            </button>
            <div className="text-5xl mb-4">{modal.icon}</div>
            <h2 className="text-4xl font-bold text-white mb-6">{modal[lang].title}</h2>
            <div className="text-slate-200 leading-relaxed whitespace-pre-line text-xl">
              {modal[lang].long}
            </div>
          </div>
        </div>
      )}

      {/* ── Status toast ── */}
      {status && (
        <div className="fixed bottom-6 right-6 bg-slate-700/90 backdrop-blur text-white px-5 py-3 rounded-xl shadow-xl text-sm border border-slate-600">
          {status}
        </div>
      )}
    </div>
  )
}

// ─── TopicCard ─────────────────────────────────────────────────────────────────

function TopicCard({ topic, lang, onOpen }: { topic: Topic; lang: 'cs' | 'en'; onOpen: () => void }) {
  const content = topic[lang]
  return (
    <div
      onClick={onOpen}
      className="relative flex-1 rounded-2xl border border-slate-700 hover:border-slate-500 bg-slate-800/40 p-3 flex flex-col gap-2 min-h-0 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{topic.icon}</span>
          <h3 className="text-white font-semibold leading-tight">{content.title}</h3>
        </div>
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 text-slate-300 text-sm font-bold flex items-center justify-center"
          title="Více informací"
        >
          ?
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <TopicVisual id={topic.id} lang={lang} />
      </div>
      <p className="text-slate-400 text-sm leading-snug">{content.short}</p>
    </div>
  )
}
