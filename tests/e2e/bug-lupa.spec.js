const { test, expect } = require("@playwright/test");
const { HomePage } = require("../pages/HomePage");
const { evidencia } = require("../support/evidencia");

test.describe("Bug conhecido: lupa não abre a busca", () => {
  // Falha esperada (test.fail): enquanto o bug existir o teste falha e o
  // Playwright conta como sucesso. Se o site for corrigido, o teste passa e o
  // Playwright acusa "Expected to fail, but passed": aí dá para remover o
  // test.fail() e o prepararBusca().
  test(
    "usuário clica na lupa e o campo de pesquisa abre",
    { tag: "@bug" },
    async ({ page }) => {
      test.fail(true, "Bug conhecido no site: a lupa não abre a busca");
      // Com test.fail() só o status "failed" conta como sucesso: se estourar o
      // timeout do teste o status é "timedOut" e a pipeline quebra. Por isso
      // cada espera abaixo tem timeout próprio e o teste tem folga.
      test.setTimeout(90_000);
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

      await home.lupa.click({ timeout: 10_000 });
      await page.waitForTimeout(2000); // tempo para o usuário perceber que nada abriu
      await evidencia(page, "Depois de clicar na lupa");

      await expect(
        home.overlay,
        "o campo de pesquisa deveria abrir",
      ).toBeVisible({ timeout: 5000 });
    },
  );
});
