(function () {
  "use strict";

  var WHATSAPP = "https://wa.me/5543996044219?text=";

  var PECAS = {
    laje: {
      nome: "Laje",
      rotulos: ["Comprimento (m)", "Largura (m)", "Espessura (cm)"],
      larguraEmCm: false,
      fck: 25,
      inicial: ["6", "5", "10", "1"],
      dica: "Laje treliçada (pré-moldada): use só a espessura da capa de concreto, normalmente 4 a 5 cm."
    },
    viga: {
      nome: "Viga ou baldrame",
      rotulos: ["Comprimento (m)", "Largura (cm)", "Altura (cm)"],
      larguraEmCm: true,
      fck: 25,
      inicial: ["8", "15", "30", "1"],
      dica: "Some o comprimento de todas as vigas com a mesma seção, ou use o campo de quantidade."
    },
    sapata: {
      nome: "Sapata",
      rotulos: ["Comprimento (m)", "Largura (m)", "Altura (cm)"],
      larguraEmCm: false,
      fck: 25,
      inicial: ["1", "1", "40", "8"],
      dica: "Conte quantas sapatas têm a mesma medida e informe em quantidade."
    },
    contrapiso: {
      nome: "Contrapiso",
      rotulos: ["Comprimento (m)", "Largura (m)", "Espessura (cm)"],
      larguraEmCm: false,
      fck: 20,
      inicial: ["10", "8", "6", "1"],
      dica: "Meça a área de cada cômodo e some, ou calcule cômodo por cômodo."
    },
    calcada: {
      nome: "Calçada",
      rotulos: ["Comprimento (m)", "Largura (m)", "Espessura (cm)"],
      larguraEmCm: false,
      fck: 20,
      inicial: ["12", "1,5", "7", "1"],
      dica: "Calçada de passeio costuma ter de 6 a 8 cm de espessura."
    }
  };

  function numero(valor) {
    var texto = String(valor).trim();
    if (texto.indexOf(",") > -1) {
      texto = texto.replace(/\./g, "").replace(",", ".");
    }
    var n = parseFloat(texto);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function formatar(n) {
    return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function iniciarCalculadora() {
    var painel = document.querySelector("[data-calculadora]");
    if (!painel) {
      return;
    }

    var botoes = document.querySelectorAll("[data-peca]");
    var campos = {
      a: painel.elements.a,
      b: painel.elements.b,
      c: painel.elements.c,
      q: painel.elements.q,
      bomba: painel.elements.bomba
    };
    var saida = {};
    document.querySelectorAll("[data-calc]").forEach(function (el) {
      saida[el.getAttribute("data-calc")] = el;
    });

    var pecaAtual = "laje";

    function calcular() {
      var peca = PECAS[pecaAtual];
      var a = numero(campos.a.value);
      var b = numero(campos.b.value);
      var c = numero(campos.c.value);
      var q = numero(campos.q.value);
      var volume = a * (peca.larguraEmCm ? b / 100 : b) * (c / 100) * q;
      var margem = volume * 1.05;
      var pedido = volume > 0 ? Math.max(0.5, Math.ceil(margem * 2) / 2) : 0;
      var temVolume = volume > 0;

      saida.resultado.hidden = !temVolume;
      saida.vazio.hidden = temVolume;
      saida.volume.textContent = formatar(volume);
      saida.margem.textContent = formatar(margem);
      saida.pedido.textContent = formatar(pedido);
      saida.fck.textContent = String(peca.fck);

      var medidas = campos.a.value + " x " + campos.b.value + (peca.larguraEmCm ? " cm" : " m") + " x " + campos.c.value + " cm";
      var linhas = [
        "Olá! Fiz o cálculo no site da Concre Prime.",
        "Peça: " + peca.nome + " (" + medidas + "), quantidade " + campos.q.value + "."
      ];
      if (temVolume) {
        linhas.push("Volume com margem: " + formatar(margem) + " m³ (pedido sugerido " + formatar(pedido) + " m³).");
      }
      linhas.push("fck de referência: " + peca.fck + " MPa. Bomba: " + (campos.bomba.checked ? "sim" : "não") + ".");
      linhas.push("Cidade da obra: ");
      saida.whatsapp.href = WHATSAPP + encodeURIComponent(linhas.join("\n"));
    }

    function escolher(chave) {
      var peca = PECAS[chave];
      if (!peca) {
        return;
      }
      pecaAtual = chave;
      botoes.forEach(function (botao) {
        botao.setAttribute("aria-pressed", String(botao.getAttribute("data-peca") === chave));
      });
      saida.nome.textContent = peca.nome;
      saida.dica.textContent = peca.dica;
      saida["rotulo-a"].textContent = peca.rotulos[0];
      saida["rotulo-b"].textContent = peca.rotulos[1];
      saida["rotulo-c"].textContent = peca.rotulos[2];
      campos.a.value = peca.inicial[0];
      campos.b.value = peca.inicial[1];
      campos.c.value = peca.inicial[2];
      campos.q.value = peca.inicial[3];
      calcular();
    }

    botoes.forEach(function (botao) {
      botao.addEventListener("click", function () {
        escolher(botao.getAttribute("data-peca"));
      });
    });

    painel.addEventListener("input", calcular);
    painel.addEventListener("change", calcular);
    painel.addEventListener("submit", function (evento) {
      evento.preventDefault();
    });

    calcular();
  }

  function iniciarOrcamento() {
    var form = document.querySelector("[data-orcamento]");
    if (!form) {
      return;
    }

    var status = form.querySelector("[data-orcamento-status]");
    var nome = form.elements.nome;
    var erroNome = document.getElementById("erro-nome");

    function limparErro() {
      nome.removeAttribute("aria-invalid");
      erroNome.textContent = "";
    }

    nome.addEventListener("input", limparErro);

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();

      if (!nome.value.trim()) {
        nome.setAttribute("aria-invalid", "true");
        erroNome.textContent = "Informe seu nome para a equipe saber com quem falar.";
        nome.focus();
        return;
      }

      limparErro();

      var dados = form.elements;
      var linhas = [
        "Olá! Quero um orçamento pela página da Concre Prime.",
        "Nome: " + nome.value.trim(),
        "Cidade da obra: " + dados.cidade.value
      ];
      if (dados.endereco.value.trim()) {
        linhas.push("Endereço da obra: " + dados.endereco.value.trim());
      }
      linhas.push("Produto: " + dados.produto.value);
      if (dados.volume.value.trim()) {
        linhas.push("Volume: " + dados.volume.value.trim() + " m³");
      }
      if (dados.produto.value === "Concreto usinado") {
        linhas.push("Resistência: " + dados.fck.value);
        linhas.push("Bomba: " + dados.bomba.value);
      }
      if (dados.data.value) {
        var partes = dados.data.value.split("-");
        linhas.push("Data desejada: " + partes[2] + "/" + partes[1] + "/" + partes[0]);
      }
      if (dados.obs.value.trim()) {
        linhas.push("Detalhes: " + dados.obs.value.trim());
      }

      var url = WHATSAPP + encodeURIComponent(linhas.join("\n"));
      var janela = window.open(url, "_blank");
      if (janela) {
        janela.opener = null;
      } else {
        window.location.href = url;
      }
      status.textContent = "Abrimos o WhatsApp com seu pedido. Confira a mensagem e toque em enviar.";
    });
  }

  iniciarCalculadora();
  iniciarOrcamento();
})();
