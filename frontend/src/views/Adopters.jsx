import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

export default function Adopters() {
  const [candidates, setCandidates] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    async function loadCandidates() {
      if (window.api) {
        try {
          const data = await window.api.getCandidates();
          setCandidates(data);
        } catch (error) {
          console.error("Error loading candidates:", error);
        }
      }
    }
    loadCandidates();
  }, []);

  const handleOpenMatches = async (candidate) => {
    setSelectedCandidate(candidate);
    setMatchResult(null);
    setOpenModal(true);
    setLoadingMatch(true);

    try {
      if (window.api) {
        const result = await window.api.runMatchmaking(candidate.id);
        setMatchResult(result);
      }
    } catch (err) {
      console.error(err);
      setMatchResult({ success: false, reason: 'Error en el algoritmo.', matches: [] });
    } finally {
      setLoadingMatch(false);
    }
  };

  if (!candidates) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress /></Box>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Candidatos y Cuestionarios ASPCA</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona solicitudes de adopción y ejecuta el algoritmo de compatibilidad.</p>
        </div>
        <Chip label={`${candidates.length} Solicitudes`} color="primary" variant="outlined" />
      </div>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Candidato</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Propósito</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Vivienda / Estilo</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }} align="right">Algoritmo Match</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((row) => {
              const q = row.questionnaires && row.questionnaires[0];
              const isRedFlag = q && (q.adoptionPurpose === 'Guardia' || q.adoptionPurpose === 'Regalo');

              return (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#F5F7FA' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary">{(new Date(row.createdAt)).toLocaleDateString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    {q ? (
                      <Chip 
                        label={q.adoptionPurpose} 
                        size="small" 
                        color={isRedFlag ? 'error' : 'default'} 
                        icon={isRedFlag ? <ErrorOutlineRoundedIcon /> : undefined}
                      />
                    ) : (
                      <Typography variant="caption">Sin cuestionario</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {q && (
                      <Box>
                        <Typography variant="body2">{q.housingType} • {q.hasYard ? 'Con Patio' : 'Sin Patio'}</Typography>
                        <Typography variant="caption" color="text.secondary">{q.activityLevel} • {q.hoursAlone} hrs solos</Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ejecutar Matchmaking">
                      <Button 
                        variant="contained" 
                        color={isRedFlag ? 'error' : 'primary'}
                        size="small" 
                        startIcon={<AutoAwesomeRoundedIcon />}
                        onClick={() => handleOpenMatches(row)}
                        disabled={!q}
                        sx={{ borderRadius: 2 }}
                      >
                        Match
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Matchmaking */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        {selectedCandidate && (
          <>
            <DialogTitle sx={{ bgcolor: 'primary.dark', color: 'white', display: 'flex', alignItems: 'center' }}>
              <AutoAwesomeRoundedIcon sx={{ mr: 2 }} />
              Resultados de Emparejamiento: {selectedCandidate.fullName}
            </DialogTitle>
            <DialogContent dividers sx={{ p: 4, bgcolor: '#F8FAFC' }}>
              
              {loadingMatch ? (
                <Box display="flex" flexDirection="column" alignItems="center" my={5}>
                  <CircularProgress size={60} thickness={4} />
                  <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                    Calculando compatibilidad y buscando candidatos ideales...
                  </Typography>
                </Box>
              ) : matchResult ? (
                <Box>
                  <Typography variant="h6" color={matchResult.success ? 'success.main' : 'error.main'} gutterBottom>
                    {matchResult.success ? '✅ Emparejamiento Completado' : '❌ Alerta de Sistema'}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                    {matchResult.reason}
                  </Typography>

                  {matchResult.matches && matchResult.matches.length > 0 && (
                    <Grid container spacing={3}>
                      {matchResult.matches.map((m, idx) => (
                        <Grid item xs={12} sm={4} key={m.animal.id}>
                          <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', height: '100%', borderTop: `6px solid ${idx === 0 ? '#FFD700' : '#4CAF50'}` }}>
                            <PetsRoundedIcon sx={{ fontSize: 40, color: idx === 0 ? '#FFD700' : '#4CAF50', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>{m.animal.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{m.animal.species} • {m.animal.breed}</Typography>
                            
                            <Chip label={`Energía: ${m.animal.energyLevel}`} size="small" variant="outlined" sx={{ mb: 1, width: '100%' }} />
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F1F8E9', borderRadius: 2 }}>
                              <Typography variant="caption" color="success.dark" sx={{ fontWeight: 700 }}>PUNTAJE DE MATCH</Typography>
                              <Typography variant="h4" color="success.main" sx={{ fontWeight: 800 }}>{m.score}%</Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              ) : null}

            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenModal(false)} variant="contained">Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
