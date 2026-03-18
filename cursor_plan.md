🐘 Elephant V1.0 - Cursor AI Implementation Plan
Phase 1: Project Setup & Core Dependencies
1. Initialize a new Next.js project using the App Router, TypeScript, and Tailwind CSS. Clean up the default boilerplate.
2. Install mobile and UI dependencies: next-pwa, framer-motion (for swipe gestures), @dnd-kit/core and @dnd-kit/sortable (for drag-and-drop), and lucide-react (for icons).
3. Install utility dependencies: @supabase/supabase-js, zustand (state), date-fns (time/dates), file-saver (JSON export), and papaparse (CSV export).
4. Configure next-pwa in next.config.js to enable Progressive Web App capabilities so the app can be installed natively on iOS/Android home screens.
5. Initialize Shadcn UI (or a similar unstyled component library like Radix UI) and set up base primitives: Buttons, Inputs, Dialogs, Tabs, and Popovers.

Phase 2: Database Schema & Type Definitions
6. Create strictly typed TypeScript interfaces in types/index.ts that match the provided JSON Export/Import Data Structure exactly (e.g., ActiveProjectList, MasterList, CompletedList, ProjectItem).
7. Initialize the Supabase client locally in lib/supabase.ts using environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).
8. Create Supabase SQL schemas/migrations for the Projects table (Columns: projectId, projectName, priority [1-5], createdDate, dueDate, status).
9. Create Supabase SQL schemas for the ProjectItems table to handle nested items (Columns: itemId, projectId, itemName, isActive, orderIndex).
10. Create Supabase SQL schemas for the MasterList table (Columns: mlpIndex, itemId, itemName, isErrand, projectId, isPlaceholder).
11. Create Supabase SQL schemas for the CompletedList table (Columns: itemId, itemName, projectId, dateTimeCompleted).

Phase 3: State Management & App Shell
12. Set up a global store using zustand (store/useAppStore.ts) to manage UI state, specifically the showMasterList boolean from the Settings page.
13. Create utility functions in lib/dateUtils.ts wrapping date-fns for consistent formatting of project due dates and generating the exact dateTimeCompleted timecode.
14. Create a mobile-first Layout wrapper component (app/layout.tsx) enforcing a maximum width (max-w-md), horizontally centered alignment, and hidden overflow to simulate a native app.
15. Build a global Navigation Header component containing a conditional "Back to Homepage" button (top-left) and an "Add Item (+)" button (top-right).
16. Implement the global "Add Item" Modal, triggered by the (+) button, featuring a toggle to create either a standalone "Errand" or a "Project Item" attached to a specific project.

Phase 4: Home Page & Project Management UI
17. Build the Home Page (app/page.tsx) featuring a welcoming message (e.g., "Welcome, Lionel!") and a circular profile picture placeholder.
18. Implement the four primary Home Page navigation buttons: "Start Working", "Manage Projects", "Completed List", and "Settings".
19. Implement conditional rendering logic on the Home Page to display the "View Master List" button only if showMasterList is true in the Zustand store.
20. Build the Project List Page (app/projects/page.tsx) utilizing Shadcn Tabs to toggle between "Active Projects" and "Inactive Projects" in a scrollable table.
21. Add sorting controls to the Project List Page, allowing users to order projects by Alphabetical order or Priority (1-5).

Phase 5: Edit Project Page & Mobile Gestures
22. Build the Edit Project Page (app/projects/[id]/page.tsx) to allow modification of Project Name, Priority (1-5), and Due Date.
23. Fetch and render the project's internal items. Implement click-to-edit behavior so users can tap an item's text to rename it inline.
24. Wrap project items in framer-motion to implement a native-feeling "swipe left to delete" gesture.
25. Integrate @dnd-kit/sortable to allow users to long-press and drag items vertically to reorder their internal priority sequence.
26. Wire the drag-and-drop and delete actions to immediately sync and update the orderIndex within the ProjectItems table in Supabase.

Phase 6: The "Do Now" Page & "Take a Bite" UI
27. Build the minimal "Do Now" Page (app/do-now/page.tsx) layout. Fetch and display only the item where mlpIndex === 1 from the MasterList.
28. Use Tailwind CSS to design the visually prominent, stylized, flowery gold frame to house the #1 Item text centered on the screen.
29. Dynamically render the associated Project Name 35-50% smaller directly underneath the gold frame (leave blank if isErrand is true).
30. Add the primary interaction buttons fixed to the bottom: a green ✅ "Completed!" button (lower-right) and a red 🔴 "Take a Bite" button (lower-left).
31. Build the "Take a Bite" modal prompt with two fields: Field 1 (pre-filled with the current item text) and Field 2 (blank for the new sub-item) with Cancel/Complete buttons.

Phase 7: Core Logic: "Take a Bite" & The PPFI Engine
32. Implement "Take a Bite" logic: On Complete, update the database to rename the #1 Item with Field 1. If it's an Errand, create a new Errand from Field 2 and append it to the absolute bottom of the MasterList.
33. Implement "Take a Bite" for Project Items: Insert the new Field 2 item directly below the renamed item within the project's internal sequence, and adjust the Master List backend placeholders accordingly.
34. Implement CompleteItem logic: Wire the green button to move the #1 Item to the CompletedList, tagging it with a precise dateTimeCompleted timestamp, and remove it from the MasterList.
35. Write ReprocessList (Part 1): Create a backend function that runs after CompleteItem to recalculate TNML (Total Number of Master List Items) and re-index all remaining mlpIndex values.
36. Write ReprocessList (Part 2 - PPFI): Loop through active projects to find PLPI. Calculate PIT = 1 / Priority and PRS = 1 - (PLPI / TNML). If PRS > PIT, activate the topmost inactive project item, append it to the Master List, and perform a final index recalculation.

Phase 8: Settings & Data Management
37. Build the Settings Page (app/settings/page.tsx) with the "Show Master List" toggle, linking it directly to the Zustand store.
38. Implement "Export Database": Fetch all tables, construct the exact .json nested payload outlined in the Data Structure spec, and trigger a browser download using file-saver.
39. Implement "Import Database": Create a file uploader that accepts a .json file, triggers a hard warning prompt ("This will overwrite all data"), validates the file schema, wipes the Supabase tables, and bulk-inserts the new lists.
40. Implement the final administrative actions: "Export CSV" (prompt user to pick a list, map data, and export via papaparse) and "Reset App" (a highly-destructive button with confirmation that truncates all database tables to return to a blank state).