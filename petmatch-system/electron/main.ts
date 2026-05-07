import { config } from '../src/config/env'; // Cargar y validar variables de entorno ("Crash Early")
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { prisma } from '../src/services/adoptionService';
import { hasAllEssentialVaccines } from '../src/services/vaccineConstants';

// Determina si estamos en modo desarrollo observando las variables de entorno
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "PetMatch & Shelter",
    webPreferences: {
      // Para un entorno de producción estricto con arquitectura limpia, nodeIntegration 
      // debe ser false y se debe usar un contextBridge/preload script.
      // Se mantiene false por seguridad, asumiendo que el Frontend y el Backend 
      // se comunican vía IPC o API local.
      nodeIntegration: false,
      contextIsolation: true, 
      preload: path.join(__dirname, 'preload.js') // Archivo preload asumido
    },
  });

  if (isDev) {
    // Si estamos en desarrollo, cargar el servidor de Vite de React (por defecto 5173)
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar el build estático generado por Vite/React
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Ciclo de vida principal de Electron
app.whenReady().then(() => {
  // Manejadores IPC para la base de datos (PostgreSQL vía Prisma)
  ipcMain.handle('get-dashboard-stats', async () => {
    // Obtenemos todos los animales con sus relaciones para lógica estricta en TS
    const allAnimals = await prisma.animal.findMany({
      include: {
        vaccinations: true,
        medicalHistory: true
      }
    });

    const totalAnimals = allAnimals.length;
    
    // Conteo por especie
    const speciesData = [
      { name: 'Perro', value: allAnimals.filter(a => a.species.toLowerCase() === 'perro').length },
      { name: 'Gato', value: allAnimals.filter(a => a.species.toLowerCase() === 'gato').length }
    ].filter(i => i.value > 0);

    // Conteo por energía
    const energyMap: Record<string, string> = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta' };
    const energyCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    allAnimals.forEach(a => energyCounts[a.energyLevel as keyof typeof energyCounts]++);
    
    const energyData = Object.entries(energyCounts).map(([key, value]) => ({
      name: energyMap[key],
      value
    })).filter(i => i.value > 0);

    // Lógica Estricta de Salud
    let medicalCases = 0;
    let readyAnimals = 0;
    let pendingAnimals = 0;

    for (const animal of allAnimals) {
      if (animal.medicalHistory !== null) {
        medicalCases++;
      } else {
        // Evaluamos si tiene todas las vacunas esenciales
        const applied = animal.vaccinations.map(v => v.vaccineName);
        const isReady = hasAllEssentialVaccines(animal.species, applied);
        if (isReady) {
          readyAnimals++;
        } else {
          pendingAnimals++;
        }
      }
    }

    // Construimos la data de salud para el gráfico de pastel
    const healthData = [
      { name: 'Listos para Adopción', value: readyAnimals, color: '#2E7D32' },
      { name: 'Pendientes (Faltan Vacunas)', value: pendingAnimals, color: '#ED6C02' },
      { name: 'En Tratamiento', value: medicalCases, color: '#D32F2F' }
    ].filter(item => item.value > 0); // No mostrar los que están en cero

    const activeAdoptions = await prisma.adopterCandidate.count({ where: { status: 'IN_PROCESS' } });
    
    return { 
      totalAnimals, 
      activeAdoptions,
      speciesData,
      energyData,
      healthData
    };
  });

  ipcMain.handle('get-animals', async () => {
    return await prisma.animal.findMany({
      include: {
        vaccinations: true,
        medicalHistory: true
      },
      orderBy: { createdAt: 'desc' }
    });
  });

  ipcMain.handle('submit-evaluation', async (event, formData) => {
    return await prisma.adopterCandidate.create({
      data: {
        fullName: formData.fullName,
        email: formData.email || 'correo@example.com',
        phone: formData.phone || '0000000000',
        status: 'IN_PROCESS',
        questionnaires: {
          create: {
            housingType: formData.housingType,
            homeOwnership: formData.homeOwnership,
            hasYard: formData.hasYard === 'si',
            yardFenced: formData.yardFenced === 'si',
            kidsInHome: formData.kidsInHome === 'si',
            allergies: formData.allergies === 'si',
            familyAgreement: formData.familyAgreement === 'si',
            
            hoursAlone: parseInt(formData.hoursAlone) || 0,
            activityLevel: formData.activityLevel,
            travelFrequency: formData.travelFrequency,
            
            hasOtherPets: formData.hasOtherPets === 'si',
            hadPetsBefore: formData.hadPetsBefore === 'si',
            hasVet: formData.hasVet === 'si',
            
            monthlyBudget: parseFloat(formData.monthlyBudget) || 0,
            adoptionPurpose: formData.adoptionPurpose,
            returnConditions: formData.returnConditions
          }
        }
      }
    });
  });

  ipcMain.handle('create-animal', async (event, data) => {
    const mainShelter = await prisma.shelter.findFirst();
    if (!mainShelter) throw new Error("No hay refugio principal registrado");

    return await prisma.animal.create({
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed,
        energyLevel: data.energyLevel,
        shelterId: mainShelter.id,
        vaccinations: data.vaccinations && data.vaccinations.length > 0 ? {
          create: data.vaccinations.map((vacName: string) => ({
            vaccineName: vacName,
            dateAdministered: new Date()
          }))
        } : undefined,
        medicalHistory: data.needsMedical && data.diagnosis && data.treatment ? {
          create: {
            diagnosis: data.diagnosis,
            treatment: data.treatment
          }
        } : undefined
      }
    });
  });

  ipcMain.handle('update-animal-vaccines', async (event, { id, appliedVaccines }) => {
    // Primero, borramos todas las vacunas actuales
    await prisma.vaccinationSchedule.deleteMany({
      where: { animalId: id }
    });

    // Luego, insertamos la nueva lista
    if (appliedVaccines && appliedVaccines.length > 0) {
      await prisma.vaccinationSchedule.createMany({
        data: appliedVaccines.map((v: string) => ({
          animalId: id,
          vaccineName: v,
          dateAdministered: new Date()
        }))
      });
    }
    return { success: true };
  });

  ipcMain.handle('get-candidates', async () => {
    return await prisma.adopterCandidate.findMany({
      include: { questionnaires: true },
      orderBy: { createdAt: 'desc' }
    });
  });

  ipcMain.handle('run-matchmaking', async (event, candidateId) => {
    const { runMatchmaking } = require('../src/services/matchmakingService');
    return await runMatchmaking(candidateId);
  });

  ipcMain.handle('get-adoption-history', async () => {
    const { getAdoptionHistory } = require('../src/services/adoptionService');
    return await getAdoptionHistory();
  });

  ipcMain.handle('get-abuse-reports', async () => {
    const { getAbuseReports } = require('../src/services/adoptionService');
    return await getAbuseReports();
  });

  ipcMain.handle('resolve-abuse-report', async (event, id) => {
    const { resolveAbuseReport } = require('../src/services/adoptionService');
    return await resolveAbuseReport(id);
  });

  ipcMain.handle('get-follow-ups', async (event, candidateId) => {
    const { getFollowUps } = require('../src/services/adoptionService');
    return await getFollowUps(candidateId);
  });

  ipcMain.handle('add-follow-up', async (event, data) => {
    const { addFollowUp } = require('../src/services/adoptionService');
    return await addFollowUp(data);
  });

  ipcMain.handle('save-pdf', async (event, filename, base64Data) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Guardar Reporte PDF',
      defaultPath: filename,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (filePath) {
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
      return { success: true, path: filePath };
    }
    return { success: false, canceled: true };
  });

  createWindow();

  app.on('activate', () => {
    // Convención de macOS: Recrear la ventana si se hace clic en el dock 
    // y no hay ventanas abiertas
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Salir de la aplicación cuando todas las ventanas se cierran,
  // respetando el comportamiento nativo de macOS (darwin)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
