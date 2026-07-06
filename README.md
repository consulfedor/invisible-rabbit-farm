# Invisible Rabbit Farm / Ферма невидимых кроликов

Interactive AI-first technical assignment prototype.

Live interface: https://consulfedor.github.io/invisible-rabbit-farm/

The scenario is intentionally simple: invisible rabbits cannot be observed directly, so the farmer works with indirect signals: missing carrots, new holes, motion sensor triggers, rustles, and footprints. The app turns those noisy events into normalized signals, confidence, location risk, recommendations, and editable JSON.

This is an explainable heuristic UI prototype, not a production ML model and not a trading system.

## Quick Start For Windows

Recommended path for review:

1. Install Git for Windows: https://git-scm.com/download/win
2. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
3. Start Docker Desktop.
4. Clone this repository:

```powershell
git clone https://github.com/consulfedor/invisible-rabbit-farm.git
cd invisible-rabbit-farm
```

5. Run the app:

```powershell
docker compose up --build
```

6. Open:

```text
http://localhost:4178/
```

Stop the app with `Ctrl+C`, then:

```powershell
docker compose down
```

## Node.js Run

Alternative local path:

1. Install Node.js 22 LTS or newer.
2. Run:

```bash
npm ci
npm run dev
```

Default dev URL:

```text
http://localhost:5173/
```

Production preview:

```bash
npm run build
npm run preview
```

Default preview URL:

```text
http://localhost:4173/
```

## What The Interface Shows

- Unique estimated rabbit count.
- Confidence score for the current inference.
- Strongest signal type and highest-risk location.
- Timeline of normalized signals.
- Contribution by signal type.
- Location risk chart.
- Editable event table and JSON editor.
- Recommendations based on current evidence.
- AI Worklog with a concise, sanitized process summary.

## Data Modes

- `Brief sample`: the original small event set for deterministic baseline review.
- `Seeded farm`: deterministic generator controlled by seed, event count, pressure, and noise parameters.
- `Market sample`: bundled offline OHLCV candles converted into the same `FarmSignalEvent` contract.
- `Live market`: optional public Binance BTCUSDT 1m REST bootstrap plus WebSocket stream. No API key is required. If the network is unavailable, offline modes continue to work.

The market adapter is only a demonstration of time-series signal normalization. It maps:

- `volume spike` -> `missing_carrot`
- `range spike` -> `motion_sensor`
- `return impulse` -> `new_hole`
- `taker imbalance` -> `rustle_detected`
- `local extreme` -> `footprints`

## Architecture

```text
src/data        bundled seed data
src/domain      scoring, randomizer, math, types
src/adapters    JSON normalization and market/live adapters
src/charts      ECharts wrappers and dashboard charts
src/components  reusable UI blocks
src/i18n        RU/EN copy and labels
src/styles      responsive application styling
```

Shared inference pipeline:

```text
events -> normalized signals -> weighted score -> estimate/confidence/contributions -> recommendations
```

Event scoring:

```text
base_signal = count * intensity
weighted_signal = base_signal * event_weight
final_signal = weighted_signal * recency_factor * noise_adjustment
```

`estimated_rabbits` uses bounded square-root scaling so noisy input does not grow the estimate linearly.

`confidence` considers signal diversity, repeated location evidence, recency, signal strength, noise level, and false-positive rate.

## Validation

Run:

```bash
npm audit --audit-level=moderate
npm run typecheck
npm test
npm run build
docker compose up --build
```

Expected result:

- TypeScript passes.
- Vitest passes.
- Production build passes.
- Docker serves the app on `http://localhost:4178/`.

Known non-blocking warning:

- The ECharts bundle is large, so Vite can warn about chunk size. This is acceptable for this prototype.

## AI Worklog Policy

The in-app AI Worklog is intentionally curated. It explains how AI was used for task framing, architecture, UI iteration, and validation without exposing raw prompts, private discussion, secrets, credentials, or unrelated context.

## Security And Privacy

- No API keys are required.
- No backend, database, authentication, cookies, or stored user accounts.
- Live market mode uses public market endpoints only.
- The repository does not include local build output, dependency folders, internal QA receipts, or private working notes.

## Русская версия

Интерактивный AI-first прототип для технического тестового задания.

Сценарий простой: невидимых кроликов нельзя увидеть напрямую, поэтому фермер работает с косвенными сигналами: пропала морковь, появилась ямка, сработал датчик движения, слышен шорох, появились следы. Приложение превращает эти шумные события в нормализованные сигналы, confidence, риск по зонам, рекомендации и редактируемый JSON.

Это explainable heuristic UI prototype, а не production ML-модель и не торговая система.

### Быстрый запуск на Windows

Рекомендуемый путь для проверки:

1. Установить Git for Windows: https://git-scm.com/download/win
2. Установить Docker Desktop: https://www.docker.com/products/docker-desktop/
3. Запустить Docker Desktop.
4. Склонировать репозиторий:

```powershell
git clone https://github.com/consulfedor/invisible-rabbit-farm.git
cd invisible-rabbit-farm
```

5. Запустить приложение:

```powershell
docker compose up --build
```

6. Открыть:

```text
http://localhost:4178/
```

Остановить приложение: `Ctrl+C`, затем:

```powershell
docker compose down
```

### Что проверять в интерфейсе

- Оценку количества кроликов.
- Уверенность системы.
- Сильнейший тип сигнала и самую рискованную зону.
- Timeline нормализованных сигналов.
- Вклад типов сигналов.
- Риск по зонам.
- Полный lifecycle события: добавить, изменить, удалить, синхронизировать JSON, применить JSON.
- Рекомендации.
- AI Worklog внутри интерфейса.

### Ограничения

- Нет ключей, backend, database, auth или secrets.
- Live market режим опциональный и зависит от публичной сети.
- Offline modes полностью проверяемы без внешнего API.
- Market adapter показывает adapter pattern для временного ряда, но не заявляет торговую точность.
