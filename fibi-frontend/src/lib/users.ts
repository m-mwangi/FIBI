/** User profile & admin user APIs — matches BACKEND `/api/v1/users` */

export const USERS_PREFIX = "/api/v1/users";

export type ApiIdType = "passport" | "national_id" | "drivers_license" | null;

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "investor" | "admin";
  dob: string | null;
  country: string | null;
  idType: ApiIdType;
  idNumber: string | null;
  createdAt: string;
};

export type ProfileResponse = { success: boolean; data: UserProfile };

export type ProfileUpdateResponse = {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role: "investor" | "admin";
    country: string | null;
  };
};

export type UserListEntry = {
  id: string;
  name: string;
  email: string;
  role: "investor" | "admin";
  createdAt: string;
};

export type UsersListResponse = {
  success: boolean;
  count: number;
  data: UserListEntry[];
};

/** Values for `<select>` — same as Signup */
export const ID_TYPE_FORM_VALUES = ["passport", "national-id", "drivers-license"] as const;
export type IdTypeFormValue = (typeof ID_TYPE_FORM_VALUES)[number];

export function apiIdTypeToFormValue(t: ApiIdType): IdTypeFormValue | "" {
  if (t === "national_id") return "national-id";
  if (t === "drivers_license") return "drivers-license";
  if (t === "passport") return "passport";
  return "";
}

export function formValueToApiIdType(v: string): string | undefined {
  const s = v.trim();
  if (!s) return undefined;
  return s;
}

/** Build synthetic chart points ending at `count` (dashboard illustration). */
export function userGrowthSeriesFromCount(count: number) {
  const months = ["Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26"];
  const n = months.length;
  if (count <= 0) return months.map((month) => ({ month, users: 0 }));
  const factors = [0.55, 0.62, 0.72, 0.8, 0.9, 1];
  return months.map((month, i) => ({
    month,
    users: Math.max(0, Math.round(count * factors[i]!)),
  }));
}
