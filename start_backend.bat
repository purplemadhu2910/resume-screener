@echo off
echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
echo.
echo Starting Flask backend on http://localhost:5000
python app.py
