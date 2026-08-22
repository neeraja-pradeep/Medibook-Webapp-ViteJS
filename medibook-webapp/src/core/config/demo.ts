/**
 * Demo-world constants shared across features during the static-data
 * (presentation-only) phase. When real APIs land, the clock becomes server
 * time and these constants disappear with the fixtures that use them.
 */

/** The demo "today" every seeded date orbits (design file's DEMO_TODAY). */
export const DEMO_TODAY = 'June 13, 2026';

/** Same demo clock as an ISO date, for date-input comparisons. */
export const DEMO_TODAY_ISO = '2026-06-13';

/**
 * This mbAdmin instance's tenant id in the operations registry. All
 * cross-app records join on it — never on the display name.
 */
export const APOLLO_HID = 13;

/** Platform commission on online bookings (10%), defined once. */
export const SETTLE_COMMISSION = 0.1;
