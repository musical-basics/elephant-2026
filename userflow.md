# User Flow & Sequence Logic

---

## 1. "Take a Bite" User Flow

> How a user breaks down a daunting task into smaller, manageable pieces — directly from the Do Now Page.

### Step-by-Step

1. User presses the red **"Take a Bite"** button (lower-left corner of the Do Now Page).
2. A prompt appears with **two text fields:**

   | Field | Pre-filled? | Purpose |
   |-------|-------------|---------|
   | **Field 1** | Yes (original item text) | Edit to represent a smaller, immediate step |
   | **Field 2** | No (blank) | Enter the remainder / next piece of the task |

3. User modifies Field 1 and fills out Field 2.
4. User chooses one of two actions:
   - **Cancel** — reverts all changes, returns to Do Now Page.
   - **Complete** — continues to step 5.

### On "Complete"

5. The **#1 Item is renamed** with the contents of Field 1.
6. A **new Item is created** from the contents of Field 2.

### Routing the New Item

| Original Item Type | Where the new item goes |
|--------------------|-------------------------|
| **Errand** | Added to the **bottom of the Master List**. |
| **Project Item** | Inserted **directly below** the renamed item within the project's internal list. The Master List placeholders update accordingly — the current #1 placeholder shows the renamed text, and the next placeholder for that project shows the new item. |

7. User returns to the Do Now Page, sees the renamed (smaller) step, and can tap **"Completed!"** when done.

---

## 2. Insertion Algorithm — `PingProjectForItem` (PPFI) Sequence

> How the backend decides when to introduce a new project item into the Master List to maintain a healthy mix of tasks.

### Trigger

A user action — such as clicking **"Completed!"** or adding new Errands — triggers the `ReprocessList` function.

### `ReprocessList` Steps

1. **Recalculate TNML** — Total Number of Master List Items.
2. **Ping every active project** using the PPFI calculation (steps 3–7).

### Per-Project PPFI Calculation

3. Identify **PLPI** — Position of the Last Active Project Item in the Master List.
4. Calculate **Project Insertion Threshold (PIT):**

   ```
   PIT = 1 / Project Priority
   ```

5. Calculate **Project Ready Score (PRS):**

   ```
   PRS = 1 − (PLPI / TNML)
   ```

6. **Evaluate:**

   | Condition | Result |
   |-----------|--------|
   | **PRS > PIT** | ✅ Activate the topmost inactive item of the project and **append it to the bottom** of the Master List. |
   | **PRS ≤ PIT** | ⏸️ Do nothing for this project. |

7. After all projects are evaluated, **re-index** every item in the Master List by recalculating their Master List Position (MLP).

### Visual Summary

```
User taps "Completed!"
        │
        ▼
  CompleteItem()
  ── move #1 → Completed List
        │
        ▼
  ReprocessList()
  ── recalculate TNML
        │
        ▼
  ┌─ For each active project ─┐
  │  calculate PIT & PRS      │
  │  if PRS > PIT:             │
  │    activate next item      │
  │    append to Master List   │
  └────────────────────────────┘
        │
        ▼
  Re-index all Master List positions
```