const { test, expect } = require("@playwright/test");
const { HomePage } = require("../pages/HomePage");
const { SearchResultsPage } = require("../pages/SearchResultsPage");
const busca = require("../data/busca.json");
const { evidencia } = require("../support/evidencia");

test.describe("Pesquisa de artigos pela lupa", () => {
  let home;
  let resultados;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    resultados = new SearchResultsPage(page);
    await home.visitar();
  });

  test.describe("Cenários positivos", { tag: "@positivo" }, () => {
    test("encontra artigos quando o termo existe no blog", async ({ page }) => {
      await home.pesquisar(busca.termoComResultado);

      await resultados.deveRefletirOTermo(busca.termoComResultado);
      await resultados.deveListarArtigosRelacionados(busca.termoComResultado);
      await evidencia(page, "Resultados da busca");
    });

    test("abre a busca pela lupa e permite sair sem pesquisar", async ({
      page,
    }) => {
      await home.abrirBusca();
      await evidencia(page, "Busca aberta");
      await home.fecharBuscaPeloTeclado();

      await expect(page).toHaveURL("https://blog.agibank.com.br/");
    });
  });

  test.describe("Cenários negativos", { tag: "@negativo" }, () => {
    test("informa que não há artigos quando o termo não existe", async ({
      page,
    }) => {
      await home.pesquisar(busca.termoSemResultado);

      await resultados.deveRefletirOTermo(busca.termoSemResultado);
      await resultados.deveInformarAusenciaDeResultados();
      await evidencia(page, "Busca sem resultados");
    });

    test("pesquisa vazia não quebra a página e lista artigos sem filtro", async ({
      page,
    }) => {
      await home.pesquisar(busca.termoVazio);

      await resultados.deveListarArtigosSemFiltro();
      await evidencia(page, "Busca vazia");
    });

    test("pesquisa só com espaços se comporta como pesquisa vazia", async ({
      page,
    }) => {
      await home.pesquisar(busca.termoSomenteEspacos);

      await resultados.deveListarArtigosSemFiltro();
      await evidencia(page, "Busca só com espaços");
    });

    test("termo com HTML é exibido como texto e não executa script", async ({
      page,
    }) => {
      const alertas = [];
      page.on("dialog", async (dialogo) => {
        alertas.push(dialogo.message());
        await dialogo.dismiss();
      });

      await home.pesquisar(busca.termoComHtml);

      await resultados.deveRefletirOTermo(busca.termoComHtml);
      await resultados.deveExibirTermoComoTexto(busca.termoComHtml);
      await resultados.deveInformarAusenciaDeResultados();
      expect(alertas, "nenhum alert deveria ser disparado").toEqual([]);
      await evidencia(page, "Busca com HTML");
    });

    test("termo muito longo informa que não há artigos", async ({ page }) => {
      const termoLongo = "a".repeat(busca.tamanhoTermoLongo);
      await home.pesquisar(termoLongo);

      await resultados.deveRefletirOTermo(termoLongo);
      await resultados.deveInformarAusenciaDeResultados();
      await evidencia(page, "Busca com termo longo");
    });
  });
});
