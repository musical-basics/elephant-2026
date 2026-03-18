# Product Requirements Document: Elephant V1.0

---

## 1. Product Overview & Objective

| Field | Detail |
|-------|--------|
| **Product Name** | Elephant V1.0 |
| **Core Philosophy** | "How do you eat an elephant? One bite at a time." |
| **Primary Goal** | A productivity / to-do app that shows users the **minimum possible information** for their current task, preventing overwhelm. |
| **Core Mechanism** | The app surfaces only **1 item at a time**, drawn from a hidden **Master List** that blends project tasks and smaller errands — giving users a healthy mix of hard work and easy wins. |

---

## 2. Core App Objects

### Items
- The core building blocks for a better future.
- Consciously named **"Items"** (not "tasks") to avoid the chore-like connotation.

### Errands
- Project-less Items that act as little **"snacks"** between heavier, higher-pressure Items.

### Projects
- Ordered lists of Items, executed **sequentially**.
- Each project has a **Priority Score** from **1** (less important) to **5** (super important).
- Higher priority → Items surface **more frequently** in the Master List.

---

## 3. Core App Lists

### Master List
- A **hidden, non-editable** list that operates like a line at a doctor's office.
- Contains both **Project Items** and **Errands**.
- Items **never lose their place** in line once ordered.
- Uses **Project Placeholders** in the back-end to maintain a project's reserved spots while letting users reorder items within the project itself.

### Completed List
- Archived list of completed Items, each tagged with a **completion timecode**.

### Active Project List
- Contains all **ongoing** projects.

### Inactive Project List
- Contains **upcoming** projects where all Items are currently inactive.

### Completed Project List
- Contains **finished** projects.

### Project Items List
- The specific Items within a given Project.

---

## 4. User Experience & Pages

### 4.1 Home Page

**Purpose:** Initial landing page with a welcoming message and profile picture (e.g., *"Welcome, Lionel!"*).

**Primary Buttons (4):**

| Button | Action |
|--------|--------|
| **Start Working** | Navigate to the Do Now Page |
| **Manage Projects** | Navigate to the Project List Page |
| **Completed List** | View completed items |
| **Settings** | Open Settings |

**Additional Controls:**
- **"View Master List"** — hidden by default; toggleable via Settings.
- **"Add Item" (+)** — top-right corner.

---

### 4.2 Do Now Page

> A **minimalist** view showing only the **#1 Item** from the Master List.

**Display:**
- Item text is **prominently centered** inside a stylized, flowery gold frame.
- The associated **Project Name** appears **35–50% smaller**, directly underneath the frame.
  - Blank for Errands.

**Controls:**

| Button | Position | Action |
|--------|----------|--------|
| ✅ **"Completed!"** | Lower-right (green) | Triggers `CompleteItem` + `ReprocessList` |
| 🔴 **"Take a Bite"** | Lower-left (red) | Splits the current item into smaller pieces |

**Navigation:**
- **"Add Item" (+)** — top-right corner.
- **"Back to Homepage"** — upper-left corner.

---

### 4.3 Project List Page

- **Two tabs:** Active Projects · Inactive Projects
- Scrollable table with columns: **Project Name**, **Priority**, **Date** (optional).
- Sortable by **alphabetical order** or **priority**.

### 4.4 Edit Project Page

- Modify project attributes: **Name**, **Priority**, **Due Date**.
- **Click** to edit an item name.
- **Swipe left** to delete an item.
- **Long-press + drag** to reorder items (adjusts internal priority).

---

## 5. Core Logic & App Engine

### 5.1 `CompleteItem` & `ReprocessList`

**Flow:**
1. User taps **"Completed!"**.
2. The **#1 Item** moves to the **Completed List** (with a timestamp).
3. The Master List **re-indexes** every remaining item.
4. `ReprocessList` runs:
   - Recalculates **TNML** (Total Number of Master List Items).
   - Executes the **PPFI** (PingProjectForItem) calculation for every project.

---

### 5.2 Insertion Algorithm — `PingProjectForItem` (PPFI)

**Variables:**

| Variable | Description |
|----------|-------------|
| **PLPI** | Position of the Last Active Project Item in the Master List |
| **TNML** | Total Number of Master List Items |

**Formulas:**

| Metric | Formula |
|--------|---------|
| **Project Insertion Threshold (PIT)** | `1 / Project Priority` |
| **Project Ready Score (PRS)** | `1 − (PLPI / TNML)` |

**Decision Rule:**
> If **PRS > PIT**, activate the topmost inactive item of the project and **append it to the bottom** of the Master List.

**Intuition:** Higher-priority projects have a *lower* threshold, so their items get pulled in more frequently.

---

### 5.3 "Take a Bite" Functionality

**Trigger:** User taps the red **"Take a Bite"** button when an item feels too large or complex.

**Prompt UI — Two text fields:**

| Field | Pre-filled? | Purpose |
|-------|-------------|---------|
| **Field 1** | Yes (original item text) | Rename / refine the current item |
| **Field 2** | No (blank) | Create a new sub-item |

**On "Complete":**
1. The **#1 item is renamed** with the text from Field 1.
2. A **new Item** is created from Field 2 and added to the **bottom of the Master List**.

**Special behavior for Project Items:**
- The new item is placed **directly below** the renamed item within the project's internal sequence.
- Master List **Placeholders adjust** to reflect the updated task breakdown.

---

## 6. Settings & Data Management

| Setting | Description |
|---------|-------------|
| **Show Master List** | Toggles visibility of the Master List button on the Home Page |
| **Export Database** | Downloads all data as a `.json` file |
| **Import Database** | Uploads a `.json` file — overwrites all data after a confirmation dialog |
| **Export CSV** | User selects which lists to export (Master, Completed, Active Projects, etc.) |
| **Reset App** | Deletes all lists for a full application reset (requires confirmation) |