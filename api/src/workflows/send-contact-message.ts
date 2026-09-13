import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { sendNotificationsStep } from "@medusajs/medusa/core-flows";

type SendContactMessageInput = {
  to: string;
  name: string;
  email: string;
  topic: string;
  message: string;
};

export const sendContactMessageWorkflow = createWorkflow(
  "send-contact-message",
  (input: SendContactMessageInput) => {
    const notifications = transform({ input }, ({ input }) => [
      {
        to: input.to,
        channel: "email",
        template: "contact-message",
        data: {
          name: input.name,
          email: input.email,
          topic: input.topic,
          message: input.message,
          reply_to: input.email,
        },
      },
    ]);

    return new WorkflowResponse(sendNotificationsStep(notifications));
  },
);
