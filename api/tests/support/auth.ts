import { MedusaContainer } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  generateJwtToken,
  Modules,
} from "@medusajs/framework/utils";

export type Headers = { headers: Record<string, string> };

export async function createAdminHeaders(
  container: MedusaContainer,
): Promise<Headers> {
  const email = "admin@test.local";
  const user = await container.resolve(Modules.USER).createUsers({ email });
  const authIdentity = await container
    .resolve(Modules.AUTH)
    .createAuthIdentities({
      provider_identities: [{ provider: "emailpass", entity_id: email }],
      app_metadata: { user_id: user.id },
    });
  const { jwtSecret } = container.resolve(
    ContainerRegistrationKeys.CONFIG_MODULE,
  ).projectConfig.http;
  const token = generateJwtToken(
    {
      actor_id: user.id,
      actor_type: "user",
      auth_identity_id: authIdentity.id,
      app_metadata: { user_id: user.id },
    },
    { secret: jwtSecret, expiresIn: "1h" },
  );

  return { headers: { authorization: `Bearer ${token}` } };
}

export async function createStoreHeaders(
  container: MedusaContainer,
): Promise<Headers> {
  const { createApiKeysWorkflow } = await import("@medusajs/medusa/core-flows");
  const {
    result: [apiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [{ title: "test", type: "publishable", created_by: "test" }],
    },
  });

  return { headers: { "x-publishable-api-key": apiKey.token } };
}

export function setupHeaders(getContainer: () => MedusaContainer) {
  let admin: Headers;
  let store: Headers;

  beforeEach(async () => {
    admin = await createAdminHeaders(getContainer());
    store = await createStoreHeaders(getContainer());
  });

  return {
    get admin() {
      return admin;
    },
    get store() {
      return store;
    },
  };
}
