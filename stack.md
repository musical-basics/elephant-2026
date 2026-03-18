# Elephant V1.0 - Stack & Dependencies

## 🏗 Core Architecture
* **Frontend Framework:** Next.js (React)
  * *Why:* Perfect integration with Vercel. Allows for server-side rendering or static generation to keep the Do Now Page loading instantly.
* **Backend / Database:** Supabase (PostgreSQL)
  * *Why:* Handles the complex relational data between the Master List, Active Projects, and Errands. [cite_start]Excellent for running the heavy `ReprocessList` calculations and bulk index updates via SQL functions[cite: 181, 182, 185].
* **Hosting / Deployment:** Vercel
  * *Why:* Zero-config deployments, edge functions for fast database querying, and seamless integration with Next.js.

## 📱 Mobile-First & UI Dependencies
To achieve the native mobile feel outlined in the specs (like iPhone-style scrolling and swipe gestures):

* **Styling:** Tailwind CSS
  * *Why:* Utility-first CSS framework that makes building a responsive, mobile-first design incredibly fast. [cite_start]Perfect for styling the centered, stylized gold frame on the Do Now Page[cite: 41].
* **Mobile App Capabilities (PWA):** `next-pwa`
  * *Why:* Allows users to install Elephant V1.0 directly to their iOS or Android home screen as a Progressive Web App, giving it a standalone, native app feel without going through the App Store.
* **Animations & Gestures:** `framer-motion`
  * [cite_start]*Why:* Essential for implementing the "swipe left" to delete functionality on the Edit Project Page[cite: 78].
* **Drag and Drop:** `@dnd-kit/core` and `@dnd-kit/sortable`
  * *Why:* Highly customizable, mobile-friendly drag-and-drop library. [cite_start]Required for the feature where users can "long-press and hold to drag the item up and down the list in priority"[cite: 78].
* **UI Components (Optional but recommended):** Shadcn UI or Radix UI
  * [cite_start]*Why:* Provides unstyled, accessible primitives (like the date selector popup for Due Dates [cite: 75] [cite_start]and the tabs for Active/Inactive projects [cite: 35]).

## 🛠 Utility Dependencies
* **Date & Time Formatting:** `date-fns`
  * [cite_start]*Why:* Lightweight library to handle the "timecode of completion" tagging when a user presses "Completed!" [cite: 21][cite_start], as well as managing Project creation and due dates[cite: 74, 75].
* **State Management:** `zustand` (or React Context)
  * *Why:* A small, fast state-management bear. [cite_start]Great for holding the UI state of the "Take a Bite" prompt [cite: 187] without unnecessary re-renders.
* **File Exporting:** `file-saver` and `papaparse`
  * [cite_start]*Why:* `file-saver` helps trigger the browser download for the `.json` "Export Database" feature[cite: 245]. [cite_start]`papaparse` is excellent for converting your JSON array lists into CSV formats for the "Export CSV" button[cite: 249].