# Pahinga Norte Management System - System Documentation

## 2. System Architecture

### High-Level Diagram
[ Frontend: React UI ] ---> ( REST/WebSockets ) ---> [ Gemini AI: ID Scanner API ]
        |
        +---> ( Real-time Hooks / onSnapshot ) ---> [ Backend/Database: Firebase Firestore ]
        |
        +---> ( Authentication flows ) ---> [ Firebase Authentication ]
        |
        +---> ( Asset delivery ) ---> [ Firebase Cloud Storage / Base64 DB ]

### Tech Stack
* **Frontend Logic & UI:** React (v19), TypeScript, Vite
* **Styling & Styling Framework:** Tailwind CSS (v4)
* **Icons & Animation:** Lucide React, Motion (Framer Motion)
* **Database & BaaS:** Firebase Cloud Firestore (NoSQL realtime database)
* **Authentication:** Firebase Authentication
* **Artificial Intelligence:** Google Gemini AI API (@google/genai)
* **Real-Time Communication:** Socket.io, Firebase realtime listeners
* **Deployment:** Vercel

---

## 3. Database Design

### Entity-Relationship (ER) Diagram
* **User** (1) ----> (Many) **Donation** (A user can offer multiple donations or applications)
* **User** (1) ----> (Many) **Message** (A user can send/receive multiple messages)
* **User** (1) ----> (Many) **Appointment** (A user can schedule multiple appointments)
* **User** (1) ----> (Many) **Call** (A user can participate in multiple voice/video calls)
* **Official** (1) ----> (Many) **Appointment** (An official manages multiple appointments)
* **System Settings** (1) ----> (Many) **User** (Global system preferences impact all users)

### Data Dictionary

| Collection / Entity | Field Name | Data Type | Description |
| --- | --- | --- | --- |
| **`users`** | `uid` | String | Primary Key (from Auth) |
| | `email` | String | User's registered email address |
| | `fullName` | String | Complete basic name of the individual |
| | `role` | String | Determines access ('resident', 'official') |
| | `photoURL` | String | Base64 string for profile picture |
| **`donations`** | `id` | String | Primary Key |
| | `item` | String | Category of the donated material |
| | `quantity` | Number | Quantity or amount of the item |
| | `status` | String | Current state (e.g., 'pending', 'available') |
| | `donorUid` | String | Foreign Key referencing the user's uid |
| **`messages`** | `id` | String | Primary Key |
| | `senderId` | String | Foreign Key referencing sender (user) |
| | `receiverId` | String | Foreign Key referencing receiver |
| | `text` | String | Text content of the chat message |
| | `timestamp` | Timestamp | Record creation time |
| **`appointments`** | `id` | String | Primary Key |
| | `residentId` | String | Foreign Key referencing the resident |
| | `serviceName` | String | The barangay service requested |
| | `date` | String | Date of the appointment |
| | `status` | String | Current state (e.g., 'pending', 'approved') |
| **`system_settings`** | `id` | String | Primary Key ('logo') |
| | `logoUrl` | String | Base64 image string of the System Logo |
| | `updatedBy` | String | Reference to the admin who updated the logo |

---

## 4. Component Design

### Modules
* **Authentication & Onboarding Module:** Handles creating accounts, logging in, and scanning/verifying valid ID cards using artificial intelligence.
* **Donation & Inventory Management Module:** Allows administrators to track active commodities and residents to offer or apply for assistance.
* **Communication & Telehealth Module:** Manages the real-time chat interface and WebRTC-based video/audio calls between residents and the barangay unit.
* **Audit & Transparency Module:** A specific section for viewing municipal budget allocations, tracking expenses, and submitting resident-initiated audit requests.
* **System & Configuration Module:** Provides main administrators the capability to alter high-level configurations like the system logo, themes, and accounts.

### Key Functions
* `verifyIDCard()`: Uses Google Gemini AI to analyze, extract data from, and validate user-uploaded ID cards.
* `addDonation()`: Saves a new resource record, distinguishing between an admin encoding direct inventory and a resident submitting an offer for pending review.
* `handleLogoUpload()`: Compresses a selected image file to under 2MB and sets it universally as the system logo across all dashboards.
* `sendMessage()` / `handleCall()`: Initiates standard text or real-time audiovisual connection links between clients routing through the Firestore structure.
* `handleResetSystem()`: Specifically executes a batch deletion across all transactional collections while completely isolating and preserving the Main Admin's core account.
* `updateDonationStatus()`: Adjusts the logistical status of a material record (e.g., pending_donation to available), notifying the relevant donors/beneficiaries automatically.
