
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

const Usuario = require("./models/usuario");

// Configuração do ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// ======================================
// ROTA DE CADASTRO
// ======================================

app.post("/cadastro", async (req, res) => {
  // 1. Receber os dados do formulário
  const { nome, sobrenome, email, senha } = req.body;

  // 2. Validar os tipos dos campos
  if (
    typeof nome !== "string" ||
    typeof sobrenome !== "string" ||
    typeof email !== "string" ||
    typeof senha !== "string"
  ) {
    return res.status(400).send("Dados de login inválidos!");
  }

  // 3. Validar nome e sobrenome
  if (!nome.trim() || !sobrenome.trim()) {
    return res.status(400).send(
      "Nome e sobrenome são obrigatórios!"
    );
  }

  // 4. Normalizar o e-mail
  const emailNormalizado = email.trim().toLowerCase();

  // Verificar o formato do e-mail
  const emailValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);

  if (!emailValido) {
    return res.status(400).send("E-mail inválido!");
  }

  // 5. Validar a senha
  if (senha.length < 8) {
    return res.status(400).send(
      "A senha deve ter pelo menos 8 caracteres!"
    );
  }

  // Verificar o limite de 72 bytes
  if (bcrypt.truncates(senha)) {
    return res.status(400).send(
      "A senha ultrapassa o limite de 72 bytes!"
    );
  }

  // 6. Gerar hash e salvar no MongoDB
  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    // 7. Criar o usuário no banco
    await Usuario.create({
      nome: nome.trim(),
      sobrenome: sobrenome.trim(),
      email: emailNormalizado,
      senhaHash
    });

    // 8. Resposta de sucesso
    return res.status(201).send(
      "Usuário cadastrado com sucesso!"
    );

  } catch (erro) {
    // Verificar e-mail duplicado
    if (erro.code === 11000) {
      return res.status(409).send(
        "Este e-mail já está cadastrado!"
      );
    }

    console.error(erro);

    return res.status(500).send(
      "Erro interno do servidor!"
    );
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (
    typeof email !== "string" ||
    typeof senha !== "string"
  ) 


try {
  // Buscar o usuário pelo e-mail
  const usuario = await Usuario.findOne({
    email: emailNormalizado
  }).select("+senhaHash");

  // Comparar a senha com o hash armazenado
  const senhaCorreta = usuario
    ? await bcrypt.compare(senha, usuario.senhaHash)
    : false;

  // E-mail inexistente ou senha incorreta
  if (!senhaCorreta) {
    return res.status(401).send(
      "E-mail ou senha incorretos!"
    );
  }

  // Login válido
  return res.status(200).send(
    "Usuário encontrado!"
  );

} catch (erro) {
  console.error("Erro ao realizar login:", erro);

  return res.status(500).send(
    "Erro interno do servidor!"
  );
}


  if (!email.trim() || !senha) {
    return res.status(400).send(
      "E-mail e senha são obrigatórios!"
    );
  }

  const emailNormalizado = email.trim().toLowerCase();

  return res.status(200).send(
    "Dados de login validados!"
  );
});

// ======================================
// INICIALIZAÇÃO DO SERVIDOR
// ======================================

async function iniciar() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB conectado!");

    // Aguardar a criação dos índices
    await Usuario.init();

    // Iniciar o Express
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
