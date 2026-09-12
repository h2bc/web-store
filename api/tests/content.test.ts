import { medusaIntegrationTestRunner } from "@medusajs/test-utils";

import { setupHeaders } from "./support/auth";
import { ABOUT, VIDEOS, VIMEO_VIDEOS } from "./support/data";
import { getEmbedUrl, getUrls } from "./support/gallery";
import { getErrorResponse } from "./support/http";
import seedContentPages from "../src/scripts/seed/content-pages";

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    const auth = setupHeaders(getContainer);

    describe("content", () => {
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

    describe("gallery", () => {
      it("shows the shopper an empty gallery before any video is added", async () => {
        const response = await api.get("/store/gallery", auth.store);

        expect(response.status).toBe(200);
        expect(response.data).toEqual({ videos: [] });
      });

      it("stores the embed links of the pasted links in the order the owner set", async () => {
        const saved = await api.post(
          "/admin/gallery",
          { videos: VIDEOS },
          auth.admin,
        );
        const gallery = await api.get("/store/gallery", auth.store);

        expect(saved.status).toBe(200);
        expect(getUrls(gallery)).toEqual([
          getEmbedUrl("srRVUe4_wW4"),
          getEmbedUrl("C8Hkml0CRmo"),
          getEmbedUrl("qI8fDbBXW2s"),
        ]);
        expect(gallery.data.videos[0].title).toBe("verkei?");
      });

      it("refuses a link that is not YouTube and names the field", async () => {
        const response = await api
          .post("/admin/gallery", { videos: VIMEO_VIDEOS }, auth.admin)
          .catch(getErrorResponse);
        const gallery = await api.get("/store/gallery", auth.store);

        expect(response.status).toBe(400);
        expect(response.data.message).toContain("url");
        expect(gallery.data.videos).toEqual([]);
      });

      it("shows the shopper the new order after the owner reorders", async () => {
        await api.post("/admin/gallery", { videos: VIDEOS }, auth.admin);

        await api.post(
          "/admin/gallery",
          { videos: [...VIDEOS].reverse() },
          auth.admin,
        );
        const gallery = await api.get("/store/gallery", auth.store);

        expect(getUrls(gallery)).toEqual([
          getEmbedUrl("qI8fDbBXW2s"),
          getEmbedUrl("C8Hkml0CRmo"),
          getEmbedUrl("srRVUe4_wW4"),
        ]);
      });

      it("removes a video the owner left out and keeps the order of the rest", async () => {
        await api.post("/admin/gallery", { videos: VIDEOS }, auth.admin);

        await api.post(
          "/admin/gallery",
          { videos: [VIDEOS[0], VIDEOS[2]] },
          auth.admin,
        );
        const gallery = await api.get("/store/gallery", auth.store);

        expect(getUrls(gallery)).toEqual([
          getEmbedUrl("srRVUe4_wW4"),
          getEmbedUrl("qI8fDbBXW2s"),
        ]);
      });

      it("refuses a gallery save without an admin login", async () => {
        const response = await api
          .post("/admin/gallery", { videos: VIDEOS })
          .catch(getErrorResponse);
        const gallery = await api.get("/store/gallery", auth.store);

        expect(response.status).toBe(401);
        expect(gallery.data.videos).toEqual([]);
      });
    });
  },
});
