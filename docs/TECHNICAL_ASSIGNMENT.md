# Technical Assignment Summary

## Scenario

Build an interactive interface for the `Invisible Rabbit Farm` scenario.

Invisible rabbits cannot be observed directly. The user receives indirect signals:

- missing carrots;
- new holes;
- motion sensor events;
- rustles;
- footprints.

The interface should help the user estimate hidden rabbit activity, understand confidence, see the strongest evidence, and receive practical recommendations.

## Product Interpretation

The app treats the task as a small signal intelligence console:

```text
noisy events -> normalized signals -> explainable score -> confidence -> recommendations
```

The important part is not a decorative scene. The important part is a usable decision interface where the user can change data and parameters and immediately see the result change.

## Functional Requirements

- The interface opens locally.
- The user can edit event rows.
- The user can add and delete events.
- The user can edit and apply JSON.
- Model parameters can be changed with sliders.
- The result recalculates visibly.
- The app shows estimate, confidence, strongest signal, location risk, charts, and recommendations.
- The app includes an in-interface AI Worklog.
- The app supports Russian and English UI copy.

## Data Modes

- `Brief sample`: deterministic baseline from the assignment data.
- `Seeded farm`: deterministic generated event stream for scenario variation.
- `Market sample`: offline OHLCV sample converted into the same event contract.
- `Live market`: optional public BTCUSDT 1m REST/WebSocket adapter with graceful fallback.

## Acceptance

The reviewer should be able to:

1. Install and run the app with Docker.
2. Open `http://localhost:4178/`.
3. Switch RU/EN.
4. Change sliders and see recalculation.
5. Add, edit, and delete events.
6. Apply JSON and see the model update.
7. Switch data modes and inspect how charts and recommendations change.
8. Open AI Worklog in the interface.

## Out Of Scope

- No backend.
- No database.
- No authentication.
- No private API keys.
- No claim of real-world ML or trading accuracy.
