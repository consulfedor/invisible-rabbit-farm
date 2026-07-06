import type { DataMode, FarmEventType, Recommendation } from '../domain/types'

export type Language = 'ru' | 'en'

export const languages: Record<Language, string> = {
  ru: 'RU',
  en: 'EN',
}

export const modeLabels: Record<Language, Record<DataMode, string>> = {
  ru: {
    brief: 'Данные ТЗ',
    seeded: 'Генератор фермы',
    market_sample: 'Рыночный пример',
    live_market: 'Live рынок',
  },
  en: {
    brief: 'Brief sample',
    seeded: 'Seeded farm',
    market_sample: 'Market sample',
    live_market: 'Live market',
  },
}

export const modeHelp: Record<Language, Record<DataMode, string[]>> = {
  ru: {
    brief: [
      'Что: исходные события из ТЗ без генерации.',
      'Зачем: доказывает, что приложение покрывает базовый сценарий задания.',
      'SSoT: JSON из задания в briefSample.',
      'Проверить: изменить count/intensity и увидеть пересчет итогов.',
    ],
    seeded: [
      'Что: детерминированная ферма по seed и параметрам шума.',
      'Зачем: показывает, как меняются выводы при других допущениях.',
      'SSoT: generator parameters + shared FarmSignalEvent.',
      'Проверить: изменить seed/noise/pressure и сравнить итог.',
    ],
    market_sample: [
      'Что: offline OHLCV sample, преобразованный в farm events.',
      'Зачем: показывает adapter pattern для временного ряда без сети.',
      'Логика: volume spike=морковка, range=движение, return=ямка, taker imbalance=шорох, extreme=следы.',
      'Проверить: включить режим и смотреть evidence/market chart.',
    ],
    live_market: [
      'Что: online режим BTCUSDT 1m: REST bootstrap + WebSocket minute stream.',
      'Зачем: показывает live adapter, но не делает сеть критичной для приемки.',
      'SSoT: Binance public market data, без ключей и private endpoints.',
      'Проверить: нажать Live рынок; статус покажет bootstrap/stream/fallback.',
    ],
  },
  en: {
    brief: [
      'What: original task events without generation.',
      'Why: proves the app covers the baseline assignment scenario.',
      'SSoT: task JSON in briefSample.',
      'Check: edit count/intensity and watch the summary recalculate.',
    ],
    seeded: [
      'What: deterministic farm generated from seed and noise parameters.',
      'Why: shows how conclusions change under different assumptions.',
      'SSoT: generator parameters + shared FarmSignalEvent.',
      'Check: change seed/noise/pressure and compare the result.',
    ],
    market_sample: [
      'What: offline OHLCV sample converted into farm events.',
      'Why: demonstrates a time-series adapter without network dependency.',
      'Logic: volume spike=carrot, range=motion, return=hole, taker imbalance=rustle, extreme=footprints.',
      'Check: enable the mode and inspect evidence/market chart.',
    ],
    live_market: [
      'What: BTCUSDT 1m online mode: REST bootstrap + WebSocket minute stream.',
      'Why: demonstrates a live adapter while keeping network non-critical.',
      'SSoT: Binance public market data, no keys or private endpoints.',
      'Check: choose Live market; status shows bootstrap/stream/fallback.',
    ],
  },
}

export const eventLabels: Record<Language, Record<FarmEventType, string>> = {
  ru: {
    missing_carrot: 'Исчезла морковка',
    new_hole: 'Новая ямка',
    motion_sensor: 'Датчик движения',
    rustle_detected: 'Шорох',
    footprints: 'Следы',
  },
  en: {
    missing_carrot: 'Missing carrot',
    new_hole: 'New hole',
    motion_sensor: 'Motion sensor',
    rustle_detected: 'Rustle detected',
    footprints: 'Footprints',
  },
}

const locationLabels: Record<Language, Record<string, string>> = {
  ru: {
    'Огород': 'Огород',
    'У забора': 'У забора',
    'Сарай': 'Сарай',
    'Теплица': 'Теплица',
    'Северная грядка': 'Северная грядка',
    'Склад моркови': 'Склад моркови',
    'Новая зона': 'Новая зона',
  },
  en: {
    'Огород': 'Garden plot',
    'У забора': 'By the fence',
      'Сарай': 'Barn',
      'Теплица': 'Greenhouse',
      'Северная грядка': 'North bed',
      'Склад моркови': 'Carrot shed',
      'Новая зона': 'New zone',
  },
}

export const localizeLocation = (location: string | null | undefined, language: Language): string => {
  if (!location) return language === 'ru' ? 'Нет зоны' : 'No zone'
  return locationLabels[language][location] ?? location
}

