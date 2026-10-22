import { Button, SearchInput } from "@nicolassancho/storybook-core";

// A native GET form: submitting it loads /products?q=..., which the page reads on the server. It
// needs no JavaScript and no event handler.
export function SearchForm() {
  return (
    <form role="search" action="/products" className="flex items-center gap-2">
      <SearchInput
        name="q"
        aria-label="Search products"
        variantSize="small"
        className="w-24 min-w-0 sm:w-56"
      />
      <Button type="submit" size="small">
        Search
      </Button>
    </form>
  );
}
