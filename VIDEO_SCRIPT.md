# Wind Desk video guide (target runtime: 8:30)

Use the deployed app or run `docker compose up --build` and open `http://localhost:8080`. Keep the recording under ten minutes. The script separates the customer pitch from the internal technical handoff.

## Part 1 — Customer pilot readout (4:15)

### 0:00–0:35 — Set up the decision

**Show:** Dashboard title, month picker set to January 2026, and decision snapshot banner.

“This is Wind Desk, a pilot view for the day-ahead buying team. The question it helps answer is: how much confidence should we place in the wind generation forecast that was available when tomorrow’s procurement decision had to be made? For this pilot we have deliberately used only Elexon national wind forecasts and metered wind outturn.”

### 0:35–1:20 — Explain the snapshot

**Show:** 11:00 UTC cutoff and the selected delivery period panel.

“For each delivery hour, we select the latest WINDFOR forecast published by 11:00 UTC on the prior day. That gives us an auditable decision-time snapshot instead of comparing actuals with a forecast that was revised after the decision. The timestamp is visible in the latest matched period panel.”

### 1:20–2:30 — Read the evidence

**Show:** Mean absolute error, root mean square error, mean bias, matched coverage; then the daily chart. Optionally switch to hourly.

“MAE is the typical size of the miss. RMSE gives larger misses more weight. Bias tells us whether the forecasts tended to run high or low. A positive bias means wind was over-forecast; if demand is unchanged, that can create under-buying exposure. The chart puts the forecast and actual series beside each other across the month so we can spot when the forecast diverged.”

“WINDFOR is hourly in the data we queried, while FUELHH is half-hourly. To compare like with like, the portal averages the two half-hour actual readings into each forecast hour. Coverage shows how much of the month has a valid matched pair.”

### 2:30–3:25 — Connect to the buying workflow

**Show:** Interpretation card and latest matched period.

“The forecast error is an input to a procurement decision, not a purchase recommendation on its own. The size of a prudent buffer should also consider the utility’s demand position, portfolio, thermal availability, and risk appetite. Those inputs are outside this pilot’s agreed data scope, so this view does not claim to calculate the full residual requirement.”

### 3:25–4:15 — Export and close

**Show:** Click **Export CSV**; briefly show the downloaded file.

"The desk can export the selected month’s forecast rows with publication time, forecast, actual, and signed error. Where an actual is unavailable, the row remains available with a blank match. That gives the team a traceable basis for review and follow-up calibration. This pilot demonstrates a transparent way to bring forecast confidence into tomorrow’s buying conversation."

## Part 2 — Technical lead review (4:15)

### 4:15–4:55 — Architecture

**Show:** Repository tree, `docker-compose.yml`, and the root `Dockerfile`.

“The app is a React, TypeScript, Tailwind CSS, and Vite client with a Python FastAPI service. The API service calls Elexon’s public BMRS Insights endpoints; the browser only calls our `/api/wind` endpoint. Docker Compose runs the frontend and API separately for local work. The root Dockerfile builds the static React bundle and serves it with FastAPI for a single-container deployment.”

### 4:55–6:10 — Data path and snapshot logic

**Show:** `backend/app/api/routes.py`, `backend/app/services/elexon.py`, and `backend/app/services/wind.py`.

“The backend requests FUELHH for the selected settlement-date month and filters to WIND. It requests WINDFOR across the publication window that includes the pre-month day-ahead forecasts. For each delivery timestamp it discards forecasts published after the decision cutoff, then keeps the most recently published eligible record. The default cutoff is 11:00 UTC and can be set through the API’s `decision_hour` parameter.”

“The join normalizes UTC timestamps. Since the feed resolution differs, it only forms an actual hourly value when both the :00 and :30 FUELHH values are present, then averages those values to match the hourly WINDFOR interval.”

### 6:10–7:10 — Analysis and UI

**Show:** The `accuracy_metrics` calculation in `backend/app/services/wind.py`, then `frontend/src/App.tsx`, `frontend/src/components/ForecastChart.tsx`, and `frontend/src/hooks/useWindData.ts`.

“For paired periods, error is forecast minus actual. MAE is the mean absolute error, RMSE the square root of mean squared error, and bias the mean signed error. Coverage is paired forecast hours divided by the number of expected hours in the month. Missing actual or forecast values are excluded from error metrics and remain visible in the downloaded rows.”

"The UI shows aggregate indicators first, a daily-average series for scanning the month, then the selected delivery period and interpretation guidance. The month picker defaults to January 2026 and reloads the selected month. CSV export preserves the hourly values and source publication timestamps."

### 7:10–8:00 — Practices and limits

**Show:** README data notes and Docker files.

“The service uses parameterized requests, explicit response handling, CORS configuration, and no fabricated fallback data. A source failure produces an error state. The README records the source endpoints, calculation definitions, run instructions, and scope boundary. The main operational limitation is that this dataset-only prototype has no demand, thermal availability, or market price data, so it must not be treated as a complete procurement optimizer.”

### 8:00–8:30 — Handoff

“To extend this safely, the next steps are to confirm the buyer’s actual decision cutoff, reconcile the snapshot rule with their auction workflow, and add governed demand and portfolio inputs only after the data scope is approved. This version gives us a reviewable foundation for the forecast side of that workflow.”
