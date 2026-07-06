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
    worklogLead: 'Сдачная выжимка AI-first процесса: как была поставлена задача, что делали AI-инструменты, что проверял человек и как результат доведен до публичного интерфейса.',
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
    worklogLead: 'Submission-ready AI-first process summary: how the task was framed, what AI tools handled, what the human reviewed, and how the result was shipped as a public interface.',
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
      title: '1. Постановка задачи AI',
      body: 'Задача была поставлена AI как полноценное мини-приложение, а не макет: сценарий фермы, RU/EN, редактируемые данные, пересчет итогов, Docker, README и публичная проверка.',
    },
    {
      title: '2. Выбор сценария',
      body: 'Человек выбрал "Ферму невидимых кроликов": этот вариант лучше показывает hidden state, косвенные признаки, шум, confidence и explainable inference.',
    },
    {
      title: '3. Архитектура с AI',
      body: 'Codex CLI помог разложить приложение на domain scoring, adapters, data modes, charts, i18n и UI. Человек зафиксировал offline-first как основной приемочный путь.',
    },
    {
      title: '4. Goal prompt',
      body: 'После согласования логики был подготовлен подробный /goal prompt: что сделать, где лежит проект, какие non-goals, как проверять результат и какие артефакты вернуть.',
    },
    {
      title: '5. Реализация',
      body: 'В /goal режиме AI coding flow собрал Vite + React + TypeScript, scoring-логику, seeded randomizer, market adapters, ECharts dashboard, Vitest checks, Docker и GitHub Actions.',
    },
    {
      title: '6. UX и логика',
      body: 'После ревью были доработаны итоговая зона, подсказки режимов, полный lifecycle события add/edit/delete, переводы RU/EN, mobile layout и читаемость Worklog.',
    },
    {
      title: '7. Проверка',
      body: 'Результат проверялся через npm audit, typecheck, Vitest, production build, Docker, browser smoke и отдельную CodexAPP-проверку: repo был скачан, установлен и запущен по ТЗ.',
    },
    {
      title: '8. Репозиторий и деплой',
      body: 'После ручной приемки основной GitHub repo был обновлен, GitHub Pages workflow собрал production build и опубликовал интерфейс по публичной ссылке.',
    },
  ],
  en: [
    {
      title: '1. AI task framing',
      body: 'The task was given to AI as a complete mini-app, not a static mockup: farm scenario, RU/EN, editable data, recalculated output, Docker, README, and public review.',
    },
    {
      title: '2. Scenario choice',
      body: 'The human chose Invisible Rabbit Farm because it better demonstrates hidden state, indirect signals, noise, confidence, and explainable inference.',
    },
    {
      title: '3. AI architecture',
      body: 'Codex CLI helped split the app into domain scoring, adapters, data modes, charts, i18n, and UI. The human kept offline-first as the primary acceptance path.',
    },
    {
      title: '4. Goal prompt',
      body: 'After the logic was agreed, a detailed /goal prompt was prepared: what to build, where the project lives, non-goals, validation rules, and required artifacts.',
    },
    {
      title: '5. Implementation',
      body: 'In /goal mode, the AI coding flow produced Vite + React + TypeScript, scoring logic, seeded randomizer, market adapters, ECharts dashboard, Vitest checks, Docker, and GitHub Actions.',
    },
    {
      title: '6. UX and logic',
      body: 'After review, the summary zone, mode explanations, full add/edit/delete event lifecycle, RU/EN copy, mobile layout, and Worklog readability were refined.',
    },
    {
      title: '7. Validation',
      body: 'The result was checked with npm audit, typecheck, Vitest, production build, Docker, browser smoke, and a separate CodexAPP pass that cloned, installed, and ran the repo against the brief.',
    },
    {
      title: '8. Repository and deploy',
      body: 'After human acceptance, the main GitHub repo was updated, then the GitHub Pages workflow built the production bundle and published the interface at a public URL.',
    },
  ],
}
