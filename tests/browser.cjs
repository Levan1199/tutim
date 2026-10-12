const assert = require("node:assert/strict");
const { chromium, expect } = require("@playwright/test");
const mongoose = require("mongoose");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const root = path.resolve(__dirname, "..");
const dbName = "tutim_v1_browser_" + Date.now() + "_" + process.pid;
const base = "http://localhost:4001";
let browser, server, vite, uploads;
(async () => {
  try {
    await mongoose.connect(
      (process.env.TEST_MONGO_BASE || "mongodb://host.docker.internal:27017") +
        "/" +
        dbName,
      { autoIndex: false },
    );
    process.env.JWT_SECRET = "isolated-browser-test-secret";
    process.env.CORS_ORIGINS = base;
    uploads = await fs.mkdtemp(path.join(os.tmpdir(), "tutim-browser-"));
    process.env.PUBLIC_DIR = uploads;
    const User = require("../server/models/user"),
      Teacher = require("../server/models/teacherReg"),
      Student = require("../server/models/studentReg"),
      Course = require("../server/models/courses");
    const common = {
      email: "demo@example.test",
      telnum: "0901234567",
      available: true,
      grade: ["Grade 10"],
      subject: ["Maths"],
      district: ["District 1"],
      fee: 150000,
    };
    const teacher = await Teacher.create({
      ...common,
      name: "Browser Teacher",
      weekly: [2, 4],
    });
    const student = await Student.create({
      ...common,
      name: "Browser Student",
      address: "Demo address",
    });
    for (const [username, extra] of [
      ["browser-admin", { admin: true }],
      ["browser-student", { isStudent: true, studentProfile: student._id }],
      ["browser-teacher", { isTeacher: true, teacherProfile: teacher._id }],
    ])
      await User.register(new User({ username, ...extra }), "browser-password");
    await Course.create({
      name: "Maths",
      description: "Demo mathematics course",
    });
    server = require("../server/app").listen(4000, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const bin = path.join(
      path.dirname(require.resolve("vite/package.json")),
      "bin/vite.js",
    );
    vite = spawn(
      process.execPath,
      [
        bin,
        ...(process.env.BROWSER_TEST_BUILD ? ["preview"] : []),
        "--host",
        "127.0.0.1",
        "--port",
        "4001",
        "--strictPort",
      ],
      {
        cwd: path.join(root, "client"),
        env: { ...process.env, API_PROXY_TARGET: "http://127.0.0.1:4000" },
        stdio: "pipe",
      },
    );
    let logs = "";
    vite.stdout.on("data", (d) => (logs += d));
    vite.stderr.on("data", (d) => (logs += d));
    let ready = false;
    for (let i = 0; i < 50; i++) {
      try {
        if ((await fetch(base)).ok) {
          ready = true;
          break;
        }
      } catch {
        /* Server may still be starting. */
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    assert.equal(ready, true, "Vite did not start: " + logs.slice(-500));
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    await page.addInitScript(() => localStorage.setItem("tutim-ui", "legacy"));
    const errors = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
      console.log("Runtime error:", error.message);
    });
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("Failed to load resource"))
        errors.push(m.text());
    });
    const providerRequests = [];
    await page.route(
      /https?:\/\/[^/]*(?:google|gstatic|facebook)[^/]*\//i,
      (route) => {
        providerRequests.push(route.request().url());
        return route.abort();
      },
    );
    const goto = async (route) => {
      await page.goto(base + route);
      await page.waitForTimeout(250);
    };
    const login = async (username) => {
      await goto("/home");
      await page.getByRole("button", { name: "Sign In", exact: true }).click();
      await expect(page.getByRole("button", { name: /facebook/i })).toHaveCount(
        0,
      );
      await page.getByLabel(/^username/).fill(username);
      await page.getByLabel(/^password/).fill("browser-password");
      await page
        .getByRole("button", { name: "Sign In", exact: true })
        .last()
        .click();
      await expect(
        page.getByRole("button", { name: "Sign Out", exact: true }),
      ).toBeVisible();
    };
    await fs.mkdir(path.join(root, "test-results"), { recursive: true });
    for (const route of [
      "/home",
      "/teacherList",
      "/studentList",
      "/courses",
      "/profile/teacher/" + teacher._id,
      "/profile/student/" + student._id,
      "/courseDetail/Maths",
      "/addresses",
      "/map",
    ]) {
      console.log("Route", route);
      await goto(route);
      await expect(
        page.getByRole("button", { name: "Sign In", exact: true }),
      ).toBeVisible();
    }
    await goto("/addresses/Demo%20address");
    await expect(page.getByLabel("Search addresses")).toHaveValue(
      "Demo address",
    );
    await expect(
      page.getByRole("link", { name: "Browser Student", exact: true }),
    ).toBeVisible();
    await page.getByLabel("Search addresses").fill("no-such-address");
    await expect(
      page.getByText("No saved address matches your search."),
    ).toBeVisible();
    await page.getByLabel("Search addresses").fill("");
    await expect(
      page.getByRole("link", { name: "Browser Student", exact: true }),
    ).toBeVisible();
    await goto("/map/Demo%20address");
    await expect(
      page.getByRole("heading", { name: "Addresses", exact: true }),
    ).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await goto("/profile/teacher/not-a-real-id");
    await expect(page.getByRole("alert")).toContainText("not found");
    console.log("PASS public routes and anonymous profile viewing");
    await login("browser-admin");
    for (const route of [
      "/admin/view",
      "/admin/teacherList",
      "/admin/studentList",
    ]) {
      await goto(route);
      await expect(
        page.getByText(
          route.includes("teacherList")
            ? "Current teacher accounts"
            : route.includes("studentList")
              ? "Current student accounts"
              : "Management",
          { exact: true },
        ),
      ).toBeVisible();
    }
    await page.getByRole("button", { name: "Disable", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Disabled", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Disabled", exact: true }).click();
    await goto("/admin/view");
    await page
      .getByRole("button", { name: "Post Course", exact: true })
      .click();
    await page.locator('input[name="name"]').fill("Browser Art");
    await page
      .locator('textarea[name="description"]')
      .first()
      .fill("A course created through the original admin form");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.locator('input[name="name"]')).toHaveCount(0);
    assert.equal(await Course.countDocuments({ name: "Browser Art" }), 1);
    await goto("/courseDetail/Browser%20Art");
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await page.locator('input[name="name"]').fill("Updated Art");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForURL("**/courseDetail/Updated%20Art");
    await expect(
      page.getByText("Start learning Updated Art", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: /^delete$/i }).click();
    await page.waitForURL("**/courses");
    assert.equal(await Course.countDocuments({ name: "Updated Art" }), 0);
    await page.getByRole("button", { name: "Sign Out", exact: true }).click();
    console.log("PASS admin lists, account toggle, course create/edit/delete");
    await login("browser-student");
    await goto("/profile/student");
    await page
      .getByRole("button", { name: "Edit introduction", exact: true })
      .click();
    await page.locator('input[name="name"]').fill("Updated Browser Student");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.locator('input[name="name"]')).toHaveCount(0);
    await expect(
      page.getByText("Updated Browser Student", { exact: true }).last(),
    ).toBeVisible();
    // Shared requirements selector must persist changes and clearing for string-array fields.
    await page
      .getByRole("button", { name: "Edit requirements", exact: true })
      .click();
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Grade 11", exact: true }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("combobox")).toHaveCount(0);
    assert.deepEqual((await Student.findById(student._id)).grade, [
      "Grade 10",
      "Grade 11",
    ]);
    await page
      .getByRole("button", { name: "Edit requirements", exact: true })
      .click();
    const gradeSelect = page.locator(".MuiAutocomplete-root").first();
    await gradeSelect.hover();
    await gradeSelect
      .getByRole("button", { name: "Clear", exact: true })
      .click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("combobox")).toHaveCount(0);
    assert.deepEqual((await Student.findById(student._id)).grade, []);
    await goto("/teacherList");
    await page
      .getByRole("button", { name: "Register", exact: true })
      .first()
      .click();
    await expect(
      page.getByRole("button", { name: "Connecting", exact: true }),
    ).toBeVisible();
    await goto("/awaiting");
    await expect(
      page.getByText("Browser Teacher", { exact: true }),
    ).toBeVisible();
    await goto("/profile/teacher/" + teacher._id);
    await page
      .getByRole("button", { name: "Submit Comment", exact: true })
      .click();
    await page.getByRole("radio", { name: "4 Stars", exact: true }).focus();
    await page
      .getByRole("radio", { name: "4 Stars", exact: true })
      .press("Space");
    await expect(
      page.getByRole("radio", { name: "4 Stars", exact: true }),
    ).toBeChecked();
    await page
      .getByPlaceholder("Comment is required")
      .fill("A helpful lesson through the original UI");
    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await expect(
      page.getByText("A helpful lesson through the original UI", {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Disconnect", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Connect", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign Out", exact: true }).click();
    console.log("PASS student profile edits, connections and teacher comments");
    await login("browser-teacher");
    await goto("/profile/teacher");
    await expect(
      page.getByText("Browser Teacher", { exact: true }).last(),
    ).toBeVisible();
    await goto("/teaAwaiting");
    await expect(
      page.getByText("Your list of registed students", { exact: true }),
    ).toBeVisible();
    await goto("/admin/view");
    await page.waitForURL("**/home");
    console.log("PASS teacher routes and admin access guard");
    await page.getByRole("button", { name: "Sign Out", exact: true }).click();
    await goto("/home");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await page
      .getByText("Don't have an account? Sign Up", { exact: true })
      .click();
    await page.getByLabel(/^username/).fill("browser-new");
    await page.getByLabel(/^password/).fill("browser-password");
    await page.getByRole("button", { name: "Sign Up", exact: true }).click();
    await page.waitForURL("**/stepper");
    await page.getByRole("radio", { name: "Student", exact: true }).check();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByLabel(/^Full name/).fill("Onboarded Student");
    await page.getByLabel(/^Email/).fill("new@example.test");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(
      page.getByText("Registeration Successfully", { exact: true }),
    ).toBeVisible();
    console.log("PASS signup and three-step profile onboarding");
    await page.setViewportSize({ width: 390, height: 844 });
    await goto("/teacherList");
    assert.equal(
      await page.evaluate(
        () =>
          globalThis.document.documentElement.scrollWidth <=
          globalThis.innerWidth,
      ),
      true,
    );
    await page.screenshot({
      path: path.join(root, "test-results/browser-mobile.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(
      providerRequests,
      [],
      "No Google/Facebook requests should be made",
    );
    await expect(page.locator("iframe")).toHaveCount(0);
    console.log("PASS legacy mobile width and zero React runtime errors");
    await require("./modern-browser.cjs").runModernBrowser({
      browser,
      base,
      root,
      User,
      Teacher,
      Student,
      Course,
      teacher,
      student,
    });
  } catch (error) {
    if (browser) {
      const pages = browser.contexts().flatMap((c) => c.pages());
      if (pages[0])
        await pages[0].screenshot({
          path: path.join(root, "test-results/browser-failure.png"),
          fullPage: true,
        });
    }
    throw error;
  } finally {
    if (browser) await browser.close();
    if (vite) vite.kill();
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState === 1) {
      assert.equal(mongoose.connection.name, dbName);
      assert.match(dbName, /^tutim_v1_browser_\d+_\d+$/);
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
    if (uploads) await fs.rm(uploads, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
