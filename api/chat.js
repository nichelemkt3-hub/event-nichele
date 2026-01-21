import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ===== BASE DE CONHECIMENTO ===== */

const sorteio = `
Até quando vai a campanha?
Período da Promoção: De 20.01 a 17.12
Período de Participação: De 20.01 a 14.12

Quais lojas participam?
Todas as lojas Nichele Materiais de Construção + Nichele Tintas.
Não vale para a loja Vero Acabamentos.

Quem pode participar?
Pessoas físicas e jurídicas maiores de 18 anos com CPF válido.

Quem não pode participar?
Menores de 18 anos, funcionários, sócios e parentes de 1º grau.

Como participar?
Compras a partir de R$ 2.000,00 e cadastro no hotsite ou WhatsApp.

Onde vejo meu número da sorte?
No hotsite ou WhatsApp da campanha.

Quando acontecem os sorteios?
Quartas e sábados, conforme calendário oficial.

Ganhei uma vez, participo de novo?
Não. Cada CPF pode ganhar apenas uma vez.

Entrega do prêmio:
Retirada presencial na filial de Xaxim.
`;

const roleta = `
Até quando vai a campanha?
De 20/01/2026 a 23/12/2026.

Quais lojas participam?
Somente lojas Nichele Materiais de Construção.

Como participar?
Compras acima de R$ 2.000,00 geram 1 Giro da Sorte.

Onde vejo o resultado?
No hotsite ou WhatsApp.

Retirada do prêmio:
Loja física ou envio no e-commerce.
`;

/* ===== FUNÇÃO PRINCIPAL ===== */

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Método não permitido." });
    }

    const { message, context } = req.body;
    const text = message?.toLowerCase() || "";

    // Saudações simples
    if (
      ["oi", "olá", "bom dia", "boa tarde", "boa noite"].some(g =>
        text.includes(g)
      )
    ) {
      return res.json({
        reply:
          "Olá! 😊 Sou o assistente do evento Nichele. Posso te ajudar com dúvidas sobre **Sorteio** ou **Roleta**."
      });
    }

    // Se não escolheu contexto ainda
    if (!context) {
      return res.json({
        reply:
          "Essa dúvida é sobre **Sorteio** ou **Roleta**? 😊\n\nVocê pode clicar em uma opção ou escrever."
      });
    }

    const base = context === "sorteio" ? sorteio : roleta;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Você é um atendente educado, paciente e claro.
Responda SOMENTE com base no texto abaixo.
Se não encontrar a resposta, diga educadamente que não encontrou.

BASE:
${base}
`
        },
        { role: "user", content: message }
      ],
      temperature: 0.2
    });

    const reply = completion.choices[0].message.content;

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.json({
      reply:
        "⚠️ Não consegui te atender agora.\n\n👉 Fale com nosso time no WhatsApp: https://wa.me/5541997550040"
    });
  }
}
