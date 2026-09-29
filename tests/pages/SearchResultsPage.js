const { expect } = require("@playwright/test");

const normalizar = (t) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

class SearchResultsPage {
  constructor(page) {
    this.page = page;
    this.titulo = page.locator("h1.page-title");
    this.artigos = page.locator("article");
    this.mensagemSemResultado = page.getByText(
      "Lamentamos, mas nada foi encontrado para sua pesquisa",
    );
  }

  async deveRefletirOTermo(termo) {
    await expect(this.page).toHaveURL(
      (url) => url.searchParams.get("s") === termo,
    );
    await expect(this.titulo).toContainText(termo);
  }

  async deveListarArtigosRelacionados(termo) {
    await expect(this.artigos.first()).toBeVisible();
    const textos = await this.artigos.allInnerTexts();
    expect(normalizar(textos.join(" "))).toContain(normalizar(termo));
  }

  async deveInformarAusenciaDeResultados() {
    await expect(this.artigos).toHaveCount(0);
    await expect(this.mensagemSemResultado).toBeVisible();
  }

  // Busca sem termo: o WordPress não filtra e lista os artigos mais recentes
  async deveListarArtigosSemFiltro() {
    await expect(this.page).toHaveURL(/[?&]s=/);
    await expect(this.titulo).toBeVisible();
    await expect(this.artigos.first()).toBeVisible();
    await expect(this.mensagemSemResultado).toBeHidden();
  }

  // O termo deve aparecer como texto no título, nunca virar HTML de verdade
  async deveExibirTermoComoTexto(termo) {
    await expect(this.titulo).toContainText(termo);
    await expect(this.titulo.locator("script")).toHaveCount(0);
  }
}
module.exports = { SearchResultsPage };
