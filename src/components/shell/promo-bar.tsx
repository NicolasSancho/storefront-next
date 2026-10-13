// A dark strip above the header. `neutral-950` on `neutral-25` is the ramp pair the design system
// uses for dark chips, so it flips with the theme instead of staying dark in dark mode.
export function PromoBar() {
  return (
    <p className="bg-neutral-950 px-4 py-2 text-center text-sm text-neutral-25">
      Free delivery on orders over €60
    </p>
  );
}
