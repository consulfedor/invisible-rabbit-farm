# Validation Checklist

## Local Commands

Run from the repository root:

```bash
npm ci
npm audit --audit-level=moderate
npm run typecheck
npm test
npm run build
docker compose up --build
```

Open:

```text
http://localhost:4178/
```

## Browser Smoke

Check these flows:

- RU/EN language switch changes interface copy.
- `Brief sample` loads the baseline events.
- `Seeded farm` changes when seed or pressure changes.
- `Market sample` shows the offline candle source and generated farm events.
- `Live market` either loads public live data or falls back gracefully without breaking the UI.
- `?` help popovers open as floating overlays and do not push the layout.
- Summary block stays highlighted and is not duplicated elsewhere.
- Event lifecycle works: add, edit, delete, sync JSON, apply JSON.
- Invalid JSON shows an error instead of silently corrupting state.
- AI Worklog is visible inside the interface.

## Expected Notes

- Vite can warn that the ECharts chunk is larger than 500 kB. This is acceptable for this prototype.
- Live market depends on public network availability. Offline modes are the stable review path.
