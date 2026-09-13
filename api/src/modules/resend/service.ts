import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
  Logger,
} from "@medusajs/framework/types";
import { CreateEmailOptions, Resend } from "resend";
import { orderPlacedEmail } from "./emails/order-placed";
import { userInvitedEmail } from "./emails/user-invited";
import { passwordResetEmail } from "./emails/password-reset";
import { contactMessageEmail } from "./emails/contact-message";

enum Templates {
  ORDER_PLACED = "order-placed",
  USER_INVITED = "user-invited",
  PASSWORD_RESET = "password-reset",
  CONTACT_MESSAGE = "contact-message",
}

const templates: {
  [key in Templates]?: (props: Record<string, unknown>) => React.ReactNode;
} = {
  [Templates.ORDER_PLACED]: orderPlacedEmail,
  [Templates.USER_INVITED]: userInvitedEmail,
  [Templates.PASSWORD_RESET]: passwordResetEmail,
  [Templates.CONTACT_MESSAGE]: contactMessageEmail,
};

type ResendOptions = {
  api_key: string;
  from: string;
  logo_url?: string;
  contact_email?: string;
  html_templates?: Record<
    string,
    {
      subject?: string;
      content: string;
    }
  >;
};

type InjectedDependencies = {
  logger: Logger;
};

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend";
  private resendClient: Resend;
  private options: ResendOptions;
  private logger: Logger;

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super();
    this.resendClient = new Resend(options.api_key);
    this.options = options;
    this.logger = logger;
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the provider's options.",
      );
    }

    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the provider's options.",
      );
    }
  }

  getTemplate(template: Templates) {
    if (this.options.html_templates?.[template]) {
      return this.options.html_templates[template].content;
    }

    const allowedTemplates = Object.keys(templates);

    if (!allowedTemplates.includes(template)) {
      return null;
    }

    return templates[template];
  }

  getTemplateSubject(template: Templates, data: Record<string, unknown>) {
    if (this.options.html_templates?.[template]?.subject) {
      return this.options.html_templates[template].subject;
    }

    switch (template) {
      case Templates.ORDER_PLACED:
        return "Order Confirmation";
      case Templates.USER_INVITED:
        return "You're Invited!";
      case Templates.PASSWORD_RESET:
        return "Reset Your Password";
      case Templates.CONTACT_MESSAGE:
        return `${data.topic} from ${data.name}`;
      default:
        return "New Email";
    }
  }

  async send(
    notification: ProviderSendNotificationDTO,
  ): Promise<ProviderSendNotificationResultsDTO> {
    const template = this.getTemplate(notification.template as Templates);

    if (!template) {
      this.logger.error(
        `Couldn't find an email template for ${notification.template}. The valid options are ${Object.values(Templates)}`,
      );

      return {};
    }

    const templateData = notification.data ?? {};
    const replyTo =
      typeof templateData.reply_to === "string"
        ? { replyTo: templateData.reply_to }
        : {};

    const commonOptions = {
      from: this.options.from,
      to: [notification.to],
      subject: this.getTemplateSubject(
        notification.template as Templates,
        templateData,
      ),
      ...replyTo,
    };

    let emailOptions: CreateEmailOptions;

    if (typeof template === "string") {
      emailOptions = {
        ...commonOptions,
        html: template,
      };
    } else {
      emailOptions = {
        ...commonOptions,
        react: template({
          ...templateData,
          logo_url: this.options.logo_url,
          contact_email: this.options.contact_email,
        }),
      };
    }

    const { data, error } = await this.resendClient.emails.send(emailOptions);

    if (error || !data) {
      if (error) {
        this.logger.error("Failed to send email", error);
      } else {
        this.logger.error("Failed to send email: unknown error");
      }

      return {};
    }

    return { id: data.id };
  }
}

export default ResendNotificationProviderService;
