# Dumy

Aplicacion mobile local-first para control financiero personal, con asistente IA hibrido (offline/online) y persistencia local en SQLite.

[![Descargar APK](https://img.shields.io/badge/Descargar-APK-2ea44f?logo=android&logoColor=white)](https://github.com/joseph12n/Dumy/releases/latest/download/dumy.apk)
[![Ultima Release](https://img.shields.io/github/v/release/joseph12n/Dumy?display_name=release)](https://github.com/joseph12n/Dumy/releases/latest)

![Logo Dumy](./assets/images/icon.png)

## Descargar APK

- Ultima release: https://github.com/joseph12n/Dumy/releases/latest
- Descarga directa del APK: https://github.com/joseph12n/Dumy/releases/latest/download/dumy.apk

Si la descarga directa falla, entra a Releases y baja el asset `dumy.apk` manualmente.

Status actual: Backend listo + Mobile UI activa + flujo de diseno simplificado.

## Stack

- React Native + Expo Router
- TypeScript + Zustand
- SQLite (expo-sqlite)
- NativeWind (Tailwind para mobile)
- Backend Node opcional para IA online (`npm run ai:backend`)

## Estructura principal

- `app/`: pantallas y navegacion mobile
- `src/store/`: estado y acceso a base de datos
- `src/hooks/`: hooks de consumo para componentes
- `src/api/`: capa IA (router/proveedores/compatibilidad)
- `src/components/common/`: UI reutilizable
- `src/theme/`: runtime de diseno y tokens
- `backend/`: gateway IA online (`/health`, `/ai/chat`)

Nota: `web-test/` fue retirado del flujo activo y del repositorio versionado.

## Comandos

```bash
npm install
npm start
```

Comandos utiles:

```bash
npm run android
npm run ios
npm run web
npm run ai:backend
npx tsc --noEmit
```

## IA

- `src/api/llmBridge.ts` expone una interfaz estable para chatStore.
- Internamente delega al router en `src/api/ai/`.
- Modo offline primero; online cuando hay contexto de red y backend configurado.

## Modo SaaS

Para usuarios finales, la app debe apuntar a un backend publico y no a un proceso local.

- `EXPO_PUBLIC_AI_BACKEND_URL`: URL publica del backend IA.
- `EXPO_PUBLIC_AI_MODE=online`: fuerza uso del backend publico y desactiva el fallback local.
- En desarrollo puedes dejar `EXPO_PUBLIC_AI_MODE=hybrid` para usar backend publico cuando exista y mock local como respaldo.

## Modos de uso

- Modo local (misma red): app apuntando a IP LAN + backend en tu PC.
- Modo remoto personal gratis: app apuntando a URL publica de tunel + backend en tu PC.
- Modo SaaS online: app en `online` usando backend publico como unica fuente IA.

## Modo Gratis Personal

Si quieres usar la app tu y otra persona fuera de tu red sin pagar hosting, el flujo recomendado es este:

- Compilas la app Android localmente y la instalas como APK.
- Mantienes el backend en tu PC.
- Publicas `http://localhost:8787` con un tunel gratuito como Cloudflare Tunnel.
- Apuntas `EXPO_PUBLIC_AI_BACKEND_URL` a la URL publica del tunel.
- Dejas `EXPO_PUBLIC_AI_MODE=online` para que la app use solo esa URL.

Este enfoque no tiene costo de hosting, pero tu PC debe quedar encendida mientras se use la IA.

## Publicar nuevo APK en GitHub

1. Abre Actions en el repositorio.
2. Ejecuta el workflow `Build Android APK`.
3. Define `release_tag` (ejemplo: `apk-v3`).
4. Al finalizar, el APK queda en Artifacts y en Releases.

## Base de datos

- DB local: `dumy.db`
- Migraciones en `src/store/migrations.ts`
- Repositorios SQL en `src/store/repositories/`

## Estado del diseno

- Personalizacion visual por un solo flujo: `Cambio rapido (1 clic)`.
- Presets activos en `src/theme/designRuntime.ts`.

## Documentacion de continuidad

- `CONTEXT.md`: contexto tecnico y decisiones.
- `CHANGELOG.md`: historial de cambios.
- `PROJECT_STATUS.md`: estado global del proyecto.
