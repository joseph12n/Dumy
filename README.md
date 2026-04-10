# Dumy

Aplicacion mobile local-first para control financiero personal, con asistente IA hibrido (offline/online) y persistencia local en SQLite.

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
