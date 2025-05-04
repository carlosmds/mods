**Product Requirements Document (PRD)**

**Produto:** MOderated aDS — Página de Anúncios Aéreos **Objetivo:** Criar uma experiência lúdica, visual e monetizável de exibição de anúncios em um "céu virtual", utilizando assistência de IA para prototipagem, moderação e desenvolvimento.

---

### **1\. Visão Geral**

MOderated aDS é uma página web que simula um céu animado com diferentes tipos de veículos aéreos (aviões, dirigíveis, balões de ar quente), cada um carregando mensagens publicitárias. Os anúncios podem ser criados por qualquer usuário logado via e-mail. Após pagamento, os anúncios são exibidos de forma randômica e cômica no "céu" por toda sua validade.

---

### **2\. Funcionalidades Principais**

**Visitantes:**

- Acessam a página sem necessidade de login

- Visualizam o céu animado com até 6 anúncios simultâneos

**Usuários logados (via magic link por e-mail):**

- Criam um novo anúncio

- Escolhem:

  - Tipo de veículo (avião, dirigível, balão)

  - Texto da mensagem (pode incluir emojis)

  - Duração do anúncio: 1 semana, 3 meses ou 1 ano

- Realizam pagamento via Stripe Checkout

- Recebem confirmação por e-mail

---

### **3\. Lógica de Exibição de Anúncio**

- Céu exibe **até 12 anúncios** ativos simultaneamente

- Os anúncios são selecionados **aleatoriamente** entre os válidos

- Cada veículo **loopa** com a sua animação correspondente:

  - Avião: mensagem via **fumaça**

  - Dirigível: mensagem em **painel de LED**

  - Balão: mensagem em **faixa de pano**

- Os anúncios ficam visíveis 24h/dia até o fim da validade

---

### **4\. Autenticação e Moderação**

- Login via magic link enviado por e-mail

- O e-mail é verificado no ato do login

- Anúncios criados passam por moderação automatizada por IA para filtrar:

  - Palavrões / ofensas

  - Discurso de ódio ou violência

- Caso rejeitado, o valor pago pelo usuário é estornado, juntamente de uma notificação por e-mail.

---

### **5\. Pagamento**

- Stripe Checkout (redirecionamento)

- Moeda: BRL

- Preços:

  - 1 semana: R$ 2.99

  - 1 mês: R$ 9.99

  - 3 meses: R$ 19.99

---

### **6\. Estilo Visual e Tecnologias**

- Estilo flat, simples, cômico, acessível (ref.: jogo educativo / infantil)

- Elementos 2D (SVG ou Canvas)

- Animações suaves (loop de voo dos veículos)

- Céu azul com nuvens, árvores ao fundo

- Implementação sugerida: React \+ Tailwind \+ SVG animation (ou Canvas)

---

### **7\. Futuras Expansões (Não obrigatórias para MVP)**

- Clima e horário dinâmicos (dia/noite, sol/nublado)

- Sistema de reputação de anúncio (likes?)

- Integração com IA generativa para sugestão de mensagens

- Painel do usuário para editar ou renovar anúncio

---

### **8\. Métricas de Sucesso**

- Número de anúncios pagos publicados

- Taxa de conversão de visitantes em anunciantes

- Engajamento (tempo na tela, interações)

- Rejeição de anúncios pela IA (qualidade dos inputs)

---

**Status: MVP em desenvolvimento com assistência de IA.** 