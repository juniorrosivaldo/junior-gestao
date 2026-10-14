import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("painel apresenta três prioridades e abre sem erros de JavaScript", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Seu dia, com direção." }),
  ).toBeVisible();
  await expect(page.locator(".priority-card")).toHaveCount(3);
  await expect(page.locator(".front-grid .front-card")).toHaveCount(6);
  await expect(page.locator(".day-ring")).toContainText("0/3");
  expect(errors).toEqual([]);
});

test("limita três prioridades e permite criar tarefa com checklist", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Nova tarefa", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("O que precisa ser entregue?")
    .fill("Revisar estoque da bancada");
  await dialog
    .getByLabel("Qual é o próximo passo?")
    .fill("Contar os itens de reposição.");
  await dialog.getByLabel("Prioridade do dia").check();
  await dialog.getByRole("button", { name: "Salvar tarefa" }).click();
  await expect(dialog.getByRole("alert")).toContainText("três prioridades");
  await dialog.getByLabel("Prioridade do dia").uncheck();
  await dialog.getByLabel("Nova etapa do checklist").fill("Conferir peças");
  await dialog.getByRole("button", { name: "Adicionar", exact: true }).click();
  await dialog.getByRole("button", { name: "Salvar tarefa" }).click();
  await page
    .locator(".desktop-nav")
    .getByRole("button", { name: "Projetos", exact: true })
    .click();
  await expect(
    page.getByRole("button").filter({ hasText: "Revisar estoque da bancada" }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("textbox", { name: "Buscar tarefas e responsáveis" })
    .fill("Revisar estoque");
  await expect(page.locator(".search-results .task-row")).toHaveCount(1);
  await page.locator(".search-results .task-row").click();
  await expect(
    page.getByRole("dialog").getByText("Conferir peças", { exact: true }),
  ).toBeVisible();
});

test("checklist e evidência são persistidos e atualizam as entregas feitas", async ({
  page,
}) => {
  await page.locator(".priority-card").first().click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Reunir OS e serviços realizados", { exact: true })
    .check();
  await dialog
    .getByLabel("Situação", { exact: true })
    .selectOption("Concluído");
  await dialog.getByRole("button", { name: "Salvar tarefa" }).click();
  await expect(dialog).toBeVisible();
  expect(
    await dialog
      .getByLabel("Evidência de conclusão")
      .evaluate((node) => node.validity.valueMissing),
  ).toBe(true);
  await dialog
    .getByLabel("Evidência de conclusão")
    .fill("Ficha de custos conferida e registrada na OS.");
  await dialog.getByRole("button", { name: "Salvar tarefa" }).click();
  await expect(page.locator(".day-ring")).toContainText("1/3");
  await page.reload();
  await expect(page.locator(".day-ring")).toContainText("1/3");
  await page.locator(".priority-card").first().click();
  await expect(
    page.getByLabel("Reunir OS e serviços realizados", { exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Evidência de conclusão")).toHaveValue(
    "Ficha de custos conferida e registrada na OS.",
  );
});

test("hábitos são salvos e separados por dia", async ({ page }) => {
  const habit = page.getByRole("button", {
    name: /Planejar o dia Escolher até três entregas/,
  });
  await habit.click();
  await expect(habit).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(habit).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Data do painel", { exact: true }).fill("2026-10-15");
  await expect(habit).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".priority-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Dia anterior", exact: true }).click();
  await expect(habit).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".priority-card")).toHaveCount(3);
});

test("cria registro, filtra por data e exporta os dados locais", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Fazer um registro", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Título", { exact: true })
    .fill("Conferência de documentos");
  await dialog
    .getByLabel("O que aconteceu?")
    .fill("Identificação conferida com a equipe.");
  await dialog.getByLabel("Amanhã começo por").fill("Localizar o recibo.");
  await dialog.getByRole("button", { name: "Salvar registro" }).click();
  await page
    .locator(".desktop-nav")
    .getByRole("button", { name: "Registros", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Conferência de documentos" }),
  ).toBeVisible();
  await page.reload();
  await page
    .locator(".desktop-nav")
    .getByRole("button", { name: "Registros", exact: true })
    .click();
  await expect(
    page.getByText("Localizar o recibo.", { exact: false }),
  ).toBeVisible();
  await page
    .getByLabel("Data dos registros", { exact: true })
    .fill("2026-10-15");
  await expect(
    page.getByRole("heading", { name: "Seu avanço merece um registro." }),
  ).toBeVisible();
  await page
    .getByLabel("Data dos registros", { exact: true })
    .fill("2026-10-14");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportar dados", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("junior-gestao-2026-10-14.json");
});

test("base RBC guarda foto e treinamento sem apresentar dados como produção real", async ({
  page,
}) => {
  await page
    .locator(".desktop-nav")
    .getByRole("button", { name: "RBC Motores", exact: false })
    .click();
  await expect(page.getByText("Protótipo local")).toBeVisible();
  await page.locator(".order-card").first().click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Adicionar foto: Antes", { exact: true })
    .setInputFiles({
      name: "antes.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
        "base64",
      ),
    });
  await expect(
    dialog.getByRole("img", { name: "OS 3647: antes do serviço" }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Treinamento", exact: true })
    .click();
  await dialog
    .getByLabel("Confirmar identificação e condições de segurança", {
      exact: false,
    })
    .check();
  await expect(dialog.getByText("1/5 etapas conferidas")).toBeVisible();
  await dialog.getByRole("button", { name: "Concluir consulta" }).click();
  await expect(page.locator(".rbc-metrics")).toContainText(
    "Fotos registradas01",
  );
  await page.reload();
  await page
    .locator(".desktop-nav")
    .getByRole("button", { name: "RBC Motores", exact: false })
    .click();
  await page.locator(".order-card").first().click();
  await expect(page.getByRole("dialog").getByRole("img")).toBeVisible();
});

test("navegação móvel mantém páginas e janelas sem rolagem horizontal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const nav = page.getByRole("navigation", { name: "Navegação no celular" });
  for (const name of ["Painel", "Projetos", "Checklists", "Registros", "RBC"]) {
    await nav.getByRole("button", { name, exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await nav.getByRole("button", { name: "Painel", exact: true }).click();
  await page.locator(".priority-card").first().click();
  const dialog = page.getByRole("dialog");
  expect(
    await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  await expect(page.locator(".sidebar")).toHaveClass(/sidebar-open/);
  await page.getByRole("button", { name: "Fechar menu", exact: true }).click();
  await expect(page.locator(".sidebar")).not.toHaveClass(/sidebar-open/);
});

test("falha de armazenamento é comunicada sem fingir que salvou", async ({
  page,
}) => {
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: /Planejar o dia Escolher até três entregas/ })
    .click();
  await expect(page.getByRole("alert")).toContainText("apenas nesta sessão");
});

test("contraste e estrutura acessível do painel", async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
