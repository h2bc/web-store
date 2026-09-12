import { medusaIntegrationTestRunner } from "@medusajs/test-utils";

import { setupHeaders } from "./support/auth";
import { VIDEOS, VIMEO_VIDEOS } from "./support/data";
import { getEmbedUrl, getUrls } from "./support/gallery";
import { getErrorResponse } from "./support/http";

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    const auth = setupHeaders(getContainer);

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
