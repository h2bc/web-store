import {
  ADMIN_SCREENS,
  NEW_BODY,
  NEW_BODY_TEXT,
  NEW_DESCRIPTION,
  NEW_VIDEO,
  RENAMED_VIDEO_TITLE,
  SECOND_GALLERY_VIDEO_TITLE,
  THIRD_GALLERY_VIDEO_TITLE,
} from "./support/data";
import { expect, test } from "./support/fixtures";

test.describe.configure({ mode: "serial" });

test("the owner finds every content screen in the sidebar", async ({ admin }) => {
  await test.step("Then the gallery and the four pages are listed", async () => {
    for (const name of ADMIN_SCREENS) {
      await expect(admin.getSidebarLink(name)).toBeVisible();
    }
  });
});

test("the owner is told when the pasted link is not YouTube", async ({ admin }) => {
  await test.step("Given the gallery screen", async () => {
    await admin.open("gallery");
  });

  await test.step("When they save a Vimeo link", async () => {
    await admin.submitVideo("https://vimeo.com/12345", "nope");
  });

  await test.step("Then the link is marked invalid and the form stays open", async () => {
    await expect(admin.getInvalidField("YouTube link")).toBeVisible();
    await expect(admin.getDialog()).toBeVisible();
  });
});

test("the owner adds a video, it lands last, and the owner removes it again", async ({ admin }) => {
  await test.step("Given the gallery screen", async () => {
    await admin.open("gallery");
  });

  await test.step("When they save a YouTube share link", async () => {
    await admin.submitVideo(`https://youtu.be/${NEW_VIDEO.id}`, NEW_VIDEO.title);
  });

  await test.step("Then it is the last row and shows the embed link", async () => {
    await expect(admin.getLastRow()).toContainText(NEW_VIDEO.title);
    await expect(admin.getLastRow()).toContainText(NEW_VIDEO.id);
  });

  await test.step("When they delete it", async () => {
    await admin.deleteVideo(NEW_VIDEO.title);
  });

  await test.step("Then it is gone from the list", async () => {
    await expect(admin.getRow(NEW_VIDEO.title)).toHaveCount(0);
  });
});

test("the owner rewrites the About page and puts it back", async ({ admin }) => {
  let original: string;

  await test.step("Given the About screen", async () => {
    await admin.open("about");
    original = await admin.getBodyDraft();
  });

  await test.step("When they save a new body", async () => {
    await admin.editPageBody(NEW_BODY);
  });

  await test.step("Then the screen shows the new body", async () => {
    await expect(admin.getBodyText(NEW_BODY_TEXT)).toBeVisible();
  });

  await test.step("When they save the original body again", async () => {
    await admin.editPageBody(original!);
  });

  await test.step("Then the screen shows the original body", async () => {
    await expect(admin.getBodyText(NEW_BODY_TEXT)).toHaveCount(0);
    expect(await admin.getBodyDraft()).toBe(original!);
  });
});

test("the owner renames a video and gives it its name back", async ({ admin }) => {
  await test.step("Given the gallery screen", async () => {
    await admin.open("gallery");
  });

  await test.step("When they save a new title on the third video", async () => {
    await admin.editVideoTitle(THIRD_GALLERY_VIDEO_TITLE, RENAMED_VIDEO_TITLE);
  });

  await test.step("Then the row shows the new title", async () => {
    await expect(admin.getRow(RENAMED_VIDEO_TITLE)).toBeVisible();
    await expect(admin.getRow(THIRD_GALLERY_VIDEO_TITLE)).toHaveCount(0);
  });

  await test.step("When they save the old title again", async () => {
    await admin.editVideoTitle(RENAMED_VIDEO_TITLE, THIRD_GALLERY_VIDEO_TITLE);
  });

  await test.step("Then the row shows the old title", async () => {
    await expect(admin.getRow(THIRD_GALLERY_VIDEO_TITLE)).toBeVisible();
  });
});

test("the owner drags the second video to the top and back", async ({ admin }) => {
  await test.step("Given the gallery screen", async () => {
    await admin.open("gallery");
  });

  await test.step("When they move the second video up in the ranking", async () => {
    await admin.moveVideo(SECOND_GALLERY_VIDEO_TITLE, "up");
  });

  await test.step("Then it is the first row", async () => {
    await expect(admin.getFirstRow()).toContainText(SECOND_GALLERY_VIDEO_TITLE);
  });

  await test.step("When they move it down again", async () => {
    await admin.moveVideo(SECOND_GALLERY_VIDEO_TITLE, "down");
  });

  await test.step("Then it is no longer the first row", async () => {
    await expect(admin.getFirstRow()).not.toContainText(SECOND_GALLERY_VIDEO_TITLE);
  });
});

test("the owner sees an empty gallery with a way to add the first video", async ({ admin, emptyGallery }) => {
  void emptyGallery;

  await test.step("Given a gallery with no videos", async () => {
    await admin.open("gallery");
  });

  await test.step("Then there is no list, only the way to create one", async () => {
    await expect(admin.getCreateButton()).toBeVisible();
    await expect(admin.getRows()).toHaveCount(0);
  });
});

test("the owner rewrites the About description and puts it back", async ({ admin }) => {
  let original: string;

  await test.step("Given the About screen", async () => {
    await admin.open("about");
    original = await admin.getDescriptionDraft();
  });

  await test.step("When they save a new description", async () => {
    await admin.editPageDescription(NEW_DESCRIPTION);
  });

  await test.step("Then the screen shows the new description", async () => {
    await expect(admin.getBodyText(NEW_DESCRIPTION)).toBeVisible();
  });

  await test.step("When they save the original description again", async () => {
    await admin.editPageDescription(original!);
  });

  await test.step("Then the screen shows the original description", async () => {
    await expect(admin.getBodyText(NEW_DESCRIPTION)).toHaveCount(0);
  });
});

test("the owner is told the body cannot be empty and keeps what they typed", async ({ admin }) => {
  await test.step("Given the About screen", async () => {
    await admin.open("about");
  });

  await test.step("When they clear the body and save", async () => {
    await admin.saveClearedBody(NEW_DESCRIPTION);
  });

  await test.step("Then the body is marked invalid and the drawer keeps the description", async () => {
    await expect(admin.getInvalidField("Body")).toBeVisible();
    await expect(admin.getDialog()).toBeVisible();
    await expect(admin.getDialog().getByLabel("Meta description")).toHaveValue(NEW_DESCRIPTION);
  });
});

test("the owner clears the About title and puts it back", async ({ admin }) => {
  let original: string;

  await test.step("Given the About screen with a title", async () => {
    await admin.open("about");
    original = await admin.getTitleDraft();
    expect(original, "the About page has no title, reseed the content pages").not.toBe("");
  });

  await test.step("When they save an empty title", async () => {
    await admin.editPageTitle("");
  });

  await test.step("Then the Title row shows a dash", async () => {
    await expect(admin.getTitleRow()).toContainText("-");
  });

  await test.step("When they save the original title again", async () => {
    await admin.editPageTitle(original!);
  });

  await test.step("Then the Title row shows it", async () => {
    await expect(admin.getTitleRow()).toContainText(original!);
  });
});
