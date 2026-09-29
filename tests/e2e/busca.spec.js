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

  test("encontra artigos quando o termo existe no blog", async ({ page }) => {
    await home.pesquisar(busca.termoComResultado);

    await resultados.deveRefletirOTermo(busca.termoComResultado);
    await resultados.deveListarArtigosRelacionados(busca.termoComResultado);
    await evidencia(page, "Resultados da busca");
  });

  test("informa que não há artigos quando o termo não existe", async ({
    page,
  }) => {
    await home.pesquisar(busca.termoSemResultado);

    await resultados.deveRefletirOTermo(busca.termoSemResultado);
    await resultados.deveInformarAusenciaDeResultados();
    await evidencia(page, "Busca sem resultados");
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
