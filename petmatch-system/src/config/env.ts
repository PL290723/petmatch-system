import * as dotenv from 'dotenv';

// Cargar las variables desde el archivo .env si existe
dotenv.config();

/**
 * Patrón "Crash Early"
 * Esta función valida que todas las variables de entorno críticas estén presentes.
 * Si falta alguna, detiene la ejecución de la aplicación inmediatamente con un código de error (1),
 * previniendo que el backend corra en un estado inestable.
 */
function validateEnv() {
  const requiredVariables = ['DATABASE_URL'];
  const missingVariables: string[] = [];

  requiredVariables.forEach((variable) => {
    if (!process.env[variable]) {
      missingVariables.push(variable);
    }
  });

  if (missingVariables.length > 0) {
    console.error('====================================================');
    console.error('🔥 ERROR CRÍTICO DE SEGURIDAD / CONFIGURACIÓN 🔥');
    console.error('Faltan las siguientes variables de entorno obligatorias:');
    missingVariables.forEach(v => console.error(`  - ${v}`));
    console.error('Por favor, revisa tu archivo .env basado en .env.example');
    console.error('El sistema se detendrá por seguridad.');
    console.error('====================================================');
    
    // Crash Early
    process.exit(1);
  }

  // Aquí podemos opcionalmente advertir de variables no críticas (como JWT_SECRET o PORT)
  // que podrían tener valores por defecto, pero advertir al SysAdmin.
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ ADVERTENCIA: No se detectó JWT_SECRET en el entorno. Si usas la API de Auth, fallará.');
  }
}

// Ejecutar la validación inmediatamente al ser requerido este módulo
validateEnv();

export const config = {
  db: {
    url: process.env.DATABASE_URL as string,
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-do-not-use-in-production',
  }
};
