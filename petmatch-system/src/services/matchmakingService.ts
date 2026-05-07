import { prisma } from './adoptionService';
import { hasAllEssentialVaccines } from './vaccineConstants';

export async function runMatchmaking(candidateId: string) {
  const candidate = await prisma.adopterCandidate.findUnique({
    where: { id: candidateId },
    include: { questionnaires: true }
  });

  if (!candidate || !candidate.questionnaires || candidate.questionnaires.length === 0) {
    throw new Error('Candidato no encontrado o sin cuestionario.');
  }

  const q = candidate.questionnaires[0];

  // Filtros Rojos Automáticos (Descarto directo)
  if (['Guardia', 'Regalo'].includes(q.adoptionPurpose)) {
    return {
      success: false,
      reason: `El propósito de adopción (${q.adoptionPurpose}) va en contra de nuestras políticas institucionales. No se recomiendan matches.`,
      matches: []
    };
  }

  if (q.monthlyBudget < 500) {
    return {
      success: false,
      reason: 'El presupuesto mensual estimado es demasiado bajo para garantizar el bienestar médico y alimenticio de la mascota.',
      matches: []
    };
  }

  // Obtenemos a TODOS los animales
  const allAnimals = await prisma.animal.findMany({
    include: {
      vaccinations: true,
      medicalHistory: true,
      shelter: true
    }
  });

  // Filtramos los que están "Listos para Adopción"
  const readyAnimals = allAnimals.filter(animal => {
    if (animal.medicalHistory !== null) return false;
    const applied = animal.vaccinations.map(v => v.vaccineName);
    return hasAllEssentialVaccines(animal.species, applied);
  });

  // Puntuamos a cada animal listo
  const scoredMatches = readyAnimals.map(animal => {
    let score = 100;
    const isDog = animal.species.toLowerCase() === 'perro';

    // Penalización por horas solos vs Energía
    if (animal.energyLevel === 'HIGH' && q.hoursAlone >= 8) {
      score -= 40; // Muy mala idea dejar a un animal de alta energía solo todo el día
    }

    // Compatibilidad de Vivienda
    if (q.housingType === 'Departamento' && !q.hasYard) {
      if (animal.energyLevel === 'HIGH' && isDog) score -= 30;
      if (animal.energyLevel === 'LOW') score += 20; // Los departamentos van bien con baja energía
    }

    // Estilo de vida del adoptante
    if (q.activityLevel === 'SEDENTARY' && animal.energyLevel === 'HIGH') {
      score -= 50;
    } else if (q.activityLevel === 'HIGH' && animal.energyLevel === 'HIGH') {
      score += 20;
    }

    // Gatos vs Departamentos (excelente match)
    if (!isDog && q.housingType === 'Departamento') {
      score += 15;
    }

    // Aseguramos que el score no pase de 100% ni baje de 0%
    score = Math.max(0, Math.min(100, score));

    return { animal, score };
  });

  // Filtramos los que tengan menos de 50 puntos (incompatibles) y ordenamos
  const validMatches = scoredMatches
    .filter(match => match.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Tomamos el Top 3

  return {
    success: true,
    reason: validMatches.length > 0 ? 'Emparejamiento exitoso basado en variables de ASPCA.' : 'No encontramos un animal compatible actualmente.',
    matches: validMatches
  };
}
