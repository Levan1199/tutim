const assert = require("node:assert/strict");
const path = require("node:path");
const { expect } = require("@playwright/test");

exports.runModernBrowser = async ({
  browser,
  base,
  root,
  User,
  Student,
  Course,
  teacher,
  student,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [],
    providers = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().includes("Failed to load resource")
    )
      errors.push(message.text());
  });
  await page.route(
    /https?:\/\/[^/]*(?:google|gstatic|facebook|openstreetmap)[^/]*\//i,
    (route) => {
      providers.push(route.request().url());
      return route.abort();
    },
  );
  page.on("dialog", (dialog) => dialog.accept());
  const go = async (route) => page.goto(base + route);
  const switchUI = async (mode) => {
    await page
      .getByRole("button", {
        name: mode === "legacy" ? "Legacy UI" : "Modern UI",
        exact: true,
      })
      .first()
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-tutim-ui", mode);
    assert.deepEqual(
      await page
        .locator("style[data-tutim-ui]")
        .evaluateAll((items) => items.map((item) => item.dataset.tutimUi)),
      [mode],
    );
  };
  const login = async (username) => {
    await go("/signin");
    await page.getByLabel("Username", { exact: true }).fill(username);
    await page.getByLabel("Password", { exact: true }).fill("browser-password");
    await page
      .getByRole("button", { name: "Sign in", exact: true })
      .last()
      .click();
    await expect(
      page.getByRole("button", { name: "Sign out", exact: true }).first(),
    ).toBeVisible();
  };
  try {
    await go("/");
    await expect(
      page.getByRole("heading", { name: /Find your people/ }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute(
      "data-tutim-ui",
      "modern",
    );
    await switchUI("legacy");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
      "data-tutim-ui",
      "legacy",
    );
    await switchUI("modern");
    await expect(
      page.getByRole("heading", { name: /Find your people/ }),
    ).toBeVisible();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
      "data-tutim-ui",
      "modern",
    );
    for (const route of [
      "/teachers",
      "/students",
      "/courses",
      "/teachers/" + teacher._id,
      "/students/" + student._id,
      "/addresses",
      "/map",
    ]) {
      await go(route);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("iframe")).toHaveCount(0);
    }
    await go("/teachers?subject=Maths");
    await expect(
      page.getByRole("link", { name: "Browser Teacher", exact: true }),
    ).toBeVisible();
    await switchUI("legacy");
    await page.waitForURL("**/teacherList/Maths?subject=Maths");
    await switchUI("modern");
    await page.waitForURL("**/teachers?subject=Maths");
    await page.getByLabel("Search by name or subject").fill("missing-person");
    await expect(
      page.getByText("No results yet. Try different filters or add a profile."),
    ).toBeVisible();
    await go("/addresses");
    await page
      .getByLabel("Search name, address, or district")
      .fill("Demo address");
    await expect(
      page.getByText("Updated Browser Student", { exact: true }),
    ).toBeVisible();
    console.log(
      "PASS modern default, saved preference, isolated styles, directories and address search",
    );

    await login("browser-admin");
    await go("/admin");
    const studentRow = page
      .getByRole("row")
      .filter({ hasText: "browser-student" });
    await studentRow
      .getByRole("button", { name: "Disable", exact: true })
      .click();
    await expect(
      studentRow.getByRole("button", { name: "Enable", exact: true }),
    ).toBeVisible();
    await studentRow
      .getByRole("button", { name: "Enable", exact: true })
      .click();
    await expect(
      studentRow.getByRole("button", { name: "Disable", exact: true }),
    ).toBeVisible();
    await switchUI("legacy");
    await page.waitForURL("**/admin/view");
    await expect(
      page.getByRole("button", { name: "Sign Out", exact: true }),
    ).toBeVisible();
    await switchUI("modern");
    await page.waitForURL("**/admin");
    await expect(
      page.getByRole("heading", { name: "Admin dashboard", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Add course", exact: true }).click();
    await page.getByLabel("Course name").fill("Modern Art");
    await page
      .getByLabel("Description")
      .fill("Created by the imported v2 interface");
    await page
      .getByRole("button", { name: "Save course", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const course = await Course.findOne({ name: "Modern Art" });
    assert.ok(course);
    await go("/courses/" + course._id);
    await switchUI("legacy");
    await page.waitForURL("**/courseDetail/Modern%20Art");
    await switchUI("modern");
    await page.waitForURL("**/courses/" + course._id);
    await page
      .getByRole("button", { name: "Edit course", exact: true })
      .click();
    await page.getByLabel("Course name").fill("Modern Music");
    await page
      .getByRole("button", { name: "Save course", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Modern Music", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Delete course", exact: true })
      .click();
    await page.waitForURL("**/courses");
    assert.equal(await Course.countDocuments({ _id: course._id }), 0);
    await page
      .getByRole("button", { name: "Sign out", exact: true })
      .first()
      .click();
    console.log(
      "PASS modern admin, account state, course lifecycle and signed-in switching",
    );

    await login("browser-student");
    await go("/profile");
    await page
      .getByLabel("Name", { exact: true })
      .fill("Modern Browser Student");
    // A real image verifies multipart uploads through the shared backend.
    await page
      .locator('input[type="file"]')
      .setInputFiles({
        name: "avatar.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aElcAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    await page
      .getByRole("button", { name: "Save profile", exact: true })
      .click();
    await expect(page.getByText("Your profile has been saved.")).toBeVisible();
    assert.equal(
      (await Student.findById(student._id)).name,
      "Modern Browser Student",
    );
    assert.match((await Student.findById(student._id)).imgPath, /\.png$/);
    await switchUI("legacy");
    await page.waitForURL("**/profile/student");
    await expect(
      page.getByText("Modern Browser Student", { exact: true }).last(),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign Out", exact: true }).click();
    await switchUI("modern");
    await expect(
      page.getByRole("link", { name: "Sign in", exact: true }).first(),
    ).toBeVisible();
    await login("browser-student");
    await go("/teachers/" + teacher._id);
    await page.getByRole("button", { name: "Connect", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Connected", exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Your review")
      .fill("A helpful lesson through the modern UI");
    await page
      .getByRole("button", { name: "Post review", exact: true })
      .click();
    await expect(
      page.getByText("A helpful lesson through the modern UI", { exact: true }),
    ).toBeVisible();
    await go("/connections");
    await expect(
      page.getByRole("link", { name: "Browser Teacher", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Remove connection", exact: true })
      .click();
    await expect(
      page.getByText("No results yet. Try different filters or add a profile."),
    ).toBeVisible();
    await go("/admin");
    await page.waitForURL(base + "/");
    await page
      .getByRole("button", { name: "Sign out", exact: true })
      .first()
      .click();
    console.log(
      "PASS modern profile/image editing, reviews, connections, logout and access guard",
    );

    await go("/signup");
    await page.getByLabel("Username", { exact: true }).fill("modern-new");
    await page.getByLabel("Password", { exact: true }).fill("browser-password");
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await page.waitForURL("**/profile");
    await page.getByLabel("Name", { exact: true }).fill("New Modern Student");
    await page
      .getByRole("button", { name: "Save profile", exact: true })
      .click();
    await expect(page.getByText("Your profile has been saved.")).toBeVisible();
    assert.ok((await User.findOne({ username: "modern-new" })).studentProfile);
    await page.setViewportSize({ width: 390, height: 844 });
    await go("/teachers");
    await page
      .getByRole("button", { name: "Show filters", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "District" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Legacy UI", exact: true })
      .first()
      .click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-tutim-ui",
      "legacy",
    );
    await switchUI("modern");
    await expect(
      page.getByRole("heading", { name: "Current teachers", exact: true }),
    ).toBeVisible();
    assert.equal(
      await page.evaluate(
        () =>
          globalThis.document.documentElement.scrollWidth <=
          globalThis.innerWidth,
      ),
      true,
    );
    await page.screenshot({
      path: path.join(root, "test-results/modern-mobile.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go("/");
    await expect(page.getByRole("heading", { name: /Find your people/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browser Teacher", exact: true })).toBeVisible();
    await page.screenshot({
      path: path.join(root, "test-results/modern-home.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(providers, []);
    console.log(
      "PASS modern onboarding, mobile navigation/filters/switch, no external maps or social SDKs, zero runtime errors",
    );
  } finally {
    await context.close();
  }
};
