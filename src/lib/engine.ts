"use server";

import { supabase } from "./supabase";
import type { MasterListItem, Project } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getNextMlpIndex(): Promise<number> {
  const { data } = await supabase
    .from("master_list")
    .select("mlp_index")
    .order("mlp_index", { ascending: false })
    .limit(1);
  return (data?.[0]?.mlp_index ?? 0) + 1;
}

async function reindexMasterList() {
  await supabase.rpc("reindex_master_list");
}

// ─── CompleteItem ────────────────────────────────────────────────────────────

export async function completeItem(item: MasterListItem) {
  // 1. Insert into completed_list with timestamp
  await supabase.from("completed_list").insert({
    item_id: item.itemId,
    item_name: item.itemName,
    project_id: item.projectId,
    date_time_completed: new Date().toISOString(),
  });

  // 2. Remove from master_list
  await supabase.from("master_list").delete().eq("item_id", item.itemId);

  // 3. If it was a project item, mark it completed in project_items
  if (item.projectId && !item.isErrand) {
    await supabase
      .from("project_items")
      .delete()
      .eq("item_id", item.itemId);

    // Check if all project items are done → mark project completed
    const { data: remaining } = await supabase
      .from("project_items")
      .select("item_id")
      .eq("project_id", item.projectId);

    if (!remaining || remaining.length === 0) {
      await supabase
        .from("projects")
        .update({ status: "completed" })
        .eq("project_id", item.projectId);
    }
  }

  // 4. Reprocess the list
  await reprocessList();
}

// ─── ReprocessList ───────────────────────────────────────────────────────────

export async function reprocessList() {
  // Step 1: Re-index all mlp_index values sequentially
  await reindexMasterList();

  // Step 2: Get the new total
  const { data: allItems } = await supabase
    .from("master_list")
    .select("mlp_index")
    .order("mlp_index", { ascending: false })
    .limit(1);

  const TNML = allItems?.[0]?.mlp_index ?? 0;
  if (TNML === 0) return;

  // Step 3: Ping every active project
  const { data: activeProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "active");

  if (activeProjects) {
    for (const project of activeProjects) {
      await pingProjectForItem(project as Project, TNML);
    }
  }

  // Step 4: Final re-index after potential new items
  await reindexMasterList();
}

// ─── PingProjectForItem (PPFI Algorithm) ─────────────────────────────────────

async function pingProjectForItem(project: Project, TNML: number) {
  // Find PLPI: position of the LAST active item for this project in master list
  const { data: projectEntries } = await supabase
    .from("master_list")
    .select("mlp_index")
    .eq("project_id", project.projectId)
    .eq("is_placeholder", false)
    .order("mlp_index", { ascending: false })
    .limit(1);

  const PLPI = projectEntries?.[0]?.mlp_index ?? 0;

  // Calculate scores
  const PIT = 1 / project.priority; // Project Insertion Threshold
  const PRS = TNML > 0 ? 1 - PLPI / TNML : 1; // Project Ready Score

  // Decision: if PRS > PIT, activate next item
  if (PRS > PIT) {
    // Find topmost INACTIVE item in this project
    const { data: nextItems } = await supabase
      .from("project_items")
      .select("*")
      .eq("project_id", project.projectId)
      .eq("is_active", false)
      .order("order_index", { ascending: true })
      .limit(1);

    if (nextItems && nextItems[0]) {
      const nextItem = nextItems[0];

      // Activate it in project_items
      await supabase
        .from("project_items")
        .update({ is_active: true })
        .eq("item_id", nextItem.item_id);

      // Append to bottom of master list
      const newIndex = await getNextMlpIndex();
      await supabase.from("master_list").insert({
        mlp_index: newIndex,
        item_id: nextItem.item_id,
        item_name: nextItem.item_name,
        is_errand: false,
        project_id: project.projectId,
        is_placeholder: false,
      });
    }
  }
}

// ─── Take a Bite ─────────────────────────────────────────────────────────────

export async function takeABite(
  item: MasterListItem,
  renamedText: string,
  newItemText: string
) {
  const newItemId = crypto.randomUUID();

  // 1. Rename the current #1 item in master list
  await supabase
    .from("master_list")
    .update({ item_name: renamedText })
    .eq("item_id", item.itemId);

  if (item.isErrand) {
    // 2a. ERRAND: new item goes to bottom of master list
    const newIndex = await getNextMlpIndex();
    await supabase.from("master_list").insert({
      mlp_index: newIndex,
      item_id: newItemId,
      item_name: newItemText,
      is_errand: true,
      project_id: null,
      is_placeholder: false,
    });
  } else if (item.projectId) {
    // 2b. PROJECT ITEM: insert directly below renamed item in project sequence
    const { data: currentProjectItem } = await supabase
      .from("project_items")
      .select("order_index")
      .eq("item_id", item.itemId)
      .single();

    const currentOrder = currentProjectItem?.order_index ?? 0;

    // Shift all subsequent items down
    await supabase.rpc("shift_project_items_down", {
      p_project_id: item.projectId,
      p_after_index: currentOrder,
    });

    // Insert new item at currentOrder + 1
    await supabase.from("project_items").insert({
      item_id: newItemId,
      project_id: item.projectId,
      item_name: newItemText,
      is_active: false,
      order_index: currentOrder + 1,
    });

    // Update renamed item in project_items too
    await supabase
      .from("project_items")
      .update({ item_name: renamedText })
      .eq("item_id", item.itemId);
  }
}

