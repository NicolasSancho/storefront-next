const euros = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const eurosAndCents = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

/**
 * Formats a price in cents for display. Whole euros drop the decimals (`1800` is "€18"), and
 * anything else shows both digits (`1850` is "€18.50").
 */
export function formatPrice(cents: number): string {
  return (cents % 100 === 0 ? euros : eurosAndCents).format(cents / 100);
}
