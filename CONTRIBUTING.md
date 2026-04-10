# Contributing to Dumy

Gracias por tu interes en contribuir.

## Alcance

Este repositorio es una app mobile (Expo + React Native) con backend IA opcional en Node.

## Requisitos de desarrollo

- Node.js 20+
- npm 10+
- Cuenta Expo (si vas a generar builds en EAS)

## Configuracion inicial

1. Instala dependencias:

```bash
npm install
```

2. Crea tu entorno local:

```bash
copy .env.example .env
```

3. Inicia la app:

```bash
npm start -- --clear
```

4. Si necesitas IA backend local:

```bash
npm run ai:backend
```

## Flujo de trabajo recomendado

1. Crea una rama desde main:

```bash
git checkout -b feature/nombre-corto
```

2. Haz cambios pequenos y commits claros.
3. Valida antes de abrir PR:

```bash
npx tsc --noEmit
```

4. Abre Pull Request describiendo:

- Problema que resuelve
- Cambios realizados
- Riesgos conocidos
- Evidencia de prueba

Plantillas disponibles:

- PR: .github/PULL_REQUEST_TEMPLATE.md
- Issues: .github/ISSUE_TEMPLATE/

## Convenciones

- Mantener TypeScript y estilos consistentes con el proyecto.
- Evitar cambios no relacionados en un mismo PR.
- No subir secretos ni archivos .env reales.
- Mantener documentacion actualizada cuando cambie un flujo.

## Revisiones

Los PR se revisan priorizando:

- Riesgo de regresion
- Seguridad de datos y credenciales
- Claridad en los flujos mobile/backend/release

## Publicacion de APK

La publicacion oficial se hace con GitHub Actions:

- Workflow: Build Android APK
- Publica asset dumy.apk en Releases

Si tu cambio afecta iconos, splash o configuracion nativa, valida instalando un APK nuevo en dispositivo.

## Reporte de vulnerabilidades

Si detectas un problema de seguridad, no lo publiques como issue abierto con secretos.
Comparte el reporte de forma privada con el mantenedor del repositorio.
