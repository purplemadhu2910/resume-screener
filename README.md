# Resume Screener

AI-powered resume vs job description compatibility analyzer using TF-IDF + Cosine Similarity.

## Folder Structure

```
resume-screener/
├── backend/
│   ├── app.py              # Flask API
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ResumeScreener.jsx   # Main page
│       │   ├── FileUpload.jsx       # Drag-and-drop uploader
│       │   ├── ResultsDashboard.jsx # Results layout
│       │   ├── ScoreRing.jsx        # Animated SVG score ring
│       │   └── SkillBadge.jsx       # Skill pill badge
│       ├── App.jsx
│       └── index.css
├── start_backend.bat
└── start_frontend.bat
```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:5173](https://resume-screener-self.vercel.app/)**

## API

`POST /analyze`
- Form fields: `resume` (file), `job_description` (string)
- Returns:
```json
{
  "score": 72.4,
  "matched_skills": ["python", "react", "docker"],
  "missing_skills": ["kubernetes", "terraform"],
  "suggestions": ["Add missing skills...", "Quantify achievements..."]
}
```
