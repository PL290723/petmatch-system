import express from 'express';
import cors from 'cors';
import { config } from './config/env'; // Validador de entorno DevSecOps
import { prisma, AdoptionService, getAdoptionHistory, getAbuseReports, resolveAbuseReport, getFollowUps, addFollowUp } from './services/adoptionService';
import { runMatchmaking } from './services/matchmakingService';

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend (Vercel u otros dominios)
app.use(express.json({ limit: '10mb' }));

// ==========================================
// Rutas de la API (Sustituyen a los IPC de Electron)
// ==========================================

// 1. Dashboard Stats
app.get('/api/stats', async (req, res) => {
  try {
    const allAnimals = await prisma.animal.findMany({
      include: { vaccinations: true, medicalHistory: true }
    });
    
    const dogsCount = allAnimals.filter(a => a.species.toLowerCase() === 'perro').length;
    const catsCount = allAnimals.filter(a => a.species.toLowerCase() === 'gato').length;
    
    // Simplificación: Animales "Sanos" vs "En Tratamiento"
    const healthyCount = allAnimals.filter(a => !a.medicalHistory).length;
    const treatmentCount = allAnimals.filter(a => a.medicalHistory).length;

    res.json({
      totalAnimals: allAnimals.length,
      dogsCount,
      catsCount,
      healthyCount,
      treatmentCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
});

// 2. Animales
app.get('/api/animals', async (req, res) => {
  try {
    const animals = await prisma.animal.findMany({
      include: {
        vaccinations: true,
        medicalHistory: true,
        shelter: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener animales' });
  }
});

app.post('/api/animals', async (req, res) => {
  try {
    const animalData = req.body;
    
    // Replicando la lógica estricta de Electron main.ts
    // 1. Asegurar refugio y rescatista por defecto (simplificado)
    let defaultShelter = await prisma.shelter.findFirst();
    if (!defaultShelter) {
      defaultShelter = await prisma.shelter.create({
        data: { name: "Refugio Central PetMatch", address: "Calle Principal 123" }
      });
    }

    let defaultRescuer = await prisma.rescuer.findFirst();
    if (!defaultRescuer) {
      defaultRescuer = await prisma.rescuer.create({
        data: { name: "Administrador del Sistema", phone: "555-0000", shelterId: defaultShelter.id }
      });
    }

    // 2. Nested write de Prisma (Transacción atómica)
    const newAnimal = await prisma.animal.create({
      data: {
        name: animalData.name,
        species: animalData.species,
        breed: animalData.breed || 'Mestizo',
        energyLevel: animalData.energyLevel || 'MEDIUM',
        shelterId: defaultShelter.id,
        rescuerId: defaultRescuer.id,
        // Insertar vacunas iniciales seleccionadas
        vaccinations: animalData.appliedVaccines && animalData.appliedVaccines.length > 0 ? {
          create: animalData.appliedVaccines.map((vName: string) => ({
            vaccineName: vName,
            dateAdministered: new Date()
          }))
        } : undefined,
        // Insertar historial médico si requiere atención
        medicalHistory: animalData.needsMedicalAttention ? {
          create: {
            diagnosis: animalData.medicalDiagnosis || 'Evaluación inicial pendiente',
            treatment: animalData.medicalTreatment || 'Observación'
          }
        } : undefined
      }
    });

    res.json(newAnimal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el animal' });
  }
});

app.put('/api/animals/:id/vaccines', async (req, res) => {
  try {
    const { id } = req.params;
    const { appliedVaccines } = req.body;
    
    // Eliminar las anteriores (simplificación) e insertar nuevas
    await prisma.vaccinationSchedule.deleteMany({ where: { animalId: id } });
    
    if (appliedVaccines && appliedVaccines.length > 0) {
      await prisma.vaccinationSchedule.createMany({
        data: appliedVaccines.map((vName: string) => ({
          animalId: id,
          vaccineName: vName,
          dateAdministered: new Date()
        }))
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar vacunas' });
  }
});

// 3. Adopciones y Matchmaking
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await prisma.adopterCandidate.findMany({
      include: {
        questionnaires: true,
        inspectionVisits: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener candidatos' });
  }
});

app.post('/api/evaluations', async (req, res) => {
  try {
    const data = req.body;
    
    // Insertar Candidato + Cuestionario en transacción
    const candidate = await prisma.adopterCandidate.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        status: 'IN_PROCESS',
        questionnaires: {
          create: {
            housingType: data.housingType,
            homeOwnership: data.homeOwnership,
            hasYard: data.hasYard,
            yardFenced: data.yardFenced,
            kidsInHome: data.kidsInHome,
            allergies: data.allergies,
            familyAgreement: data.familyAgreement,
            hoursAlone: data.hoursAlone,
            activityLevel: data.activityLevel,
            travelFrequency: data.travelFrequency,
            hasOtherPets: data.hasOtherPets,
            hadPetsBefore: data.hadPetsBefore,
            hasVet: data.hasVet,
            monthlyBudget: data.monthlyBudget,
            adoptionPurpose: data.adoptionPurpose,
            returnConditions: data.returnConditions
          }
        }
      }
    });

    res.json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la evaluación' });
  }
});

app.post('/api/matchmaking/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const result = await runMatchmaking(candidateId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error ejecutando matchmaking' });
  }
});

app.get('/api/adoptions/history', async (req, res) => {
  try {
    const history = await getAdoptionHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// 4. Reportes de Abuso
app.get('/api/abuse-reports', async (req, res) => {
  try {
    const reports = await getAbuseReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo reportes' });
  }
});

app.put('/api/abuse-reports/:id/resolve', async (req, res) => {
  try {
    const result = await resolveAbuseReport(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al resolver reporte' });
  }
});

// 5. Seguimientos
app.get('/api/follow-ups/:candidateId', async (req, res) => {
  try {
    const result = await getFollowUps(req.params.candidateId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo seguimientos' });
  }
});

app.post('/api/follow-ups', async (req, res) => {
  try {
    const result = await addFollowUp(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error agregando seguimiento' });
  }
});

// Arrancar Servidor
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 PetMatch API Server corriendo en http://localhost:${PORT}`);
  console.log(`🔌 Conectado a la BD: ${config.db.url ? 'Éxito' : 'Fallo'}`);
});
