# System Documentation: Pahinga Norte Management System

## 1. System Architecture

### High-Level Diagram
The system follows a modern serverless architecture pattern using React for the presentation layer and Firebase for the backend services.

![System Architecture](https://ais-dev-7mmff7tzgiqmkk67loh44k-703325803487.asia-southeast1.run.app/system_architecture.svg)

### Tech Stack
| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend UI** | React + TypeScript | Modern functional components with hooks. |
| **Styling** | Tailwind CSS | Utility-first CSS framework for rapid and consistent design. |
| **Icons** | Lucide React | Clean, consistent SVG icons. |
| **Animations** | Framer Motion | Smooth transitions and macro-interactions. |
| **Database** | Firebase Firestore | NoSQL real-time document-based database. |
| **Authentication** | Firebase Auth | Secure user identity management (Email/Password). |
| **AI Integration** | Gemini Flash 1.5 | Used for automated ID document verification during registration. |
| **Hosting** | Vercel / Cloud Run | Robust, scalable cloud deployment. |

---

## 2. Database Design

### Data Dictionary

#### `users` Collection
| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique User ID (Firebase UID). |
| `fullName` | String | Complete legal name. |
| `email` | String | Registered email address. |
| `role` | Enum | User permission level (`resident` or `official`). |
| `purok` | String | Resident's street/area location. |
| `isVerified` | Boolean | True if ID verification passed. |

#### `donations` Collection
| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique record ID. |
| `item` | String | Category of donation. |
| `status` | Enum | `pending`, `approved`, `declined`, `completed`. |
| `donorName` | String | Name of the provider. |
| `date` | Timestamp | Date of submission. |

#### `appointments` Collection
| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique record ID. |
| `residentId` | String | Link to user record. |
| `serviceName`| String | Type of service (e.g., Barangay Clearance). |
| `status` | Enum | `pending`, `approved`, `cancelled`. |
| `date` | String | Scheduled date (YYYY-MM-DD). |

---

## 3. Component Design

### Modules
| Module | Purpose |
|--------|---------|
| **Dashboard** | Provides a statistical overview and quick access to features. |
| **Donation/Application** | Manages community contributions and resource requests. |
| **Audit & Transparency** | Displays financial reports and allows residents to request audits. |
| **Officials Module** | Directory of current and former barangay leaders. |
| **Messaging/Call** | Real-time communication between residents and officials. |
| **Appointments** | Booking system for barangay services and certifications. |

---

## 4. Key Functions
| Function | Description |
|----------|-------------|
| `handleIdVerification` | Uses Gemini AI to scan uploaded documents and match names for account security. |
| `addDonation` | Creates a new donation record; auto-approves if submitted by an official. |
| `sendMessage` | Handles real-time text and image communication via Firestore listeners. |
| `handleCall` | Manages WebRTC signaling for peer-to-peer audio calls within the system. |
| `seedOfficials` | Ensures the system is initialized with essential administrative data. |

---

## Instructions to Convert to PDF:
1. Open this file in a Markdown Editor (like VS Code, Obsidian, or an online viewer).
2. Use the **Export to PDF** feature within the editor.
3. If using VS Code, you can use the extension "Markdown PDF" to generate it instantly.
