# 🐘 Elephant V1.0 — Full Implementation Plan

> **Audience:** An AI coding agent that needs explicit file paths, code snippets, SQL, and function signatures to build this app from scratch.

---

## Tech Stack Summary

| Layer | Tool | Package |
|-------|------|---------|
| Framework | Next.js 14+ (App Router) | `next`, `react`, `react-dom` |
| Language | TypeScript | `typescript` |
| Styling | Tailwind CSS | `tailwindcss` |
| Database | Supabase (PostgreSQL) | `@supabase/supabase-js` |
| State | Zustand | `zustand` |
| PWA | next-pwa | `next-pwa` |
| Animations | Framer Motion | `framer-motion` |
| Drag & Drop | dnd-kit | `@dnd-kit/core`, `@dnd-kit/sortable` |
| UI Primitives | Shadcn UI (Radix) | `shadcn-ui` |
| Icons | Lucide | `lucide-react` |
| Dates | date-fns | `date-fns` |
| Export JSON | file-saver | `file-saver` |
| Export CSV | PapaParse | `papaparse` |
| Hosting | Vercel | — |

---

## Phase 1: Project Setup (Steps 1–5)

### 1.1 Initialize Project

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --app --eslint --src-dir --use-pnpm
```

### 1.2 Install Dependencies

```bash
pnpm add @supabase/supabase-js zustand date-fns file-saver papaparse framer-motion @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react next-pwa
pnpm add -D @types/file-saver @types/papaparse
```

### 1.3 Configure PWA — `next.config.js`

```js
const withPWA = require("next-pwa")({ dest: "public", disable: process.env.NODE_ENV === "development" });
module.exports = withPWA({ /* existing next config */ });
```

### 1.4 Init Shadcn UI

```bash
npx -y shadcn-ui@latest init
npx -y shadcn-ui@latest add button input dialog tabs popover
```

### 1.5 Mobile-First Layout Constraint — `src/app/layout.tsx`

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white min-h-screen flex justify-center">
        <div className="w-full max-w-md mx-auto overflow-hidden min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}
```

---

## Phase 2: Database Schema (Steps 6–11)

### 2.1 TypeScript Interfaces — `src/types/index.ts`

```ts
export interface Project {
  projectId: string;        // UUID
  projectName: string;
  priority: 1 | 2 | 3 | 4 | 5;
  createdDate: string;      // ISO timestamp
  dueDate: string | null;
  status: "active" | "inactive" | "completed";
}

export interface ProjectItem {
  itemId: string;           // UUID
  projectId: string;        // FK → Projects
  itemName: string;
  isActive: boolean;
  orderIndex: number;       // position within project
}

export interface MasterListItem {
  mlpIndex: number;         // 1-based position
  itemId: string;
  itemName: string;
  isErrand: boolean;
  projectId: string | null; // null for errands
  isPlaceholder: boolean;
}

export interface CompletedItem {
  itemId: string;
  itemName: string;
  projectId: string | null;
  dateTimeCompleted: string; // ISO timestamp
}
```

### 2.2 Supabase SQL Migrations

> ⚠️ **DO NOT RUN THESE DIRECTLY.** Provide to the user to run manually.

```sql
-- Table: projects
CREATE TABLE projects (
  project_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name   TEXT NOT NULL,
  priority       INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
  created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date       TIMESTAMPTZ,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','completed'))
);

-- Table: project_items
CREATE TABLE project_items (
  item_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  item_name    TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT false,
  order_index  INTEGER NOT NULL DEFAULT 0
);

-- Table: master_list
CREATE TABLE master_list (
  mlp_index      SERIAL PRIMARY KEY,
  item_id        UUID NOT NULL,
  item_name      TEXT NOT NULL,
  is_errand      BOOLEAN NOT NULL DEFAULT false,
  project_id     UUID REFERENCES projects(project_id) ON DELETE SET NULL,
  is_placeholder BOOLEAN NOT NULL DEFAULT false
);

-- Table: completed_list
CREATE TABLE completed_list (
  item_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name            TEXT NOT NULL,
  project_id           UUID REFERENCES projects(project_id) ON DELETE SET NULL,
  date_time_completed  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 Supabase Client — `src/lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js";

