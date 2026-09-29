const { test, expect } = require("@playwright/test");
const { HomePage } = require("../pages/HomePage");
const { evidencia } = require("../support/evidencia");

test.describe("Bug conhecido: lupa não abre a busca", () => {
  // Este teste FALHA de propósito enquanto o bug existir no site.
  // Quando passar, o site foi corrigido e dá para remover o prepararBusca().
  test(
    "usuário clica na lupa e o campo de pesquisa abre",
    { tag: "@bug" },
    async ({ page }) => {
      test.info().annotations.push({
        type: "bug",
        description:
          "O LiteSpeed adia o JavaScript do tema e os scripts _jb_static, que ligam o clique à lupa, nunca carregam.",
      });

      const home = new HomePage(page);
      await home.visitarSemContorno();
      await evidencia(page, "Home carregada, antes do clique");

      const temAcao = await home.lupaTemAcaoDeClique();
      await test.step(`Lupa tem ação de clique? ${temAcao ? "sim" : "não"}`, async () => {});

      await home.lupa.click();
      await page.waitForTimeout(2000); // tempo para o usuário perceber que nada abriu
      await evidencia(page, "Depois de clicar na lupa");

      await expect(
        home.overlay,
        "o campo de pesquisa deveria abrir",
      ).toBeVisible({ timeout: 5000 });
    },
  );
});
