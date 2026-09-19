import { OrderAddressDTO } from "@medusajs/framework/types";

export const getAddressLines = (address?: OrderAddressDTO | null) =>
  address
    ? [
        [address.first_name, address.last_name].filter(Boolean).join(" "),
        address.company,
        address.address_1,
        address.address_2,
        [address.postal_code, address.city].filter(Boolean).join(" "),
        [address.province, address.country_code?.toUpperCase()]
          .filter(Boolean)
          .join(", "),
        address.phone,
      ].filter(Boolean)
    : ["No shipping address"];