export const canonicalizeLocationInput = (value: string, language: Language): string => {
  if (language !== 'en') return value
  const match = Object.entries(locationLabels.en).find(([, label]) => label.toLowerCase() === value.toLowerCase())
  return match?.[0] ?? value
}

export const dictionary = {
  ru: {
    appTitle: 'Ферма невидимых кроликов',
    appSubtitle: 'Мини-приложение для фермера-аналитика: косвенные шумные события -> normalized signals -> confidence -> рекомендации.',
    scenarioBadge: 'AI-first technical assignment',
    offlineBadge: 'Offline-first: Brief, Seeded и Market sample работают без Binance',
    aiBadge: 'AI Worklog внутри продукта',
    language: 'Язык',
    dataMode: 'Режим данных',
    help: 'Что это?',
    liveOptional: 'Live режим опционален и не влияет на приемку.',
    liveUsingOffline: 'Live недоступен: анализ оставлен на offline sample.',
    liveLoading: 'Live: выполняю REST bootstrap последних 60 минутных свечей.',
    liveLoaded: 'Live: REST bootstrap выполнен, данные без ключей.',
    liveConnecting: 'Live: подключаю WebSocket, обновление на закрытии минутной свечи.',
    liveStreaming: 'Live: WebSocket подключен, обновление графика на закрытии каждой 1m свечи.',
    liveUpdated: 'Live: минутная свеча закрылась, график обновлен.',
    liveStreamUnavailable: 'Live stream недоступен: остаемся на последнем REST/offline состоянии.',
    sourceNote: 'Источник',
    recalculated: 'Пересчитано',
    recalculating: 'Идет пересчет',
    estimatedRabbits: 'Оценка кроликов',
    hiddenActivity: 'Hidden activity',
    confidence: 'Уверенность',
    strongestSignal: 'Сильнейший сигнал',
    highestRiskLocation: 'Риск-зона',
    eventCount: 'Событий',
    summaryTitle: 'Итоги анализа',
    summaryLead: 'Главный вывод мини-приложения: что система видит, насколько уверена и что делать дальше.',
    summaryEstimate: 'Оценка',
    summaryReason: 'Главная причина',
    summaryZone: 'Фокус-зона',
    summaryAction: 'Решение',
    summaryActionText: 'усилить наблюдение и проверить ресурсные точки',
    summaryToneLegend: 'Цветовая легенда итогов',
    toneOutcome: 'итог',
    toneDriver: 'драйвер',
    toneRisk: 'риск',
    toneData: 'данные',
    parameterDeck: 'Параметры модели',
    generatorDeck: 'Генератор',
    weightsDeck: 'Веса сигналов',
    eventEditor: 'События и JSON',
    jsonEditor: 'JSON editor',
    applyJson: 'Применить JSON',
    syncJson: 'Обновить JSON из таблицы',
    resetMode: 'Сбросить режим',
    addEvent: 'Добавить событие',
    deleteEvent: 'Удалить',
    action: 'Действие',
    emptyEvents: 'Событий нет. Добавьте событие или примените JSON.',
    invalidJson: 'JSON не применен',
    tableHint: 'Полный цикл события: добавить, изменить, удалить; изменения сразу пересчитывают итоги, графики и рекомендации.',
    timeline: 'Timeline нормализованных сигналов',
    contributions: 'Вклад типов сигналов',
    locationRisk: 'Риск по зонам',
    marketCandles: 'Market sample: OHLCV -> farm events',
    marketLiveCandles: 'Live market: BTCUSDT 1m -> farm events',
    marketSourceSample: 'Локальный bundled OHLCV sample',
    marketSourceLive: 'Реальные публичные свечи Binance BTCUSDT 1m',
    marketSourceFallback: 'Fallback: локальный bundled OHLCV sample',
    recommendations: 'Рекомендации',
    normalizedEvidence: 'Evidence',
    aiWorklog: 'AI Worklog',
    worklogLead: 'Короткая безопасная выжимка процесса: без секретов, приватных данных и raw prompts.',
    noSignal: 'Нет сигнала',
    noLocation: 'Нет зоны',
    noiseLevel: 'Шум',
    sensorSensitivity: 'Чувствительность датчика',
    falsePositiveRate: 'False positive',
    rabbitScale: 'Масштаб кроликов',
    seed: 'Seed',
    eventCountInput: 'Количество событий',
    hiddenPressure: 'Скрытая активность',
    event: 'Сигнал',
    location: 'Зона',
    count: 'Count',
    intensity: 'Intensity',
    time: 'Время',
    modeBriefDesc: 'Исходные 5 событий из ТЗ. Базовый proof соответствия заданию.',
    modeSeededDesc: 'Детерминированный генератор: меняйте seed/noise/pressure и смотрите пересчет.',
    modeMarketDesc: 'Bundled OHLCV sample без сети, преобразованный в те же rabbit events.',
    modeLiveDesc: 'Online pipeline: REST bootstrap + WS-обновление на закрытии 1m свечи.',
  },
  en: {
    appTitle: 'Invisible Rabbit Farm',
    appSubtitle: 'A mini-app for a farmer-analyst: indirect noisy events -> normalized signals -> confidence -> recommendations.',
    scenarioBadge: 'AI-first technical assignment',
    offlineBadge: 'Offline-first: Brief, Seeded, and Market sample work without Binance',
    aiBadge: 'AI Worklog inside the product',
    language: 'Language',
    dataMode: 'Data mode',
    help: 'What is this?',
    liveOptional: 'Live mode is optional and is not acceptance-critical.',
    liveUsingOffline: 'Live unavailable: analysis stayed on offline sample.',
    liveLoading: 'Live: running REST bootstrap for the latest 60 one-minute candles.',
    liveLoaded: 'Live: REST bootstrap completed, no API key.',
    liveConnecting: 'Live: connecting WebSocket, updates on each closed 1m candle.',
    liveStreaming: 'Live: WebSocket connected, chart updates on each closed 1m candle.',
    liveUpdated: 'Live: minute candle closed, chart refreshed.',
    liveStreamUnavailable: 'Live stream unavailable: keeping last REST/offline state.',
    sourceNote: 'Source',
    recalculated: 'Recalculated',
    recalculating: 'Recalculating',
    estimatedRabbits: 'Estimated rabbits',
    hiddenActivity: 'Hidden activity',
    confidence: 'Confidence',
    strongestSignal: 'Strongest signal',
    highestRiskLocation: 'Highest-risk zone',
    eventCount: 'Events',
    summaryTitle: 'Analysis summary',
    summaryLead: 'The mini-app conclusion: what the system sees, how confident it is, and what to do next.',
    summaryEstimate: 'Estimate',
    summaryReason: 'Main reason',
    summaryZone: 'Focus zone',
    summaryAction: 'Decision',
    summaryActionText: 'increase monitoring and verify resource points',
    summaryToneLegend: 'Summary color legend',
    toneOutcome: 'outcome',
    toneDriver: 'driver',
    toneRisk: 'risk',
    toneData: 'data',
    parameterDeck: 'Model parameters',
    generatorDeck: 'Generator',
    weightsDeck: 'Signal weights',
    eventEditor: 'Events and JSON',
    jsonEditor: 'JSON editor',
    applyJson: 'Apply JSON',
    syncJson: 'Sync JSON from table',
    resetMode: 'Reset mode',
    addEvent: 'Add event',
    deleteEvent: 'Delete',
    action: 'Action',
    emptyEvents: 'No events. Add an event or apply JSON.',
    invalidJson: 'JSON was not applied',
    tableHint: 'Full event lifecycle: add, edit, delete; changes immediately recalculate the summary, charts, and recommendations.',
    timeline: 'Normalized signal timeline',
    contributions: 'Signal-type contributions',
    locationRisk: 'Location risk',
    marketCandles: 'Market sample: OHLCV -> farm events',
    marketLiveCandles: 'Live market: BTCUSDT 1m -> farm events',
    marketSourceSample: 'Local bundled OHLCV sample',
    marketSourceLive: 'Real public Binance BTCUSDT 1m candles',
    marketSourceFallback: 'Fallback: local bundled OHLCV sample',
    recommendations: 'Recommendations',
    normalizedEvidence: 'Evidence',
    aiWorklog: 'AI Worklog',
    worklogLead: 'Safe curated process summary: no secrets, private data, or raw prompts.',
    noSignal: 'No signal',
    noLocation: 'No zone',
    noiseLevel: 'Noise',
    sensorSensitivity: 'Sensor sensitivity',
    falsePositiveRate: 'False positive',
    rabbitScale: 'Rabbit scale',
    seed: 'Seed',
    eventCountInput: 'Event count',
    hiddenPressure: 'Hidden pressure',
    event: 'Signal',
    location: 'Location',
    count: 'Count',
    intensity: 'Intensity',
    time: 'Time',
    modeBriefDesc: 'The original 5 task events. Baseline proof that the app follows the brief.',
    modeSeededDesc: 'Deterministic generator: change seed/noise/pressure and inspect recalculation.',
    modeMarketDesc: 'Bundled offline OHLCV sample converted into the same rabbit events.',
    modeLiveDesc: 'Online pipeline: REST bootstrap + WS update when each 1m candle closes.',
  },
} satisfies Record<Language, Record<string, string>>

