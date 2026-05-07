export const DOG_ESSENTIAL_VACCINES = [
  'Rabia',
  'Parvovirus canino',
  'Moquillo canino (Distemper)',
  'Adenovirus tipo 1 y 2'
];

export const DOG_OPTIONAL_VACCINES = [
  'Leptospirosis',
  'Bordetella bronchiseptica',
  'Parainfluenza canina',
  'Enfermedad de Lyme',
  'Leishmaniosis'
];

export const CAT_ESSENTIAL_VACCINES = [
  'Rabia',
  'Panleucopenia felina',
  'Calicivirus felino',
  'Rinotraqueítis viral felina'
];

export const CAT_OPTIONAL_VACCINES = [
  'Leucemia viral felina (FeLV)',
  'Clamidiosis felina',
  'Peritonitis Infecciosa Felina (PIF)',
  'Bordetella bronchiseptica'
];

/**
 * Checks if an animal has all of its essential vaccines.
 */
export function hasAllEssentialVaccines(species: string, appliedVaccines: string[]): boolean {
  if (!species) return false;
  
  const essentialList = species.toLowerCase() === 'perro' 
    ? DOG_ESSENTIAL_VACCINES 
    : CAT_ESSENTIAL_VACCINES;

  // We check if every vaccine in the essential list is present in the applied list.
  return essentialList.every(essential => 
    appliedVaccines.some(applied => applied.trim().toLowerCase() === essential.trim().toLowerCase())
  );
}
