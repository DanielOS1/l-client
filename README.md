# Lolos App (Cliente)

**Lolos App** es una aplicación móvil diseñada para simplificar la gestión financiera y operativa de grupos organizados (cursos, comités, agrupaciones). Permite administrar miembros, periodos (semestres) y actividades de recaudación de fondos de manera eficiente.

## 🚀 Características Principales

### 🔐 Autenticación y Usuarios

- **Registro e Inicio de Sesión**: Sistema seguro para ingresar a la plataforma.
- **Gestión de Perfil**: Visualización de datos de usuario.

### 👥 Gestión de Grupos

- **Mis Grupos**: Visualiza todos los grupos a los que perteneces.
- **Creación de Grupos**: Crea nuevos grupos para tu organización.
- **Roles y Miembros**: Asigna roles personalizados y administra a los integrantes.

### 📅 Operaciones y Semestres

- **Gestión de Semestres**: Organiza el año en periodos operativos (ej. "Otoño 2024").
- **Visualización de Cronograma**:
  - Vista de **Agenda** con calendario interactivo.
  - Lista de actividades por día seleccionado.

### 🎉 Actividades y Eventos

- **Planificación**: Crea actividades con fecha, ubicación y descripción.
- **Detalle de Actividad**: Información centralizada de cada evento.
- **(Próximamente)**: Control de asistencia y recaudación financiera (ventas, cuotas).

## 🛠 Tecnologías Utilizadas

- **React Native (Expo)**: Framework principal para desarrollo móvil multiplataforma.
- **TypeScript**: Lenguaje tipado para mayor robustez.
- **NativeWind (TailwindCSS)**: Estilizado eficiente y moderno.
- **Zustand**: Gestión de estado global ligero y rápido.
- **React Native Calendars**: Componentes avanzados para manejo de fechas y agendas.
- **Axios**: Comunicación con el backend.

## 🏃 Como Ejecutar la App

1.  **Instalar dependencias**:

    ```bash
    npm install
    ```

2.  **Iniciar el servidor de desarrollo**:

    ```bash
    npx expo start
    ```

3.  **Probar**:
    - Escanea el código QR con **Expo Go** (Android/iOS).
    - Presiona `a` para abrir en emulador Android.

## 📂 Arquitectura

El proyecto sigue una estructura modular para facilitar la escalabilidad:

- `src/modules/`: Contiene la lógica de negocio dividida por dominios (`auth`, `group`, `semester`, `activity`).
- `src/store/`: Stores globales de Zustand.
- `src/components/`: Componentes UI reutilizables (Botones, Inputs, DatePickers).
- `src/navigation/`: Configuración de rutas y navegación.
