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

export type CollaborationConnection = {
  id: string;
  request_id: string;
  organisation_id: string;
  project_id: string;
  requester_user_id: string;
  target_user_id: string;
  counterpart_user_id: string;
  counterpart_name: string;
  project_title: string;
  relationship_type: "project_collaborator";
  permission_scope: string[];
  status: "active" | "revoked";
  connected_at: string;
  created_at: string;
  updated_at: string;
};

export type CollaborationConnectionListResponse = {
  items: CollaborationConnection[];
};
