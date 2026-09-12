import { medusaIntegrationTestRunner } from "@medusajs/test-utils";

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api }) => {
    describe("/health", () => {
      it("answers 200 while the server is up", async () => {
        const response = await api.get("/health");

        expect(response.status).toEqual(200);
      });
    });
  },
});
