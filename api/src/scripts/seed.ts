import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import seedAdminUser from "./seed/admin-user";
import seedContentPages from "./seed/content-pages";
import seedGallery from "./seed/gallery";
import seedProducts from "./seed/products";
import seedStore from "./seed/store";

export default async function seed(args: ExecArgs) {
  await seedStore(args);
  await seedProducts(args);
  await seedContentPages(args);
  await seedGallery(args);
  await seedAdminUser(args);

  args.container
    .resolve(ContainerRegistrationKeys.LOGGER)
    .info("Seed finished");
}
