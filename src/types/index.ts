// ─── Core App Objects ─────────────────────────────────────────────────────────

export interface Project {
  projectId: string;
  projectName: string;
  priority: 1 | 2 | 3 | 4 | 5;
  createdDate: string;
  dueDate: string | null;
  status: "active" | "inactive" | "completed";
}

export interface ProjectItem {
  itemId: string;
  projectId: string;
  itemName: string;
  isActive: boolean;
  orderIndex: number;
}

export interface MasterListItem {
  mlpIndex: number;
  itemId: string;
  itemName: string;
  isErrand: boolean;
  projectId: string | null;
  isPlaceholder: boolean;
}

export interface CompletedItem {
  itemId: string;
  itemName: string;
  projectId: string | null;
  projectName?: string | null;
  dateTimeCompleted: string;
}

// ─── Database Export/Import Shape ─────────────────────────────────────────────

export interface ProjectWithItems extends Project {
  projectItemsList: ProjectItem[];
}

export interface DatabaseExport {
  database: {
    ActiveProjectList: ProjectWithItems[];
    InactiveProjectList: ProjectWithItems[];
    MasterList: MasterListItem[];
    CompletedList: CompletedItem[];
  };
}
