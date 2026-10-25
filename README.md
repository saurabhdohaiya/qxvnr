# Wind Desk

Wind Desk is a pilot day-ahead wind forecast monitoring portal for a UK electricity trading desk. It compares Elexon's national WINDFOR forecasts with FUELHH wind generation outturn for January 2026.

The frontend uses React 18, TypeScript, Tailwind CSS, and Vite. `npm run build` performs a TypeScript check before creating the production bundle.

## What it shows

- Latest wind forecast available by the configurable decision cutoff (default 11:00 UTC on the day before delivery), matched against actual generation. WINDFOR is hourly in the queried data while FUELHH is half-hourly, so the app averages each pair of half-hour actuals into a matching hourly value.
- Mean absolute error (MAE), root mean square error (RMSE), mean signed error (bias), matched data coverage, and a daily average forecast/outturn chart.
- Daily or hourly chart inspection, independently toggled forecast and actual series, a selectable delivery-period readout, and a resizable hourly range.
- A light/dark theme toggle, with the selection remembered in the browser.
- A month picker (January 2026 by default) that reloads the selected period, updates matched-hour coverage, and names the CSV export for that month.
- A CSV download of the selected forecasts, matched actuals, errors, and publication times.

This pilot is limited to national wind forecasts and actuals from Elexon. It does not contain customer demand or thermal availability, so it cannot calculate the full residual procurement position. Positive forecast bias indicates over-forecast wind, which can create under-procurement exposure if demand is unchanged. All timestamps are shown in UTC. The default decision cutoff is an illustrative operating assumption and should be aligned with the buyer's actual auction workflow.

## Run locally

### Docker (recommended)

From the repository root:

```bash
docker compose up --build
```

Open <http://localhost:8080>. The backend API is available at <http://localhost:8000/api/health>.

### Run services separately

Backend (Python 3.9+):

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend (Node 20+), in another terminal:

```bash
cd frontend
npm ci
npm run dev
```

The Vite dev server proxies `/api` requests to `http://127.0.0.1:8000` by default, so no frontend environment variable is needed for local development. Set `VITE_API_URL` if the API is hosted at another origin.

## Deploy

### Vercel

The root `vercel.toml` configures a Vercel Services deployment with the Vite app in `frontend/` and the FastAPI app in `backend/`. Import the repository into Vercel and deploy it as one project. Requests under `/api/` are routed to FastAPI; all other paths are served by the frontend. Keep the frontend API base URL empty so it uses the same-origin `/api` route.

For local Vercel emulation, install the Vercel CLI and run `vercel dev` from the repository root. The Python runtime requires a current Vercel CLI; see the [Vercel FastAPI deployment guide](https://vercel.com/docs/frameworks/backend/fastapi).

The root `Dockerfile` builds the React app and serves it from the FastAPI container, which is suitable for Heroku Container Registry or another Docker host. For Heroku, create an app, log in with the Heroku CLI, then:

```bash
heroku container:login
heroku create <anonymous-app-name>
heroku container:push web -a <anonymous-app-name>
heroku container:release web -a <anonymous-app-name>
```

Then set the deployment URL as `VITE_API_URL` only if frontend and API are hosted separately. For a single-container deployment, the default same-origin API path is used. The live deployment link will be added here after deployment.

## Repository guide

```text
.
├── backend/
│   ├── Dockerfile          # Standalone API container
│   ├── main.py             # Uvicorn compatibility entry point
│   ├── app/
│   │   ├── main.py         # FastAPI setup, middleware and static frontend serving
│   │   ├── api/routes.py   # Health and monthly wind endpoints
│   │   └── services/       # Elexon access, forecast selection, matching and metrics
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── Dockerfile          # Standalone static React container
│   ├── index.html          # Vite entry HTML
│   ├── package-lock.json    # Pinned dependency tree
│   ├── package.json        # Frontend dependencies and scripts
│   ├── postcss.config.cjs   # Tailwind CSS processing
│   ├── tailwind.config.js   # Tailwind theme and source scanning
│   ├── tsconfig.json        # TypeScript compiler settings
│   ├── vite.config.ts       # React setup and local API proxy
│   └── src/
│       ├── App.tsx         # Dashboard state and page composition
│       ├── main.tsx        # React entry point and global stylesheet import
│       ├── components/     # Sidebar, top bar, chart, metrics and delivery panels
│       ├── hooks/          # Wind API loading and persisted theme state
│       ├── lib/            # API/display constants, chart transforms and CSV export
│       ├── types/          # Shared forecast, chart and theme types
│       ├── styles.css      # Tailwind directives, theme tokens, chart styles
│       └── vite-env.d.ts   # Vite environment types
├── Dockerfile              # Single-container Heroku/Docker deployment
├── docker-compose.yml      # Local two-container orchestration
├── vercel.toml             # Vercel frontend/API services and routing
├── .gitignore              # Local dependencies, build output, secrets
├── README.md               # Setup, architecture, data and deployment notes
└── VIDEO_SCRIPT.md         # Time-coded customer pitch and technical review guide
```

## Data and calculation notes

- Source APIs: [Elexon FUELHH](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream) and [Elexon WINDFOR](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream). Elexon Insights API access is public and requires no API key.
- Forecast selection: for each delivery hour, use the latest WINDFOR record published by 11:00 UTC on the previous calendar day.
- Join key: normalized UTC hourly `startTime`. The FUELHH half-hour observations at :00 and :30 are averaged; incomplete pairs are omitted. Only matched hourly periods contribute to accuracy metrics.
- Error convention: forecast minus actual. Positive bias means over-forecasting.
- MAE = mean of absolute errors; RMSE = square root of mean squared errors; bias = mean signed error.
- The API loads source data on request and does not persist or fabricate observations. A source/API error is shown in the UI.

## Video walkthrough outline (8 minutes 30 seconds)

1. **Client pitch (4:15):** explain the day-ahead cutoff, show monthly accuracy and the forecast/outturn chart, put the metrics in procurement context, then export the selected month.
2. **Technical review (4:15):** walk through the React/Vite frontend modules and FastAPI backend services, the Elexon data path, matching and metric calculations, Docker setup, and the pilot’s scope limits. See [VIDEO_SCRIPT.md](VIDEO_SCRIPT.md) for the timed narration and screen cues.

AI tools were used to assist with implementation and product copy. The code and domain assumptions should be reviewed before operational use.
