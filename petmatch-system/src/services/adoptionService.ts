import { config } from '../config/env'; // Validador de entorno DevSecOps
import { PrismaClient, VisitStatus, EnergyLevel, AdopterStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export interface AdoptionRequestPayload {
  candidateId: string;
  animalId: string;
  questionnaireId: string;
}

export class AdoptionService {
  /**
   * Evalúa la elegibilidad de un candidato a adoptante procesando una solicitud de adopción.
   * Aplica reglas de negocio críticas que pueden bloquear automáticamente al candidato.
   * 
   * @param request Datos de la solicitud de adopción
   * @returns Un booleano indicando si el candidato puede proceder (true) o si fue bloqueado (false)
   */
  public static async evaluateAdopterEligibility(request: AdoptionRequestPayload): Promise<boolean> {
    const { candidateId, animalId, questionnaireId } = request;

    if (!candidateId || !animalId || !questionnaireId) {
      throw new Error('Faltan campos requeridos para la evaluación de adopción.');
    }

    try {
      // 1. Obtener al candidato con su historial de visitas de inspección
      const candidate = await prisma.adopterCandidate.findUnique({
        where: { id: candidateId },
        include: {
          inspectionVisits: true,
        },
      });

      if (!candidate) {
        throw new Error(`Candidato con ID ${candidateId} no encontrado.`);
      }

      // Si ya está bloqueado, no procesar más
      if (candidate.status === AdopterStatus.BLOCKED) {
        return false;
      }

      // REGLA A: Se bloquea si se le registra una "Visita Fallida" en el módulo de visitas.
      // La lógica evalúa si existe al menos una visita con status FAILED.
      const hasFailedInspection = candidate.inspectionVisits.some(
        (visit) => visit.status === VisitStatus.FAILED
      );

      if (hasFailedInspection) {
        await this.blockCandidate(candidateId, 'Se registró una visita de inspección fallida.');
        return false;
      }

      // 2. Obtener el animal para evaluar su nivel de energía
      const animal = await prisma.animal.findUnique({
        where: { id: animalId },
      });

      if (!animal) {
        throw new Error(`Animal con ID ${animalId} no encontrado.`);
      }

      // 3. Obtener el cuestionario de compatibilidad específico de esta solicitud
      const questionnaire = await prisma.compatibilityQuestionnaire.findUnique({
        where: { id: questionnaireId },
      });

      if (!questionnaire) {
        throw new Error(`Cuestionario con ID ${questionnaireId} no encontrado.`);
      }

      // REGLA B: Se bloquea si intenta adoptar una raza catalogada como "alta energía" 
      // Y su cuestionario de compatibilidad arroja que no tiene patio.
      if (animal.energyLevel === EnergyLevel.HIGH && !questionnaire.hasYard) {
        await this.blockCandidate(
          candidateId, 
          `Perfil incompatible: Intento de adopción de perro de alta energía sin tener patio en casa.`
        );
        return false;
      }

      // Si pasa todas las validaciones de negocio, el proceso de adopción puede continuar
      return true;

    } catch (error) {
      // Manejo de errores centralizado para el servicio
      console.error(`Error procesando la evaluación de adopción:`, error);
      throw error; 
    }
  }

  /**
   * Método privado auxiliar para cambiar el estado de un candidato a BLOQUEADO.
   * Aplica el principio de responsabilidad única para separar la lógica de escritura.
   */
  private static async blockCandidate(candidateId: string, reason: string): Promise<void> {
    console.warn(`[AdoptionService] Bloqueando candidato ${candidateId}. Razón: ${reason}`);
    
    await prisma.adopterCandidate.update({
      where: { id: candidateId },
      data: {
        status: AdopterStatus.BLOCKED,
      },
    });
  }
}

// Historial de Adopciones
export async function getAdoptionHistory() {
  return await prisma.adoptionContract.findMany({
    include: {
      animal: true,
      candidate: true
    },
    orderBy: { signedDate: 'desc' }
  });
}

// Reportes de Abuso
export async function getAbuseReports() {
  return await prisma.abuseReport.findMany({
    include: {
      animal: true
    },
    orderBy: { reportDate: 'desc' }
  });
}

export async function resolveAbuseReport(id: string) {
  return await prisma.abuseReport.update({
    where: { id },
    data: { resolved: true, updatedAt: new Date() }
  });
}

// Seguimientos Post-Adopción
export async function getFollowUps(candidateId: string) {
  return await prisma.postAdoptionFollowUp.findMany({
    where: { candidateId },
    orderBy: { followUpDate: 'desc' }
  });
}

export async function addFollowUp(data: { candidateId: string, condition: string, comments: string }) {
  return await prisma.postAdoptionFollowUp.create({
    data: {
      candidateId: data.candidateId,
      condition: data.condition,
      comments: data.comments,
      followUpDate: new Date()
    }
  });
}
