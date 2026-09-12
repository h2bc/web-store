import { medusaIntegrationTestRunner } from "@medusajs/test-utils";

import { setupHeaders } from "./support/auth";
import { ABOUT } from "./support/data";
import { getErrorResponse } from "./support/http";
import seedContentPages from "../src/scripts/seed/content-pages";

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    const auth = setupHeaders(getContainer);

    describe("content pages", () => {
      it("shows the shopper the seeded privacy policy", async () => {
        await seedContentPages({ container: getContainer(), args: [] });

        const response = await api.get("/store/privacy", auth.store);

        expect(response.status).toBe(200);
        expect(response.data.content_page).toMatchObject({
          slug: "privacy",
          title: "Privacy Policy",
        });
        expect(response.data.content_page.body).toContain("## ");
      });

      it("answers 404 for a screen that has no content yet", async () => {
        const response = await api
          .get("/store/about", auth.store)
          .catch(getErrorResponse);

        expect(response.status).toBe(404);
      });

      it("shows the shopper the text the owner saved", async () => {
        const saved = await api.post("/admin/about", ABOUT, auth.admin);
        const response = await api.get("/store/about", auth.store);

        expect(saved.status).toBe(200);
        expect(saved.data.content_page).toMatchObject(ABOUT);
        expect(response.data.content_page).toMatchObject(ABOUT);
      });

      it("replaces the text when the owner saves it again", async () => {
        await api.post("/admin/about", ABOUT, auth.admin);

        await api.post(
          "/admin/about",
          { ...ABOUT, title: "About us" },
          auth.admin,
        );
        const response = await api.get("/store/about", auth.store);

        expect(response.data.content_page.title).toBe("About us");
      });

      it("refuses an empty body and names the field", async () => {
        const response = await api
          .post("/admin/terms", { ...ABOUT, body: "" }, auth.admin)
          .catch(getErrorResponse);

        expect(response.status).toBe(400);
        expect(response.data.message).toContain("body");
      });

      it("refuses a save without an admin login", async () => {
        const response = await api
          .post("/admin/terms", ABOUT)
          .catch(getErrorResponse);
        const content = await api
          .get("/store/terms", auth.store)
          .catch(getErrorResponse);

        expect(response.status).toBe(401);
        expect(content.status).toBe(404);
      });
    });
  },
});
