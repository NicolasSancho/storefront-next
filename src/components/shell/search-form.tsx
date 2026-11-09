import { Button, Input } from "@nicolassancho/storybook-core";

// A native GET form: submitting it loads /products?q=..., which the page reads on the server. It
// needs no event handler, so it is a Server Component.
export function SearchForm() {
  return (
    <form role="search" action="/products" className="flex items-center gap-2">
      <Input
        type="search"
        name="q"
        label="Search products"
        hideLabel
        className="w-20 min-w-0 sm:w-56"
      />
      <Button type="submit" size="medium">
        Search
      </Button>
    </form>
  );
}
