## Building with the h2bc storefront components

**Setup.** No provider is needed. Load `styles.css` and `_ds_bundle.js`; every component is on `window.H2bc`. The bundle already carries a shim so `next/link`- and `next/image`-based components (`ProductCard`, `ProductCardImage`, `CategoryFilter`, `CartEmptyState`, `ShippingInfoAlert`, `CheckoutStepSection`) render as plain anchors and images outside Next.js. `Toaster` is mounted once at the app root in the real storefront (`position="top-center" richColors`); do the same in a design that shows toasts, and fire them with the bundled `toast` helper (`window.H2bc.toast.success("Added to cart")`), never a separately imported sonner. `Form` is react-hook-form's `FormProvider`: it needs a `useForm()` instance spread into it, and `FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` only work inside it.

**Styling idiom: Tailwind v4 utility classes, shadcn/ui "new-york" tokens.** Style your own layout glue with `className` utilities; never write ad-hoc CSS or hex colours. The compiled stylesheet is static, so use these families (all verified in `styles.css`'s import closure):

| Family | Real names |
|---|---|
| Surface / text colours | `bg-background text-foreground`, `bg-card text-card-foreground`, `bg-primary text-primary-foreground`, `bg-secondary text-secondary-foreground`, `bg-muted text-muted-foreground`, `bg-accent text-accent-foreground`, `bg-destructive text-destructive` |
| Borders / radius | `border border-border`, `border-input`, `divide-y`, `rounded-sm rounded-md rounded-lg rounded-xl` |
| Brand accent | `bg-pink-500`, `text-pink-500`, `pink-img-shadow` (the pink drop-shadow used on every product image) |
| Fonts | `font-sans` (Arial, the body default), `font-blackletter` (UnifrakturMaguntia: page titles like "Cart", "Checkout"), `font-script` (Edwardian Script: "Sold Out", "Cart empty", "no items") |
| Type scale | `text-xs` … `text-5xl`, `font-medium font-semibold font-bold`, `tracking-wide`, `uppercase`, `text-shadow-xl`, `prose prose-sm` (markdown bodies) |
| Layout | `flex flex-col items-center justify-between gap-2 … gap-8`, `grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6`, `max-w-sm max-w-2xl mx-auto`, `space-y-4`, `aspect-square`, `p-4 px-6 py-8 mt-4 mb-8` |
| States | `hover:underline`, `hover:bg-accent`, `group` + `group-hover:underline`, `disabled:opacity-50`, `opacity-40` (sold-out imagery) |

The storefront's look is monochrome: near-black `--primary` on white, neutral greys, no colour except the pink accent and the red destructive state. Keep pages centered (`mx-auto max-w-*`), headings in blackletter via `<Heading level={1} font="blackletter">`, and money formatted like `€54,00 EUR`.

**Where the truth lives.** `styles.css` → `_ds_bundle.css` (the whole compiled Tailwind sheet; `:root` holds the tokens `--background --foreground --primary --secondary --muted --muted-foreground --accent --destructive --border --input --ring --radius`, used as `var(--primary)` etc.) and `fonts/fonts.css` (`--font-unifraktur`, `--font-edwardian` faces). Per component: `components/<group>/<Name>/<Name>.prompt.md` for usage and `<Name>.d.ts` for the exact props (`Button` has `variant` default | secondary | outline | ghost | link | destructive and `size` sm | default | lg | icon; `Badge` and `Alert` carry `variant`; `Sheet` content takes `side`).

**Idiomatic snippet** (the cart page's order summary, verbatim from the app):

```jsx
const { Card, CardHeader, CardTitle, CardContent, Separator, ShippingInfoAlert, Button } = window.H2bc;

<Card className="max-w-sm">
  <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">Subtotal</span>
      <span className="font-medium">€54,00 EUR</span>
    </div>
    <Separator />
    <ShippingInfoAlert />
    <div className="flex flex-col gap-3 pt-2">
      <Button size="lg">Checkout</Button>
      <Button variant="outline" size="lg">Continue shopping</Button>
    </div>
  </CardContent>
</Card>
```
