// Exercise the deployed artifact using only a static file server, with no API or MongoDB.
/* global document */
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const http = require("node:http");
const { chromium, expect } = require("@playwright/test");

async function main() {
  const root = path.resolve(__dirname, "../client/dist");
  const prefix = process.env.PAGES_BASE_PATH || "/tutim/";
  const mime = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
  };
  await fs.access(path.join(root, "index.html"));
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (!pathname.startsWith(prefix)) {
        res.writeHead(404).end();
        return;
      }
      const file = path.resolve(
        root,
        pathname.slice(prefix.length) || "index.html",
      );
      if (!file.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      const bytes = await fs.readFile(file);
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      });
      res.end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const base = origin + prefix;
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    const errors = [],
      rejected = [],
      badResponses = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) badResponses.push(response.url());
    });
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (
        url.origin !== origin ||
        !url.pathname.startsWith(prefix) ||
        /\/api\//.test(url.pathname)
      ) {
        rejected.push(url.origin + url.pathname);
        return route.abort();
      }
      return route.continue();
    });
    const go = async (route) => {
      await page.goto(base + "#" + route);
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByRole("complementary", { name: "Demo notice" }),
      ).toBeVisible();
    };
    const switchUI = async (mode) => {
      await page
        .getByRole("button", {
          name: mode === "legacy" ? "Legacy UI" : "Modern UI",
          exact: true,
        })
        .first()
        .click();
      await expect(page.locator("html")).toHaveAttribute("data-tutim-ui", mode);
    };
    const checkImages = async () => {
      await page.waitForFunction(() =>
        [...document.images].every((img) => img.complete),
      );
      const broken = await page
        .locator("img")
        .evaluateAll((images) =>
          images
            .filter((img) => !img.naturalWidth)
            .map((img) => img.getAttribute("src")),
        );
      assert.deepEqual(broken, []);
    };
    await go("/");
    await expect(
      page.getByRole("heading", { name: /Find your people/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Sign in", exact: true }).first(),
    ).toHaveAttribute("aria-disabled", "true");
    await checkImages();
    for (const route of [
      "/teachers",
      "/students",
      "/courses",
      "/teachers/demo-teacher-1",
      "/students/demo-student-1",
      "/courses/demo-course-1",
      "/addresses",
    ]) {
      await go(route);
      await expect(page.locator("h1")).toBeVisible();
      await checkImages();
      await page.reload();
      await expect(page.locator("h1")).toBeVisible();
    }
    await go("/teachers");
    for (const [label, value] of [
      ["District", "District 1"],
      ["Grade", "Grade 10"],
      ["Subject", "Maths"],
    ]) {
      await page
        .getByRole("combobox", { name: label, exact: true })
        .fill(value);
      await page.getByRole("option", { name: value, exact: true }).click();
      await page.keyboard.press("Escape");
    }
    await page.getByRole("button", { name: "Find", exact: true }).click();
    await expect(
      page.getByText("1 teachers match your search", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Minh An", exact: true }),
    ).toBeVisible();
    await page.getByLabel("Search by name or subject").fill("not-a-person");
    await expect(
      page.getByText("No results yet. Try different filters or add a profile."),
    ).toBeVisible();
    await go("/teachers?subject=Maths");
    await switchUI("legacy");
    await page.waitForURL("**/#/teacherList/Maths?subject=Maths");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
      "data-tutim-ui",
      "legacy",
    );
    await checkImages();
    for (const route of [
      "/home",
      "/teacherList",
      "/studentList",
      "/courses",
      "/profile/teacher/demo-teacher-1",
      "/profile/student/demo-student-1",
      "/courseDetail/Maths",
      "/addresses",
    ]) {
      await go(route);
      await expect(
        page.getByRole("button", { name: "Modern UI", exact: true }),
      ).toBeVisible();
      await checkImages();
    }
    await go("/courseDetail/Maths");
    await switchUI("modern");
    await page.waitForURL("**/#/courses/demo-course-1");
    await expect(
      page.getByRole("heading", { name: "Maths", exact: true }).first(),
    ).toBeVisible();
    await switchUI("legacy");
    await page.waitForURL("**/#/courseDetail/Maths");
    await go("/profile/teacher/demo-teacher-1");
    await switchUI("modern");
    await page.waitForURL("**/#/teachers/demo-teacher-1");
    await expect(
      page.getByRole("heading", { name: "Student reviews" }),
    ).toBeVisible();
    await go("/signin");
    await expect(page.getByRole("alert")).toContainText(
      "Accounts, registration, and saving changes are disabled",
    );
    await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
    await go("/admin");
    await page.waitForURL("**/#/signin");
    await page.setViewportSize({ width: 390, height: 844 });
    await go("/teachers");
    await page.getByRole("button", { name: "Show filters" }).click();
    await expect(
      page.getByRole("combobox", { name: "Grade", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("button", { name: "Legacy UI", exact: true })
      .first()
      .click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-tutim-ui",
      "legacy",
    );
    await page.getByRole("button", { name: "Modern UI", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-tutim-ui",
      "modern",
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go("/");
    await checkImages();
    await fs.mkdir(path.resolve(__dirname, "../test-results"), {
      recursive: true,
    });
    await page.screenshot({
      path: path.resolve(__dirname, "../test-results/pages-demo.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(
      rejected,
      [],
      "The demo must not request an API, external service, or root-level asset",
    );
    assert.deepEqual(
      badResponses,
      [],
      "Every static asset must load under the repository base path",
    );
    console.log(
      "PASS static demo: both interfaces, combined filters, search, images, deep links, reloads, switching, disabled accounts, mobile navigation; zero API or external requests",
    );
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
