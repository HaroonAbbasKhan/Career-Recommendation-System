
# 🎯 CareerAI — Pakistan Career Recommendation System

An end-to-end ML-powered web application that recommends the most suitable tech career for Pakistani students based on their academic background, skills, and interests.

> **Model Accuracy: 96.67%** | Trained on Pakistan-specific data | 15 career paths | 4.0 CGPA scale

---

## 📸 Screenshots

| Landing Page | Career Quiz | Results |
|---|---|---|
| ![Landing]() | ![Quiz]() | ![Results]() |

---

## 🚀 Features

- 🧠 **ML-Powered Recommendations** — Random Forest classifier trained on 1,200 Pakistan-specific student profiles
- 🎓 **Pakistan-Specific** — Supports local degrees (BSCS, BSSE, BSIT, BE, BBA), 4.0 CGPA scale, and Pakistani job market careers
- 📊 **Top 5 Career Matches** — Ranked results with confidence percentages and progress bars
- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 📁 **Recommendation History** — Every quiz result saved per user in MongoDB
- 📱 **Responsive UI** — Works on mobile and desktop

---

## 🏗️ Architecture

```
User → Next.js (Port 3000)
         ↓
    Express.js API (Port 5000)
         ↓              ↓
      MongoDB     FastAPI ML Service (Port 8000)
                        ↓
                 Scikit-Learn Model (.pkl)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS v4, Zustand |
| Backend | Express.js 5, Mongoose 9, JWT |
| ML Service | FastAPI, Scikit-Learn, joblib |
| Database | MongoDB |
| ML Model | Random Forest (96.67% accuracy) |

---

## 📁 Project Structure

```
Career-Recommendation-System/
├── frontend/                   # Next.js App
│   └── src/
│       ├── app/
│       │   ├── page.jsx        # Landing page
│       │   ├── (auth)/         # Login & Register
│       │   └── (app)/          # Dashboard, Quiz, Results
│       ├── store/              # Zustand state (auth, quiz)
│       └── lib/                # Axios instance
│
├── backend/                    # Express.js API
│   └── src/
│       ├── models/             # Mongoose schemas
│       ├── controllers/        # Route handlers
│       ├── services/           # Business logic
│       ├── middlewares/        # Auth, error handler
│       └── routes/             # API routes
│
└── ml-service/                 # FastAPI + Scikit-Learn
    ├── app.py                  # Prediction endpoint
    ├── ml_artifacts/
    │   ├── model.pkl           # Trained Random Forest
    │   ├── target_encoder.pkl  # Career label encoder
    │   ├── encoders.json       # Feature encoders
    │   └── feature_names.json  # Input feature order
    └── pakistan_career_dataset.csv
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 20+
- Python 3.10+
- MongoDB (local or Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Career-Recommendation-System.git
cd Career-Recommendation-System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/career_recommender
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

```bash
npm run dev
```

### 3. ML Service Setup

```bash
cd ml-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn scikit-learn joblib numpy pandas
uvicorn app:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

### 5. Open the App

```
http://localhost:3000
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Recommendation
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/recommend` | Get career recommendation | ✅ |
| GET | `/api/recommend/history` | Get past recommendations | ✅ |

### Profile
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/profile` | Get user profile | ✅ |
| PUT | `/api/profile` | Update user profile | ✅ |

### ML Service
| Method | Endpoint | Description |
|---|---|---|
| POST | `/predict` | Run prediction |
| GET | `/health` | Service health check |

---

## 🤖 ML Model Details

| Property | Value |
|---|---|
| Algorithm | Random Forest Classifier |
| Training Samples | 1,200 (80 per career) |
| Test Accuracy | **96.67%** |
| Features | 10 (degree, CGPA, skills, interests, etc.) |
| Target Classes | 15 careers |
| CGPA Scale | 0.0 – 4.0 (Pakistan standard) |

### Supported Career Predictions

Software Engineer · Full Stack Developer · Mobile App Developer · Data Scientist · ML/AI Engineer · Cloud Engineer · Cybersecurity Analyst · Network Engineer · Database Administrator · UI/UX Designer · DevOps Engineer · Business Analyst · IT Consultant · Data Analyst · Game Developer

---

## 🎓 Supported Pakistani Degrees

`BSCS` `BSSE` `BSIT` `BCS` `BE` `BBA` `BS Economics` `MCS`

---

## 👤 Author

**Haroon Abbas**
- GitHub: [@RealHaroon](https://github.com/HaroonAbbasKhan)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)

---

## 📄 License

This project is licensed under the MIT License.




