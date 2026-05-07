# PetMatch & Shelter

Un sistema moderno de administración, seguimiento médico y gestión de adopciones diseñado específicamente para refugios de animales.

## Descripción del Proyecto

PetMatch es una aplicación de escritorio multiplataforma (Windows y Linux) que permite a los administradores de refugios llevar un control estricto de los animales ingresados, gestionar a los candidatos interesados en adoptar, evaluar cuestionarios de compatibilidad (basados en las guías de la ASPCA) y llevar historiales médicos y reportes de abuso de manera centralizada.

El proyecto está diseñado bajo una arquitectura de monorepo que separa la interfaz gráfica construida con tecnologías web modernas, y un motor backend empaquetado como aplicación de escritorio nativa.

## Stack Tecnológico

- **Frontend:** React.js, Vite, Tailwind CSS v4, Material UI (MUI), Lucide React.
- **Backend / Desktop:** Electron, TypeScript, Node.js.
- **Base de Datos:** PostgreSQL (Relacional) y Prisma ORM.
- **Reportes:** jsPDF (Generación nativa de expedientes).

## Características Principales

- **Directorio Médico Avanzado:** Registro detallado de especies, control inteligente de vacunas (esenciales vs. opcionales) y alertas de estado de salud.
- **Matchmaking Inteligente:** Algoritmo de compatibilidad que cruza la información del estilo de vida del adoptante (horas solo, patio, presupuesto) con el nivel de energía del animal.
- **Reportes de Abuso:** Módulo de atención de alta prioridad para denuncias de maltrato animal.
- **Seguimiento Post-Adopción:** Bitácora de seguimiento para asegurar el bienestar a largo plazo de las mascotas adoptadas.
- **Generación de PDF Corporativos:** Exportación del historial de adopciones con calidad profesional usando el sistema de archivos nativo del usuario.

## Seguridad y DevSecOps

El repositorio fue diseñado implementando las mejores prácticas de seguridad:

1. **Ignorados Estrictos (`.gitignore`):** Los archivos de variables de entorno y los binarios de compilación nunca se exponen al control de versiones.
2. **Plantillas Seguras (`.env.example`):** Define la estructura de configuración requerida sin exponer credenciales.
3. **Módulo Validador (Crash Early):** El backend ejecuta un validador de configuración estricto antes de iniciar. Si falta una variable crítica (como `DATABASE_URL`), el sistema se detiene de inmediato, previniendo errores silenciosos o corrupción de la base de datos.

## Guía de Instalación y Uso

### 1. Requisitos Previos
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+ instalado y corriendo en el puerto 5432.

### 2. Configuración de la Base de Datos
Clona este repositorio y configura el archivo de entorno del backend:
```bash
cd petmatch-system
cp .env.example .env
```
Abre el archivo `.env` y sustituye los valores `dummy` por las credenciales reales de tu base de datos PostgreSQL local o remota.

Genera las tablas usando Prisma:
```bash
npx prisma db push
```

### 3. Desarrollo (Modo Dev)
Para arrancar el proyecto en modo de desarrollo, necesitas dos consolas.

**Consola 1 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

**Consola 2 (Backend/Electron):**
```bash
cd petmatch-system
npm install
NODE_ENV=development npx electron out/electron/main.js
```

### 4. Empaquetado Multiplataforma (Distribución)
El sistema incluye scripts automatizados que compilan tanto el frontend estático como el backend para generar instaladores independientes.

Dentro de la carpeta `petmatch-system`, ejecuta:
- Para generar un ejecutable universal en Linux (`.AppImage`):
  ```bash
  npm run pack:linux
  ```
- Para generar el instalador en Windows (`.exe`):
  ```bash
  npm run pack:windows
  ```
> **Nota:** Los archivos finales se depositarán automáticamente en el directorio `petmatch-system/release/`.

---

*Desarrollado para transformar la administración y el bienestar en refugios animales.*
