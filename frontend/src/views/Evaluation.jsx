import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Stepper, Step, StepLabel, Button, Grid, TextField, 
  MenuItem, FormControlLabel, Checkbox, Divider, Alert 
} from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const steps = [
  'Vivienda y Entorno',
  'Estilo de Vida',
  'Historial con Mascotas',
  'Finanzas y Compromiso'
];

export default function Evaluation() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    
    // Step 1
    housingType: 'Casa',
    homeOwnership: 'Propia',
    hasYard: 'si',
    yardFenced: 'si',
    kidsInHome: 'no',
    allergies: 'no',
    familyAgreement: 'si',

    // Step 2
    hoursAlone: '0',
    activityLevel: 'MODERATE',
    travelFrequency: 'LOW',

    // Step 3
    hasOtherPets: 'no',
    hadPetsBefore: 'si',
    hasVet: 'si',

    // Step 4
    monthlyBudget: '500',
    adoptionPurpose: 'Compañía',
    returnConditions: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (window.api) {
        await window.api.submitEvaluation(formData);
        setSubmitted(true);
      }
    } catch (err) {
      alert("Error al enviar el formulario.");
      console.error(err);
    }
  };

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Vivienda
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 1 }}>
            <Box>
              <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>Datos de Contacto</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>Nombre Completo *</Typography>
                  <TextField fullWidth required name="fullName" value={formData.fullName} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>Correo Electrónico *</Typography>
                  <TextField fullWidth required name="email" type="email" value={formData.email} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>Teléfono *</Typography>
                  <TextField fullWidth required name="phone" value={formData.phone} onChange={handleChange} />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>Características de la Vivienda</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>Tipo de Vivienda</Typography>
                  <TextField select fullWidth name="housingType" value={formData.housingType} onChange={handleChange}>
                    <MenuItem value="Casa">Casa</MenuItem>
                    <MenuItem value="Departamento">Departamento</MenuItem>
                    <MenuItem value="Rancho">Rancho o Finca</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>Propiedad</Typography>
                  <TextField select fullWidth name="homeOwnership" value={formData.homeOwnership} onChange={handleChange}>
                    <MenuItem value="Propia">Propia</MenuItem>
                    <MenuItem value="Rentada">Rentada (Con Carta)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>¿Están todos de acuerdo?</Typography>
                  <TextField select fullWidth name="familyAgreement" value={formData.familyAgreement} onChange={handleChange}>
                    <MenuItem value="si">Sí, todos</MenuItem>
                    <MenuItem value="no">No, alguien se opone</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>¿Tiene patio?</Typography>
                  <TextField select fullWidth name="hasYard" value={formData.hasYard} onChange={handleChange}>
                    <MenuItem value="si">Sí</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>¿El patio está bardado/cercado adecuadamente?</Typography>
                  <TextField select fullWidth name="yardFenced" value={formData.yardFenced} onChange={handleChange}>
                    <MenuItem value="si">Sí, adecuadamente</MenuItem>
                    <MenuItem value="no">No / No aplica</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>¿Hay niños pequeños en casa?</Typography>
                  <TextField select fullWidth name="kidsInHome" value={formData.kidsInHome} onChange={handleChange}>
                    <MenuItem value="si">Sí</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>¿Alguien en la familia tiene alergias a animales?</Typography>
                  <TextField select fullWidth name="allergies" value={formData.allergies} onChange={handleChange}>
                    <MenuItem value="si">Sí</MenuItem>
                    <MenuItem value="no">No / No sabemos</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      case 1: // Estilo de Vida
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>Rutina Diaria</Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>¿Cuántas horas seguidas pasará el animal solo al día?</Typography>
              <TextField 
                fullWidth 
                type="number" 
                name="hoursAlone" 
                value={formData.hoursAlone} 
                onChange={handleChange} 
                helperText="Sea honesto, esto evita sugerirle animales con ansiedad por separación." 
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>Nivel de Actividad Familiar</Typography>
              <TextField 
                select 
                fullWidth 
                name="activityLevel" 
                value={formData.activityLevel} 
                onChange={handleChange} 
                helperText="¿Suelen salir a correr o prefieren quedarse en casa?"
              >
                <MenuItem value="SEDENTARY">Sedentario (Caminatas cortas)</MenuItem>
                <MenuItem value="MODERATE">Moderado (Paseos diarios activos)</MenuItem>
                <MenuItem value="HIGH">Muy Activo (Deporte intenso, senderismo)</MenuItem>
              </TextField>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>Frecuencia de Viajes</Typography>
              <TextField 
                select 
                fullWidth 
                name="travelFrequency" 
                value={formData.travelFrequency} 
                onChange={handleChange}
              >
                <MenuItem value="LOW">Poco o nunca viajo</MenuItem>
                <MenuItem value="MEDIUM">Algunos fines de semana</MenuItem>
                <MenuItem value="HIGH">Viajamos constantemente</MenuItem>
              </TextField>
            </Box>
          </Box>
        );
      case 2: // Historial Mascotas
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 1 }}>
            <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>Experiencia Previa</Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>¿Tiene otras mascotas actualmente en su hogar?</Typography>
              <TextField select fullWidth name="hasOtherPets" value={formData.hasOtherPets} onChange={handleChange}>
                <MenuItem value="si">Sí</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>¿Ha tenido mascotas en los últimos 5 años?</Typography>
              <TextField select fullWidth name="hadPetsBefore" value={formData.hadPetsBefore} onChange={handleChange}>
                <MenuItem value="si">Sí, pero fallecieron/fueron dadas en adopción</MenuItem>
                <MenuItem value="no">No, será mi primera mascota en mucho tiempo</MenuItem>
              </TextField>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>¿Cuenta con un Médico Veterinario de confianza?</Typography>
              <TextField select fullWidth name="hasVet" value={formData.hasVet} onChange={handleChange} helperText="Le pediremos sus datos si el proceso avanza a validación.">
                <MenuItem value="si">Sí, ya tengo uno</MenuItem>
                <MenuItem value="no">No, necesito recomendaciones del refugio</MenuItem>
              </TextField>
            </Box>
          </Box>
        );
      case 3: // Finanzas y Expectativas
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 1 }}>
            <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>Compromiso a Largo Plazo</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>Presupuesto Mensual Estimado (Comida, Vet)</Typography>
                <TextField 
                  fullWidth 
                  type="number" 
                  name="monthlyBudget" 
                  value={formData.monthlyBudget} 
                  onChange={handleChange} 
                  InputProps={{ startAdornment: <Typography sx={{mr:1}}>$</Typography> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>Propósito principal de la adopción</Typography>
                <TextField select fullWidth name="adoptionPurpose" value={formData.adoptionPurpose} onChange={handleChange}>
                  <MenuItem value="Compañía">Animal de Compañía (Familia)</MenuItem>
                  <MenuItem value="Guardia">Para Guardia o Seguridad</MenuItem>
                  <MenuItem value="Regalo">Para regalar a un tercero</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>Casos Hipotéticos: ¿Bajo qué circunstancia devolvería al animal?</Typography>
              <TextField 
                fullWidth 
                multiline 
                rows={4} 
                name="returnConditions" 
                value={formData.returnConditions} 
                onChange={handleChange} 
                placeholder="Ej. Si me mudo de país, si ataca a algún miembro de la familia, si no tengo tiempo, etc."
              />
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  if (submitted) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CheckCircleRoundedIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" color="primary.main" gutterBottom>¡Cuestionario ASPCA Enviado!</Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 500 }}>
          Sus respuestas han sido ingresadas al motor de Matchmaking. En la sección de "Candidatos" el administrador podrá calcular su compatibilidad.
        </Typography>
        <Button variant="outlined" sx={{ mt: 4 }} onClick={() => { setSubmitted(false); setActiveStep(0); }}>
          Enviar otra solicitud de prueba
        </Button>
      </Box>
    );
  }

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        return formData.fullName.trim() !== '' && 
               formData.email.trim() !== '' && 
               formData.phone.trim() !== '';
      case 1:
        return formData.hoursAlone !== '';
      case 2:
        return true; 
      case 3:
        return formData.monthlyBudget !== ''; // returnConditions opcional
      default:
        return true;
    }
  };

  const isNextDisabled = !validateStep();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <AssignmentRoundedIcon fontSize="large" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formulario de Adopción</h2>
          <p className="text-sm text-gray-500 mt-1">Este formulario recopila variables cualitativas y cuantitativas para nuestro sistema de compatibilidad.</p>
        </div>
      </div>

      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ overflowX: 'auto', mb: 5 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ minWidth: 400 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ mb: 4, minHeight: 300 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 2, pt: 3, borderTop: '1px solid #E0E0E0' }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Atrás
          </Button>
          <Box sx={{ flex: '1 1 auto', display: { xs: 'none', sm: 'block' } }} />
          {activeStep === steps.length - 1 ? (
            <Button disabled={isNextDisabled} variant="contained" onClick={handleSubmit} sx={{ width: { xs: '100%', sm: 'auto' }, py: { xs: 1.5, sm: 1 } }}>
              Finalizar y Enviar
            </Button>
          ) : (
            <Button disabled={isNextDisabled} variant="contained" onClick={handleNext} sx={{ width: { xs: '100%', sm: 'auto' }, py: { xs: 1.5, sm: 1 } }}>
              Siguiente
            </Button>
          )}
        </Box>
      </Paper>
    </div>
  );
}
