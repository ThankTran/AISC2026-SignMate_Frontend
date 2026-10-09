# 🤟 SignMate

**Learn signs. Practice together. Connect with confidence.**

A Vietnamese sign language learning app built for **AISC 2026** — featuring guided lessons, camera-based practice, sign translation, and peer connection.

**React 19 · Vite 8 · Tailwind CSS 4 · Spring Boot · FastAPI**

[🚀 Setup & run](#2--setup--run) · [📦 Build](#4--build--preview) · [🔧 Troubleshooting](#6--troubleshooting)

## 1. 🧰 Requirements

These instructions use **Windows + PowerShell**.

| Install | Version / configuration |
| --- | --- |
| Git | Available in PATH |
| Node.js + npm | Node.js 22.13+ within 22.x, or 24+ |
| Java JDK | 17; set `JAVA_HOME` to the JDK folder |
| Python | 3.11, 64-bit; add to PATH |

Internet access is required for dependencies, AI models, and the video dataset. The local backend uses **H2**, so PostgreSQL is not required for this setup.

| Repository | Service | Port |
| --- | --- | --- |
| [Frontend](https://github.com/ThankTran/AISC2026-SignMate_Frontend) | Web interface | `5173` |
| [Backend](https://github.com/ThankTran/AISC2026-SignMate_Backend) | Accounts, lessons, progress | `8080` |
| [HandSign](https://github.com/quan14333/HandSign) | Camera practice evaluation | `8001` |
| [fast-api-trans-vsl](https://github.com/tapu25z/fast-api-trans-vsl) | Text, speech, and sign video translation | `8000` |

## 2. 🚀 Setup & run

### Step 1 — Clone all four repositories

Run in your project folder:

```powershell
git clone https://github.com/ThankTran/AISC2026-SignMate_Frontend.git
git clone https://github.com/ThankTran/AISC2026-SignMate_Backend.git
git clone https://github.com/quan14333/HandSign.git
git clone https://github.com/tapu25z/fast-api-trans-vsl.git
```

**All four repositories are required.** Keep them in the same parent folder. If a repository is already cloned, use the existing folder.

For each step below, open a **separate terminal from that parent folder** and keep the service running.

### Step 2 — Start the backend · Terminal 1

```powershell
cd AISC2026-SignMate_Backend
powershell -ExecutionPolicy Bypass -File .\run-local.ps1
```

✅ [Backend health](http://localhost:8080/actuator/health) should return `"status":"UP"`.

### Step 3 — Start HandSign · Terminal 2

```powershell
cd HandSign
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
.\.venv-handsign\Scripts\python.exe scripts/download_model.py
powershell -ExecutionPolicy Bypass -File .\run-api.ps1
```

✅ Open [HandSign lessons](http://127.0.0.1:8001/lessons) to check the response.

### Step 4 — Start the translation API · Terminal 3

```powershell
cd fast-api-trans-vsl
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-ml.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Create an [Ollama Cloud API key](https://ollama.com/settings/keys), update `.env`, and save:

```dotenv
OLLAMA_API_KEY=your_ollama_cloud_api_key
OLLAMA_HOST=https://ollama.com
OLLAMA_MODEL=gpt-oss:120b
```

Download the dataset and start the API:

```powershell
.\.venv\Scripts\python.exe scripts/download_kaggle_dataset.py
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

✅ Check [API health](http://127.0.0.1:8000/health) or open [API docs](http://127.0.0.1:8000/docs). Models may download on first use.

### Step 5 — Start the frontend · Terminal 4

```powershell
cd AISC2026-SignMate_Frontend
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Set these values and save. Leave the two AI URLs empty to use the local proxy:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=false
VITE_DEMO=false
VITE_HANDSIGN_API_URL=
VITE_VSL_API_URL=
```

```powershell
npm run dev -- --port 5173 --strictPort
```

🎉 Open **[http://localhost:5173](http://localhost:5173)**, register an email/password account, and allow camera/microphone access when prompted.

## 3. ⚡ Run again

After the first setup, run these commands in separate terminals **inside the corresponding repository**:

| Repository | Command |
| --- | --- |
| Backend | `powershell -ExecutionPolicy Bypass -File .\run-local.ps1` |
| HandSign | `powershell -ExecutionPolicy Bypass -File .\run-api.ps1` |
| fast-api-trans-vsl | `.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000` |
| Frontend | `npm run dev -- --port 5173 --strictPort` |

Open **[localhost:5173](http://localhost:5173)**. Press `Ctrl+C` in each terminal to stop.

To update: stop the services, run `git pull` in each repository, and reinstall dependencies if their files changed. Keep the backend's `data/` folder to preserve local accounts and progress.

## 4. 📦 Build & preview

Inside `AISC2026-SignMate_Frontend`, stop the dev server and run:

```powershell
npm run build
npm run preview -- --port 5173 --strictPort
```

Open **[localhost:5173](http://localhost:5173)**. Keep the backend and both AI services running.

| Command | Result |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production frontend files in `dist/` |
| `npm run preview` | Local preview of the build |
| `npm run lint` | ESLint checks |

### 🌐 Deploy

- Set `VITE_*` values before building; rebuild after changing them.
- Serve `dist/` over HTTPS with an `index.html` fallback for frontend routes.
- Point `VITE_API_BASE_URL` to the deployed backend and set its `CORS_ALLOWED_ORIGINS` to the frontend origin.
- Route `/handsign` to HandSign and `/vsl` to the translation API, stripping those prefixes and forwarding media requests too. Vite's local proxy is not included in `dist/`.
- Alternatively, configure the two AI URLs and their services' CORS settings. Place public HandSign access behind an authenticated gateway with request limits.

The frontend build contains only the web interface; deploy the backend and AI services separately. Never put API keys or server passwords in `VITE_*` variables or commit `.env` files.

## 5. 🗄️ PostgreSQL or Docker

Use either option **instead of** the H2 backend command. Run only one backend at a time.

### PostgreSQL

Install PostgreSQL, then run inside the backend repository:

```powershell
.\setup-postgres.ps1
.\run-postgres.ps1
```

Setup asks for the administrator's `postgres` password and creates the `signmate` role/database if missing. The run command uses the **`signmate` password**. The setup script defaults to PostgreSQL 18.

### Docker

Start Docker Desktop with Linux containers. Inside the backend repository, copy `.env.example` to `.env`, set your own `DATABASE_PASSWORD`, then run:

```powershell
docker compose up --build -d
```

Compose starts the backend and PostgreSQL; run the frontend and AI services separately. Its `prod` profile does not seed sample lessons. Stop with `docker compose down`; avoid `-v` to keep database data.

H2, local PostgreSQL, and Docker use separate databases. See the [backend setup guide](https://github.com/ThankTran/AISC2026-SignMate_Backend#readme) for configuration details.

## 6. 🔧 Troubleshooting

| Problem | Fix |
| --- | --- |
| Command not found | Check the required version and PATH, then open a new terminal. For Java, also check `JAVA_HOME` and `javac`. |
| PowerShell blocks scripts | For this trusted checkout, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in the current terminal. |
| Registration/login fails | Check backend health and `VITE_API_BASE_URL`. For 401/403 responses, sign in again. |
| CORS error | Use `http://localhost:5173`, or update backend `CORS_ALLOWED_ORIGINS` to match your frontend origin and restart. |
| Port already in use | Stop the previous service with `Ctrl+C`. |
| H2 database locked | Stop the previous backend or disconnect the database viewer; do not delete the database file. |
| Practice API fails | Check HandSign on port `8001`, its `/lessons` endpoint, and the downloaded model. |
| Translation fails | Check port `8000`, the Ollama key, network access, model downloads, and dataset videos. Read the translation terminal's error. |
| Dataset download interrupted | Rerun `scripts/download_kaggle_dataset.py` with the translation environment's Python. |
| `fastdtw` installation fails | Use Python 3.11 64-bit; install Microsoft C++ Build Tools if the pip error requests a C++ compiler. |
| Camera/microphone unavailable | Allow browser permissions and use localhost or HTTPS, including on phones. |
| Environment changes not applied | Check `.env.local` overrides, restart Vite, and rebuild if previewing `dist/`. |

## 👥 Contributors

- [Trần Thị Hồng Thanh](https://github.com/ThankTran)
- [Nguyễn Ngọc Lan Anh](https://github.com/ngnlananh)
- [Đào Thị Mai Chi](https://github.com/maichidao)

## 📄 License

[MIT License](LICENSE).
