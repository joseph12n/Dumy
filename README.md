<p align="center">
  <img src="./assets/images/icon.png" width="120" alt="Dumy Logo" />
</p>

<h1 align="center">Dumy</h1>

<p align="center">
  <strong>Tu asistente financiero personal. Offline. Privado. Inteligente.</strong>
</p>

<p align="center">
  <a href="https://github.com/joseph12n/Dumy/releases/latest/download/dumy.apk">
    <img src="https://img.shields.io/badge/Descargar-APK-2ea44f?style=for-the-badge&logo=android&logoColor=white" alt="Descargar APK" />
  </a>
  &nbsp;
  <a href="https://github.com/joseph12n/Dumy/releases/latest">
    <img src="https://img.shields.io/github/v/release/joseph12n/Dumy?style=for-the-badge&display_name=release" alt="Ultima Release" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/React_Native-0.81-61dafb?logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SQLite-on--device-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/100%25-Offline-orange?logo=wifi&logoColor=white" alt="Offline" />
</p>

---

## Que es Dumy

Dumy es una aplicacion mobile de finanzas personales disenada para el contexto colombiano. Funciona **completamente offline**, sin servidores externos, sin cuentas, sin telemetria. Tus datos financieros nunca salen de tu dispositivo.

Combina un **motor de inteligencia financiera basado en skills**, un **escaner OCR on-device** con 3 modos de captura, y una **arquitectura centralizada de datos** sobre SQLite — todo empaquetado en una app nativa ligera con interfaz personalizable.

---

## Caracteristicas principales

### Asistente financiero inteligente (Dumy AI)

Un bot conversacional offline con **12 skills financieras** que analiza tus datos reales en tiempo real:

| Skill | Descripcion |
|-------|-------------|
| **Resumen de gastos** | Panorama del mes: ingresos, gastos, balance, promedio diario y proyeccion a fin de mes |
| **Analisis por categoria** | Distribucion porcentual con barras visuales y recomendaciones por concentracion |
| **Estado de presupuestos** | Alertas por presupuesto excedido o cerca del limite |
| **Tips de ahorro** | Regla 50/30/20 personalizada, reduccion por categoria, presupuesto diario disponible |
| **Recomendaciones diarias** | Evaluacion de salud financiera, tasa de ahorro, patrones recientes |
| **Analisis de recibos** | Desglose de factura escaneada con porcentaje sobre gastos totales |
| **Suma de numeros** | Totalizar valores detectados en imagenes de precios o numeros manuscritos |
| **Tendencias** | Comparacion de ritmo de gasto vs. ritmo ideal del mes |
| **Alertas inteligentes** | Deteccion proactiva: deficit, ritmo acelerado, concentracion excesiva, presupuestos |
| **Saludo personalizado** | Resumen financiero automatico al saludar |
| **Ayuda del sistema** | Listado completo de capacidades |
| **Respuesta general** | Fallback contextual con sugerencias de uso |

El motor clasifica la intencion del usuario por coincidencia de keywords y genera respuestas dinamicas usando `FinancialContext` — datos reales del mes actual del usuario.

### Escaner OCR con 3 modos

Procesamiento de imagenes 100% on-device usando **Google ML Kit Text Recognition**:

| Modo | Caso de uso | Resultado |
|------|-------------|-----------|
| **Recibo** | Facturas, tickets, comprobantes | Establecimiento, fecha, articulos, subtotal, IVA, total, confianza |
| **Precios** | Etiquetas de precios, listas de productos | Valores extraidos, suma automatica |
| **Numeros** | Numeros escritos a mano, cuentas en papel | Deteccion de valores, suma total |

Cada modo permite:
- Captura con camara en tiempo real o carga desde galeria
- Visualizacion del texto OCR crudo (modo debug)
- Envio directo al chat para analisis con Dumy AI
- Registro como gasto en un solo toque

**Parser optimizado para Colombia:** reconocimiento de valores en COP (`$150.000`), separador de miles con punto, IVA 19%, etiquetas comunes (`TOTAL A PAGAR`, `VLR TOTAL`, `SUBTOTAL`, etc.).

### Dashboard financiero

- Balance del mes con indicador de salud
- Desglose por categorias con porcentaje
- Transacciones recientes
- Alertas de presupuesto activas
- Tendencias comparativas

### Gestion de transacciones

- Registro manual de ingresos y gastos
- Historial con filtros por periodo y categoria
- Categorias predeterminadas para contexto colombiano: Alimentacion, Transporte, Salud, Educacion, Ocio, Hogar, Compras, Ingresos, Otros
- Presupuestos por categoria con alertas automaticas

### Personalizacion

- Nombre de perfil
- Temas de interfaz y modo oscuro
- Escalas de fuente y densidad visual
- Esquinas, sombras y gradientes configurables

---

## Arquitectura del sistema

### Flujo de datos

```
Usuario
  │
  ├─> Dashboard ──> useFinancialSystem ──> SQLite
  ├─> Chat ──────> chatStore ──> llmBridge ──> Dumy Skill Engine
  ├─> Escaner ───> ocrEngine (ML Kit) ──> receiptParser ──> chatStore
  └─> Historial ─> useTransactions ──> SQLite
```

### Orquestador financiero unico

Toda la lectura financiera parte de un hook centralizado:

```
src/hooks/useFinancialSystem.ts
```

Este hook unifica: periodo activo, totales, desglose por categoria, tendencias, presupuestos, alertas y acciones CRUD. Los hooks de acceso historico (`useTransactions`, `useCategories`, `useStats`) delegan en este orquestador.

### Motor de IA local

