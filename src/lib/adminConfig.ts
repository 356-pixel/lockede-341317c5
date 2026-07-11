// Lockede admin & branding config.
export const SHAREABLE_DOMAIN = "https://lockede.com";
export const ADMIN_PASSWORD = "lock2026";

// Admin's Clickadu direct link. Every 2nd click on a non-destination button
// on the /:slug landing page is redirected here.
export const ADMIN_CLICKADU_LINK = "https://clickadu.com/admin-placeholder";

// Legacy allow-list; tracking IDs are now issued from the admin dashboard
// and stored in Firestore (see trackingIdsApi.ts). Kept for compatibility.
export const ALLOWED_TRACKING_IDS = [] as const;

export const MIN_CLICKS_DISPLAY = 25;

export const PRIORITY_COUNTRY_CODES = [
  "PH", "ID", "KH", "TH", "VN", "MX", "MY", "IN", "BD", "US",
  "BR", "TW", "SG", "SA", "KR", "CA", "JP",
  "GB", "PK", "AU", "IT", "FR", "ES", "HK", "DE", "AE", "NG",
];

const ALL_COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "US", name: "United States", flag: "🇺🇸" },
];

export const COUNTRIES = ALL_COUNTRIES;

export function countryName(code: string) {
  if (code === "ALL") return "Default (all countries)";
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}
