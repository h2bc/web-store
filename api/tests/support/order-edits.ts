import { MedusaContainer, OrderDTO } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import {
  beginOrderEditOrderWorkflow,
  confirmOrderEditRequestWorkflow,
  orderEditUpdateItemQuantityWorkflow,
  requestOrderEditRequestWorkflow,
} from "@medusajs/medusa/core-flows";
import { ORDER } from "./notifications";

const getEditedItemId = (order: OrderDTO) => {
  const item = (order.items ?? []).find(
    ({ title }) => title === ORDER.items[0].title,
  );

  if (!item) {
    throw new Error(`Order ${order.id} has no ${ORDER.items[0].title} to edit`);
  }

  return item.id;
};

export async function confirmOrderEdit(
  container: MedusaContainer,
  order: OrderDTO,
  options: { quantity: number; no_notification?: boolean },
) {
  const { result: change } = await beginOrderEditOrderWorkflow(container).run({
    input: { order_id: order.id },
  });

  await orderEditUpdateItemQuantityWorkflow(container).run({
    input: {
      order_id: order.id,
      items: [{ id: getEditedItemId(order), quantity: options.quantity }],
    },
  });
  await requestOrderEditRequestWorkflow(container).run({
    input: {
      order_id: order.id,
      no_notification: options.no_notification ?? false,
    },
  });
  await confirmOrderEditRequestWorkflow(container).run({
    input: { order_id: order.id },
  });

  return container
    .resolve(Modules.ORDER)
    .retrieveOrderChange(change.id, { relations: ["actions"] });
}
