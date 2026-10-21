
document.addEventListener("DOMContentLoaded", () => {
  // ======================================
  // 1. SELECIONAR ELEMENTOS
  // ======================================

  const tabCadastro = document.getElementById("tab-cadastro");
  const tabLogin = document.getElementById("tab-login");

  const formCadastro = document.getElementById("form-cadastro");
  const formLogin = document.getElementById("form-login");

  const titulo = document.getElementById("auth-title");
  const descricao = document.getElementById("auth-description");

  const mensagem = document.getElementById("auth-message");

  // ======================================
  // 2. EXIBIR MENSAGENS
  // ======================================

  function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `auth-message ${tipo}`;
    mensagem.hidden = false;
  }

  function limparMensagem() {
    mensagem.textContent = "";
    mensagem.className = "auth-message";
    mensagem.hidden = true;
  }

  // ======================================
  // 3. ALTERNAR FORMULÁRIOS
  // ======================================

  function alternarFormulario(tipo) {
    const cadastroAtivo = tipo === "cadastro";

    formCadastro.hidden = !cadastroAtivo;
    formLogin.hidden = cadastroAtivo;

    tabCadastro.classList.toggle("active", cadastroAtivo);
    tabLogin.classList.toggle("active", !cadastroAtivo);

    tabCadastro.setAttribute(
      "aria-pressed",
      String(cadastroAtivo)
    );

    tabLogin.setAttribute(
      "aria-pressed",
      String(!cadastroAtivo)
    );

    titulo.textContent = cadastroAtivo
      ? "Crie sua conta"
      : "Bem-vindo de volta";

    descricao.textContent = cadastroAtivo
      ? "Preencha os dados abaixo para começar."
      : "Entre com suas credenciais para continuar.";

    limparMensagem();
  }

  tabCadastro.addEventListener("click", () => {
    alternarFormulario("cadastro");
  });

  tabLogin.addEventListener("click", () => {
    alternarFormulario("login");
  });

  // ======================================
  // 4. MOSTRAR E OCULTAR SENHAS
  // ======================================

  const botoesSenha = document.querySelectorAll(
    ".toggle-password"
  );

  botoesSenha.forEach((botao) => {
    botao.addEventListener("click", () => {
      const campoSenha = document.getElementById(
        botao.dataset.target
      );

      if (!campoSenha) return;

      const senhaVisivel = campoSenha.type === "text";

      campoSenha.type = senhaVisivel
        ? "password"
        : "text";

      botao.textContent = senhaVisivel
        ? "Mostrar"
        : "Ocultar";

      botao.setAttribute(
        "aria-label",
        senhaVisivel ? "Mostrar senha" : "Ocultar senha"
      );

      botao.setAttribute(
        "aria-pressed",
        String(!senhaVisivel)
      );
    });
  });

  // ======================================
  // 5. ENVIAR FORMULÁRIOS COM FETCH
  // ======================================

  async function enviarFormulario(evento) {
    // Impedir que o navegador abra outra página
    evento.preventDefault();

    const formulario = evento.currentTarget;
    const botao = formulario.querySelector(
      'button[type="submit"]'
    );

    const textoOriginal = botao.innerHTML;

    limparMensagem();

    botao.disabled = true;
    botao.textContent = "Aguarde...";

    try {
      // Coletar os dados do formulário
      const dados = new URLSearchParams(
        new FormData(formulario)
      );

      // Enviar ao Express
      const resposta = await fetch(formulario.action, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },
        body: dados
      });

      // Ler a mensagem enviada pelo servidor
      const texto = await resposta.text();

      if (resposta.ok) {
        mostrarMensagem(texto, "success");

        // Limpar formulário após cadastro
        if (formulario === formCadastro) {
          formulario.reset();
        }
      } else {
        mostrarMensagem(texto, "error");
      }

    } catch (erro) {
      console.error("Erro na requisição:", erro);

      mostrarMensagem(
        "Não foi possível conectar ao servidor. Tente novamente.",
        "error"
      );

    } finally {
      botao.disabled = false;
      botao.innerHTML = textoOriginal;
    }
  }

  // ======================================
  // 6. ASSOCIAR OS FORMULÁRIOS
  // ======================================

  formCadastro.addEventListener(
    "submit",
    enviarFormulario
  );

  formLogin.addEventListener(
    "submit",
    enviarFormulario
  );

  // ======================================
  // 7. ESTADO INICIAL
  // ======================================

  alternarFormulario("cadastro");
});
