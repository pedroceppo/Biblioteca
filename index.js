import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

const host = "0.0.0.0";
const porta = 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: "biblioteca-secret",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 }
}));

const livros = [];
const leitores = [];

const menu = `
<div class="container mt-3">
  <a href="/">Menu</a> |
  <a href="/livros">Cadastro de Livros</a> |
  <a href="/leitores">Cadastro de Leitores</a> |
  <a href="/logout">Logout</a>
  <hr>
</div>
`;

function verificarLogin(req, res, next) {
  if (req.session.logado) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.get("/login", (req, res) => {
  res.send(`
    <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <title>Login - Biblioteca</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="bg-light">
        <div class="container mt-5" style="max-width:400px;">
          <h2 class="mb-4 text-center">📚 Sistema de Biblioteca</h2>

          ${req.query.erro ? '<div class="alert alert-danger">Usuário ou senha inválidos!</div>' : ""}

          <form method="POST" action="/login">
            <div class="mb-3">
              <label class="form-label">Usuário</label>
              <input class="form-control" type="text" name="usuario" placeholder="Digite o usuário">
            </div>
            <div class="mb-3">
              <label class="form-label">Senha</label>
              <input class="form-control" type="password" name="senha" placeholder="Digite a senha">
            </div>
            <button class="btn btn-primary w-100">Entrar</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

app.post("/login", (req, res) => {
  const usuario = req.body.usuario;
  const senha = req.body.senha;

  if (usuario == "admin" && senha == "123") {

    req.session.logado = true;
    req.session.usuario = usuario;

    const agora = new Date().toLocaleString("pt-BR");
    const ultimoAcesso = req.cookies.ultimoAcesso || "Primeiro acesso";

    res.cookie("ultimoAcesso", agora, { maxAge: 365 * 24 * 60 * 60 * 1000 });

    req.session.ultimoAcesso = ultimoAcesso;

    res.redirect("/");
  } else {
    res.redirect("/login?erro=1");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(function () {
    res.redirect("/login");
  });
});

app.get("/", verificarLogin, (req, res) => {
  const ultimoAcesso = req.session.ultimoAcesso || "Primeiro acesso";

  res.send(`
    <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <title>Menu - Biblioteca</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
        ${menu}
        <div class="container mt-5 text-center">
          <h1 class="mb-4">📚 Sistema de Gerenciamento de Biblioteca</h1>
          <p class="text-muted">Último acesso: <strong>${ultimoAcesso}</strong></p>
          <div class="row justify-content-center mt-5">
            <div class="col-md-4">
              <div class="card p-4 mb-3 shadow-sm">
                <h4>📖 Cadastro de Livros</h4>
                <p>Cadastre e visualize os livros da biblioteca.</p>
                <a class="btn btn-primary" href="/livros">Acessar</a>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card p-4 mb-3 shadow-sm">
                <h4>👤 Cadastro de Leitores</h4>
                <p>Registre leitores e controle os empréstimos.</p>
                <a class="btn btn-success" href="/leitores">Acessar</a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.get("/livros", verificarLogin, (req, res) => {

  let tabela = "";

  for (let i = 0; i < livros.length; i++) {
    tabela += `
      <tr>
        <td>${livros[i].titulo}</td>
        <td>${livros[i].autor}</td>
        <td>${livros[i].isbn}</td>
      </tr>
    `;
  }

  if (tabela == "") {
    tabela = `<tr><td colspan="3" class="text-center">Nenhum livro cadastrado</td></tr>`;
  }

  res.send(`
    <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <title>Cadastro de Livros</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
        ${menu}
        <div class="container mt-4">
          <h1 class="mb-4">Cadastro de Livro</h1>

          ${req.query.sucesso ? '<div class="alert alert-success">Livro cadastrado com sucesso!</div>' : ""}

          <form method="POST" action="/livros" class="row g-3">

            <div class="col-md-12">
              <label class="form-label">Título do Livro</label>
              <input class="form-control" type="text" name="titulo" placeholder="Digite o título">
            </div>

            <div class="col-md-6">
              <label class="form-label">Nome do Autor</label>
              <input class="form-control" type="text" name="autor" placeholder="Digite o nome do autor">
            </div>

            <div class="col-md-6">
              <label class="form-label">Código ISBN / Identificação</label>
              <input class="form-control" type="text" name="isbn" placeholder="Digite o ISBN">
            </div>

            <div class="col-12">
              <button class="btn btn-primary">Cadastrar Livro</button>
            </div>

          </form>

          <h2 class="mt-5">Livros Cadastrados</h2>

          <table class="table table-bordered mt-3">
            <thead class="table-dark">
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>ISBN / Identificação</th>
              </tr>
            </thead>
            <tbody>
              ${tabela}
            </tbody>
          </table>

          <a class="btn btn-secondary" href="/">Voltar ao Menu</a>
        </div>
      </body>
    </html>
  `);
});

app.post("/livros", verificarLogin, (req, res) => {

  const dados = req.body;
  let erros = "";

  if (dados.titulo === "") erros += "<li>Título não preenchido.</li>";
  if (dados.autor === "") erros += "<li>Nome do autor não preenchido.</li>";
  if (dados.isbn === "") erros += "<li>Código ISBN não preenchido.</li>";

  if (erros != "") {
    res.send(`
      <html>
        <head>
          <meta charset="UTF-8">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
          ${menu}
          <div class="container mt-4">
            <div class="alert alert-danger">
              <h5>Campos obrigatórios não preenchidos:</h5>
              <ul>${erros}</ul>
            </div>
            <a class="btn btn-primary" href="/livros">Voltar</a>
          </div>
        </body>
      </html>
    `);
  } else {
    livros.push(dados);
    res.redirect("/livros?sucesso=1");
  }

});

app.get("/leitores", verificarLogin, (req, res) => {

  let opcoesLivros = "";

  for (let i = 0; i < livros.length; i++) {
    opcoesLivros += `<option value="${livros[i].titulo}">${livros[i].titulo}</option>`;
  }

  let tabela = "";

  for (let i = 0; i < leitores.length; i++) {
    tabela += `
      <tr>
        <td>${leitores[i].nome}</td>
        <td>${leitores[i].cpf}</td>
        <td>${leitores[i].telefone}</td>
        <td>${leitores[i].dataEmprestimo}</td>
        <td>${leitores[i].dataDevolucao}</td>
        <td>${leitores[i].livro}</td>
      </tr>
    `;
  }

  if (tabela == "") {
    tabela = `<tr><td colspan="6" class="text-center">Nenhum leitor cadastrado</td></tr>`;
  }

  res.send(`
    <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <title>Cadastro de Leitores</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
        ${menu}
        <div class="container mt-4">
          <h1 class="mb-4">Cadastro de Leitor</h1>

          ${req.query.sucesso ? '<div class="alert alert-success">Leitor cadastrado com sucesso!</div>' : ""}

          <form method="POST" action="/leitores" class="row g-3">

            <div class="col-md-6">
              <label class="form-label">Nome do Leitor</label>
              <input class="form-control" type="text" name="nome" placeholder="Digite o nome">
            </div>

            <div class="col-md-6">
              <label class="form-label">CPF / Identificação</label>
              <input class="form-control" type="text" name="cpf" placeholder="Digite o CPF">
            </div>

            <div class="col-md-6">
              <label class="form-label">Telefone para Contato</label>
              <input class="form-control" type="text" name="telefone" placeholder="Digite o telefone">
            </div>

            <div class="col-md-3">
              <label class="form-label">Data de Empréstimo</label>
              <input class="form-control" type="date" name="dataEmprestimo">
            </div>

            <div class="col-md-3">
              <label class="form-label">Data de Devolução</label>
              <input class="form-control" type="date" name="dataDevolucao">
            </div>

            <div class="col-md-12">
              <label class="form-label">Livro</label>
              <select class="form-select" name="livro">
                <option value="">-- Selecione um livro --</option>
                ${opcoesLivros}
              </select>
            </div>

            <div class="col-12">
              <button class="btn btn-success">Cadastrar Leitor</button>
            </div>

          </form>

          <h2 class="mt-5">Leitores Cadastrados</h2>

          <table class="table table-bordered mt-3">
            <thead class="table-dark">
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Data Empréstimo</th>
                <th>Data Devolução</th>
                <th>Livro</th>
              </tr>
            </thead>
            <tbody>
              ${tabela}
            </tbody>
          </table>

          <a class="btn btn-secondary" href="/">Voltar ao Menu</a>
        </div>
      </body>
    </html>
  `);
});

app.post("/leitores", verificarLogin, (req, res) => {

  const dados = req.body;
  let erros = "";

  if (dados.nome === "") erros += "<li>Nome do leitor não preenchido.</li>";
  if (dados.cpf === "") erros += "<li>CPF não preenchido.</li>";
  if (dados.telefone === "") erros += "<li>Telefone não preenchido.</li>";
  if (dados.dataEmprestimo === "") erros += "<li>Data de empréstimo não preenchida.</li>";
  if (dados.dataDevolucao === "") erros += "<li>Data de devolução não preenchida.</li>";
  if (dados.livro === "") erros += "<li>Livro não selecionado.</li>";

  if (erros != "") {
    res.send(`
      <html>
        <head>
          <meta charset="UTF-8">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
          ${menu}
          <div class="container mt-4">
            <div class="alert alert-danger">
              <h5>Campos obrigatórios não preenchidos:</h5>
              <ul>${erros}</ul>
            </div>
            <a class="btn btn-success" href="/leitores">Voltar</a>
          </div>
        </body>
      </html>
    `);
  } else {
    leitores.push(dados);
    res.redirect("/leitores?sucesso=1");
  }

});

app.listen(porta, host, () => {
  console.log(`Servidor rodando em http://${host}:${porta}`);
});