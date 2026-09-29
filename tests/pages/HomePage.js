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
   * O blog adia o JavaScript do tema (LiteSpeed). Os scripts só rodam após uma
   * interação real, e mesmo assim os bundles `_jb_static` (que atribuem o
   * onclick da lupa) ficam em `data-src` sem carregar. Aqui acordamos o
   * LiteSpeed, carregamos esses bundles e copiamos o handler para a lupa visível.
   */
  async prepararBusca() {
    // o Guest Mode do LiteSpeed pode recarregar a página depois do goto; se o
    // movimento cair no documento antigo, o novo nunca acorda. Por isso repete.
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

    await this.page.evaluate(async () => {
      const temHandler = () =>
        [...document.querySelectorAll("a.astra-search-icon")].some(
          (el) => typeof el.onclick === "function",
        );
      if (temHandler()) return;

      const pendentes = [
        ...document.querySelectorAll("script[data-src]"),
      ].filter(
        (n) =>
          !n.src && (n.getAttribute("data-src") || "").includes("_jb_static"),
      );
      for (const node of pendentes) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = node.getAttribute("data-src");
          script.onload = script.onerror = resolve;
          document.body.appendChild(script);
        });
      }
    });

    await this.page.waitForFunction(() => {
      const icones = [...document.querySelectorAll("a.astra-search-icon")];
      const fonte = icones.find((el) => typeof el.onclick === "function");
      if (!fonte) return false;
      icones.forEach((el) => {
        if (typeof el.onclick !== "function") el.onclick = fonte.onclick;
      });
      return true;
    });
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
