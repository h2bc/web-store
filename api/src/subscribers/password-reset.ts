import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { dashboardUrl } from "../utils/dashboard-url";

type PasswordResetEvent = {
  entity_id: string;
  actor_type: string;
  token: string;
};

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetEvent>) {
  if (data.actor_type !== "user") {
    return;
  }

  const email = data.entity_id;
  const reset_url = dashboardUrl(container, "/reset-password", {
    token: data.token,
    email,
  });

  await container.resolve(Modules.NOTIFICATION).createNotifications({
    to: email,
    channel: "email",
    template: "password-reset",
    data: { reset_url, email },
  });
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};
