
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

const Usuario = require("./models/usuario");

// ======================================
// CONFIGURAÇÃO DO AMBIENTE
// ======================================

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ======================================
// MIDDLEWARES
// ======================================

// Receber dados dos formulários HTML
app.use(express.urlencoded({ extended: false }));

// Disponibilizar arquivos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// ======================================
// ROTA DE CADASTRO
// ======================================

app.post("/cadastro", async (req, res) => {
  // 1. Receber os dados
  const { nome, sobrenome, email, senha } = req.body;

  // 2. Validar os tipos
  if (
    typeof nome !== "string" ||
    typeof sobrenome !== "string" ||
    typeof email !== "string" ||
    typeof senha !== "string"
  ) {
    return res.status(400).send(
      "Dados de cadastro inválidos!"
    );
  }

  // 3. Validar nome e sobrenome
  if (!nome.trim() || !sobrenome.trim()) {
    return res.status(400).send(
      "Nome e sobrenome são obrigatórios!"
    );
  }

  // 4. Normalizar o e-mail
  const emailNormalizado = email.trim().toLowerCase();

  // Validar formato do e-mail
  const emailValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);

  if (!emailValido) {
    return res.status(400).send(
      "E-mail inválido!"
    );
  }

  // 5. Validar tamanho mínimo da senha
  if (senha.length < 8) {
    return res.status(400).send(
      "A senha deve ter pelo menos 8 caracteres!"
    );
  }

  // Verificar limite de 72 bytes do bcrypt
  if (bcrypt.truncates(senha)) {
    return res.status(400).send(
      "A senha ultrapassa o limite de 72 bytes!"
    );
  }

  try {
    // 6. Gerar o hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // 7. Salvar o usuário no MongoDB
    await Usuario.create({
      nome: nome.trim(),
      sobrenome: sobrenome.trim(),
      email: emailNormalizado,
      senhaHash
    });

    // 8. Responder com sucesso
    return res.status(201).send(
      "Usuário cadastrado com sucesso!"
    );

  } catch (erro) {
    // E-mail duplicado
    if (erro.code === 11000) {
      return res.status(409).send(
        "Este e-mail já está cadastrado!"
      );
    }

    console.error("Erro ao cadastrar usuário:", erro);

    return res.status(500).send(
      "Erro interno do servidor!"
    );
  }
});

// ======================================
// ROTA DE LOGIN
// ======================================

app.post("/login", async (req, res) => {
  // 1. Receber os dados do formulário
  const { email, senha } = req.body;

  // 2. Validar os tipos
  if (
    typeof email !== "string" ||
    typeof senha !== "string"
  ) {
    return res.status(400).send(
      "Dados de login inválidos!"
    );
  }

  // 3. Verificar campos obrigatórios
  if (!email.trim() || !senha) {
    return res.status(400).send(
      "E-mail e senha são obrigatórios!"
    );
  }

  // 4. Normalizar o e-mail
  const emailNormalizado = email.trim().toLowerCase();

  try {
    // 5. Buscar o usuário no MongoDB
    const usuario = await Usuario.findOne({
      email: emailNormalizado
    }).select("+senhaHash");

    // 6. Comparar a senha com o hash
    const senhaCorreta = usuario
      ? await bcrypt.compare(senha, usuario.senhaHash)
      : false;

    // 7. Credenciais incorretas
    if (!senhaCorreta) {
      return res.status(401).send(
        "E-mail ou senha incorretos!"
      );
    }

    // 8. Login válido
    return res.status(200).send(
      "Usuário encontrado!"
    );

  } catch (erro) {
    console.error("Erro ao realizar login:", erro);

    return res.status(500).send(
      "Erro interno do servidor!"
    );
  }
});

// ======================================
// INICIALIZAÇÃO DO SERVIDOR
// ======================================

async function iniciar() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB conectado!");

    // Aguardar a criação do índice único
    await Usuario.init();

    // Iniciar o servidor Express
    app.listen(PORT, () => {
      console.log(
        `Servidor rodando em http://localhost:${PORT}`
      );
    });

  } catch (erro) {
    console.error("Erro ao iniciar:", erro);
    process.exit(1);
  }
}

iniciar();
