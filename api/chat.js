import fs from "fs";
import path from "path";

function carregarBase(nome) {
  const filePath = path.join(process.cwd(), "knowledge", nome);
  return fs.readFileSync(filePath, "utf8");
}

function extrairQA(texto) {
  const blocos = texto.split(/\n\s*\n/);
  const qa = [];

  blocos.forEach(bloco => {
    const p = bloco.match(/Pergunta:\s*(.+)/i);
    const r = bloco.match(/Resposta:\s*([\s\S]+)/i);

    if (p && r) {
      qa.push({
        pergunta: p[1].toLowerCase(),
        resposta: r[1].trim()
      });
    }
  });

  return qa;
}

function buscarResposta(base, perguntaUsuario) {
  perguntaUsuario = perguntaUsuario.toLowerCase();

  for (const item of base) {
    if (perguntaUsuario.includes(item.pergunta)) {
      return item.resposta;
    }
  }
  return null;
}

export default function handler(req, res) {
  const { message, contexto } = req.body;

  // Mensagem de boas-vindas
  if (!message) {
    return res.status(200).json({
      reply:
        "👋 Olá! Seja bem-vindo(a) ao **Assistente do Evento Nichele** 🎉\n\n" +
        "Posso te ajudar com dúvidas sobre a **Roleta** ou os **Sorteios**.\n\n" +
        "É só me perguntar 😊"
    });
  }

  // Se ainda não sabe se é roleta ou sorteio
  if (!contexto) {
    return res.status(200).json({
      reply:
        "Essa dúvida é sobre a **Roleta** ou sobre o **Sorteio**? 😊",
      askContext: true
    });
  }

  const base =
    contexto === "roleta"
      ? extrairQA(carregarBase("roleta.txt"))
      : extrairQA(carregarBase("sorteio.txt"));

  const resposta = buscarResposta(base, message);

  if (!resposta) {
    return res.status(200).json({
      reply:
        "🤔 Essa dúvida é um pouco mais específica e não encontrei nas regras oficiais.\n\n" +
        "👉 Você pode falar com um atendente pelo WhatsApp:\n" +
        "📱 (41) 99755-0040\n\n" +
        "Eles vão te ajudar rapidinho 😊"
    });
  }

  res.status(200).json({ reply: resposta });
}
