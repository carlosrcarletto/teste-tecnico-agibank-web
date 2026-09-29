# Testes automatizados — Blog do Agibank

Testes de interface (E2E) que abrem o [Blog do Agibank](https://blog.agibank.com.br/) num navegador de verdade e verificam se a **pesquisa de artigos pela lupa** funciona.

Ferramentas usadas:

- **[Playwright](https://playwright.dev/)**: controla o navegador (clica, digita, confere textos).
- **[Allure Report](https://allurereport.org/)**: gera um relatório visual com o resultado de cada teste, prints e vídeos.
- **GitHub Actions**: roda os testes automaticamente a cada push ou pull request e publica o relatório Allure no [GitHub Pages](https://carlosrcarletto.github.io/teste-tecnico-agibank-web/).

Este guia foi escrito para quem **nunca usou Playwright**. Siga as seções na ordem.

**Resumo dos cenários** (detalhes na [seção 5.1](#51-detalhe-de-cada-arquivo)):

| Tipo | Quantidade | Resultado atual |
|---|---|---|
| ✅ Positivos: o usuário faz o esperado e o site responde certo | 2 | Passam |
| 🚫 Negativos: entradas inválidas ou inexistentes, o site deve lidar sem quebrar | 5 | Passam |
| 🐞 Bug conhecido: a lupa não abre a busca para um usuário real | 1 | **Falha esperada** (`test.fail`), contada como sucesso |

---

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Instalação](#2-instalação)
3. [Rodando os testes](#3-rodando-os-testes)
4. [Vendo os relatórios](#4-vendo-os-relatórios)
5. [Estrutura do projeto](#5-estrutura-do-projeto)
6. [Como os testes são organizados (Page Objects)](#6-como-os-testes-são-organizados-page-objects)
7. [Guia de manutenção](#7-guia-de-manutenção)
8. [CI/CD (GitHub Actions)](#8-cicd-github-actions)
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
| `npx playwright test --grep @positivo` | Roda só os cenários positivos (`@negativo` para os negativos, `@bug` para o bug) |
| `npx playwright test --debug` | Roda em modo depuração, pausando a cada passo |
| `npx playwright codegen https://blog.agibank.com.br/` | Abre o site e **gera código** conforme você clica, útil para descobrir seletores |

Resultado esperado no terminal:

```
Running 8 tests using 4 workers
  ✓  … › Cenários positivos › encontra artigos quando o termo existe no blog @positivo
  ✓  … › Cenários positivos › abre a busca pela lupa e permite sair sem pesquisar @positivo
  ✓  … › Cenários negativos › informa que não há artigos quando o termo não existe @negativo
  ✓  … › Cenários negativos › pesquisa vazia não quebra a página e lista artigos sem filtro @negativo
  ✓  … › Cenários negativos › pesquisa só com espaços se comporta como pesquisa vazia @negativo
  ✓  … › Cenários negativos › termo com HTML é exibido como texto e não executa script @negativo
  ✓  … › Cenários negativos › termo muito longo informa que não há artigos @negativo
  ✘  … › Bug conhecido: lupa não abre a busca › usuário clica na lupa e o campo de pesquisa abre @bug
  8 passed
```

> O **✘ no teste `@bug` é normal**: ele falha de propósito e o Playwright o conta como sucesso (por isso aparece `8 passed`). Veja a explicação em [bug-lupa.spec.js](#testse2ebug-lupaspecjs-demonstração-do-bug-da-lupa).

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
│       └── playwright.yml      → pipeline CI/CD: roda os testes e publica o relatório
├── tests/
│   ├── e2e/
│   │   ├── busca.spec.js       → OS TESTES: cenários positivos e negativos da pesquisa
│   │   └── bug-lupa.spec.js    → bug conhecido da lupa (falha esperada, test.fail)
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

Arquivos terminados em **`.spec.js`** são os únicos que o Playwright executa como teste. Os cenários estão divididos em dois grupos, cada um com uma *tag* para rodar separadamente.

**Cenários positivos (`@positivo`)**: o usuário faz o que se espera e o site deve responder corretamente.

| Cenário | O que verifica |
|---|---|
| encontra artigos quando o termo existe no blog | Pesquisa “cartão”: a URL e o título mostram o termo e os artigos listados falam dele |
| abre a busca pela lupa e permite sair sem pesquisar | Abre a lupa, aperta `Esc` e confirma que continua na página inicial |

**Cenários negativos (`@negativo`)**: o usuário digita algo inválido ou que não existe, e o site deve lidar com isso sem quebrar.

| Cenário | Entrada | Comportamento esperado |
|---|---|---|
| informa que não há artigos quando o termo não existe | `zzzxqy987termoinexistente` | Nenhum artigo e a mensagem “Lamentamos, mas nada foi encontrado…” |
| pesquisa vazia não quebra a página e lista artigos sem filtro | *(vazio)* | Abre a página de busca listando os artigos mais recentes (padrão do WordPress), sem erro |
| pesquisa só com espaços se comporta como pesquisa vazia | `"   "` | Igual à pesquisa vazia |
| termo com HTML é exibido como texto e não executa script | `<script>alert("xss")</script>` | O termo aparece como **texto** no título, nenhum `alert` é disparado e não há resultados (proteção contra XSS) |
| termo muito longo informa que não há artigos | `"a"` repetido 300 vezes | Página de busca normal com “nada foi encontrado”, sem erro |

> O teste do bug da lupa **não é um cenário negativo**. Ele verifica o comportamento **correto** (a lupa deveria abrir a busca) e falha porque o site tem um defeito. Veja o próximo arquivo.

Estrutura do arquivo:

- `test.describe(...)`: agrupa os testes de um mesmo assunto.
- `test.beforeEach(...)`: roda **antes de cada teste** (aqui: abre o blog).
- `test("nome", async ({ page }) => { ... })`: um teste. `page` é a aba do navegador.

#### `tests/e2e/bug-lupa.spec.js`: demonstração do bug da lupa

Reproduz o bug **como um usuário real**, sem o contorno do `prepararBusca()`: abre o blog, mexe o mouse, clica na lupa e espera o campo de pesquisa abrir. O campo não abre, e o teste falha na verificação `o campo de pesquisa deveria abrir`: o elemento `#ast-seach-full-screen-form` continua **oculto** (`hidden`).

**Por que falha (causa raiz):** o blog usa o plugin de performance **LiteSpeed**, que adia o JavaScript do site até o usuário interagir com a página. Mesmo **depois** que o mouse se mexe, os scripts `_jb_static` do tema (responsáveis por ligar a ação de clique à lupa) continuam guardados em `data-src` e **nunca são carregados**. Assim a lupa fica sem ação de clique (o passo *“Lupa tem ação de clique? não”* aparece no relatório) e clicar nela não faz nada. É um defeito do site, não do teste.

**Como o teste está marcado:** ele usa `test.fail()`, que diz ao Playwright *“este teste deve falhar”*. Assim o bug fica documentado e com evidências, sem deixar o `npm test` e a pipeline vermelhos:

| O que aparece | O que significa |
|---|---|
| ✘ no terminal, mas contado em `passed` (no Allure: **passed** com a tag **bug**) | O bug continua no site. É o resultado esperado. Prints, vídeo e a anotação **bug** ficam no relatório |
| ❌ Falha com `Expected to fail, but passed` | **O site foi corrigido.** Remova o `test.fail()` do teste e avalie remover o `prepararBusca()` do `HomePage.js` |

> **Cuidado:** com `test.fail()`, **qualquer** falha conta como esperada, inclusive o site fora do ar. Se o teste mudar de comportamento, confira no relatório se ele falhou mesmo na etapa `o campo de pesquisa deveria abrir`.

Para rodar só os testes da busca, sem o do bug: `npx playwright test --grep-invert @bug`.

Para rodar só ele: `npx playwright test --grep @bug --headed`.

#### `tests/pages/HomePage.js`: página inicial

Guarda **onde estão os elementos** (seletores) e **o que dá para fazer** na página inicial:

| Método | O que faz |
|---|---|
| `visitar()` | Abre o blog e prepara a lupa para funcionar |
| `prepararBusca()` | Contorno técnico, veja abaixo |
| `visitarSemContorno()` | Abre o blog como usuário real, sem o contorno (usado no cenário do bug) |
| `lupaTemAcaoDeClique()` | Diz se a lupa tem ação de clique ligada (`true`/`false`) |
| `abrirBusca()` | Clica na lupa e confere que o campo “Digite sua busca” apareceu |
| `pesquisar(termo)` | Abre a busca, digita o termo e clica em pesquisar |
| `fecharBuscaPeloTeclado()` | Aperta `Esc` e confere que a busca fechou |

> **Por que existe o `prepararBusca()`?** É o contorno do [bug da lupa](#testse2ebug-lupaspecjs-demonstração-do-bug-da-lupa). O plugin LiteSpeed só carrega o JavaScript do site depois que o usuário interage, e mesmo assim os scripts `_jb_static`, que ligam o clique à lupa, nunca são carregados. O método faz duas coisas: (1) mexe o mouse até o LiteSpeed rodar os scripts (repetindo, porque o LiteSpeed às vezes recarrega a página e o primeiro movimento se perde) e (2) **carrega à mão** os scripts `_jb_static` pendentes. Sem ele, nenhum cenário de busca conseguiria abrir a lupa. **Se o site trocar de tema/plugin ou o bug for corrigido, este é o primeiro método a revisar.**

#### `tests/pages/SearchResultsPage.js`: página de resultados

Contém apenas **verificações** (métodos começam com `deve…`):

| Método | O que verifica |
|---|---|
| `deveRefletirOTermo(termo)` | A URL tem `?s=termo` e o título `h1` mostra o termo |
| `deveListarArtigosRelacionados(termo)` | Há artigos e o texto deles contém o termo (ignorando acentos e maiúsculas) |
| `deveInformarAusenciaDeResultados()` | Nenhum artigo e a mensagem de “nada encontrado” aparece |
| `deveListarArtigosSemFiltro()` | Busca vazia: a página de busca abre e lista artigos, sem “nada encontrado” |
| `deveExibirTermoComoTexto(termo)` | O termo aparece como texto no título, sem virar `<script>` na página |

#### `tests/data/busca.json`: massa de dados

```json
{
  "termoComResultado": "cartão",
  "termoSemResultado": "zzzxqy987termoinexistente",
  "termoVazio": "",
  "termoSomenteEspacos": "   ",
  "termoComHtml": "<script>alert(\"xss\")</script>",
  "tamanhoTermoLongo": 300
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

> O teste `@bug` (**usuário clica na lupa e o campo de pesquisa abre**) **sempre** mostra ✘ enquanto o bug do site existir, e isso é esperado. Só é problema se ele falhar com `Expected to fail, but passed` (veja [5.1](#testse2ebug-lupaspecjs-demonstração-do-bug-da-lupa)).

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

## 8. CI/CD (GitHub Actions)

O arquivo `.github/workflows/playwright.yml` define a pipeline que o GitHub executa sozinho em um servidor Linux. Ela tem duas etapas (jobs):

```
push / pull request / botão "Run workflow"
            │
            ▼
┌──────────────────────────┐        ┌───────────────────────────────┐
│ test (CI)                │  só na │ deploy-report (CD)            │
│ roda os testes e gera os │ ─main─▶│ publica o relatório Allure no │
│ relatórios               │        │ GitHub Pages                  │
└──────────────────────────┘        └───────────────────────────────┘
```

### 8.1 Quando a pipeline roda

| Evento | O que acontece |
|---|---|
| **push** em qualquer branch | Roda os testes (job `test`) |
| **push** na `main` | Roda os testes **e** publica o relatório no GitHub Pages |
| **pull request** para a `main` | Roda os testes, o resultado aparece no próprio PR |
| **Manual** | Aba **Actions** → *Playwright Tests* → **Run workflow** |

Se você fizer um novo push no mesmo branch enquanto a pipeline anterior ainda roda, a anterior é **cancelada** (opção `concurrency`) para não desperdiçar tempo.

### 8.2 Job `test` (CI: integração contínua)

1. Baixa o código (`actions/checkout`).
2. Instala o Node.js (`actions/setup-node`) com cache do npm, para acelerar as próximas execuções.
3. Instala o Java 17 (`actions/setup-java`), necessário para o Allure gerar o HTML.
4. `npm ci`: instala as dependências exatamente como no `package-lock.json`.
5. `npx playwright install --with-deps chromium`: instala o navegador.
6. `npx playwright test`: roda os testes (com até 2 repetições em caso de falha).
7. `npm run allure:generate`: gera o relatório Allure.
8. Publica `playwright-report` e `allure-report` como **artifacts** (guardados por 30 dias).
9. Só na `main`: empacota o `allure-report` para o GitHub Pages.

Os passos 7 a 9 rodam **mesmo se algum teste falhar** (`if: !cancelled()`), justamente para você ter o relatório da falha.

### 8.3 Job `deploy-report` (CD: entrega contínua)

Roda **só na `main`**, depois do job `test`. Publica o relatório Allure como um site no **GitHub Pages**:

**https://carlosrcarletto.github.io/teste-tecnico-agibank-web/**

A cada push na `main` o site é substituído pelo relatório da execução mais recente, e qualquer pessoa com o link pode ver o resultado sem instalar nada.

#### Configuração necessária (fazer uma única vez)

O GitHub Pages precisa ser ativado manualmente no repositório. Sem isso, o job `deploy-report` falha com o erro `Failed to create deployment (status: 404) ... Ensure GitHub Pages has been enabled`.

1. No GitHub, abra o repositório → **Settings** → **Pages** (menu lateral).
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Volte na aba **Actions**, abra a última execução da `main` e clique em **Re-run failed jobs**.

> Se o repositório for **privado**, o GitHub Pages só está disponível em planos pagos (GitHub Pro/Team). Nesse caso use os artifacts (8.4).

### 8.4 Onde ver o resultado

| Onde | Como |
|---|---|
| **Status geral** | Aba **Actions**: ✅ verde = tudo passou (inclusive a falha esperada do `@bug`), ❌ vermelho = algo falhou de verdade. Clique na execução e no job para ver o log de cada passo |
| **Relatório online** (só `main`) | https://carlosrcarletto.github.io/teste-tecnico-agibank-web/ |
| **Relatórios de qualquer branch** | Aba **Actions** → clique na execução → role até **Artifacts** → baixe `allure-report` ou `playwright-report`. Descompacte e, na raiz do projeto, rode `npx allure open caminho/da/pasta` (Allure) ou `npx playwright show-report caminho/da/pasta` (Playwright) |

### 8.5 Manutenção da pipeline

- **Mudar os branches que disparam a pipeline**: edite a seção `on:` do workflow.
- **Publicar o relatório a partir de outro branch**: troque `refs/heads/main` pelo branch desejado nas duas condições `if:` do workflow.
- **Rodar em mais navegadores no CI**: adicione o projeto no `playwright.config.js` (7.6) e troque `chromium` por nada em `npx playwright install --with-deps` (instala todos).
- **Avisos de versão** (ex.: *“Node.js 20 is deprecated”*): são só alertas. Quando uma action lançar versão nova, atualize o número após o `@` (ex.: `actions/checkout@v4` → `@v5`).

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
| Job `deploy-report` falha com `status: 404` | GitHub Pages não ativado | Settings → Pages → Source: **GitHub Actions** (8.3) |
| Clicar na lupa não abre a busca | Bug conhecido do site: os scripts `_jb_static` não carregam | Nos testes o `prepararBusca()` contorna isso. Veja o [bug da lupa](#testse2ebug-lupaspecjs-demonstração-do-bug-da-lupa) |
| Teste `@bug` falha com `Expected to fail, but passed` | O site corrigiu o bug da lupa | Remova o `test.fail()` de `bug-lupa.spec.js` |
