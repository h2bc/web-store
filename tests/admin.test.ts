import { ADMIN_SCREENS, NEW_BODY, NEW_BODY_TEXT, NEW_VIDEO } from "./support/data";
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

  await test.step("Then the form shows the error and stays open", async () => {
    await expect(admin.getDialog().getByText("not a YouTube video link")).toBeVisible();
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
