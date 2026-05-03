export type CollaborationRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled";

export type CollaborationRequestItem = {
  id: string;
  project_id: string;
  requester_user_id: string;
  target_user_id: string;
  message: string;
  status: CollaborationRequestStatus;
  created_at: string;
};

export type CollaborationRequestListResponse = {
  items: CollaborationRequestItem[];
};
