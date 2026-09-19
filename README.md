# WildWatch AI - Wildlife Habitat Monitoring System

An AI-powered environmental monitoring platform designed to detect habitat changes using satellite imagery, calculate environmental indices (NDVI, NDWI, NDBI), and provide AI-assisted insights using Gemini.

## Architecture
- **Frontend:** React, Vite, Tailwind CSS, React Leaflet (Map drawing & GeoJSON visualization), Recharts
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** MySQL (Configurable to SQLite for local demo testing)
- **Geo Engine:** Built-in Python integration with Copernicus Data Space Ecosystem (CDSE) APIs.
- **AI Integration:** Google Gemini for interpreting numerical environmental data.

## Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MySQL Server (If using `mysql+pymysql`)

## Environment Variables
Create a `.env` file in the `backend/` directory (see `.env.example`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wildwatch
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=super_secret_key
COPERNICUS_CLIENT_ID=your_cdse_client_id
COPERNICUS_CLIENT_SECRET=your_cdse_client_secret
GEMINI_API_KEY=your_gemini_api_key

DEMO_MODE=true
```

Create a `.env` file in the `frontend/` directory (see `.env.example`):
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_DEMO_MODE=true
```

## Setup & Installation

### 1. Backend & Geo Engine Setup
Open a terminal and navigate to the backend directory:
```bash
cd backend
```
Create and activate a virtual environment:
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```
Install Python dependencies:
```bash
pip install -r requirements.txt
```
Initialize the Database (Creates all necessary tables):
```bash
python init_db.py
```
Create a Test User (Admin account):
```bash
python create_user.py
```
Run the FastAPI Server:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```
Install dependencies:
```bash
npm install
```
Start the React Development Server:
```bash
npm run dev
```

## Running the Application
### Demo Mode
When `DEMO_MODE=true` in both backend and frontend `.env` files, the application will bypass Copernicus API calls and return deterministic mock GeoJSON data to ensure smooth presentations during hackathons without requiring a paid API or live connection. The AI insight will also use mock data if Gemini is not configured.

### Live Satellite Mode
To use real live satellite processing:
1. Ensure `COPERNICUS_CLIENT_ID` and `COPERNICUS_CLIENT_SECRET` are correctly set.
2. Set `DEMO_MODE=False` in backend `.env`.
3. Restart the backend server.
The system will now authenticate with CDSE, search for Sentinel-2 data within your provided AOI and Date range, and return genuine processed indicators.

## API Endpoints
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Get JWT
- `GET /api/areas/` - Get all saved monitoring areas
- `POST /api/analysis/{area_id}/run` - Trigger an environmental analysis job
- `POST /api/ai/insight` - Request Gemini AI interpretation

## Limitations & Security
- Never expose the `COPERNICUS_CLIENT_SECRET` or `GEMINI_API_KEY` in the frontend code.
- Satellite-derived indicators are estimations and do not serve as confirmed ground-truth ecological data.
- AI interpretation is generated for prioritization, not definitive proof of causes (like poaching/illegal activity).