// USE SERVICE ROLE KEY (server-side only, never expose to browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## Phase 3: State Management (Steps 12–16)

### 3.1 Zustand Store — `src/store/useAppStore.ts`

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  showMasterList: boolean;
  toggleShowMasterList: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      showMasterList: false,
      toggleShowMasterList: () => set((s) => ({ showMasterList: !s.showMasterList })),
    }),
    { name: "elephant-settings" }
  )
);
```

### 3.2 Date Utilities — `src/lib/dateUtils.ts`

```ts
import { format, formatDistanceToNow } from "date-fns";

export const formatTimestamp = (iso: string) => format(new Date(iso), "MMM d, yyyy h:mm a");
export const formatRelative  = (iso: string) => formatDistanceToNow(new Date(iso), { addSuffix: true });
export const nowISO          = () => new Date().toISOString();
```

### 3.3 Nav Header — `src/components/NavHeader.tsx`

```tsx
"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

export default function NavHeader({ showBack = true }: { showBack?: boolean }) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  return (
    <header className="flex items-center justify-between p-4">
      {showBack && (
        <button onClick={() => router.push("/")}><ArrowLeft size={24} /></button>
      )}
      <button onClick={() => setShowAddModal(true)}><Plus size={24} /></button>
      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} />}
    </header>
  );
}
```

### 3.4 Add Item Modal — `src/components/AddItemModal.tsx`

The modal contains:
- A **toggle** to switch between "Errand" and "Project Item"
- A **text input** for the item name
- If "Project Item" is selected, a **dropdown** to pick the target project
- On submit: insert into `master_list` (errand) or `project_items` + placeholder in `master_list` (project item)

---

## Phase 4: Home Page & Projects UI (Steps 17–21)

### 4.1 Home Page — `src/app/page.tsx`

```tsx
"use client";
import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";

export default function HomePage() {
  const showMasterList = useAppStore((s) => s.showMasterList);
  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <img src="/profile.png" alt="profile" className="w-24 h-24 rounded-full" />
      <h1 className="text-2xl font-bold">Welcome, Lionel!</h1>

      <div className="grid grid-cols-2 gap-4 w-full">
        <Link href="/do-now"    className="btn-primary">🚀 Start Working</Link>
        <Link href="/projects"  className="btn-primary">📂 Manage Projects</Link>
        <Link href="/completed" className="btn-primary">✅ Completed List</Link>
        <Link href="/settings"  className="btn-primary">⚙️ Settings</Link>
      </div>

      {showMasterList && (
        <Link href="/master-list" className="btn-secondary mt-4">👁 View Master List</Link>
      )}
    </div>
  );
}
```

### 4.2 Project List Page — `src/app/projects/page.tsx`

- Use **Shadcn `<Tabs>`** with two panels: "Active Projects" / "Inactive Projects"
- Fetch from `projects` table filtered by `status`
- Each row shows: **Project Name**, **Priority** (badge), **Due Date**
- Sorting buttons: Alphabetical ↕ / Priority ↕
- Click a row → navigate to `/projects/[id]`

### 4.3 Edit Project Page — `src/app/projects/[id]/page.tsx`

- Editable fields: **Name**, **Priority** (1–5 selector), **Due Date** (date picker)
- Item list with:
  - **Click** item text → inline edit (input replaces text)
  - **Swipe left** → delete (use `framer-motion` `drag="x"` with threshold)
  - **Long-press drag** → reorder (use `@dnd-kit/sortable`)
- All mutations sync `order_index` in `project_items` table immediately

#### Swipe-to-Delete Pattern (Framer Motion)

```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 0 }}
  onDragEnd={(_, info) => {
    if (info.offset.x < -80) deleteItem(item.itemId);
  }}
