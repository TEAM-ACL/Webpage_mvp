export type CollaborationRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled";

export type CollaborationRequestItem = {
  id: string;
  organisation_id: string;
  project_id: string;
  requester_user_id: string;
  target_user_id: string;
  message: string;
  status: CollaborationRequestStatus;
  created_at: string;
  updated_at: string;
  responded_at?: string | null;
};

export type CollaborationRequestListResponse = {
  items: CollaborationRequestItem[];
};
