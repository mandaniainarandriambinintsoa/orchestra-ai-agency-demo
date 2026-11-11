import { expect, test } from "@playwright/test";

test("dashboard and navigation remain usable", async ({ page }, testInfo) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Tout ce qui mérite votre attention." })).toBeVisible();
  await expect(page.getByText("Pilotage en temps réel")).toBeVisible();
  await expect(page.getByRole("link", { name: "Agents & workflows" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Paramètres" })).toHaveCount(0);

  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
    await page.getByRole("button", { name: "Fermer le menu" }).click();
  }
});

test("a prospect can be submitted and receives an AI qualification", async ({ page }) => {
  const rows = [{
    id: 1, full_name: "Sophie Laurent", company_name: "Nova RH", email: "sophie@example.com",
    status: "qualifie", qualification_score: 84, qualification_summary: "Besoin précis de qualification automatique.",
    qualification_subject: "Qualification des demandes", interest_level: "high", request_text: "Automatiser les demandes",
    source: "formulaire-web", created_at: new Date().toISOString(),
  }];
  await page.route("**/api/prospects", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ data: rows[0], qualification: { score: 84 } }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: rows }) });
  });
  await page.goto("/dashboard/prospects");
  await expect(page.getByText("Sophie Laurent")).toBeVisible();
  await page.getByRole("button", { name: "Nouveau prospect" }).click();
  await page.getByLabel("Nom complet").fill("Nora Simon");
  await page.getByLabel("Email").fill("nora@example.com");
  await page.getByLabel("Entreprise").fill("Atelier Simon");
  await page.getByLabel("Demande du prospect").fill("Nous voulons automatiser la qualification de nos demandes entrantes.");
  await page.getByRole("button", { name: "Enregistrer et qualifier" }).click();
  await expect(page.getByText("Prospect enregistré et qualifié par l’agent IA.")).toBeVisible();
});

test("the conversational agent sends and displays a reply", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { reply: "Votre colis est en transit. Souhaitez-vous le récapitulatif par email ?" } }),
    });
  });
  await page.goto("/dashboard/conversations");
  await page.getByPlaceholder("Tapez votre message…").fill("FR-4545-5454");
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.getByText("Votre colis est en transit. Souhaitez-vous le récapitulatif par email ?")).toBeVisible();
});

test("stock can be incremented without a page reload", async ({ page }) => {
  let quantity = 3;
  await page.route("**/api/products", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [{ id: 2, sku: "INF-HDP-02", name: "Casque USB Pro", description: null, quantity_available: quantity, minimum_stock: 5, unit_price: 59 }] }),
    });
  });
  await page.route("**/api/products/2/adjust", async (route) => {
    quantity += 1;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: 2, quantity_available: quantity } }) });
  });
  page.on("dialog", (dialog) => void dialog.accept("Réapprovisionnement"));
  await page.goto("/dashboard/stock");
  await expect(page.getByText("Casque USB Pro")).toBeVisible();
  await page.getByRole("button", { name: "Ajouter une unité à Casque USB Pro" }).click();
  await expect(page.getByText("Stock de « Casque USB Pro » mis à jour.")).toBeVisible();
  await expect(page.getByText("4", { exact: true }).first()).toBeVisible();
});
