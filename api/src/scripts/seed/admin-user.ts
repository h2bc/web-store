import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils";

const TEST_ADMIN = { email: "admin@h2bc.local", password: "admin-pass" };

export default async function seedAdminUser({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const userService = container.resolve(Modules.USER);
  const authService = container.resolve(Modules.AUTH);

  const [existing] = await userService.listUsers({ email: TEST_ADMIN.email });

  if (existing) {
    logger.info("Admin user: exists");

    return;
  }

  const user = await userService.createUsers({ email: TEST_ADMIN.email });
  const { authIdentity, error } = await authService.register("emailpass", {
    body: TEST_ADMIN,
  });

  if (error || !authIdentity) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      error ?? "Admin user: registration failed",
    );
  }

  await authService.updateAuthIdentities({
    id: authIdentity.id,
    app_metadata: { user_id: user.id },
  });

  logger.info("Admin user: created");
}
