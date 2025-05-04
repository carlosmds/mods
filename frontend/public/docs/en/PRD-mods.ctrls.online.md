**Product Requirements Document (PRD)**

**Product:** MOderated aDS — Aerial Advertising Page **Objective:** Create a playful, visual, and monetizable experience for displaying ads in a "virtual sky", using AI assistance for prototyping, moderation, and development.

---

### **1\. Overview**

MOderated aDS is a web page that simulates an animated sky with different types of aerial vehicles (airplanes, airships, hot air balloons), each carrying advertising messages. Ads can be created by any user logged in via email. After payment, ads are displayed randomly and comically in the "sky" throughout their validity period.

---

### **2\. Main Features**

**Visitors:**

- Access the page without login

- View the animated sky with up to 6 simultaneous ads

**Logged-in users (via magic link email):**

- Create a new ad

- Choose:

  - Vehicle type (airplane, airship, balloon)

  - Message text (can include emojis)

  - Ad duration: 1 week, 3 months, or 1 year

- Make payment via Stripe Checkout

- Receive email confirmation

---

### **3\. Ad Display Logic**

- Sky displays **up to 6 active ads** simultaneously

- Each vehicle **loops** with its corresponding animation:

  - Airplane: message via **smoke**

  - Airship: message on **LED panel**

  - Balloon: message on **cloth banner**

- Ads are visible 24/7 until the end of their validity

---

### **4\. Authentication and Moderation**

- Login via magic link sent by email

- Email is verified at login time

- Created ads go through automated AI moderation to filter:

  - Profanity / offenses

  - Hate speech or violence

- If rejected, the amount paid by the user is refunded, along with an email notification.

---

### **5\. Payment**

- Stripe Checkout (redirect)

- Currency: BRL

- Prices:

  - 1 week: R$ 2.99

  - 1 month: R$ 9.99

  - 3 months: R$ 19.99

---

### **6\. Visual Style and Technologies**

- Flat, simple, comical, accessible style (ref.: educational / children's game)

- 2D elements (SVG or Canvas)

- Smooth animations (vehicle flight loop)

- Blue sky with clouds, trees in the background

- Suggested implementation: React + Tailwind + SVG animation (or Canvas)

---

### **7\. Future Expansions (Not required for MVP)**

- Dynamic weather and time (day/night, sunny/cloudy)

- Ad reputation system (likes?)

- Generative AI integration for message suggestions

- User panel to edit or renew ads

---

### **8\. Success Metrics**

- Number of paid ads published

- Visitor to advertiser conversion rate

- Engagement (screen time, interactions)

- AI rejection of ads (input quality)

---

**Status: MVP in development with AI assistance.** 