// ─── CRUD Helpers ────────────────────────────────────────────────────────────

export async function addErrand(itemName: string) {
  const itemId = crypto.randomUUID();
  const newIndex = await getNextMlpIndex();

  await supabase.from("master_list").insert({
    mlp_index: newIndex,
    item_id: itemId,
    item_name: itemName,
    is_errand: true,
    project_id: null,
    is_placeholder: false,
  });

  return itemId;
}

export async function addProjectItem(
  projectId: string,
  itemName: string
) {
  const itemId = crypto.randomUUID();

  // Find next order_index in project
  const { data: lastItem } = await supabase
    .from("project_items")
    .select("order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrder = (lastItem?.[0]?.order_index ?? -1) + 1;

  await supabase.from("project_items").insert({
    item_id: itemId,
    project_id: projectId,
    item_name: itemName,
    is_active: false,
    order_index: nextOrder,
  });

  return itemId;
}

export async function createProject(
  projectName: string,
  priority: 1 | 2 | 3 | 4 | 5,
  dueDate: string | null = null
) {
  const { data } = await supabase
    .from("projects")
    .insert({
      project_name: projectName,
      priority,
      due_date: dueDate,
      status: "active",
    })
    .select("project_id")
    .single();

  return data?.project_id;
}

export async function deleteProject(projectId: string) {
  // Remove all master list entries for this project
  await supabase.from("master_list").delete().eq("project_id", projectId);
  // Cascade will handle project_items
  await supabase.from("projects").delete().eq("project_id", projectId);
  await reindexMasterList();
}

export async function updateProject(
  projectId: string,
  updates: Partial<Pick<Project, "projectName" | "priority" | "dueDate">>
) {
  const mapped: Record<string, unknown> = {};
  if (updates.projectName !== undefined) mapped.project_name = updates.projectName;
  if (updates.priority !== undefined) mapped.priority = updates.priority;
  if (updates.dueDate !== undefined) mapped.due_date = updates.dueDate;

  await supabase.from("projects").update(mapped).eq("project_id", projectId);
}

export async function deleteProjectItem(itemId: string) {
  await supabase.from("master_list").delete().eq("item_id", itemId);
  await supabase.from("project_items").delete().eq("item_id", itemId);
  await reindexMasterList();
}

export async function updateProjectItemName(itemId: string, newName: string) {
  await supabase
    .from("project_items")
    .update({ item_name: newName })
    .eq("item_id", itemId);
  // Also update in master_list if it's there
  await supabase
    .from("master_list")
    .update({ item_name: newName })
    .eq("item_id", itemId);
}

export async function updateProjectItemOrder(
  projectId: string,
  orderedItemIds: string[]
) {
  for (let i = 0; i < orderedItemIds.length; i++) {
    await supabase
      .from("project_items")
      .update({ order_index: i })
      .eq("item_id", orderedItemIds[i]);
  }
}

// ─── Fetch Helpers ───────────────────────────────────────────────────────────

export async function fetchTopItem(): Promise<MasterListItem | null> {
  const { data } = await supabase
    .from("master_list")
    .select("*")
    .eq("is_placeholder", false)
    .order("mlp_index", { ascending: true })
    .limit(1);

  if (!data || data.length === 0) return null;

  const row = data[0];
  return {
    mlpIndex: row.mlp_index,
    itemId: row.item_id,
    itemName: row.item_name,
    isErrand: row.is_errand,
    projectId: row.project_id,
    isPlaceholder: row.is_placeholder,
  };
}

export async function fetchProjectName(projectId: string): Promise<string> {
  const { data } = await supabase
    .from("projects")
    .select("project_name")
    .eq("project_id", projectId)
    .single();
  return data?.project_name ?? "";
}

export async function fetchProjects(status: string) {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("status", status)
    .order("priority", { ascending: false });

  return (data ?? []).map((p: Record<string, unknown>) => ({
    projectId: p.project_id as string,
    projectName: p.project_name as string,
    priority: p.priority as 1 | 2 | 3 | 4 | 5,
    createdDate: p.created_date as string,
    dueDate: (p.due_date as string) ?? null,
    status: p.status as "active" | "inactive" | "completed",
  }));
}

export async function fetchProjectItems(projectId: string) {
  const { data } = await supabase
    .from("project_items")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  return (data ?? []).map((i: Record<string, unknown>) => ({
    itemId: i.item_id as string,
    projectId: i.project_id as string,
    itemName: i.item_name as string,
    isActive: i.is_active as boolean,
    orderIndex: i.order_index as number,
  }));
}

export async function fetchMasterList() {
  const { data } = await supabase
    .from("master_list")
    .select("*")
    .order("mlp_index", { ascending: true });

  return (data ?? []).map((row: Record<string, unknown>) => ({
    mlpIndex: row.mlp_index as number,
    itemId: row.item_id as string,
    itemName: row.item_name as string,
    isErrand: row.is_errand as boolean,
    projectId: (row.project_id as string) ?? null,
    isPlaceholder: row.is_placeholder as boolean,
  }));
}

export async function fetchCompletedList() {
  const { data } = await supabase
    .from("completed_list")
    .select("*")
    .order("date_time_completed", { ascending: false });

  return (data ?? []).map((row: Record<string, unknown>) => ({
    itemId: row.item_id as string,
    itemName: row.item_name as string,
    projectId: (row.project_id as string) ?? null,
    dateTimeCompleted: row.date_time_completed as string,
  }));
}

// ─── Settings: Export / Import / Reset ───────────────────────────────────────

export async function exportDatabasePayload() {
  const [projects, items, masterList, completed] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("project_items").select("*").order("order_index"),
    supabase.from("master_list").select("*").order("mlp_index"),
    supabase.from("completed_list").select("*"),
  ]);

  const mapProjects = (status: string) =>
    (projects.data ?? [])
      .filter((p: Record<string, unknown>) => p.status === status)
      .map((p: Record<string, unknown>) => ({
        projectId: p.project_id,
        projectName: p.project_name,
        priority: p.priority,
        createdDate: p.created_date,
        dueDate: p.due_date,
        status: p.status,
        projectItemsList: (items.data ?? [])
          .filter((i: Record<string, unknown>) => i.project_id === p.project_id)
          .map((i: Record<string, unknown>) => ({
            itemId: i.item_id,
            itemName: i.item_name,
            isActive: i.is_active,
          })),
      }));

  return {
    database: {
      ActiveProjectList: mapProjects("active"),
      InactiveProjectList: mapProjects("inactive"),
      MasterList: (masterList.data ?? []).map((row: Record<string, unknown>) => ({
        mlpIndex: row.mlp_index,
        itemId: row.item_id,
        itemName: row.item_name,
        isErrand: row.is_errand,
        projectId: row.project_id,
        isPlaceholder: row.is_placeholder,
      })),
      CompletedList: (completed.data ?? []).map((row: Record<string, unknown>) => ({
        itemId: row.item_id,
        itemName: row.item_name,
        projectId: row.project_id,
        dateTimeCompleted: row.date_time_completed,
      })),
    },
  };
}

