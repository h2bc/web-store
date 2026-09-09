import { CategoryFilter } from 'h2bc-web-front'

const categories = ['ALL', 'TEES', 'HOODIES', 'CAPS']

export const Default = () => (
  <CategoryFilter categories={categories} active="TEES" />
)

export const AllSelected = () => (
  <CategoryFilter categories={categories} active="ALL" />
)

export const ManyCategories = () => (
  <CategoryFilter
    categories={['ALL', 'TEES', 'HOODIES', 'CAPS', 'BEANIES', 'ACCESSORIES']}
    active="BEANIES"
  />
)
