import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const BASE_SORTEIO = `
Até quando vai a campanha?
Período da Promoção: De 20.01 a 17.12
Período de Participação: De 20.01 a 14.12

Quais lojas participam?
Todas as lojas Nichele Materiais de Construção + Nichele Tintas. Não vale para Vero Acabamentos.

Quem pode participar?
Pessoas físicas e jurídicas maiores de 18 anos com CPF válido no Brasil.

Quem não pode participar?
Menores de 18 anos, sem CPF válido, funcionários da empresa e parentes de 1º grau.

Como participar?
Compras a partir de R$ 2.000, cadastro no hotsite ou WhatsApp.

Quando acontecem os sorteios?
Quartas ou sábados conforme calendário oficial, com base na Loteria Federal.
`;

const BASE_ROLETA = `
Até quando vai a campanha?
De 20/01/2026 a 23/12/2026 ou enquanto durarem os prêmios.

Quais lojas participam?
Todas as lojas Nichele Materiais de Construção. Não vale Nichele Tintas nem Vero.

Giro da Sorte
Compras acima de R$ 2.000 dão direito a 1 giro por nota fiscal.

Onde ver o resultado?
No hotsite ou WhatsApp oficial.

Retirada do prêmio
Em loja física ou junto ao pedido no e-commerce, em até 180 dias.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método não permitido" });
  }

  try {
    const { message, contexto } = req.body;

    let base = "";
    if (contexto === "sorteio") base = BASE_SORTEIO;
    if (contexto === "roleta") base = BASE_ROLETA;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Você é o Assistente do Evento Nichele.
Seja educado, alegre e converse normalmente.
Use SOMENTE as informações abaixo.
Se não souber, diga que não encontrou a informação e sugira WhatsApp.

Base de conhecimento:
${base}
`
        },
        { role: "user", content: message }
      ]
    });

    res.status(200).json({
      reply: completion.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply:
        "Não consegui te atender agora 😔 Por favor, fale com nosso atendimento no WhatsApp 41 99755-0040."
    });
  }
}
