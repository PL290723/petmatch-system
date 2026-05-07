import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider,
  TextField, MenuItem, Checkbox, FormControlLabel, FormGroup, InputAdornment, Tabs, Tab
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';

const DOG_ESSENTIAL = ['Rabia', 'Parvovirus canino', 'Moquillo canino (Distemper)', 'Adenovirus tipo 1 y 2'];
const DOG_OPTIONAL = ['Leptospirosis', 'Bordetella bronchiseptica', 'Parainfluenza canina', 'Enfermedad de Lyme', 'Leishmaniosis'];
const CAT_ESSENTIAL = ['Rabia', 'Panleucopenia felina', 'Calicivirus felino', 'Rinotraqueítis viral felina'];
const CAT_OPTIONAL = ['Leucemia viral felina (FeLV)', 'Clamidiosis felina', 'Peritonitis Infecciosa Felina (PIF)', 'Bordetella bronchiseptica'];

export default function Directory() {
  const [animals, setAnimals] = useState(null);
  const [filteredAnimals, setFilteredAnimals] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);

  // States for editing vaccines
  const [appliedVaccines, setAppliedVaccines] = useState([]);

  async function loadAnimals() {
    if (window.api) {
      try {
        const data = await window.api.getAnimals();
        const formatted = data.map(animal => {
          const isDog = animal.species.toLowerCase() === 'perro';
          const essentialList = isDog ? DOG_ESSENTIAL : CAT_ESSENTIAL;
          const applied = animal.vaccinations ? animal.vaccinations.map(v => v.vaccineName) : [];
          
          const hasAllEssential = essentialList.every(ess => applied.some(app => app.toLowerCase() === ess.toLowerCase()));
          const needsMedical = animal.medicalHistory !== null;
          
          let statusLabel = 'Pendiente de Atención';
          let statusColor = 'warning';
          let StatusIcon = ErrorOutlineRoundedIcon;

          if (needsMedical) {
            statusLabel = 'En Tratamiento';
            statusColor = 'error';
            StatusIcon = MedicalServicesRoundedIcon;
          } else if (hasAllEssential) {
            statusLabel = 'Listo para Adopción';
            statusColor = 'success';
            StatusIcon = CheckCircleRoundedIcon;
          }

          return {
            id: animal.id.substring(0, 8).toUpperCase(),
            fullId: animal.id,
            name: animal.name,
            species: animal.species,
            breed: animal.breed,
            energy: animal.energyLevel,
            statusLabel,
            statusColor,
            StatusIcon,
            rawDetails: animal,
            appliedVaccinesList: applied
          };
        });
        setAnimals(formatted);
        setFilteredAnimals(formatted);
      } catch (error) {
        console.error("Error loading animals:", error);
      }
    } else {
      setTimeout(() => { setAnimals([]); setFilteredAnimals([]); }, 1000);
    }
  }

  useEffect(() => {
    loadAnimals();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (!animals) return;
    let filtered = animals;

    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'Todos') {
      filtered = filtered.filter(a => a.statusLabel === statusFilter);
    }

    setFilteredAnimals(filtered);
  }, [searchQuery, statusFilter, animals]);

  const handleOpenDetails = (animal) => {
    setSelectedAnimal(animal);
    setAppliedVaccines(animal.appliedVaccinesList);
    setOpenDetailsModal(true);
  };

  const handleToggleVaccine = (vaccineName) => {
    setAppliedVaccines(prev => 
      prev.includes(vaccineName) ? prev.filter(v => v !== vaccineName) : [...prev, vaccineName]
    );
  };

  const handleSaveVaccines = async () => {
    try {
      if (window.api && selectedAnimal) {
        await window.api.updateAnimalVaccines(selectedAnimal.fullId, appliedVaccines);
        alert('Expediente de vacunas actualizado');
        setOpenDetailsModal(false);
        loadAnimals(); // Recargar para recalcular estado de salud
      }
    } catch (err) {
      alert('Error guardando vacunas');
    }
  };

  if (!filteredAnimals) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress /></Box>;
  }

  const isSelectedDog = selectedAnimal?.species?.toLowerCase() === 'perro';
  const essentialList = isSelectedDog ? DOG_ESSENTIAL : CAT_ESSENTIAL;
  const optionalList = isSelectedDog ? DOG_OPTIONAL : CAT_OPTIONAL;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Directorio Administrativo</h2>
          <p className="text-sm text-gray-500 mt-1">Busca, filtra y gestiona todos los registros y expedientes del refugio.</p>
        </div>
      </div>

      {/* Toolbar de Filtros */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 3, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar por nombre o ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment>,
          }}
        />
        <TextField
          select
          size="small"
          label="Filtrar Estado"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="Todos">Mostrar Todos</MenuItem>
          <MenuItem value="Listo para Adopción">Listos (Vacunados)</MenuItem>
          <MenuItem value="Pendiente de Atención">Pendientes</MenuItem>
          <MenuItem value="En Tratamiento">En Tratamiento Médico</MenuItem>
        </TextField>
        <Chip label={`${filteredAnimals.length} Resultados`} color="secondary" variant="outlined" />
      </Paper>

      {filteredAnimals.length === 0 ? (
        <Typography variant="body1" color="text.secondary">No se encontraron animales con esos filtros.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>ID Registro</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Especie / Raza</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Nivel Energía</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Estado Médico</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }} align="right">Expediente</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAnimals.map((row) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#F5F7FA' } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                      {row.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.species}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.breed}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.energy} size="small" variant="outlined" sx={{ fontWeight: 600, borderRadius: 1 }} />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<row.StatusIcon fontSize="small" />} 
                      label={row.statusLabel} 
                      color={row.statusColor} 
                      size="small" 
                      sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Abrir Expediente Médico">
                      <IconButton color="primary" size="small" onClick={() => handleOpenDetails(row)}>
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de Expediente Médico */}
      <Dialog open={openDetailsModal} onClose={() => setOpenDetailsModal(false)} maxWidth="md" fullWidth>
        {selectedAnimal && (
          <>
            <DialogTitle sx={{ bgcolor: 'primary.dark', color: 'white', display: 'flex', alignItems: 'center' }}>
              <PetsRoundedIcon sx={{ mr: 2 }} />
              Expediente: {selectedAnimal.name}
            </DialogTitle>
            <DialogContent dividers sx={{ p: 4 }}>
              <Grid container spacing={4}>
                {/* Lado izquierdo: Info General */}
                <Grid item xs={12} md={5}>
                  <Typography variant="h6" color="primary.main" gutterBottom>Información General</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">ID del Sistema</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedAnimal.id}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Especie y Raza</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedAnimal.species} ({selectedAnimal.breed})</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Estado Actual</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip icon={<selectedAnimal.StatusIcon fontSize="small" />} label={selectedAnimal.statusLabel} color={selectedAnimal.statusColor} />
                    </Box>
                  </Box>
                  
                  {selectedAnimal.rawDetails.medicalHistory && (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#FFF0F2', borderColor: '#FFCDD2', mt: 3 }}>
                      <Typography variant="subtitle2" color="error.dark" gutterBottom>Diagnóstico Médico Activo</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedAnimal.rawDetails.medicalHistory.diagnosis}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{selectedAnimal.rawDetails.medicalHistory.treatment}</Typography>
                    </Paper>
                  )}
                </Grid>

                {/* Lado derecho: Control de Vacunas */}
                <Grid item xs={12} md={7}>
                  <Typography variant="h6" color="primary.main" gutterBottom>Cartilla de Vacunación</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Para que el animal sea marcado como "Listo para Adopción", debe contar con todas las vacunas esenciales marcadas.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#D84315', mb: 1 }}>
                    Vacunas Esenciales (Obligatorias)
                  </Typography>
                  <FormGroup sx={{ mb: 3, pl: 1 }}>
                    {essentialList.map(vac => (
                      <FormControlLabel
                        key={vac}
                        control={<Checkbox color="success" checked={appliedVaccines.includes(vac)} onChange={() => handleToggleVaccine(vac)} />}
                        label={vac}
                      />
                    ))}
                  </FormGroup>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', mb: 1 }}>
                    Vacunas Opcionales
                  </Typography>
                  <FormGroup sx={{ pl: 1 }}>
                    {optionalList.map(vac => (
                      <FormControlLabel
                        key={vac}
                        control={<Checkbox checked={appliedVaccines.includes(vac)} onChange={() => handleToggleVaccine(vac)} />}
                        label={vac}
                      />
                    ))}
                  </FormGroup>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
              <Button onClick={() => setOpenDetailsModal(false)}>Cerrar</Button>
              <Button onClick={handleSaveVaccines} variant="contained" color="primary">Guardar Cartilla</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
