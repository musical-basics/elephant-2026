# Data Structure & Settings Specifications

---

## 1. JSON Export / Import Data Structure

When the user exports the database, the app generates a `.json` file encompassing **all lists** to preserve the exact state of the app.

```json
{
  "database": {
    "ActiveProjectList": [
      {
        "projectId": "string",
        "projectName": "string",
        "priority": "integer (1-5)",
        "createdDate": "timestamp",
        "dueDate": "timestamp (or null)",
        "projectItemsList": [
          {
            "itemId": "string",
            "itemName": "string",
            "isActive": "boolean"
          }
        ]
      }
    ],
    "InactiveProjectList": [
      {
        "projectId": "string",
        "projectName": "string",
        "priority": "integer (1-5)",
        "createdDate": "timestamp",
        "dueDate": "timestamp (or null)",
        "projectItemsList": [
          {
            "itemId": "string",
            "itemName": "string",
            "isActive": "boolean (false)"
          }
        ]
      }
    ],
    "MasterList": [
      {
        "mlpIndex": "integer",
        "itemId": "string",
        "itemName": "string",
        "isErrand": "boolean",
        "projectId": "string (or null if Errand)",
        "isPlaceholder": "boolean"
      }
    ],
    "CompletedList": [
      {
        "itemId": "string",
        "itemName": "string",
        "projectId": "string (or null)",
        "dateTimeCompleted": "timestamp"
      }
    ]
  }
}
```

### Field Reference

#### ActiveProjectList / InactiveProjectList

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | string | Unique identifier for the project |
| `projectName` | string | Display name |
| `priority` | integer (1–5) | Higher = surfaces more often |
| `createdDate` | timestamp | When the project was created |
| `dueDate` | timestamp \| null | Optional deadline |
| `projectItemsList` | array | Ordered list of items within the project |

#### Project Item (nested)

| Field | Type | Description |
|-------|------|-------------|
| `itemId` | string | Unique identifier |
| `itemName` | string | Display text |
| `isActive` | boolean | Whether the item has been activated into the Master List |

#### MasterList

| Field | Type | Description |
|-------|------|-------------|
| `mlpIndex` | integer | Position in the Master List |
| `itemId` | string | Unique identifier |
| `itemName` | string | Display text |
| `isErrand` | boolean | `true` if this is an errand (no project) |
| `projectId` | string \| null | Parent project ID (`null` for errands) |
| `isPlaceholder` | boolean | `true` if this is a back-end placeholder holding the project's spot |

#### CompletedList

| Field | Type | Description |
|-------|------|-------------|
| `itemId` | string | Unique identifier |
| `itemName` | string | Display text |
| `projectId` | string \| null | Parent project ID (`null` for errands) |
| `dateTimeCompleted` | timestamp | Exact time the user pressed "Completed!" |

> **Note:** The `MasterList` array relies on back-end **Project Placeholders** to maintain task sequence while allowing internal project edits. The `CompletedList` requires the specific timecode from when the user pressed "Completed!".

---

## 2. Settings Page UI Specifications

> The Settings Page acts as the **administrative hub** for the user's data.

### Controls

#### Show Master List (Toggle)

| | |
|---|---|
| **Function** | Allows the user to view the hidden Master List |
| **Action** | Toggling reveals the normally hidden **"View Master List"** button on the Homepage |

---

#### Export Database (Button)

| | |
|---|---|
| **Function** | Creates a `.json` file of the entire app database |
| **Action** | Packages the Master List, Completed List, Active/Inactive Project Lists, and all Project Items — then prompts the user to download and save to their device |

---

#### Import Database (Button)

| | |
|---|---|
| **Function** | Imports a previously saved `.json` file from the user's device |
| **Action** | Three-step process (see below) |

**Import flow:**
1. Triggers a warning prompt: *"This will overwrite all current data. Are you sure?"*
2. If confirmed, the app runs **validation checks** on the file.
3. Deletes all existing database lists and **repopulates** them with the imported data.

---

#### Export CSV (Button)

| | |
|---|---|
| **Function** | Exports specific lists into a readable spreadsheet format |
| **Action** | Opens a prompt asking the user which list to export (e.g., Master List, Completed List, Active Project List) |

---

#### Reset App (Button)

| | |
|---|---|
| **Function** | Performs a **hard reset** of the application |
| **Action** | Deletes all lists entirely, returning the app to a blank state (requires confirmation) |