export const recommendationText = (recommendation: Recommendation, language: Language): string => {
  const location = recommendation.location
    ? localizeLocation(recommendation.location, language)
    : language === 'ru' ? 'ключевой зоне' : 'the key zone'
  const signal = recommendation.signal ? eventLabels[language][recommendation.signal] : ''

  const copy: Record<Language, Record<Recommendation['code'], string>> = {
    ru: {
      secure_high_risk_zone: `Усилить наблюдение в зоне "${location}" и проверить запасы моркови.`,
      collect_more_evidence: `Сигнал сильный, но уверенность ограничена: собрать дополнительные события по зоне "${location}".`,
      inspect_sensors: `Проверить датчики: ${signal || 'движение/шорох'} может быть шумом или ложным срабатыванием.`,
      rebalance_carrots: `Перераспределить морковь и поставить контрольные точки около "${location}".`,
      watch_market_impulse: `Market adapter видит импульсный паттерн: использовать как anomaly candidate, не как trading signal.`,
    },
    en: {
      secure_high_risk_zone: `Increase monitoring in "${location}" and verify carrot reserves.`,
      collect_more_evidence: `The signal is strong but confidence is limited: collect more events near "${location}".`,
      inspect_sensors: `Inspect sensors: ${signal || 'motion/rustle'} may be noise or a false positive.`,
      rebalance_carrots: `Rebalance carrots and place control points around "${location}".`,
      watch_market_impulse: `The market adapter sees an impulse pattern: treat it as an anomaly candidate, not a trading signal.`,
    },
  }

  return copy[language][recommendation.code]
}

