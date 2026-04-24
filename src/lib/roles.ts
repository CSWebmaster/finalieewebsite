// ─────────────────────────────────────────────────────────────
//  RBAC Role Definitions
//  Webmasters are identified by EMAIL (not UID) for resilience.
// ─────────────────────────────────────────────────────────────

export const WEBMASTER_EMAILS = [
  "ieee.wm@socet.edu.in",
  "ieeewie.wm@silveroakuni.ac.in",
  "ieeecs.wm@silveroakuni.ac.in",
  "ieeesps.wm@silveroakuni.ac.in",
  "ieeesight.wm@silveroakuni.ac.in",
] as const;

export type UserRole = "webmaster" | "core_member";

export const isWebmasterEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return WEBMASTER_EMAILS.includes(email.toLowerCase().trim() as any);
};

export const ROLE_LABELS: Record<UserRole, string> = {
  webmaster: "Webmaster",
  core_member: "Core Member",
};

export const SECTIONS = [
  { id: "events",  label: "Events" },
  { id: "members", label: "Team Members" },
  { id: "awards",  label: "Achievements" },
  { id: "blogs",   label: "Blogs" },
  { id: "sigs",    label: "SIGs" },
  { id: "journey", label: "Journey" },
] as const;

export type SectionId = typeof SECTIONS[number]["id"];
