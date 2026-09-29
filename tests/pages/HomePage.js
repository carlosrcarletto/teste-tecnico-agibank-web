const { expect } = require("@playwright/test");

class HomePage {
  constructor(page) {
    this.page = page;
    this.lupa = page.locator("a.astra-search-icon:visible").first();
    this.overlay = page.locator("#ast-seach-full-screen-form");
    this.campoBusca = this.overlay.locator('input[name="s"]');
    this.botaoPesquisar = this.overlay.locator("#search_submit");
  }

  async visitar() {
    await this.page.goto("/");
    await expect(this.lupa).toBeVisible();
    await this.prepararBusca();
  }

  /**
   * Abre o blog como um usuário real, sem o contorno do prepararBusca():
   * mexe o mouse e dá tempo para o LiteSpeed carregar o que ele carregaria sozinho.
   * Usado no cenário que demonstra o bug da lupa.
   */
  async visitarSemContorno() {
    await this.page.goto("/");
    await expect(this.lupa).toBeVisible();
    await this.page.mouse.move(200, 300);
    await this.page.mouse.move(400, 300);
    await this.page.waitForLoadState("networkidle");
  }

  async lupaTemAcaoDeClique() {
    return this.lupa.evaluate((el) => typeof el.onclick === "function");
  }

  /**
   * Contorno do bug da lupa. O LiteSpeed só roda o JavaScript do site após
   * uma interação, e mesmo assim os scripts `_jb_static` (que ligam o clique
   * à lupa) ficam em `data-src` sem carregar. Aqui:
   *   1. mexemos o mouse até o LiteSpeed rodar os scripts;
   *   2. carregamos à mão os `_jb_static`.
   */
  async prepararBusca() {
    // 1. o LiteSpeed pode recarregar a página logo após o goto e o movimento
    //    cair na página antiga; por isso mexe o mouse até funcionar
    let x = 200;
    await expect(async () => {
      x = x === 200 ? 400 : 200;
      await this.page.mouse.move(x, 300);
      await this.page.waitForFunction(
        () =>
          !document.querySelector('script[type="litespeed/javascript"]') &&
          typeof window.astra === "object",
        null,
        { timeout: 3000 },
      );
    }).toPass({ timeout: 45_000 });

    // 2. carrega os scripts que o LiteSpeed deixou pendentes
    const scriptsPendentes = await this.page
      .locator('script[data-src*="_jb_static"]')
      .evaluateAll((nos) => nos.map((no) => no.getAttribute("data-src")));
    for (const url of scriptsPendentes) {
      await this.page.addScriptTag({ url });
    }
  }

  async abrirBusca() {
    await this.lupa.click();
    await expect(this.overlay).toBeVisible();
    await expect(this.campoBusca).toHaveAttribute(
      "placeholder",
      "Digite sua busca",
    );
  }
  async pesquisar(termo) {
    await this.abrirBusca();
    await this.campoBusca.fill(termo);
    await this.botaoPesquisar.click();
  }

  async fecharBuscaPeloTeclado() {
    await this.campoBusca.press("Escape");
    await expect(this.overlay).toBeHidden();
  }
}

module.exports = { HomePage };
