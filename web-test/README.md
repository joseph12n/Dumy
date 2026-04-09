# Dumy Web Test Frontend

Frontend web para testing del backend de Dumy. Permite probar todas las funcionalidades del sistema: transacciones, categorías, presupuestos, estadísticas y chatbot de IA.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 16+
- npm o yarn

### Instalación

```bash
# Desde la raíz del proyecto
cd web-test

# Instalar dependencias
npm install
```

### Desarrollo

```bash
npm run dev
```

La app se abrirá automáticamente en `http://localhost:5173`

### Build

```bash
npm run build
```

## 📋 Páginas Disponibles

### 1. **Dashboard** 📊
- Estadísticas del mes actual (ingresos, gastos, balance)
- Resumen por categorías con gráficos de porcentaje
- Tendencias (semana/mes) y proyecciones
- Estado de presupuestos
- Resumen rápido de actividad

### 2. **Transacciones** 💰
- ➕ Agregar nuevas transacciones
- ✏️ Editar transacciones existentes
- 🗑️ Eliminar transacciones
- Filtrar por mes/categoría/tipo
- Tabla con todos los registros

### 3. **Categorías** 📁
- Ver categorías por defecto (no editables)
- ➕ Crear categorías personalizadas
- ✏️ Editar mis categorías
- 🗑️ Eliminar mis categorías
- Seleccionar icon y color para cada una

### 4. **Presupuestos** 💳
- ➕ Crear presupuestos por categoría
- ✏️ Editar límites y períodos
- 🗑️ Eliminar presupuestos
- Ver estado actual (% utilizado, disponible)
- Alertas visuales si se excede presupuesto

### 5. **Chat IA** 🤖
- Chatbot financiero en español colombiano
- Preguntas sobre gastos, ingresos, tendencias
- Contexto financiero inyectado automáticamente
- Respuestas en tiempo real (mock LLM para testing)
- Historial de conversación

### 6. **Configuración** ⚙️
- 🎨 Selector de tema (claro/oscuro/sistema)
- 🌍 Seleccionar locale/región
- 📊 Estadísticas de uso
- 💾 Información de almacenamiento (local-first)
- 🔒 Info de privacidad

## 🔧 Cómo Funciona

### Conexión con Backend
- Los stores Zustand se importan directamente desde `src/`
- La base de datos SQLite se inicializa automáticamente
- Los hooks personalizados (`useTransactions`, `useStats`, etc) consumen los stores
- Todo funciona offline - no hay APIs externas

### Data Flow
```
React Components → Custom Hooks → Zustand Stores → SQLite (via expo-sqlite)
```

### Mock Data
La primera vez que se abre, se crean categorías por defecto en español (es-CO):
- 🍔 Alimentación
- 🚌 Transporte
- ❤️ Salud
- 📚 Educación
- 🎮 Ocio
- 🏠 Hogar
- 🛍️ Compras
- 📊 Ingresos

## 🧪 Testing

### Flujo de Testing Recomendado

1. **Transacciones**
   - Crear 5-10 transacciones en diferentes categorías
   - Mezclar ingresos y gastos
   - Usar fechas diferentes

2. **Categorías**
   - Crear 2-3 categorías personalizadas
   - Cambiar icons y colores
   - Intentar editar una categoría por defecto (bloqueado ✅)

3. **Presupuestos**
   - Crear presupuestos para Alimentación y Transporte
   - Agregar transacciones hasta exceder presupuesto
   - Ver alertas visuales 🚨

4. **Dashboard**
   - Ver que estadísticas se calculen correctamente
   - Verificar desglose por categoría
   - Confirmar tendencias (semana/mes)
   - Validar estado de presupuestos

5. **Chat**
   - Hacer preguntas sobre tus gastos
   - Ver que el contexto financiero se inyecte
   - Probar diferentes preguntas

## 📊 APIs/Hooks Testeados

✅ `useTransactions()` - CRUD completo
✅ `useMonthlyStats()` - Estadísticas computadas
✅ `useCategories()` - Gestión de categorías
✅ `useBudgets()` - Presupuestos
✅ `useChat()` - Chatbot con contexto
✅ `useSettings()` - Configuración de usuario

## 🐛 Debugging

### Ver Stores en Consola
```javascript
// Settings page → Avanzado → Ver Settings en Consola
```

### Logs del Backend
Abre la consola del navegador (F12) para ver logs de:
- Inicialización de DB
- Carga de stores
- Operaciones CRUD
- Errores

## 📝 Stack Técnico

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: CSS vanilla (sin frameworks)
- **State**: Zustand v5
- **Database**: SQLite (expo-sqlite)
- **Language**: TypeScript (strict)

## 🎯 Propósito

Este frontend es **exclusivamente para testing**. Sirve para:
- ✅ Validar que el backend funciona correctamente
- ✅ Probar todas las funcionalidades
- ✅ Debugging durante desarrollo
- ✅ Demo de la arquitectura

El frontend real para móvil será con React Native en la carpeta `app/`.

## 📦 Estructura de Archivos

```
web-test/
├── index.html              # Entry HTML
├── package.json           # Dependencies
├── vite.config.ts         # Vite config
├── tsconfig.json          # TypeScript config
└── src/
    ├── main.tsx           # React entry
    ├── App.tsx            # Root component
    ├── components/        # Reusable components
    │   ├── Layout.tsx     # Navigation & structure
    │   ├── Card.tsx       # Card wrapper
    │   └── CurrencyDisplay.tsx
    ├── pages/             # Test pages
    │   ├── Dashboard.tsx
    │   ├── Transactions.tsx
    │   ├── Categories.tsx
    │   ├── Budgets.tsx
    │   ├── Chat.tsx
    │   └── Settings.tsx
    └── styles/
        └── index.css      # All styles
```

## 🚀 Próximos Pasos

1. Correr `npm install` en web-test/
2. Correr `npm run dev`
3. Testear todas las páginas
4. Verificar que los datos persisten en SQLite
5. Probar el chatbot mock

¡Listo para testing! 🎉
