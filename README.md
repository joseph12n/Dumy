# Dumy 🪙

> **Your local-first, AI-powered financial companion for students.**

**Dumy** es una aplicación móvil diseñada para centralizar y automatizar la gestión financiera personal sin comprometer la privacidad. A través de inteligencia artificial local, Dumy transforma fotos de recibos y registros manuales en estimaciones precisas, cuentas detalladas y estrategias de ahorro inteligentes.

🟢 **Status:** Backend Completo | Web Testing Disponible | Mobile UI Próxima Fase

---

## ✨ Características Principales

✅ **Smart OCR Ingestion** — Captura recibos o notas y extrae datos automáticamente  
✅ **Local Financial Chatbot** — Asistente IA que comprende tus hábitos de gasto  
✅ **On-Device Privacy** — Todo funciona localmente, sin enviar datos a servidores  
✅ **Predictive Analytics** — Estimaciones de gastos futuros y sugerencias de ahorro  
✅ **Financial Slips** — Resúmenes automáticos de gastos y proyecciones  
✅ **Budget Tracking** — Controla presupuestos por categoría  
✅ **Colombian Context** — Soporte para COP, fechas en español, contexto local  

---

## 🛠 Tech Stack

| Componente | Tecnología | Estado |
|-----------|-----------|--------|
| **Backend** | Zustand v5 + TypeScript | ✅ Completado |
| **Database** | SQLite (expo-sqlite v16) | ✅ Completado |
| **State Management** | Zustand v5 + Custom Hooks | ✅ Completado |
| **Frontend - Testing** | Vite + React | ✅ Completado |
| **Frontend - Mobile** | React Native + Expo | 🔄 En desarrollo |
| **Styling Mobile** | NativeWind (Tailwind CSS) | ⏳ Próximo |
| **Vision AI (OCR)** | Google ML Kit (On-device) | ⏳ Por integrar |
| **LLM Engine** | Llama 3.2 / ExecuTorch | ✅ Mock + Stub |
| **CSS Styling** | Tailwind + CSS vanilla | ✅ Completado |

---

## 📂 Estructura del Proyecto

```
dumy/
├── src/                        # Backend (lógica + estado)
│   ├── store/                 # Zustand stores + SQLite
│   │   ├── types.ts           # Domain types (20+ interfaces)
│   │   ├── database.ts        # SQLite singleton
│   │   ├── migrations.ts      # Schema versionado + seed
│   │   ├── *Store.ts          # 5 Zustand stores
│   │   └── repositories/      # CRUD puro SQL (4 files)
│   ├── api/                   # AI & Chatbot
│   │   ├── llmBridge.ts       # Mock + ExecuTorch
│   │   ├── promptTemplates.ts # Prompts en español
│   │   └── chatContextBuilder.ts
│   ├── hooks/                 # Custom hooks (5)
│   │   ├── useTransactions.ts
│   │   ├── useStats.ts
│   │   ├── useChat.ts
│   │   ├── useCategories.ts
│   │   └── useSettings.ts
│   └── utils/                 # Utilidades (4)
│       ├── currency.ts        # Formateo COP
│       ├── dates.ts           # Fechas en es-CO
│       ├── statistics.ts      # Cálculos puros
│       └── uuid.ts            # UUID generator
├── app/                       # Expo Router (mobile screens)
│   ├── _layout.tsx            # Root layout
│   ├── (tabs)/                # Tab-based navigation
│   └── modal.tsx
├── web-test/                  # Frontend testing (Vite + React)
│   ├── src/
│   │   ├── pages/             # 6 páginas de testing
│   │   ├── components/        # Componentes reutilizables
│   │   └── styles/            # CSS responsive
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md              # Instrucciones web-test
├── components/                # Componentes generales (boilerplate)
├── assets/                    # Imágenes, fuentes, iconos
├── CONTEXT.md                 # Guía del proyecto
├── CHANGELOG.md               # Cambios realizados
└── package.json               # Dependencias raíz
```

---

## 🚀 Empezar Rápido

### Opción 1: Frontend Web (Para Testing)

```bash
# Instalar y correr web-test
cd web-test
npm install
npm run dev

# Se abre en http://localhost:5173
```

**Qué puedes testear:**
- ✅ Crear/editar/eliminar transacciones
- ✅ Gestionar categorías y presupuestos
- ✅ Ver estadísticas y tendencias
- ✅ Chatear con el asistente IA
- ✅ Persistencia en SQLite

### Opción 2: Frontend Mobile (Expo)

```bash
# Desde la raíz del proyecto
npm install
npm start

# Luego selecciona:
# - i para iOS
# - a para Android
# - w para web
```

---

## 🗄️ Base de Datos

**SQLite Local** con 5 tablas:

| Tabla | Descripción | Rows |
|-------|-------------|------|
| `categories` | Categorías de transacciones | 8+ |
| `transactions` | Transacciones de ingresos/gastos | Variable |
| `budgets` | Límites por categoría | Variable |
| `chat_messages` | Historial de chat | Variable |
| `user_settings` | Configuración y schema_version | Variable |