>
  {item.itemName}
</motion.div>
```

#### Drag-to-Reorder Pattern (dnd-kit)

```tsx
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";

function SortableItem({ item }: { item: ProjectItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.itemId });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return <div ref={setNodeRef} style={style} {...attributes} {...listeners}>{item.itemName}</div>;
}
```

---

## Phase 5: Do Now Page (Steps 27–31)

### `src/app/do-now/page.tsx`

```tsx
"use client";

export default function DoNowPage() {
  const [currentItem, setCurrentItem] = useState<MasterListItem | null>(null);
  const [showBiteModal, setShowBiteModal] = useState(false);

  useEffect(() => {
    // Fetch the #1 item: SELECT * FROM master_list ORDER BY mlp_index ASC LIMIT 1
    fetchTopItem().then(setCurrentItem);
  }, []);

  if (!currentItem) return <EmptyState />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <NavHeader />

      {/* Gold Frame */}
      <div className="border-4 border-amber-400 rounded-2xl p-8 shadow-[0_0_30px_rgba(251,191,36,0.3)] bg-gradient-to-b from-amber-50/10 to-transparent">
        <p className="text-2xl font-bold text-center">{currentItem.itemName}</p>
      </div>

      {/* Project Name (35-50% smaller) */}
      {!currentItem.isErrand && currentItem.projectId && (
        <p className="text-sm text-neutral-400 mt-3">{projectName}</p>
      )}

      {/* Action Buttons — fixed bottom */}
      <div className="fixed bottom-8 left-0 right-0 max-w-md mx-auto flex justify-between px-8">
        <button className="bg-red-600 text-white px-6 py-3 rounded-full"
          onClick={() => setShowBiteModal(true)}>
          🔴 Take a Bite
        </button>
        <button className="bg-green-600 text-white px-6 py-3 rounded-full"
          onClick={() => handleComplete(currentItem)}>
          ✅ Completed!
        </button>
      </div>

      {showBiteModal && <TakeABiteModal item={currentItem} onClose={() => setShowBiteModal(false)} />}
    </div>
  );
}
```

---

## Phase 6: Core Engine Logic (Steps 32–36)

> **This is the most critical section.** These are server actions in `src/lib/engine.ts`.

### 6.1 `completeItem(item)`

```ts
export async function completeItem(item: MasterListItem) {
  // 1. Insert into completed_list
  await supabase.from("completed_list").insert({
    item_id: item.itemId,
    item_name: item.itemName,
    project_id: item.projectId,
    date_time_completed: new Date().toISOString(),
  });

  // 2. Delete from master_list
  await supabase.from("master_list").delete().eq("item_id", item.itemId);

  // 3. If it was a project item, check if project is now complete
  if (item.projectId) {
    const { data: remaining } = await supabase
      .from("project_items")
      .select("item_id")
      .eq("project_id", item.projectId)
      .eq("is_active", true);
    // Also remove from project_items or mark complete
  }

  // 4. Trigger reprocess
  await reprocessList();
}
```

### 6.2 `reprocessList()`

```ts
export async function reprocessList() {
  // Step 1: Re-index all mlp_index values (1-based, sequential)
  const { data: allItems } = await supabase
    .from("master_list")
    .select("*")
    .order("mlp_index", { ascending: true });

  if (!allItems) return;

  // Re-index
  for (let i = 0; i < allItems.length; i++) {
    await supabase
      .from("master_list")
      .update({ mlp_index: i + 1 })
      .eq("item_id", allItems[i].item_id);
  }

  const TNML = allItems.length; // Total Number of Master List Items

  // Step 2: Ping every active project (PPFI)
  const { data: activeProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "active");

  if (!activeProjects) return;

  for (const project of activeProjects) {
    await pingProjectForItem(project, TNML);
  }

  // Step 3: Final re-index after any new items were appended
  await reindexMasterList();
}
```

### 6.3 `pingProjectForItem(project, TNML)` — The PPFI Algorithm

```ts
async function pingProjectForItem(project: Project, TNML: number) {
  // Find PLPI: position of the LAST active item from this project in the master list
  const { data: projectItems } = await supabase
    .from("master_list")
    .select("mlp_index")
    .eq("project_id", project.projectId)
    .eq("is_placeholder", false)
    .order("mlp_index", { ascending: false })
    .limit(1);

  const PLPI = projectItems?.[0]?.mlp_index ?? 0;

  // Calculate thresholds
  const PIT = 1 / project.priority;         // Project Insertion Threshold
  const PRS = 1 - (PLPI / TNML);            // Project Ready Score

  // Decision: if PRS > PIT, activate next item
  if (PRS > PIT) {
    // Find the topmost INACTIVE item in this project
    const { data: nextItem } = await supabase
      .from("project_items")
      .select("*")
      .eq("project_id", project.projectId)
      .eq("is_active", false)
      .order("order_index", { ascending: true })
      .limit(1);

    if (nextItem && nextItem[0]) {
      // Activate it
      await supabase
        .from("project_items")
        .update({ is_active: true })
        .eq("item_id", nextItem[0].item_id);

      // Append to bottom of master list
      const { data: maxIndex } = await supabase
        .from("master_list")
        .select("mlp_index")
        .order("mlp_index", { ascending: false })
        .limit(1);

      const newIndex = (maxIndex?.[0]?.mlp_index ?? 0) + 1;

      await supabase.from("master_list").insert({
        mlp_index: newIndex,
        item_id: nextItem[0].item_id,
        item_name: nextItem[0].item_name,
        is_errand: false,
        project_id: project.projectId,
        is_placeholder: false,
      });
    }
  }
}
```

### 6.4 `takeABite(item, renamedText, newItemText)`

```ts
export async function takeABite(
  item: MasterListItem,
  renamedText: string,
  newItemText: string
) {
  // 1. Rename the current #1 item
  await supabase
    .from("master_list")
    .update({ item_name: renamedText })
    .eq("item_id", item.itemId);

  if (item.isErrand) {
    // 2a. ERRAND: new item goes to bottom of master list
    const newIndex = await getNextMlpIndex();
    await supabase.from("master_list").insert({
      mlp_index: newIndex,
      item_id: crypto.randomUUID(),
      item_name: newItemText,
      is_errand: true,
      project_id: null,
      is_placeholder: false,
    });
  } else {
    // 2b. PROJECT ITEM: insert new item directly below renamed item in project sequence
    const { data: currentProjectItem } = await supabase
      .from("project_items")
      .select("order_index")
      .eq("item_id", item.itemId)
      .single();

    const currentOrder = currentProjectItem?.order_index ?? 0;

    // Shift all subsequent items down by 1
    await supabase.rpc("shift_project_items_down", {
      p_project_id: item.projectId,
      p_after_index: currentOrder,
    });

    // Insert new item at currentOrder + 1
    const newItemId = crypto.randomUUID();
    await supabase.from("project_items").insert({
      item_id: newItemId,
      project_id: item.projectId,
      item_name: newItemText,
      is_active: false,
      order_index: currentOrder + 1,
    });

    // Update the renamed item in project_items too
    await supabase
      .from("project_items")
      .update({ item_name: renamedText })
      .eq("item_id", item.itemId);
  }
}
```

**Required SQL function for shifting items:**

```sql
CREATE OR REPLACE FUNCTION shift_project_items_down(p_project_id UUID, p_after_index INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE project_items
  SET order_index = order_index + 1
  WHERE project_id = p_project_id AND order_index > p_after_index;
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 7: Settings & Data Management (Steps 37–40)

### 7.1 Settings Page — `src/app/settings/page.tsx`

Four sections with the following server actions:

### 7.2 Export Database

```ts
import { saveAs } from "file-saver";

async function exportDatabase() {
  const [projects, items, masterList, completed] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("project_items").select("*"),
    supabase.from("master_list").select("*").order("mlp_index"),
    supabase.from("completed_list").select("*"),
  ]);

  // Nest items under their projects (match the JSON spec from datastructure.md)
  const activeProjects = projects.data?.filter(p => p.status === "active").map(p => ({
    ...p,
    projectItemsList: items.data?.filter(i => i.project_id === p.project_id) ?? [],
  }));
  // ... same for inactive, completed

  const payload = {
    database: {
      ActiveProjectList: activeProjects,
      InactiveProjectList: inactiveProjects,
      MasterList: masterList.data,
      CompletedList: completed.data,
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  saveAs(blob, `elephant-backup-${new Date().toISOString().slice(0, 10)}.json`);
}
```

### 7.3 Import Database

```ts
async function importDatabase(file: File) {
  const text = await file.text();
  const data = JSON.parse(text);

  // Validate schema
  if (!data?.database?.MasterList || !data?.database?.ActiveProjectList) {
    throw new Error("Invalid backup file format");
  }

  // ⚠️ DESTRUCTIVE: wipe all tables
  await supabase.from("completed_list").delete().neq("item_id", "");
  await supabase.from("master_list").delete().neq("item_id", "");
  await supabase.from("project_items").delete().neq("item_id", "");
  await supabase.from("projects").delete().neq("project_id", "");

  // Bulk insert from backup
  await supabase.from("projects").insert(/* mapped active + inactive + completed projects */);
  await supabase.from("project_items").insert(/* all nested items */);
  await supabase.from("master_list").insert(data.database.MasterList);
  await supabase.from("completed_list").insert(data.database.CompletedList);
}
```

### 7.4 Export CSV

```ts
import Papa from "papaparse";
import { saveAs } from "file-saver";

async function exportCSV(listName: string) {
  const { data } = await supabase.from(listName).select("*");
  const csv = Papa.unparse(data ?? []);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `elephant-${listName}-${new Date().toISOString().slice(0, 10)}.csv`);
}
```

### 7.5 Reset App

```ts
async function resetApp() {
  // Requires double confirmation in the UI
  await supabase.from("completed_list").delete().neq("item_id", "");
  await supabase.from("master_list").delete().neq("item_id", "");
  await supabase.from("project_items").delete().neq("item_id", "");
  await supabase.from("projects").delete().neq("project_id", "");
}
```

---

## File Structure Summary

```
src/
├── app/
│   ├── layout.tsx              # Mobile-first shell (max-w-md)
│   ├── page.tsx                # Home Page
│   ├── do-now/page.tsx         # Do Now Page (gold frame, #1 item)
│   ├── projects/
│   │   ├── page.tsx            # Project List (tabs: active/inactive)
│   │   └── [id]/page.tsx       # Edit Project (drag, swipe, inline edit)
│   ├── completed/page.tsx      # Completed List
│   ├── master-list/page.tsx    # Master List (hidden by default)
│   └── settings/page.tsx       # Settings & Data Management
├── components/
│   ├── NavHeader.tsx           # Back button + Add Item (+)
│   ├── AddItemModal.tsx        # Create errand or project item
│   ├── TakeABiteModal.tsx      # Two-field split prompt
│   └── GoldFrame.tsx           # Stylized frame component
├── lib/
│   ├── supabase.ts             # Supabase client (service role)
│   ├── engine.ts               # completeItem, reprocessList, pingProjectForItem, takeABite
│   └── dateUtils.ts            # date-fns wrappers
├── store/
│   └── useAppStore.ts          # Zustand (showMasterList toggle)
└── types/
    └── index.ts                # All TypeScript interfaces
```
