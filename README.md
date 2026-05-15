

# Van Alen Institute Public Art Impact Measurement System

## Project Overview

The Van Alen Institute, a nonprofit organization dedicated to inclusive urban design, is launching two community-led public art installations in Spring 2025. To measure the impact of these installations, a data collection application is being developed to facilitate real-time data gathering, survey inputs, and observational logging at installation sites. This system will provide automated data analysis, visualization tools, and reporting capabilities, allowing stakeholders to make data-driven decisions and advocate for further community-focused public art initiatives.

## Features

- **Real-time Data Collection**: Users can input survey responses and observational logs directly from installation sites.
- **Automated Data Analysis**: The system processes collected data to generate meaningful insights.
- **Visualization Tools**: Interactive charts and graphs for a clear representation of engagement metrics.
- **Reporting Capabilities**: Generate reports for stakeholders to assess project impact.
- **User-Friendly Interface**: Intuitive design for ease of use by community partners and researchers.

## Tech Stack

- **Frontend**: React
- **Backend**: Python Flask
- **Database**: Firestore (NoSQL)

---

## 🏛️ Van Alen Institute Staff Guide

This section is intended for Van Alen Institute staff who need to deploy, access, or manage the VAI Data System. No coding experience is required.

### 📺 Deployment Tutorial Video

The video below walks through the full process of forking the repository and deploying the website to Vercel from start to finish.

[![Watch the deployment tutorial](https://img.youtube.com/vi/xCMa0MGDjG8/0.jpg)](https://youtu.be/xCMa0MGDjG8)

The tutorial covers:
- Forking the GitHub repository to your own account
- Importing the project into Vercel
- Configuring environment variables
- Deploying and verifying the live site

---

### 🔑 Firebase Access & Ownership Transfer

The VAI Data System uses **Firebase** for its database and authentication. To fully deploy and operate the system, Van Alen will need ownership access to the Firebase project.

**To request access:**

Contact **Joel Vasquez** at [jfvasq1@gmail.com](mailto:jfvasq1@gmail.com) to initiate an ownership transfer of the Firebase project. Once transferred, you will have full access to:
- The Firestore database (where all survey and observational data is stored)
- Firebase Authentication (user management)
- The environment variable credentials needed to complete your Vercel deployment

> ⚠️ **Do not attempt to deploy the application without first obtaining Firebase credentials.** The app will not function without them.

---

### 🌐 Using the Website

Once deployed, the VAI Data System allows staff and community partners to:

- **Log in** using an email and password (set up through Firebase Authentication)
- **Submit survey responses** and observational data directly from installation sites
- **View data visualizations** including charts and engagement metrics
- **Generate reports** for stakeholder review

Access to the system is managed through Firebase Authentication. New users must be added by an administrator with Firebase access.

---

### 📱 QR Code

A QR code linking directly to the deployed website is included in the codebase as `survey_qr.png` in the root of the repository. This can be printed and displayed at installation sites for easy visitor access.

---

### 📬 Support

For any technical issues, deployment questions, or access requests, contact:
**Joel Vasquez** — [jfvasq1@gmail.com](mailto:jfvasq1@gmail.com)

---

## 💻 Developer Guide

This section is intended for developers who want to run the VAI Data System locally or contribute to the codebase.

### ✅ Prerequisites

Install the following tools:

* **Node.js and npm**

  * Recommended via Homebrew: [https://formulae.brew.sh/formula/node](https://formulae.brew.sh/formula/node)
  * Additional guide: [Install Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

* **Python 3.11**

  * This project requires **Python 3.11 specifically**.
  * Download: [https://www.python.org/downloads/release/python-3110/](https://www.python.org/downloads/release/python-3110/)
  * Verify your version: `python3 --version`

* **Git**

  * Download: [https://git-scm.com/downloads](https://git-scm.com/downloads)

You will also need:

* A **Google account** (for Firebase)
* A **GitHub account** (to fork and access the repository)

---

### 📁 Setting Up the Project Locally

#### 1. Fork and Clone the Repository

* Repository: [https://github.com/iden-a/VAI-DataSystem](https://github.com/iden-a/VAI-DataSystem)
* Click the **"Fork"** button in GitHub
* After forking, clone it:

  ```bash
  git clone git@github.com:your-username/VAI-DataSystem.git
  cd VAI-DataSystem
  ```

---

### 🌐 Frontend Setup

```bash
cd frontend
npm install
touch .env
```

* In your `.gitignore`, ensure it includes:

  ```
  **/.env
  ```

* If you accidentally push your `.env`:

  ```bash
  git rm --cached frontend/.env
  git commit -m "remove .env from tracking"
  git push
  ```

* To run the frontend server:

  ```bash
  npm run dev
  ```

---

### 🔥 Firebase / Firestore Setup

#### 🔧 Video Guide (watch up to 3:35): [Firebase Setup Video](#)

#### 1. Create Firebase Project

* Go to: [Firebase Console](https://console.firebase.google.com)
* Project name: `VAI-DataSystem`
* Use default settings

#### 2. Set Up Firestore Database

* Navigate to **Build > Firestore Database**
* Click **Next**, select **Start in production mode**, then click **Create**

#### 3. Generate Service Account Key

* Go to **Project Settings > Service Accounts**
* Click **Generate new private key**
* A `.json` file will be downloaded
* Rename it to: `firebase_key.json`
* Move it into your backend directory:

  ```
  backend/app/firebase_key.json
  ```

#### 4. Enable Authentication

* Navigate to **Build > Authentication > Sign-in Method**
* Enable **Email/Password**
* Click **Save**

#### 5. Register the Web App

* Go to **Project Settings > Your Apps**
* Click the `</>` Web icon
* App name: `VAI-Web`
* Uncheck/Skip Firebase Hosting for now
* Copy the generated `firebaseConfig` object

#### 6. Update `.env` in `frontend/`

* Add the values from `firebaseConfig` like so:

  ```
  VITE_API_KEY=your-api-key
  VITE_AUTH_DOMAIN=your-auth-domain
  ...
  ```

---

### 🖥️ Backend Setup

```bash
cd ..
cd backend
python3 -m venv venv
source venv/bin/activate      # Mac/Linux
# OR
venv\Scripts\activate         # Windows

pip install -r requirements.txt
touch .env
```

#### Add the following to `backend/.env`:

```
FIREBASE_KEY_PATH=app/firebase_key.json
FRONTEND_URL=http://localhost:5173
```

#### Ensure your `.gitignore` includes:

```
venv/
.env
app/firebase_key.json
app/__pycache__/
```

#### Run the Backend:

```bash
python3 run.py
```

---

### ✅ Running the Full App Locally

* **Frontend**:

  ```bash
  cd frontend
  npm run dev
  ```

* **Backend**:

  ```bash
  cd backend
  source venv/bin/activate
  python3 run.py
  ```
