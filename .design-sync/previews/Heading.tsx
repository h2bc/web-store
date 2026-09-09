import { Heading } from 'h2bc-web-front'

export const PageTitles = () => (
  <div className="flex flex-col gap-4">
    <Heading level={1} font="blackletter">
      Cart
    </Heading>
    <Heading level={1} font="blackletter">
      Checkout
    </Heading>
    <Heading level={2} font="script">
      Sold Out
    </Heading>
  </div>
)

export const Levels = () => (
  <div className="flex flex-col gap-3">
    <Heading level={1}>Heading level 1</Heading>
    <Heading level={2}>Heading level 2</Heading>
    <Heading level={3}>Heading level 3</Heading>
    <Heading level={4} bold>
      Shipping to Lithuania
    </Heading>
    <Heading level={5}>Heading level 5</Heading>
    <Heading level={6}>Heading level 6</Heading>
  </div>
)

export const Fonts = () => (
  <div className="flex flex-col gap-4">
    <Heading level={2} font="sans">
      About h2bc
    </Heading>
    <Heading level={2} font="blackletter">
      About h2bc
    </Heading>
    <Heading level={2} font="script">
      About h2bc
    </Heading>
  </div>
)