**Almacenamiento de Dinero:**
- Formato: Enteros (pesos COP directo)
- Ejemplo: `18000` = `$ 18.000 COP`
- Formateo: Locale es-CO con punto para miles

**Migraciones:**
- Versionadas en `user_settings.schema_version`
- Ejecutadas automáticamente al abrir la app
- Seed de 8 categorías por defecto en español

---

## 🎯 Arquitectura

```
React Components (web-test + app/)
    ↓
Custom Hooks (useTransactions, useStats, etc)
    ↓
Zustand Stores (in-memory + sync)
    ↓
Repository Layer (SQL CRUD)
    ↓
SQLite Database (local device storage)
```

**Key Points:**
- ✅ Sin APIs externas
- ✅ Todo offline-first
- ✅ TypeScript estricto (sin `any`)
- ✅ Funciones puras para estadísticas
- ✅ Contexto inyectado en prompts de IA

---

## 🤖 AI/Chatbot

**MockLLMBridge (Desarrollo):**
```bash
# Respuestas pre-escritas en español
# Simula latencia de 1.2s
# Perfecto para testing
```

**ExecuTorchLLMBridge (Producción):**
```bash
# Llama 3.2 local
# Contexto financiero inyectado
# Instrucciones en formato Llama 3.2
```

**Contexto Inyectado:**
- Resumen del mes (ingresos/gastos/balance)
- Categorías de mayor gasto
- Últimas 5 transacciones
- Alertas de presupuestos

---

## 📊 Funcionalidades Completadas

| Feature | Status | Detalles |
|---------|--------|----------|
| CRUD Transacciones | ✅ | Create, Read, Update, Delete |
| CRUD Categorías | ✅ | Con protección de defaults |
| CRUD Presupuestos | ✅ | Por categoría y período |
| Estadísticas | ✅ | Resúmenes, tendencias, proyecciones |
| Chat IA | ✅ | Mock + contexto inyectado |
| SQLite | ✅ | Migraciones, esquema completo |
| Custom Hooks | ✅ | 5 hooks reutilizables |
| Web Testing | ✅ | 6 páginas completas |
| TypeScript | ✅ | Strict mode, 0 `any` |

---

## 🔜 Próximas Fases

### Phase 2: Mobile UI
- [ ] Implementar screens con React Native
- [ ] Estilos finales con NativeWind
- [ ] Animaciones con React Native Reanimated
- [ ] Testing en iOS/Android

### Phase 3: AI Integration
- [ ] Integrar Google ML Kit para OCR
- [ ] Conectar ExecuTorch con Llama 3.2
- [ ] Fine-tuning del prompt para contexto colombiano
- [ ] Streaming de respuestas del LLM

### Phase 4: Polish & Deploy
- [ ] Tests unitarios con Jest
- [ ] CI/CD con GitHub Actions
- [ ] EAS Build para distribución
- [ ] App Store / Google Play

---

## 🧪 Testing

### Web Frontend
```bash
cd web-test && npm run dev
# Luego en http://localhost:5173
# Testear todas las 6 páginas
```

### Flujo de Testing Recomendado
1. Crear 5-10 transacciones
2. Crear presupuestos para 2-3 categorías
3. Exceder uno de los presupuestos
4. Ver estadísticas en Dashboard
5. Hacer preguntas en Chat

---

## 📚 Documentación

| Archivo | Propósito |
|---------|-----------|
| `CONTEXT.md` | Guía del proyecto y estándares de código |
| `CHANGELOG.md` | Cambios realizados en esta fase |
| `web-test/README.md` | Instrucciones específicas del web-test |
| `src/store/types.ts` | Documentación de tipos |
| Inline comments | En todo el código TypeScript |

---

## 🔒 Privacidad & Seguridad

✅ **Zero Cloud:** Nada sube a internet  
✅ **Local AI:** LLMs corren en tu dispositivo  
✅ **SQLite Local:** Base de datos en tu teléfono  
✅ **Open Source:** Código auditable  
✅ **No Ads:** Sin rastreo de datos  
✅ **No Permisos Excesivos:** Solo necesarios para funcionar  

---

## 💡 Contribuir

Para contribuir al proyecto:

1. Lee `CONTEXT.md` para entender los estándares
2. Revisa `CHANGELOG.md` para ver cambios recientes
3. Crea una rama: `git checkout -b feature/my-feature`
4. Commit con Conventional Commits: `git commit -m "feat: descripción"`
5. Push y abre un Pull Request

---

## 📜 License

MIT License - Dumy is open source and free to use.

---

## 👥 Equipo

Desarrollado para jóvenes colombianos que quieren controlar sus finanzas sin comprometer privacidad.

**Valores del Proyecto:**
- 🤝 Tranquilidad (peace of mind)
- ❤️ Amor (por tus datos)
- 🙏 Respeto (a tu privacidad)

---

## 🎯 Misión

Ayudar a jóvenes estudiantes colombianos a entender y mejorar sus finanzas personales a través de tecnología accesible, privada y confiable.

---

**Last Updated:** 2025-04-08  
**Status:** 🟢 Backend Ready | Testing Available | Mobile WIP  
**Next Milestone:** Mobile UI + OCR Integration
