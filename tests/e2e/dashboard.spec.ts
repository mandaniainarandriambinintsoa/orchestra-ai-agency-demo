import { expect, test } from "@playwright/test";

test("dashboard and navigation remain usable", async ({ page }, testInfo) => {
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("heading", { name: "Tout ce qui mérite votre attention." }),
  ).toBeVisible();
  await expect(page.getByText("Données démo", { exact: true })).toBeVisible();

  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath("mobile-menu.png"),
      fullPage: false,
    });
    await page.getByRole("button", { name: "Fermer le menu" }).click();
    await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeHidden();
  }

  await page.waitForTimeout(1_000);

  await page.screenshot({
    path: testInfo.outputPath("dashboard.png"),
    fullPage: true,
  });
});

test("prospect filters and demo qualification API work", async ({ page, request }) => {
  await page.goto("/dashboard/prospects");
  await page.waitForLoadState("networkidle");
  const search = page.getByPlaceholder("Nom, entreprise ou email");
  await search.fill("Nova RH");
  await expect(page.getByText("Sophie Laurent")).toBeVisible();
  await expect(page.getByText("Thomas Bernard")).toBeHidden();

  const response = await request.post("/api/prospects/qualify", {
    data: {
      company: "Atelier Kumo",
      sector: "services B2B",
      city: "Paris",
    },
  });
  expect(response.status()).toBe(200);
  const payload = (await response.json()) as {
    data: { origin: string; score: number };
  };
  expect(payload.data.origin).toBe("demo");
  expect(payload.data.score).toBeGreaterThanOrEqual(0);
  expect(payload.data.score).toBeLessThanOrEqual(100);
});
