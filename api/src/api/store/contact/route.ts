import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { sendContactMessageWorkflow } from "../../../workflows/send-contact-message";
import { PostStoreContactType } from "./validators";

export async function POST(
  req: MedusaRequest<PostStoreContactType>,
  res: MedusaResponse,
) {
  const { website, ...message } = req.validatedBody;

  if (website) {
    res.status(200).json({});

    return;
  }

  const to = process.env.CONTACT_INBOX_EMAIL;

  if (!to) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "CONTACT_INBOX_EMAIL is not set",
    );
  }

  await sendContactMessageWorkflow(req.scope).run({
    input: { to, ...message },
  });

  res.status(200).json({});
}
