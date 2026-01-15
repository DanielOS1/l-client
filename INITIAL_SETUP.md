# Documentación de Inicialización del Cliente Móvil (Lolos App)

Este documento detalla el proceso de configuración inicial (`Scaffolding`) del proyecto móvil y justifica las decisiones técnicas tomadas.

## 1. Tecnologías Base

- **Expo (Managed Workflow)**: SDK 54. Elegido por su facilidad de configuración, gestión automática de dependencias nativas y excelente experiencia de desarrollo (DX).
- **TypeScript**: Para garantizar tipado estático y reducir errores en tiempo de ejecución.

## 2. Dependencias Instaladas y Justificación

### Navegación

- **`@react-navigation/native`**, **`native-stack`**, **`bottom-tabs`**:
  - _Razón_: Estándar de la industria para navegación en React Native. Ofrece rendimiento nativo y transiciones fluidas (a diferencia de navegadores basados en JS puro).

### Gestión de Estado

- **`zustand`**:
  - _Razón_: Solución ligera y minimalista. Evita el "boilerplate" excesivo de Redux/Context API. Ideal para manejar el estado de autenticación (`useAuthStore`) y datos globales simples.

### Estilos y UI

- **`nativewind` (v4) + `tailwindcss`**:
  - _Razón_: Permite usar clases de utilidad de Tailwind directamente en componentes nativos (`className="..."`). Acelera el desarrollo y unifica el lenguaje de diseño con el desarrollo web.
- **`lucide-react-native`**:
  - _Razón_: Paquete de iconos moderno, consistente y ligero.

### Almacenamiento y Seguridad

- **`expo-secure-store`**:
  - _Razón_: **Crítico**. Permite guardar pares clave-valor (como el JWT de sesión) de forma encriptada en el dispositivo (Keychain en iOS, Keystore en Android).

### Red y Utilidades

- **`axios`**: Cliente HTTP robusto para conectar con el backend NestJS.
- **`clsx`, `tailwind-merge`**: Utilidades para combinar clases de estilos condicionalmente de forma segura.

## 3. Estructura del Proyecto

Se ha creado la carpeta `src` para mantener el código organizado:

- **`src/navigation`**: Contiene la configuración de rutas (Stacks y Tabs).
- **`src/store`**: Stores de Zustand (ej. `useAuthStore` para sesión).
- **`src/services`**: Capa para llamadas a la API (Axios).
- **`src/screens`**: Pantallas completas de la aplicación.
- **`src/components`**: Componentes reutilizables (Botones, Inputs, Cards).
- **`src/hooks`**: Custom Hooks.

## 4. Configuraciones Especiales

- **`babel.config.js` & `metro.config.js`**: Ajustados para que el compilador de React Native entienda y procese los estilos de NativeWind/Tailwind.
- **`global.css`**: Archivo de entrada para las directivas de Tailwind.

---

_Este proyecto está listo para comenzar el desarrollo de las pantallas de Autenticación._
