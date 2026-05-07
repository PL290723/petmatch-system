import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, 
  TextField, MenuItem, Checkbox, FormControlLabel, FormGroup, Typography, Box, Divider
} from '@mui/material';

const DOG_ESSENTIAL = ['Rabia', 'Parvovirus canino', 'Moquillo canino (Distemper)', 'Adenovirus tipo 1 y 2'];
const DOG_OPTIONAL = ['Leptospirosis', 'Bordetella bronchiseptica', 'Parainfluenza canina', 'Enfermedad de Lyme', 'Leishmaniosis'];
const CAT_ESSENTIAL = ['Rabia', 'Panleucopenia felina', 'Calicivirus felino', 'Rinotraqueítis viral felina'];
const CAT_OPTIONAL = ['Leucemia viral felina (FeLV)', 'Clamidiosis felina', 'Peritonitis Infecciosa Felina (PIF)', 'Bordetella bronchiseptica'];

export default function AnimalRegistrationModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Perro',
    breed: '',
    energyLevel: 'MEDIUM',
    needsMedical: false,
    diagnosis: '',
    treatment: '',
    vaccinations: []
  });

  const handleToggleVaccine = (vac) => {
    setFormData(prev => ({
      ...prev,
      vaccinations: prev.vaccinations.includes(vac) 
        ? prev.vaccinations.filter(v => v !== vac)
        : [...prev.vaccinations, vac]
    }));
  };

  const handleSpeciesChange = (e) => {
    setFormData({
      ...formData,
      species: e.target.value,
      vaccinations: [] // Reset vaccines when species changes
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (window.api) {
        await window.api.createAnimal(formData);
        
        // Reset form
        setFormData({
          name: '', species: 'Perro', breed: '', energyLevel: 'MEDIUM',
          needsMedical: false, diagnosis: '', treatment: '', vaccinations: []
        });
        
        onSuccess();
      }
    } catch (err) {
      alert('Error al registrar el animal');
      console.error(err);
    }
  };

  const isDog = formData.species === 'Perro';
  const essentialList = isDog ? DOG_ESSENTIAL : CAT_ESSENTIAL;
  const optionalList = isDog ? DOG_OPTIONAL : CAT_OPTIONAL;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
          Registrar Nuevo Ingreso en Refugio
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4, bgcolor: '#F8FAFC' }}>
          <Grid container spacing={4}>
            
            {/* Izquierda: Info Básica */}
            <Grid item xs={12} md={6}>
              <Box className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full">
                <Typography variant="h6" color="primary.dark" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  Información Básica
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField 
                      required fullWidth label="Nombre del Animal" size="small"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      select required fullWidth label="Especie" size="small"
                      value={formData.species} onChange={handleSpeciesChange}
                    >
                      <MenuItem value="Perro">Perro</MenuItem>
                      <MenuItem value="Gato">Gato</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      select required fullWidth label="Nivel de Energía" size="small"
                      value={formData.energyLevel} onChange={e => setFormData({...formData, energyLevel: e.target.value})}
                    >
                      <MenuItem value="LOW">Baja (Tranquilo)</MenuItem>
                      <MenuItem value="MEDIUM">Media</MenuItem>
                      <MenuItem value="HIGH">Alta (Muy Activo)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      required fullWidth label="Raza / Cruza (o color principal)" size="small"
                      value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} 
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" color="error.dark" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Estado de Salud
                </Typography>
                <FormControlLabel
                  control={<Checkbox color="error" checked={formData.needsMedical} onChange={e => setFormData({...formData, needsMedical: e.target.checked})} />}
                  label="¿El animal ingresa enfermo o herido?"
                />
                
                {formData.needsMedical && (
                  <Box className="mt-3 p-4 bg-red-50 border border-red-100 rounded-lg space-y-3">
                    <TextField 
                      required fullWidth label="Diagnóstico Inicial" size="small"
                      value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})}
                    />
                    <TextField 
                      required fullWidth multiline rows={2} label="Tratamiento o Cuidados Especiales" size="small"
                      value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Derecha: Vacunas */}
            <Grid item xs={12} md={6}>
              <Box className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full">
                <Typography variant="h6" color="primary.dark" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                  Cartilla de Vacunación de Ingreso
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Marca las vacunas que el animal YA trae aplicadas al momento de ingresar.
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#D84315', mb: 1 }}>
                  Esenciales (Obligatorias para Adopción)
                </Typography>
                <FormGroup sx={{ mb: 3, pl: 1 }}>
                  {essentialList.map(vac => (
                    <FormControlLabel
                      key={vac}
                      control={<Checkbox color="success" checked={formData.vaccinations.includes(vac)} onChange={() => handleToggleVaccine(vac)} />}
                      label={<span className="text-sm">{vac}</span>}
                    />
                  ))}
                </FormGroup>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', mb: 1 }}>
                  Opcionales
                </Typography>
                <FormGroup sx={{ pl: 1 }}>
                  {optionalList.map(vac => (
                    <FormControlLabel
                      key={vac}
                      control={<Checkbox checked={formData.vaccinations.includes(vac)} onChange={() => handleToggleVaccine(vac)} />}
                      label={<span className="text-sm">{vac}</span>}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, px: 4, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 'medium' }}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary" sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}>
            Completar Ingreso
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
