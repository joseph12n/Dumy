# Dumy 🪙

> **Your local-first, AI-powered financial companion.**

**Dumy** es una aplicación móvil diseñada para centralizar y automatizar la gestión financiera personal sin comprometer la privacidad. A través de inteligencia artificial local, Dumy transforma fotos de recibos y registros manuales en estimaciones precisas, cuentas detalladas y estrategias de ahorro inteligentes.

---

## ✨ Key Features

* **Smart OCR Ingestion:** Captura recibos o notas escritas a mano y extrae datos automáticamente usando visión artificial local.
* **Local Financial Chatbot:** Un asistente inteligente basado en LLMs (Small Language Models) que comprende tus hábitos de gasto y responde preguntas sobre tu salud financiera.
* **On-Device Privacy:** Todo el procesamiento de datos y la ejecución de modelos de IA ocurren directamente en tu dispositivo.
* **Predictive Analytics:** Estimaciones de gastos futuros y sugerencias de ahorro personalizadas.
* **Financial Slips:** Generación automática de resúmenes de gastos y proyecciones de ahorro.

## 🛠 Tech Stack

El proyecto utiliza una arquitectura moderna y modular para garantizar rendimiento y escalabilidad:

| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) |
| **Logic/State** | TypeScript + Context API / Zustand |
| **Local Database** | [SQLite](https://www.sqlite.org/) |
| **Vision AI (OCR)** | Google ML Kit (On-device) |
| **LLM Engine** | Llama 3.2 / Gemini Nano (via ExecuTorch) |
| **Styling** | NativeWind (Tailwind CSS for React Native) |

---

## 🏗 Project Structure

Basado en estándares de **Clean Code** y arquitectura modular:

```text
dumy/
├── src/
│   ├── api/           # Servicios y llamadas a modelos de IA
│   ├── components/    # Componentes de UI (Atomic Design)
│   ├── hooks/         # Custom hooks para lógica de negocio
│   ├── screens/       # Vistas principales de la aplicación
│   ├── store/         # Gestión de persistencia local (SQLite)
│   └── utils/         # Helpers y formateadores financieros
├── assets/            # Imágenes, fuentes y modelos cuantizados
└── App.tsx            # Punto de entrada
