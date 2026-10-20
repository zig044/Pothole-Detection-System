# Pothole Detection System

An AI-based project that detects potholes and road cracks from images and helps prioritise road maintenance based on the urgency of the reported damage.

## About the Project

Road potholes can cause accidents, damage vehicles, and create problems for daily commuters. Identifying damaged roads and deciding which ones need repairs first can be challenging.

I built this project to make that process easier using computer vision. The system uses a trained YOLO11 model to detect potholes and road cracks. It also includes a maintenance prioritisation feature that assigns priority levels to reports so that more urgent cases can be identified.

## What It Can Do

- Detect potholes and road cracks from uploaded images.
- Create and manage reports containing images and relevant details.
- Store report information in a PostgreSQL database.
- Assign maintenance priority scores based on factors such as severity, size, detection confidence, road importance, and repeated reports.
- Classify reports into Critical, High, Medium, and Low priority levels.
- Display reports through a dashboard and maintenance page.
- Provide a map interface for viewing location-based reports.

## Technologies Used

- **Python** – backend development and detection logic
- **YOLO11** – road damage detection
- **FastAPI** – backend APIs
- **PostgreSQL** – storing report information
- **SQLAlchemy** – database integration
- **React and TypeScript** – frontend development
- **Google Colab** – training the detection model

## How It Works

1. An image of a road is uploaded through the application.
2. The YOLO11 model analyses the image and detects road damage.
3. The backend processes the detection results and creates a report.
4. The report details are stored in the PostgreSQL database.
5. A prioritisation algorithm calculates a score using the available report information.
6. The dashboard and maintenance page display the reports and their priority levels.

## Project Structure

```text
Pothole-Detection-System/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── detector.py
│   │   ├── models.py
│   │   ├── prioritizer.py
│   │   ├── routers.py
│   │   └── schemas.py
│   ├── requirements.txt
│   └── best.pt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
└── .gitignore
```

## Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/zig044/Pothole-Detection-System.git
cd Pothole-Detection-System
```

### 2. Set up the backend

Create a virtual environment and activate it.

```bash
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the required Python packages:

```bash
pip install -r backend/requirements.txt
```

### 3. Configure the database

Install PostgreSQL and create a database for the project. Configure the database connection using the environment variables or settings expected by the backend.

Keep your database password and other private credentials out of GitHub.

### 4. Start the backend

From the main project folder, run:

```bash
uvicorn app.main:app --app-dir backend --reload
```

Once the server starts, open `http://127.0.0.1:8000/docs` to explore and test the API endpoints.

### 5. Start the frontend

Open another terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in the terminal to access the application.

### 6. Set up the YOLO model

Make sure the trained `best.pt` model is available at the location expected by the backend. The model path and any additional configuration should match the existing project code.

## Maintenance Prioritisation

One of the main features of this project is that it does more than detect road damage.

The prioritisation module calculates a weighted score using multiple factors, including severity, estimated size, detection confidence, road importance, and repeated reports. The score is then used to classify reports into priority levels.

This helps organise reported potholes according to their potential urgency rather than treating every report equally.

## What I Learned

While building this project, I gained practical experience with training and integrating an object detection model, developing APIs, connecting a database, and building a frontend that communicates with the backend.

I also learned how to combine detection results with a prioritisation mechanism to make the application more useful for maintenance planning.

## Future Improvements

- Improve the detection of smaller potholes.
- Train the model using a larger and more diverse dataset.
- Improve location accuracy and map-based reporting.
- Refine the prioritisation algorithm using additional road-condition information.

---

**Project:** Pothole Detection System  
**GitHub:** [zig044/Pothole-Detection-System](https://github.com/zig044/Pothole-Detection-System)
