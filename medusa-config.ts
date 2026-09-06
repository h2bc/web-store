import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const prodOnlyModules = [
  {
    resolve: "@medusajs/medusa/caching",
    options: {
      providers: [
        {
          resolve: "@medusajs/caching-redis",
          id: "caching-redis",
          is_default: true,
          options: {
            redisUrl: process.env.REDIS_URL,
          },
        },
      ],
    },
  },
  {
    resolve: "@medusajs/medusa/event-bus-redis",
    options: { redisUrl: process.env.EVENTS_REDIS_URL },
  },
  {
    resolve: "@medusajs/medusa/workflow-engine-redis",

    options: {
      redis: {
        url: process.env.WE_REDIS_URL,
      },
    },
  },
  {
    resolve: "@medusajs/medusa/locking",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/locking-redis",
          id: "locking-redis",
          is_default: true,
          options: {
            redisUrl: process.env.LOCKING_REDIS_URL,
          },
        },
      ],
    },
  },
];

const stripeApiKey = process.env.STRIPE_API_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

const paymentModule = stripeApiKey
  ? [
      {
        resolve: "@medusajs/medusa/payment",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/payment-stripe",
              id: "stripe",
              options: {
                apiKey: stripeApiKey,
                webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                capture: true,
                automaticPaymentMethods: true,
              },
            },
          ],
        },
      },
    ]
  : [];

const emailFromName = "h2bc shop";
const emailFrom = (address?: string) =>
  address ? `${emailFromName} <${address}>` : undefined;

const notificationProvider = resendApiKey
  ? {
      resolve: "./src/modules/resend",
      id: "resend",
      options: {
        channels: ["email"],
        api_key: resendApiKey,
        from: emailFrom(process.env.RESEND_FROM_EMAIL),
        logo_url: process.env.EMAIL_LOGO_URL,
      },
    }
  : {
      resolve: "@medusajs/medusa/notification-local",
      id: "local",
      options: { channels: ["email"] },
    };

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    //@ts-ignore
    workerMode: process.env.MEDUSA_WORKER_MODE || "shared",
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers:
          process.env.NODE_ENV === "production"
            ? [
                {
                  resolve: "@medusajs/medusa/file-s3",
                  id: "s3",
                  options: {
                    file_url: process.env.S3_FILE_URL,
                    region: process.env.S3_REGION,
                    access_key_id: process.env.S3_ACCESS_KEY,
                    secret_access_key: process.env.S3_SECRET_KEY,
                    bucket: process.env.S3_BUCKET,
                    endpoint: process.env.S3_ENDPOINT,
                    additional_client_config: { forcePathStyle: true },
                  },
                },
              ]
            : [
                {
                  resolve: "@medusajs/medusa/file-local",
                  id: "local",
                },
              ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: { providers: [notificationProvider] },
    },
    ...paymentModule,
    ...(process.env.NODE_ENV === "production" ? prodOnlyModules : []),
  ],
});
