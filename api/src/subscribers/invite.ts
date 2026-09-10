import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { dashboardUrl } from "../utils/dashboard-url";

export default async function inviteHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const invite = await container.resolve(Modules.USER).retrieveInvite(data.id);
  const invite_url = dashboardUrl(container, "/invite", {
    token: invite.token,
  });

  await container.resolve(Modules.NOTIFICATION).createNotifications({
    to: invite.email,
    channel: "email",
    template: "user-invited",
    data: { invite_url, email: invite.email },
  });
}

export const config: SubscriberConfig = {
  event: ["invite.created", "invite.resent"],
};
