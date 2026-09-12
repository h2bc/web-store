import { medusaIntegrationTestRunner } from "@medusajs/test-utils";

import { setupHeaders } from "./support/auth";
import { ABOUT, ABOUT_UNTITLED, ABOUT_UPDATED } from "./support/data";
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
        expect(response.data.content_page.slug).toBe("privacy");
        expect(typeof response.data.content_page.title).toBe("string");
        expect(typeof response.data.content_page.description).toBe("string");
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

        await api.post("/admin/about", ABOUT_UPDATED, auth.admin);
        const response = await api.get("/store/about", auth.store);

        expect(response.data.content_page).toMatchObject(ABOUT_UPDATED);
      });

      it("shows no title when the owner clears it", async () => {
        await api.post("/admin/about", ABOUT, auth.admin);

        await api.post("/admin/about", ABOUT_UNTITLED, auth.admin);
        const response = await api.get("/store/about", auth.store);

        expect(response.data.content_page.title).toBeNull();
        expect(response.data.content_page.body).toBe(ABOUT.body);
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