export async function importDatabase(payload: Record<string, unknown>) {
  const db = payload.database as Record<string, unknown[]>;
  if (!db?.MasterList || !db?.ActiveProjectList) {
    throw new Error("Invalid backup file format");
  }

  // Wipe all tables (order matters for FK constraints)
  await supabase.from("completed_list").delete().neq("item_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("master_list").delete().neq("item_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("project_items").delete().neq("item_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("projects").delete().neq("project_id", "00000000-0000-0000-0000-000000000000");

  // Re-insert projects
  const allProjects = [
    ...((db.ActiveProjectList as Record<string, unknown>[]) ?? []),
    ...((db.InactiveProjectList as Record<string, unknown>[]) ?? []),
  ];

  for (const p of allProjects) {
    await supabase.from("projects").insert({
      project_id: p.projectId,
      project_name: p.projectName,
      priority: p.priority,
      created_date: p.createdDate,
      due_date: p.dueDate,
      status: p.status,
    });

    const items = (p as Record<string, unknown>).projectItemsList as Record<string, unknown>[];
    if (items) {
      for (let i = 0; i < items.length; i++) {
        await supabase.from("project_items").insert({
          item_id: items[i].itemId,
          project_id: p.projectId,
          item_name: items[i].itemName,
          is_active: items[i].isActive,
          order_index: i,
        });
      }
    }
  }

  // Re-insert master list
  for (const m of db.MasterList as Record<string, unknown>[]) {
    await supabase.from("master_list").insert({
      mlp_index: m.mlpIndex,
      item_id: m.itemId,
      item_name: m.itemName,
      is_errand: m.isErrand,
      project_id: m.projectId,
      is_placeholder: m.isPlaceholder,
    });
  }

  // Re-insert completed list
  for (const c of db.CompletedList as Record<string, unknown>[]) {
    await supabase.from("completed_list").insert({
      item_id: c.itemId,
      item_name: c.itemName,
      project_id: c.projectId,
      date_time_completed: c.dateTimeCompleted,
    });
  }
}

export async function resetAllData() {
  await supabase.from("completed_list").delete().neq("item_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("master_list").delete().neq("item_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("project_items").delete().neq("item_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("projects").delete().neq("project_id", "00000000-0000-0000-0000-000000000000");
}

export async function fetchListForCSV(listName: string) {
  const tableMap: Record<string, string> = {
    "Master List": "master_list",
    "Completed List": "completed_list",
    "Active Projects": "projects",
    "Project Items": "project_items",
  };

  const table = tableMap[listName];
  if (!table) return [];

  const { data } = await supabase.from(table).select("*");
  return data ?? [];
}
