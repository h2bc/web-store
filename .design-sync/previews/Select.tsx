import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from 'h2bc-web-front'

const countries = [
  { code: 'lt', name: 'Lithuania' },
  { code: 'lv', name: 'Latvia' },
  { code: 'ee', name: 'Estonia' },
  { code: 'pl', name: 'Poland' },
  { code: 'de', name: 'Germany' },
]

export const Open = () => (
  <div className="w-64 space-y-2">
    <Label htmlFor="country">Country</Label>
    <Select open defaultValue="lt">
      <SelectTrigger id="country">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

export const Placeholder = () => (
  <div className="w-64 space-y-2">
    <Label htmlFor="country-empty">Country</Label>
    <Select>
      <SelectTrigger id="country-empty">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

export const States = () => (
  <div className="flex w-64 flex-col gap-4">
    <Select defaultValue="lt">
      <SelectTrigger aria-label="Selected country">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select defaultValue="eu" disabled>
      <SelectTrigger aria-label="Region">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="eu">Europe</SelectItem>
        <SelectItem value="lt">Lithuania</SelectItem>
      </SelectContent>
    </Select>
  </div>
)

export const WithGroups = () => (
  <div className="w-64 space-y-2">
    <Label htmlFor="shipping">Delivery</Label>
    <Select open defaultValue="omniva">
      <SelectTrigger id="shipping">
        <SelectValue placeholder="Choose delivery" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Lithuania</SelectLabel>
          <SelectItem value="omniva">Omniva parcel locker</SelectItem>
          <SelectItem value="lp">LP Express</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="dpd">DPD standard</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
)
