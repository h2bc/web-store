// Design-system surface synced to Claude Design: the source root for the
// converter's synthesized entry. Every value export here lands on window.H2bc.
// Default exports are re-exported by name (`export *` skips defaults).
// App components are limited to those that render without the Next.js
// runtime; see .design-sync/NOTES.md for the exclusion rationale.

import './next-runtime-shim'

// components/ui
export * from '../components/ui/alert'
export * from '../components/ui/badge'
export * from '../components/ui/button'
export * from '../components/ui/card'
export * from '../components/ui/checkbox'
export * from '../components/ui/collapsible'
export * from '../components/ui/dropdown-menu'
export * from '../components/ui/form'
export * from '../components/ui/icon-badge'
export * from '../components/ui/input'
export * from '../components/ui/label'
export * from '../components/ui/radio-group'
export * from '../components/ui/select'
export * from '../components/ui/separator'
export * from '../components/ui/sheet'
export * from '../components/ui/skeleton'
export * from '../components/ui/sonner'
export { default as Stepper } from '../components/ui/stepper'
export * from '../components/ui/textarea'

// app components (presentational)
export { default as Heading } from '../components/layout/heading'
export { default as RightsNotice } from '../components/layout/footer/rights-notice'
export { default as SocialIcons } from '../components/layout/footer/social-icons'
export { default as ErrorAlert } from '../components/feedback/error-alert'
export { default as ProductCard } from '../components/shop/product-card'
export { default as ProductCardImage } from '../components/shop/product-card-image'
export { default as ProductCardSkeleton } from '../components/shop/product-card-skeleton'
export { default as ProductGrid } from '../components/shop/product-grid'
export { default as NoProductsLabel } from '../components/shop/no-products-label'
export { default as CategoryFilter } from '../components/shop/category-filter'
export { default as ProductDescription } from '../components/shop/product-detail/product-description'
export { default as SizeSelector } from '../components/shop/product-detail/size-selector'
export { default as CartEmptyState } from '../components/cart/cart-empty-state'
export { default as ShippingInfoAlert } from '../components/cart/shipping-info-alert'
export { default as CheckoutStepSection } from '../components/checkout/checkout-step-section'

// helpers (non-component exports the design agent needs alongside the components)
export { toast } from 'sonner'