```
src/api/ai/smartFinancialEngine.ts   → 12 skills con logica financiera
src/api/ai/providers/localProvider.ts → Proveedor offline
src/api/ai/router.ts                 → Enrutador (solo local)
src/api/llmBridge.ts                 → Puente estable para el chat store
src/api/ai/catalog.ts                → Identificador del motor activo
```

**Sin conexiones externas.** El router delega directamente al proveedor local. No hay proveedor online, no hay URLs de backend, no hay env vars de API.

### Pipeline OCR

```
src/api/ai/ocrEngine.ts      → Wrapper de ML Kit Text Recognition
src/api/ai/receiptParser.ts  → Parser de recibos colombianos (COP)
app/(tabs)/scan.tsx           → UI de escaneo con 3 modos
```

### Persistencia local (SQLite)

| Tabla | Funcion |
|-------|---------|
| `categories` | Categorias de gasto/ingreso con seed colombiano |
| `transactions` | Registro de movimientos financieros |
| `budgets` | Limites por categoria |
| `chat_messages` | Historial de conversaciones con Dumy AI |
| `user_settings` | Preferencias de usuario y personalizacion |

Migraciones versionadas con seed inicial automatico.

---

## Estructura del proyecto

```
app/
  (tabs)/
    index.tsx        Dashboard principal
    history.tsx      Historial y filtros
    add.tsx          Registro de transacciones
    chat.tsx         Chat con Dumy AI
    scan.tsx         Escaner OCR (3 modos)
    profile.tsx      Perfil y configuracion

src/
  api/
    llmBridge.ts             Puente de IA
    chatContextBuilder.ts    Constructor de contexto financiero
    promptTemplates.ts       Templates de prompts
    ai/
      smartFinancialEngine.ts   Motor de skills (12 habilidades)
      ocrEngine.ts              Reconocimiento de texto on-device
      receiptParser.ts          Parser de recibos colombianos
      router.ts                 Router de IA (offline-only)
      catalog.ts                Catalogo del motor activo
      types.ts                  Tipos del sistema de IA
      providers/
        localProvider.ts        Proveedor local
  hooks/
    useFinancialSystem.ts    Orquestador financiero central
    useTransactions.ts       Facade de transacciones
    useCategories.ts         Facade de categorias
    useStats.ts              Facade de estadisticas
    useChat.ts               Hook del chat
  store/
    chatStore.ts             Estado del chat (Zustand)
    transactionStore.ts      Estado de transacciones
    categoryStore.ts         Estado de categorias
    settingsStore.ts         Estado de configuracion
    database.ts              Conexion SQLite
    types.ts                 Tipos del dominio
    repositories/            Consultas SQL puras
  components/
    common/                  Componentes reutilizables (BrandHeader, CandyCard, etc.)
    animated/                Componentes animados (FadeInView, ScalePress, etc.)
  theme/
    designRuntime.ts         Sistema de diseno en runtime
  utils/
    currency.ts              Formateo COP
    dates.ts                 Utilidades de fecha
    uuid.ts                  Generador de IDs
```

---

## Stack tecnologico

| Capa | Tecnologia |
|------|------------|
| Framework | Expo SDK 54 + React Native 0.81 |
| Lenguaje | TypeScript 5 |
| UI | React 19 + NativeWind 4 (Tailwind CSS) |
| Navegacion | Expo Router 6 |
| Estado | Zustand 5 |
| Base de datos | expo-sqlite (SQLite on-device) |
| OCR | @react-native-ml-kit/text-recognition 2.0 |
| Camara | expo-camera 17 |
| Galeria | expo-image-picker 17 |
| Animaciones | react-native-reanimated |
| Gradientes | expo-linear-gradient |
| Iconos | @expo/vector-icons (FontAwesome) |

---

## Instalacion y desarrollo

### Requisitos

- Node.js 20+
- npm 10+
- Android Studio o dispositivo Android
- Cuenta Expo (para builds EAS)

### Configuracion

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
```

> El bot de skills funciona offline por defecto. No requiere configurar proveedores externos.

### Comandos

```bash
# Desarrollo
npm start               # Iniciar servidor de desarrollo
npm start -- --clear    # Iniciar con cache limpia
npm run android         # Ejecutar en Android
npm run ios             # Ejecutar en iOS

# Build
npx eas-cli build --platform android --profile preview --wait
```

---

## Seguridad y privacidad

- **Zero network:** La app no realiza llamadas de red. Todo se procesa localmente.
- **Zero telemetry:** No se recopilan datos de uso, analytics ni crashlytics.
- **Data on-device:** SQLite almacena todo en el dispositivo. Sin sincronizacion cloud.
- **OCR local:** El reconocimiento de texto usa ML Kit on-device, sin enviar imagenes a servidores.
- **Sin tokens ni API keys** requeridos para operar.

---

## Notas importantes

- **OCR requiere build nativo:** El reconocimiento de texto depende de modulos nativos de ML Kit. No funciona en Expo Go — usa un build de desarrollo (`npx expo run:android`) o un APK generado con EAS.
- **Moneda:** Todos los valores se manejan en COP (Pesos Colombianos) con formato de punto como separador de miles.
- **Cambios visuales no reflejados:** Reinicia con `npm start -- --clear`.

---

## Descarga

| Canal | Enlace |
|-------|--------|
| Ultima release | https://github.com/joseph12n/Dumy/releases/latest |
| APK directo | https://github.com/joseph12n/Dumy/releases/latest/download/dumy.apk |

---

## Contribucion

- Guia: [CONTRIBUTING.md](CONTRIBUTING.md)
- Licencia: [LICENSE](LICENSE)
- Contexto tecnico: [CONTEXT.md](CONTEXT.md)

---

<p align="center">
  <sub>Dumy — Finanzas personales sin internet, sin servidores, sin excusas.</sub>
</p>
