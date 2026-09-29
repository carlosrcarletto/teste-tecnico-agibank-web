# Testes automatizados — Blog do Agibank

Testes de interface (E2E) que abrem o [Blog do Agibank](https://blog.agibank.com.br/) num navegador de verdade e verificam se a **pesquisa de artigos pela lupa** funciona.

Ferramentas usadas:

- **[Playwright](https://playwright.dev/)**: controla o navegador (clica, digita, confere textos).
- **[Allure Report](https://allurereport.org/)**: gera um relatório visual com o resultado de cada teste, prints e vídeos.
- **GitHub Actions**: roda os testes automaticamente a cada push ou pull request.

Este guia foi escrito para quem **nunca usou Playwright**. Siga as seções na ordem.

---

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Instalação](#2-instalação)
3. [Rodando os testes](#3-rodando-os-testes)
4. [Vendo os relatórios](#4-vendo-os-relatórios)
5. [Estrutura do projeto](#5-estrutura-do-projeto)
6. [Como os testes são organizados (Page Objects)](#6-como-os-testes-são-organizados-page-objects)
7. [Guia de manutenção](#7-guia-de-manutenção)
8. [Integração contínua (GitHub Actions)](#8-integração-contínua-github-actions)
9. [Problemas comuns](#9-problemas-comuns)

---

## 1. Pré-requisitos

Instale estes programas antes de começar:

| Programa | Para que serve | Como verificar se já tem |
|---|---|---|
| **Node.js** 18 ou superior ([download](https://nodejs.org/)) | Executa o JavaScript dos testes e instala as dependências (`npm`) | `node -v` |
| **Git** ([download](https://git-scm.com/)) | Baixar o projeto e versionar alterações | `git --version` |
| **Java** 8 ou superior ([download](https://adoptium.net/)) | Necessário **apenas** para gerar o relatório Allure | `java -version` |
| **VS Code** (opcional, [download](https://code.visualstudio.com/)) | Editor recomendado. Instale também a extensão *Playwright Test for VSCode* | — |

> Os comandos deste guia são digitados no **terminal** (no macOS: app *Terminal*; no Windows: *PowerShell*; no VS Code: menu *Terminal → New Terminal*).

---

## 2. Instalação

### 2.1 Baixar o projeto

```bash
git clone https://github.com/carlosrcarletto/teste-tecnico-agibank-web.git
cd teste-tecnico-agibank-web
```

### 2.2 Instalar as dependências

```bash
npm install
```

Esse comando lê o arquivo `package.json` e baixa para a pasta `node_modules/` tudo o que o projeto usa (Playwright e Allure).

### 2.3 Instalar os navegadores do Playwright

```bash
npx playwright install --with-deps chromium
```

O Playwright usa navegadores próprios, separados do Chrome instalado na sua máquina. Isso só precisa ser feito **uma vez** (ou depois de atualizar a versão do Playwright).

> **Como este projeto foi criado do zero** (apenas para referência, não precisa repetir):
> ```bash
> npm init playwright@latest               # cria playwright.config.js, pasta tests/ e workflow do GitHub
> npm i -D allure-playwright allure-commandline   # adiciona o Allure
> ```

---

## 3. Rodando os testes

| Comando | O que faz |
|---|---|
| `npm test` | Roda todos os testes sem abrir o navegador na tela (modo *headless*) |
| `npx playwright test --headed` | Roda mostrando o navegador, dá para ver os cliques acontecendo |
| `npx playwright test --ui` | Abre a interface visual do Playwright: escolher testes, ver passo a passo, repetir |
| `npx playwright test tests/e2e/busca.spec.js` | Roda só um arquivo de teste |
| `npx playwright test -g "não há artigos"` | Roda só os testes cujo nome contém o texto informado |
| `npx playwright test --debug` | Roda em modo depuração, pausando a cada passo |
| `npx playwright codegen https://blog.agibank.com.br/` | Abre o site e **gera código** conforme você clica, útil para descobrir seletores |

Resultado esperado no terminal:

```
Running 3 tests using 3 workers
  ✓  [chromium] › e2e/busca.spec.js › encontra artigos quando o termo existe no blog
  ✓  [chromium] › e2e/busca.spec.js › informa que não há artigos quando o termo não existe
  ✓  [chromium] › e2e/busca.spec.js › abre a busca pela lupa e permite sair sem pesquisar
  3 passed
```

---

## 4. Vendo os relatórios

Cada execução gera **dois** relatórios. Os dois precisam ser abertos pelo comando indicado: **não abra o `index.html` com duplo clique**, pois a página fica em branco sem um servidor local.

### 4.1 Allure (principal)

```bash
npm run allure:serve     # gera o relatório com a última execução e abre no navegador
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run test:allure` | Roda os testes **e** gera o relatório na pasta `allure-report/` |
| `npm run allure:generate` | Só gera o relatório a partir de `allure-results/` |
| `npm run allure:open` | Abre um relatório já gerado em `allure-report/` |

O que olhar no Allure:

- **Overview**: quantos testes passaram/falharam e informações do ambiente.
- **Suites**: clique num teste para ver cada passo executado e, no final, os anexos:
  - **screenshot**: print da tela ao final do teste;
  - **Evidência: …**: prints tirados em momentos específicos (veja [7.5](#75-adicionar-um-print-de-evidência));
  - **video**: gravação do teste inteiro. O vídeo começa com uma tela branca (antes do site carregar); passe o mouse e clique em ▶. **Use Chrome, Edge ou Firefox**, pois o Safari não reproduz bem o formato `.webm`.
- **Timeline / Graphs**: duração e paralelismo dos testes.

Para parar o servidor do relatório: `Ctrl + C` no terminal.

### 4.2 Relatório HTML do Playwright

```bash
npx playwright show-report
```

Relatório mais simples, que já vem com o Playwright. Útil para abrir o **trace** (uma “gravação” navegável de cada passo) quando um teste falha no CI.

---

## 5. Estrutura do projeto

```
teste-tecnico-agibank-web/
├── .github/
│   └── workflows/
│       └── playwright.yml      → roda os testes no GitHub a cada push/PR
├── tests/
│   ├── e2e/
│   │   └── busca.spec.js       → OS TESTES: cenários da pesquisa
│   ├── pages/
│   │   ├── HomePage.js         → ações na página inicial (abrir lupa, pesquisar…)
│   │   └── SearchResultsPage.js→ verificações na página de resultados
│   ├── data/
│   │   └── busca.json          → dados usados nos testes (termos pesquisados)
│   └── support/
│       └── evidencia.js        → função auxiliar para tirar prints de evidência
├── playwright.config.js        → configuração geral do Playwright
├── package.json                → dependências e atalhos de comandos (npm run …)
├── package-lock.json           → versões exatas das dependências (não editar à mão)
├── .gitignore                  → arquivos/pastas que não vão para o Git
└── README.md                   → este guia
```

Pastas **geradas automaticamente** (não versionadas, podem ser apagadas sem problema):

| Pasta | Conteúdo |
|---|---|
| `node_modules/` | Dependências baixadas pelo `npm install` |
| `test-results/` | Prints, vídeos e traces da última execução |
| `playwright-report/` | Relatório HTML do Playwright |
| `allure-results/` | Dados brutos que o Allure usa para montar o relatório |
| `allure-report/` | Relatório Allure gerado (HTML) |

### 5.1 Detalhe de cada arquivo

#### `tests/e2e/busca.spec.js`: os testes

Arquivos terminados em **`.spec.js`** são os únicos que o Playwright executa como teste. Este contém três cenários:

| Cenário | O que verifica |
|---|---|
| encontra artigos quando o termo existe no blog | Pesquisa “cartão”: a URL e o título mostram o termo e os artigos listados falam dele |
| informa que não há artigos quando o termo não existe | Pesquisa um termo inventado: nenhum artigo e a mensagem “Lamentamos, mas nada foi encontrado…” |
| abre a busca pela lupa e permite sair sem pesquisar | Abre a lupa, aperta `Esc` e confirma que continua na página inicial |

Estrutura do arquivo:

- `test.describe(...)`: agrupa os testes de um mesmo assunto.
- `test.beforeEach(...)`: roda **antes de cada teste** (aqui: abre o blog).
- `test("nome", async ({ page }) => { ... })`: um teste. `page` é a aba do navegador.

#### `tests/pages/HomePage.js`: página inicial

Guarda **onde estão os elementos** (seletores) e **o que dá para fazer** na página inicial:

| Método | O que faz |
|---|---|
| `visitar()` | Abre o blog e prepara a lupa para funcionar |
| `prepararBusca()` | Contorno técnico, veja abaixo |
| `abrirBusca()` | Clica na lupa e confere que o campo “Digite sua busca” apareceu |
| `pesquisar(termo)` | Abre a busca, digita o termo e clica em pesquisar |
| `fecharBuscaPeloTeclado()` | Aperta `Esc` e confere que a busca fechou |

> **Por que existe o `prepararBusca()`?** O blog usa um plugin de performance (LiteSpeed) que **só carrega o JavaScript do site depois que o usuário mexe o mouse**. Sem esse JavaScript, clicar na lupa não faz nada. O método simula um movimento de mouse, espera os scripts carregarem e garante que a lupa visível tenha a ação de clique. **Se o site trocar de tema/plugin, este é o primeiro método a revisar.**

#### `tests/pages/SearchResultsPage.js`: página de resultados

Contém apenas **verificações** (métodos começam com `deve…`):

| Método | O que verifica |
|---|---|
| `deveRefletirOTermo(termo)` | A URL tem `?s=termo` e o título `h1` mostra o termo |
| `deveListarArtigosRelacionados(termo)` | Há artigos e o texto deles contém o termo (ignorando acentos e maiúsculas) |
| `deveInformarAusenciaDeResultados()` | Nenhum artigo e a mensagem de “nada encontrado” aparece |

#### `tests/data/busca.json`: massa de dados

```json
{
  "termoComResultado": "cartão",
  "termoSemResultado": "zzzxqy987termoinexistente"
}
```

Para testar outro termo, **altere só aqui**. Os testes leem esse arquivo.

#### `tests/support/evidencia.js`: prints de evidência

Função `evidencia(page, "nome")` que tira um print da página inteira e anexa ao teste (aparece no Allure e no relatório HTML).

#### `playwright.config.js`: configuração

| Opção | Valor | Significado |
|---|---|---|
| `testDir` | `./tests` | Onde procurar os arquivos `.spec.js` |
| `fullyParallel` | `true` | Roda os testes ao mesmo tempo (mais rápido) |
| `retries` | 2 no CI, 0 local | Quantas vezes repetir um teste que falhou |
| `workers` | 1 no CI | Quantos testes simultâneos |
| `reporter` | `list`, `html`, `allure-playwright` | Saída no terminal + os dois relatórios |
| `baseURL` | `https://blog.agibank.com.br` | Endereço base: `page.goto("/")` abre a home |
| `screenshot` | `"on"` | Print ao final de todo teste (`"only-on-failure"` = só quando falha) |
| `video` | `"on"` | Grava vídeo de todo teste (`"retain-on-failure"` = guarda só quando falha) |
| `trace` | `"on-first-retry"` | Grava o trace quando o teste é repetido após falhar |
| `projects` | `chromium` | Em quais navegadores rodar |

#### `package.json`: scripts

Os atalhos `npm test`, `npm run allure:serve` etc. são definidos na seção `"scripts"`. Para criar um novo atalho, adicione uma linha lá.

---

## 6. Como os testes são organizados (Page Objects)

O projeto usa o padrão **Page Object Model (POM)**: cada página do site vira uma classe em `tests/pages/`.

```
busca.spec.js  ──usa──▶  HomePage.pesquisar("cartão")
      │                       └─ sabe que a lupa é  a.astra-search-icon
      └──usa──▶  SearchResultsPage.deveListarArtigosRelacionados("cartão")
                              └─ sabe que os artigos são  <article>
```

**Vantagem:** se o site mudar a classe da lupa, você corrige **uma linha** em `HomePage.js` e todos os testes voltam a funcionar, sem mexer nos cenários.

Regra prática:

- **Seletores e cliques** → ficam nas classes de `pages/`.
- **Cenários (o que testar)** → ficam nos arquivos `.spec.js`.
- **Dados** → ficam em `data/`.

---

## 7. Guia de manutenção

### 7.1 Um teste começou a falhar. E agora?

1. Rode o teste vendo o navegador: `npx playwright test --headed -g "nome do teste"`.
2. Abra o relatório (`npm run allure:serve`), veja **em qual passo** falhou, o **print** e o **vídeo**.
3. Descubra a causa mais comum:
   - **O site mudou um elemento** (classe, id, texto) → atualize o seletor na classe de `pages/` (veja 7.2).
   - **O conteúdo mudou** (ex.: nenhum artigo tem mais “cartão”) → troque o termo em `data/busca.json`.
   - **O site está lento/fora do ar** → rode de novo; se persistir, verifique o site manualmente.

### 7.2 Descobrir/atualizar um seletor

1. Abra o site no Chrome, clique com o botão direito no elemento → **Inspecionar**.
2. Veja a tag e os atributos, ex.: `<a class="astra-search-icon" ...>`.
3. Monte o seletor e atualize na classe correspondente:

```js
page.locator("a.astra-search-icon")        // tag + classe
page.locator("#search_submit")             // id
page.locator('input[name="s"]')            // atributo
page.getByText("Digite sua busca")         // texto visível
page.getByRole("button", { name: "Pesquisar" }) // papel + nome acessível (mais estável)
```

Alternativa sem inspecionar: `npx playwright codegen https://blog.agibank.com.br/`, clique no elemento e copie o seletor gerado.

> Se o Playwright reclamar de **“strict mode violation”**, o seletor encontrou mais de um elemento. Use `.first()` ou `:visible` (ex.: `a.astra-search-icon:visible`).

### 7.3 Criar um novo teste

Exemplo: verificar que o menu “Notícias” existe.

1. Se precisar de uma nova ação na página, adicione um método na classe (ex.: em `HomePage.js`):

```js
async abrirNoticias() {
  await this.page.getByRole("link", { name: "Notícias" }).click();
}
```

2. Crie o cenário em `tests/e2e/` (novo arquivo `algo.spec.js` ou dentro de um existente):

```js
test("abre a página de notícias", async ({ page }) => {
  await home.abrirNoticias();
  await expect(page).toHaveURL(/noticias/);
  await evidencia(page, "Página de notícias");
});
```

3. Rode: `npx playwright test -g "notícias"`.

### 7.4 Criar uma nova página (Page Object)

Copie o modelo abaixo em `tests/pages/NomeDaPagina.js`:

```js
const { expect } = require("@playwright/test");

class NomeDaPagina {
  constructor(page) {
    this.page = page;
    this.botaoX = page.locator("#id-do-botao");
  }

  async clicarNoBotaoX() {
    await this.botaoX.click();
  }
}

module.exports = { NomeDaPagina };
```

E importe no teste: `const { NomeDaPagina } = require("../pages/NomeDaPagina");`

> **Dentro da classe use sempre `this.page`**, nunca `page` sozinho. Caso contrário aparece o erro `page is not defined`.

### 7.5 Adicionar um print de evidência

Em qualquer ponto do teste:

```js
await evidencia(page, "Descrição do momento");
```

### 7.6 Rodar em outros navegadores

Em `playwright.config.js`, dentro de `projects`, adicione:

```js
{ name: "firefox", use: { ...devices["Desktop Firefox"] } },
{ name: "webkit",  use: { ...devices["Desktop Safari"] } },
{ name: "mobile",  use: { ...devices["Pixel 7"] } },
```

Depois instale os navegadores: `npx playwright install --with-deps`.

### 7.7 Atualizar o Playwright

```bash
npm i -D @playwright/test@latest
npx playwright install --with-deps chromium
npm test
```

---

## 8. Integração contínua (GitHub Actions)

O arquivo `.github/workflows/playwright.yml` faz o GitHub rodar os testes sozinho a cada **push** ou **pull request** para `main`/`master`. Passos:

1. Baixa o código e instala o Node.js.
2. `npm ci`: instala as dependências exatamente como no `package-lock.json`.
3. Instala os navegadores do Playwright.
4. `npx playwright test`: roda os testes (com até 2 repetições em caso de falha).
5. Gera o relatório Allure.
6. Publica `playwright-report` e `allure-report` como **artifacts** (guardados por 30 dias).

**Para ver o resultado:** no GitHub, aba **Actions** → clique na execução → role até **Artifacts** → baixe `allure-report`. Descompacte e, na raiz do projeto, rode `npx allure open caminho/da/pasta/descompactada`.

---

## 9. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `Executable doesn't exist ... chromium` | Navegadores do Playwright não instalados | `npx playwright install --with-deps chromium` |
| `page is not defined` | Usou `page` dentro de uma classe | Troque por `this.page` |
| `strict mode violation: ... resolved to 2 elements` | Seletor encontrou mais de um elemento | Use `.first()` ou `:visible` |
| `Timeout ... exceeded` esperando um elemento | Elemento mudou ou o site está lento | Confira o seletor (7.2) e rode com `--headed` |
| Relatório abre em branco | Abriu o `index.html` direto | Use `npm run allure:serve` ou `npx playwright show-report` |
| `allure: JAVA_HOME is not set` | Java não instalado | Instale o Java (seção 1) |
| Vídeo não toca no relatório | Safari não suporta `.webm` / vídeo começa branco | Use Chrome e clique em ▶ |
| Clicar na lupa não abre a busca | JavaScript do site não carregou | Veja `prepararBusca()` em `HomePage.js` |
