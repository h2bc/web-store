import { MedusaContainer } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";

export function dashboardUrl(
  container: MedusaContainer,
  path: string,
  params: Record<string, string>,
) {
  const { admin } = container.resolve(ContainerRegistrationKeys.CONFIG_MODULE);

  if (!admin.backendUrl) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "MEDUSA_BACKEND_URL must be set to build dashboard links in emails",
    );
  }

  return `${admin.backendUrl.replace(/\/$/, "")}${admin.path}${path}?${new URLSearchParams(params)}`;
}
