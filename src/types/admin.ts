// ACL: VisionTech admin dashboard types

export interface AdminSummaryResponse {
  users: {
    total: number;
    active: number;
    onboarding_completed: number;
    onboarding_incomplete: number;
  };
  ai: {
    insights_generated: number;
    failed_requests: number;
  };
  learning: {
    tracked_items: number;
    completed_items: number;
  };
  projects: {
    total: number;
    in_progress: number;
    completed: number;
  };
  collaboration: {
    pending_requests: number;
    accepted_requests: number;
    declined_requests: number;
  };
}

export interface AdminActivityItem {
  id: string;
  type: string;
  message: string;
  created_at: string;
}

export interface AdminActivityResponse {
  items: AdminActivityItem[];
}

export interface AdminSystemHealthResponse {
  api: "healthy" | "degraded" | "down";
  database: "healthy" | "degraded" | "down";
  ai_provider: "healthy" | "degraded" | "down";
  last_checked: string;
}