export const worklogEntries: Record<Language, Array<{ title: string; body: string }>> = {
  ru: [
    {
      title: '1. Формулировка задачи для AI',
      body: 'Стартовая задача была сформулирована как полноценный интерактивный продукт: RU/EN, Docker, редактируемые данные и проверяемый вывод.',
    },
    {
      title: '2. Выбор сценария',
      body: 'Мы сравнили два варианта и выбрали "Ферму невидимых кроликов", потому что она лучше раскрывает hidden state, noisy signals и confidence.',
    },
    {
      title: '3. Product framing',
      body: 'AI помог оформить задачу как мини-приложение принятия решения: события -> сигналы -> итог -> рекомендации.',
    },
    {
      title: '4. Архитектура',
      body: 'Через AI разложили проект на domain scoring, adapters, data modes, i18n, charts и UI; человек зафиксировал offline-first и Live как optional.',
    },
    {
      title: '5. Implementation slice',
      body: 'После уточнения требований был собран ограниченный implementation slice: интерфейс, domain logic, adapters, тесты, Docker и README.',
    },
    {
      title: '6. UX iteration',
      body: 'После ревью уточнили итоговую зону, перевод RU/EN, mobile layout, accessibility и Worklog, чтобы интерфейс читался как продукт.',
    },
    {
      title: '7. Validation',
      body: 'Проверка прошла через npm audit, typecheck, Vitest, production build, Docker и browser smoke.',
    },
  ],
  en: [
    {
      title: '1. First AI task',
      body: 'The initial task was framed as a full interactive product: RU/EN, Docker, editable data, and verifiable output.',
    },
    {
      title: '2. Scenario choice',
      body: 'We compared both scenarios and selected Invisible Rabbit Farm because it better exposes hidden state, noisy signals, and confidence.',
    },
    {
      title: '3. Product framing',
      body: 'AI helped shape the brief as a decision mini-app: events -> signals -> summary -> recommendations.',
    },
    {
      title: '4. Architecture',
      body: 'With AI support, the app was split into domain scoring, adapters, data modes, i18n, charts, and UI; the human decision kept it offline-first with Live optional.',
    },
    {
      title: '5. Implementation slice',
      body: 'After requirements were clarified, one bounded implementation slice was built: interface, domain logic, adapters, tests, Docker, and README.',
    },
    {
      title: '6. UX iteration',
      body: 'After review, the summary zone, RU/EN translation, mobile layout, accessibility, and Worklog were adjusted so the UI reads as a product.',
    },
    {
      title: '7. Validation',
      body: 'Validation used npm audit, typecheck, Vitest, production build, Docker, and browser smoke.',
    },
  ],
}
