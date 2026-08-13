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
  /** Stamped on every successful sign-in. Null for accounts that predate the
   *  field or have never logged in since it was added. */
  lastLoginAt?: string | null;
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

/*
 * `userGrowthSeriesFromCount` used to live here: it fitted a fixed curve to a
 * single total and the dashboard plotted it as a growth trend. It was removed
 * because the shape was invented. Real series are derived from `createdAt`
 * timestamps in app/admin/lib/analytics.ts.
 */
