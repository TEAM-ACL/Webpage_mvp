export type WorkspaceSectionSource = "live" | "derived" | "placeholder";

export type WorkspaceSummaryCard = {
  title: string;
  value: string;
  note: string;
  source: WorkspaceSectionSource;
};

export type WorkspaceFocus = {
  main_action: string;
  reason: string;
  estimated_time_minutes: number;
  source: WorkspaceSectionSource;
};

export type WorkspaceProjectItem = {
  project_id: string;
  title: string;
  description: string;
  progress_percent: number;
  status: "idea" | "planning" | "in_progress" | "completed" | "paused";
  members: number;
  next_action: string;
  related_goal: string;
  source: WorkspaceSectionSource;
};

export type WorkspaceTaskItem = {
  task_id: string;
  title: string;
  linked_project: string;
  priority: "low" | "medium" | "high";
  due_label: string;
  status: "to_do" | "in_progress" | "done";
  action_label: "Start" | "Mark Complete" | "View";
  source: WorkspaceSectionSource;
};

export type WorkspaceLearningAction = {
  action_id: string;
  title: string;
  skill_area: string;
  provider: string;
  reason: string;
  status: "recommended" | "in_progress" | "saved" | "completed";
  source_url: string | null;
  source: WorkspaceSectionSource;
};

export type WorkspaceReadinessItem = {
  label: string;
  value: number;
  source: WorkspaceSectionSource;
};

export type WorkspaceCollaborationItem = {
  item_id: string;
  actor_name: string;
  action: string;
  time_label: string;
  source: WorkspaceSectionSource;
};

export type WorkspaceInsight = {
  title: string;
  message: string;
  source: WorkspaceSectionSource;
};

export type WorkspaceStateResponse = {
  generated_at: string;
  ai_insight_updated_at: string | null;
  summary_cards: WorkspaceSummaryCard[];
  focus: WorkspaceFocus;
  projects: WorkspaceProjectItem[];
  tasks: WorkspaceTaskItem[];
  learning_actions: WorkspaceLearningAction[];
  readiness: WorkspaceReadinessItem[];
  collaboration: WorkspaceCollaborationItem[];
  insight: WorkspaceInsight;
  not_live_sections: string[];
  source_messages: string[];
};

export type WorkspaceFocusActionRequest = {
  action: "start";
};

export type WorkspaceTaskActionRequest = {
  action: "start" | "complete" | "view";
};

export type WorkspaceLearningActionRequest = {
  action: "start" | "save" | "complete" | "open";
};

export type WorkspaceActionResponse = {
  success: boolean;
  message: string;
  updated_resource_type: "focus" | "project" | "learning" | "derived" | null;
  updated_resource_id: string | null;
  redirect_url: string | null;
  state: WorkspaceStateResponse | null;
};
