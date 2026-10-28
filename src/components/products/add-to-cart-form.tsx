"use client";

import { useActionState } from "react";
import { Button, RadioGroup, Text } from "@nicolassancho/storybook-core";
import { addToCartAction, type AddToCartState } from "@/lib/cart-actions";

interface AddToCartFormProps {
  slug: string;
  colors: string[];
  soldOut: boolean;
}

const initialState: AddToCartState = { message: "", color: "" };

// The only client component in the app, kept for feedback: the pending state and an announced
// message. A plain `<form action>` would add to the cart too, without either.
// The form posts to a Server Action, so adding to the cart works without JavaScript. React resets a
// form after its action, so the chosen color comes back from the action as the new default.
export function AddToCartForm({ slug, colors, soldOut }: AddToCartFormProps) {
  const [state, action, pending] = useActionState(addToCartAction, initialState);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <RadioGroup
        label="Color"
        name="color"
        options={colors.map((name) => ({ label: name, value: name }))}
        defaultValue={state.color || colors[0]}
        columns={2}
      />
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="large" disabled={soldOut || pending}>
          {soldOut ? "Sold out" : pending ? "Adding…" : "Add to cart"}
        </Button>
        <div role="status">
          <Text as="p" size="small" color="base">
            {state.message}
          </Text>
        </div>
      </div>
    </form>
  );
}
