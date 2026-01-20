
export interface Friend {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string; // Emoji or URL
  status: "active" | "invited" | "pending";
  joinedAt: string;
  associatedCircleIds: string[]; // IDs of circles we share
}
