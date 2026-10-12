# 🏛️ CivicSaarthi AI — Android & iOS Mobile Application
**EXODIA 2K26 — AI-Powered Civic Complaint Prioritization & Duplicate Detection**

Built with **React Native**, **Expo**, and **TypeScript**. Seamlessly integrated with the existing CivicSaarthi backend at `http://localhost:4000/api` and persistent SQLite database.

---

## 📱 Features Implemented

1. **Authentication & Multi-Persona Switcher:**
   - Pre-configured 1-tap switches between **👤 Citizen**, **👮 Officer Rao (Public Works)**, and **👑 SuperAdmin**.
   - Role-based authorization enforced on the backend.
2. **AI Complaint Reporting:**
   - Smart complaint creation with title, description, category, and GPS coordinates.
   - Real-time **Civic AI Analysis**:
     - Explainable Urgency Score (0–100) with visual meter.
     - Priority assessment (**Critical**, **High**, **Medium**, **Low**).
     - Automated department routing (Public Works, Water Board, Electricity, Sanitation, Disaster Response).
     - Risk factor breakdown tags (e.g. `+40 school/pedestrian zone`, `+30 depth hazard`).
3. **Automated Duplicate Detection:**
   - Real-time text & proximity comparison against existing open municipal complaints.
   - Shows similarity percentage and matching complaint IDs before submission.
4. **Interactive Civic GIS Map:**
   - Geospatial complaint radar and marker visualization.
   - Filter by civic categories and priority levels.
   - Interactive pin inspection showing tracking ID, status, and SLA.
5. **Complaint Ledger & 5-Stage Stepper:**
   - 5-stage lifecycle stepper: `Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`.
   - Citizen reopening feature for unresolved complaints.
   - 5-star citizen satisfaction ratings and feedback.
6. **Officer Case Workbench:**
   - Assigned complaints queue for department officers.
   - Live status transitions, officer progress notes, and resolution evidence logging.
7. **Public Safety & Emergency SOS:**
   - 1-tap Municipal Rapid SOS broadcast transmitting GPS coordinates to Disaster Response.
   - Direct dial access for national emergency hotlines (112, 100 Police, 101 Fire, 108 Ambulance, 1077 Disaster).
   - Feed of active public safety hazards.
8. **Admin Governance & Demo Tools:**
   - User and officer role management.
   - Department resolution metrics and workload tracking.
   - Real-time municipal audit log trail.
   - **1-Click Demo Reset** to reseed EXODIA 2K26 test complaints.
9. **UI/UX & Design:**
   - Light mode default with deep navy (`#0f172a`), teal (`#0d9488`), and purple (`#6366f1`) accents.
   - Dark mode toggle.
   - Accessible bottom navigation tabs: **Home**, **Civic Map**, **Report Issue**, **Complaints**, **Profile**.

---

## 🚀 Running the App Locally

### 1. Ensure Backend Server is Running
The CivicSaarthi backend runs on port 4000:
```bash
cd d:\civicsaarthi\civicsaarthi\server
npm start
```

### 2. Start the Expo Development Server
In the `civicsaarthi-mobile` directory:
```bash
cd d:\civicsaarthi\civicsaarthi-mobile
npm start
```
Or for web preview:
```bash
npx expo start --web
```

---

## 📲 How to Open on Android using Expo Go

1. **Install Expo Go** from Google Play Store on your Android phone.
2. Connect your Android phone to the **same Wi-Fi network** as your laptop.
3. Find your laptop's local IP address by running in PowerShell:
   ```powershell
   ipconfig
   ```
   (Look for *IPv4 Address*, e.g., `192.168.1.100`).
4. Run the mobile app with Expo:
   ```bash
   npx expo start --tunnel
   # OR
   npx expo start --host lan
   ```
5. Scan the QR code displayed in the terminal using the Expo Go camera on your Android phone.
6. In the app, navigate to **Profile (⚙️)** ➔ **Backend API Server Connection** and verify the IP is set to `http://<YOUR_LAPTOP_IP>:4000` (e.g. `http://192.168.1.100:4000`). Tap **Save & Test Server Connection**.

---

## 📦 How to Build an Android APK using EAS Build

To generate a standalone `.apk` installable directly on any Android device without Expo Go:

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Log in to your Expo account
```bash
eas login
```

### Step 3: Configure EAS project
```bash
eas build:configure
```

### Step 4: Add an APK build profile in `eas.json`
Create or edit `eas.json` in `civicsaarthi-mobile/`:
```json
{
  "cli": {
    "version": ">= 9.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### Step 5: Trigger Android APK Build
```bash
eas build -p android --profile preview
```
EAS Build will compile the native Android package in the cloud and provide a direct download link for the `.apk` file.

---

## 🧪 EXODIA 2K26 Demonstration Workflow

To demonstrate the full end-to-end civic complaint lifecycle to evaluators:

1. **Step 1 (Citizen):** Open the app (logged in as Citizen). Tap **Report Issue** or choose the **Deep Pothole (School Zone)** preset.
2. **Step 2 (AI Intelligence):** Tap **Analyze with Civic AI**. Note the explainable urgency score (e.g. `85/100`), priority `Critical`, target department `Public Works`, and detected nearby duplicate complaint.
3. **Step 3 (Submission):** Tap **Submit Civic Grievance**. Note the generated tracking ID (e.g. `CS-...`).
4. **Step 4 (Officer Triage):** Switch to **Officer Rao** via the Profile screen or top header. Open **Officer Case Workbench**, locate the new ticket, change status to **In Progress**, add an officer note, and save.
5. **Step 5 (Resolution):** Change status to **Resolved** with a note "Pothole filled with cold asphalt mix".
6. **Step 6 (Citizen Verification):** Switch back to **Citizen**. View the complaint in **Complaints** tab. Inspect the 5-stage timeline stepper marked green. Submit a 5-star citizen review or test the **Reopen Complaint** flow.
7. **Step 7 (Governance & Demo Reset):** Switch to **SuperAdmin**, inspect the live **Audit Logs**, and tap **1-Click Reset Demo Complaints** to return the environment to its clean state.
