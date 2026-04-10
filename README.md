# Dumy

Aplicacion mobile local-first para control financiero personal, con persistencia SQLite y asistente IA en modo hibrido u online.

[![Descargar APK](https://img.shields.io/badge/Descargar-APK-2ea44f?logo=android&logoColor=white)](https://github.com/joseph12n/Dumy/releases/latest/download/dumy.apk)
[![Ultima Release](https://img.shields.io/github/v/release/joseph12n/Dumy?display_name=release)](https://github.com/joseph12n/Dumy/releases/latest)

![Logo Dumy](./assets/images/icon.png)

## Descarga rapida

- Ultima release: https://github.com/joseph12n/Dumy/releases/latest
- APK directo: https://github.com/joseph12n/Dumy/releases/latest/download/dumy.apk

Si el enlace directo falla, entra a Releases y descarga el asset dumy.apk.

## Que incluye el proyecto

- App React Native con Expo Router.
- Estado local con Zustand.
- Persistencia local en SQLite.
- Capa IA con router de proveedores y puente de compatibilidad.
- Backend Node opcional para IA online y/o Ollama local.
- Flujo de build APK por EAS y publicacion automatizada en GitHub Releases.

## Stack tecnologico

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript 5
- NativeWind + Tailwind
- expo-sqlite
- Node.js para backend IA

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Cuenta Expo para builds en EAS
- Android Studio o telefono Android para pruebas

Opcional para IA local real:

- Ollama instalado y ejecutandose
- Modelo descargado (ejemplo: qwen2.5:7b-instruct)

## Instalacion de dependencias

```bash
npm install
```

## Configuracion de entorno

1. Crea el archivo .env desde el ejemplo:

```bash
copy .env.example .env
```

2. Configura variables segun tu modo de uso:

- EXPO_PUBLIC_AI_BACKEND_URL: URL del backend IA.
- EXPO_PUBLIC_AI_MODE: hybrid u online.

Variables del backend Node (opcionales):

- AI_BACKEND_PORT (default: 8787)
- AI_BACKEND_PROVIDER (default: ollama)
- OLLAMA_BASE_URL (default: http://127.0.0.1:11434)
- OLLAMA_MODEL (default: qwen2.5:7b-instruct)

## Comandos principales

```bash
npm start
npm run android
npm run ios
npm run web
npm run ai:backend
npx tsc --noEmit
```

## Flujos de ejecucion

### 1) Desarrollo local mobile

1. Ejecuta la app:

```bash
npm start -- --clear
```

2. Abre en Android desde Expo Go o emulador.
3. Si usas backend IA local, ejecuta en otra terminal:

```bash
npm run ai:backend
```

4. Verifica salud del backend en:

- GET http://localhost:8787/health

### 2) Modo remoto personal gratis (sin hosting pago)

1. Mantiene backend en tu PC.
2. Publica el puerto 8787 con un tunel (ejemplo Cloudflare Tunnel).
3. Configura en la app:

- EXPO_PUBLIC_AI_BACKEND_URL=https://tu-url-publica
- EXPO_PUBLIC_AI_MODE=online

4. Mantiene tu PC encendida cuando se use la IA.

### 3) Modo SaaS online

1. Backend desplegado de forma publica y estable.
2. Build con:

- EXPO_PUBLIC_AI_MODE=online
- EXPO_PUBLIC_AI_BACKEND_URL=https://api.tu-dominio.com

## Flujo de actualizaciones y releases

1. Crea rama feature.
2. Implementa cambios y valida con tsc + pruebas manuales.
3. Abre Pull Request y merge a main.
4. Ejecuta workflow Build Android APK en Actions.
5. Indica release_tag (ejemplo: apk-v4).
6. Verifica que dumy.apk se publique en Releases y sea latest.

## Build APK local con EAS

```bash
npx eas-cli build --platform android --profile preview --wait
```

Nota: este comando genera el build en EAS, pero no publica automaticamente en GitHub Releases.

## Build APK desde GitHub Actions

Workflow: .github/workflows/build-apk.yml

Requiere configurar en GitHub:

- Secret: EXPO_TOKEN
- Variable: EXPO_PUBLIC_AI_BACKEND_URL
- Variable opcional: EXPO_PUBLIC_AI_MODE (si no se define, usa online)

Resultado:

- Artifact de workflow: dumy-apk
- Release publicada con asset dumy.apk

## Arquitectura rapida

- app/: rutas y pantallas con Expo Router.
- src/store/: estado, acceso a DB y repositorios.
- src/api/llmBridge.ts: capa estable para consumo desde la app.
- src/api/ai/: router, runtime y proveedores IA.
- backend/server.js: API HTTP para chat IA.

Endpoints backend:

- GET /health
- POST /ai/chat

## Seguridad y privacidad

- No subir .env al repositorio.
- Mantener solo .env.example con placeholders.
- No publicar tokens o claves en codigo ni docs.
- Si expones backend por tunel, considera autenticacion y limite de peticiones.

## Solucion de problemas

- No actualiza icono/logo:
  - Limpia cache con npm start -- --clear.
  - Reinstala APK si cambiaste icon/splash/adaptive icon.
- El backend no responde:
  - Revisa npm run ai:backend.
  - Valida /health y variables de entorno.
- Build EAS falla:
  - Verifica app.json, eas.json y credenciales Expo.

## Documentacion adicional

- CONTEXT.md
- CHANGELOG.md
- PROJECT_STATUS.md
- CONTRIBUTING.md

## Contribuir y licencia

- Guia de contribucion: CONTRIBUTING.md
- Plantilla de Pull Request: .github/PULL_REQUEST_TEMPLATE.md
- Plantillas de Issues: .github/ISSUE_TEMPLATE/
- Licencia del proyecto: LICENSE
