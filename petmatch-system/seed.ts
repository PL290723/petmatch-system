import 'dotenv/config';
import { EnergyLevel } from '@prisma/client';
import { prisma } from './src/services/adoptionService';
import { DOG_ESSENTIAL_VACCINES, DOG_OPTIONAL_VACCINES, CAT_ESSENTIAL_VACCINES, CAT_OPTIONAL_VACCINES } from './src/services/vaccineConstants';

const dogNames = ['Max', 'Bella', 'Rocky', 'Luna', 'Toby', 'Daisy', 'Milo', 'Nala', 'Zeus', 'Coco', 'Bruno', 'Kira', 'Jack', 'Mia', 'Odin', 'Lola'];
const dogBreeds = ['Mestizo', 'Golden Retriever', 'Labrador', 'Pug', 'Husky', 'Beagle', 'Poodle', 'Chihuahua', 'Pitbull', 'Bulldog'];
const catBreeds = ['Mestizo', 'Siamés', 'Persa', 'Angora', 'Maine Coon'];
const catNames = ['Mishi', 'Simba', 'Pelusa', 'Michi', 'Felix', 'Luna', 'Garfiel', 'Tom'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Limpiando base de datos y preparando sembrado masivo...');
  
  // Limpiar en orden inverso de dependencias
  await prisma.postAdoptionFollowUp.deleteMany();
  await prisma.adoptionContract.deleteMany();
  await prisma.abuseReport.deleteMany();
  await prisma.compatibilityQuestionnaire.deleteMany();
  await prisma.adopterCandidate.deleteMany();
  await prisma.vaccinationSchedule.deleteMany();
  await prisma.medicalHistory.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.shelter.deleteMany();

  const mainShelter = await prisma.shelter.create({
    data: {
      name: 'Refugio Central PetMatch',
      address: 'Av. Esperanza 404'
    }
  });

  console.log('Generando 200 animales y sus historiales estrictos...');

  for (let i = 0; i < 200; i++) {
    const isDog = Math.random() > 0.3; // 70% perros, 30% gatos
    const species = isDog ? 'Perro' : 'Gato';
    const breed = isDog ? randomElement(dogBreeds) : randomElement(catBreeds);
    const name = isDog ? randomElement(dogNames) : randomElement(catNames);
    const energy = randomElement([EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH]);

    // Lógica Estricta de Vacunas:
    // 40% tendrá TODAS las esenciales. 30% le faltarán. 30% no tendrá ninguna.
    let appliedVaccines: string[] = [];
    const rnd = Math.random();
    
    if (rnd < 0.4) {
      // Tiene todas las esenciales
      appliedVaccines = isDog ? [...DOG_ESSENTIAL_VACCINES] : [...CAT_ESSENTIAL_VACCINES];
      // Le agregamos 1 opcional a veces
      if (Math.random() > 0.5) appliedVaccines.push(randomElement(isDog ? DOG_OPTIONAL_VACCINES : CAT_OPTIONAL_VACCINES));
    } else if (rnd < 0.7) {
      // Solo tiene algunas (incompleto)
      appliedVaccines = isDog ? [DOG_ESSENTIAL_VACCINES[0], DOG_ESSENTIAL_VACCINES[1]] : [CAT_ESSENTIAL_VACCINES[0]];
    }

    const needsMedical = Math.random() > 0.85; // 15% con tratamiento

    await prisma.animal.create({
      data: {
        name: name,
        species,
        breed,
        energyLevel: energy,
        shelterId: mainShelter.id,
        vaccinations: appliedVaccines.length > 0 ? {
          create: appliedVaccines.map(vac => ({
            vaccineName: vac,
            dateAdministered: new Date()
          }))
        } : undefined,
        medicalHistory: needsMedical ? {
          create: {
            diagnosis: randomElement(['Desnutrición severa', 'Herida en pata', 'Infección ocular', 'Sarna']),
            treatment: 'Antibióticos y dieta especial por 2 semanas.'
          }
        } : undefined
      }
    });
  }

  console.log('Generando 200 Candidatos a Adoptantes con cuestionarios ASPCA...');

  const firstNames = ['Carlos', 'María', 'José', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofía', 'Miguel', 'Lucía', 'Jorge', 'Elena'];
  const lastNames = ['García', 'Martínez', 'López', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez'];
  
  for (let j = 0; j < 200; j++) {
    const fn = randomElement(firstNames);
    const ln = randomElement(lastNames);
    
    await prisma.adopterCandidate.create({
      data: {
        fullName: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${j}@test.com`,
        phone: `555000${j.toString().padStart(4, '0')}`,
        status: 'IN_PROCESS',
        questionnaires: {
          create: {
            // Vivienda
            housingType: randomElement(['Casa', 'Departamento', 'Rancho']),
            homeOwnership: randomElement(['Propia', 'Rentada']),
            hasYard: Math.random() > 0.4,
            yardFenced: Math.random() > 0.5,
            kidsInHome: Math.random() > 0.6,
            allergies: Math.random() > 0.9, // 10% alergias
            familyAgreement: true,

            // Estilo
            hoursAlone: randomElement([2, 5, 8, 10]),
            activityLevel: randomElement(['SEDENTARY', 'MODERATE', 'HIGH']),
            travelFrequency: randomElement(['LOW', 'MEDIUM', 'HIGH']),

            // Historial
            hasOtherPets: Math.random() > 0.5,
            hadPetsBefore: Math.random() > 0.2,
            hasVet: Math.random() > 0.5,

            // Finanzas
            monthlyBudget: randomElement([300, 800, 1500, 2500]),
            adoptionPurpose: randomElement(['Compañía', 'Compañía', 'Compañía', 'Guardia', 'Regalo']), // Mayoría compañía
            returnConditions: 'Solo en caso de mudanza extrema.'
          }
        }
      }
    });
  }

  console.log('Generando historial de adopciones (Nov 2025 - May 2026)...');

  // Recuperar todos los animales listos y adoptantes aprobados para simular adopciones pasadas
  const allAnimals = await prisma.animal.findMany();
  const allCandidates = await prisma.adopterCandidate.findMany();

  // Historial deseado por meses (0-based en JS, Nov=10, Dic=11, Ene=0...)
  const targetAdoptions = [
    { year: 2025, month: 10, count: 12 }, // Nov
    { year: 2025, month: 11, count: 19 }, // Dic
    { year: 2026, month: 0, count: 15 },  // Ene
    { year: 2026, month: 1, count: 22 },  // Feb
    { year: 2026, month: 2, count: 28 },  // Mar
    { year: 2026, month: 3, count: 35 },  // Abr
    { year: 2026, month: 4, count: 8 },   // May (hasta ahora)
  ];

  let currentAnimalIdx = 0;
  let currentCandidateIdx = 0;

  for (const target of targetAdoptions) {
    for (let k = 0; k < target.count; k++) {
      if (currentAnimalIdx >= allAnimals.length || currentCandidateIdx >= allCandidates.length) break;

      const animal = allAnimals[currentAnimalIdx++];
      const candidate = allCandidates[currentCandidateIdx++];

      const date = new Date(target.year, target.month, Math.floor(Math.random() * 28) + 1);

      // Crear contrato
      await prisma.adoptionContract.create({
        data: {
          animalId: animal.id,
          candidateId: candidate.id,
          signedDate: date,
          termsAccepted: true,
          createdAt: date
        }
      });

      // Crear un seguimiento (follow-up) para algunas de las adopciones pasadas
      if (Math.random() > 0.5) {
        const followUpDate = new Date(date);
        followUpDate.setDate(followUpDate.getDate() + 15); // 15 días después
        await prisma.postAdoptionFollowUp.create({
          data: {
            candidateId: candidate.id,
            followUpDate: followUpDate,
            condition: randomElement(['Excelente', 'Buena', 'Regular - En adaptación']),
            comments: 'La familia reporta que el animal come bien y duerme adentro.'
          }
        });
      }
    }
  }

  console.log('Generando 4 Reportes de Abuso pendientes...');
  for (let r = 0; r < 4; r++) {
    const animal = randomElement(allAnimals);
    await prisma.abuseReport.create({
      data: {
        animalId: animal.id,
        reporterName: `Denunciante Anónimo ${r+1}`,
        description: randomElement([
          'Vecinos reportan que el animal llora todo el día amarrado.',
          'Se observa al perro en la azotea sin sombra ni agua.',
          'Posible caso de violencia física por parte del dueño.',
          'El animal se escapó y se ve en estado grave de desnutrición.'
        ]),
        resolved: false,
        reportDate: new Date()
      }
    });
  }

  console.log('¡Sembrado Masivo Completado Exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
