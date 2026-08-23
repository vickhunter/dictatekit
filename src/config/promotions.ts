/**
 * Central kill switch for every promotional surface in the app.
 *
 * DictateKit is a free, local-first fork of OpenWhispr and never advertises a paid
 * plan. Upstream's upsell dialogs, trial CTAs, pricing grids and "Upgrade to Pro"
 * buttons are all gated on this flag rather than deleted piecemeal, so they stay
 * easy to spot when merging upstream changes.
 *
 * Deliberately NOT gated:
 *   - Billing *management* (Manage Billing / Manage Subscription). An existing
 *     DictateKit Cloud subscriber must always be able to review or cancel from the app.
 *   - Factual usage meters. Telling a signed-in cloud user how many words they have
 *     left is information, not advertising.
 *   - Server-enforced capability checks. Hiding a button cannot lift a limit that the
 *     cloud API enforces; those paths now state the limit plainly instead of selling.
 */
export const PROMOTIONS_ENABLED = false;
