import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileDown, Calendar, Search, Activity, Phone, Mail, User, ShieldCheck
} from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from '@mui/material';

export default function AdoptionHistory() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selector de Mes y Año (Default al mes actual)
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Modal Seguimiento
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [openFollowUpModal, setOpenFollowUpModal] = useState(false);
  
  const [newCondition, setNewCondition] = useState('Excelente');
  const [newComment, setNewComment] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (window.api) {
        const data = await window.api.getAdoptionHistory();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    // Filtrar por mes y año seleccionado
    const filtered = history.filter(h => {
      const d = new Date(h.signedDate);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
    setFilteredHistory(filtered);
  }, [history, selectedMonth, selectedYear]);

  const loadFollowUps = async (candidateId) => {
    if (window.api) {
      const data = await window.api.getFollowUps(candidateId);
      setFollowUps(data);
    }
  };

  const handleOpenFollowUp = (adoption) => {
    setSelectedAdoption(adoption);
    loadFollowUps(adoption.candidateId);
    setOpenFollowUpModal(true);
  };

  const handleSaveFollowUp = async () => {
    if (!newComment.trim()) return;
    try {
      if (window.api) {
        await window.api.addFollowUp({
          candidateId: selectedAdoption.candidateId,
          condition: newCondition,
          comments: newComment
        });
        setNewComment('');
        loadFollowUps(selectedAdoption.candidateId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportPDF = async () => {
    const doc = new jsPDF();
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString('es-ES', { month: 'long' });
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // Blue 800
    doc.text('PetMatch System', 14, 22);
    
    doc.setFontSize(14);
    doc.setTextColor(75, 85, 99); // Gray 600
    doc.text(`Reporte Oficial de Adopciones`, 14, 32);
    doc.setFontSize(12);
    doc.text(`Periodo: ${monthName.toUpperCase()} ${selectedYear}`, 14, 40);
    doc.text(`Total de adopciones: ${filteredHistory.length}`, 14, 46);

    const tableColumn = ["Fecha", "Adoptante", "Animal Adoptado", "Especie / Raza", "Términos Aceptados"];
    const tableRows = [];

    filteredHistory.forEach(adoption => {
      const date = new Date(adoption.signedDate).toLocaleDateString('es-MX');
      const adoptionData = [
        date,
        adoption.candidate.fullName,
        adoption.animal.name,
        `${adoption.animal.species} (${adoption.animal.breed})`,
        adoption.termsAccepted ? 'Sí' : 'No'
      ];
      tableRows.push(adoptionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }, // Blue 600
      styles: { fontSize: 10, cellPadding: 4 }
    });

    const filename = `Adopciones_${monthName}_${selectedYear}.pdf`;

    if (window.api && window.api.savePdf) {
      // Electron context
      try {
        const dataUri = doc.output('datauristring');
        const base64String = dataUri.split(',')[1];
        
        const result = await window.api.savePdf(filename, base64String);
        if (result && result.success) {
          alert(`Reporte guardado exitosamente en:\n${result.path}`);
        } else if (result && result.canceled) {
          console.log('Exportación cancelada por el usuario.');
        } else {
          alert('Hubo un error al guardar el archivo.');
        }
      } catch (e) {
        console.error("Error exportando PDF:", e);
        alert(`Error exportando PDF: ${e.message}`);
        // Fallback web
        doc.save(filename);
      }
    } else {
      // Fallback web browser
      doc.save(filename);
    }
  };

  const months = [
    { value: 0, label: 'Enero' }, { value: 1, label: 'Febrero' }, { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' }, { value: 4, label: 'Mayo' }, { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' }, { value: 7, label: 'Agosto' }, { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' }, { value: 10, label: 'Noviembre' }, { value: 11, label: 'Diciembre' }
  ];

  const years = [2025, 2026];

  if (loading) {
    return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header y Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Adopciones del Mes</h2>
          <p className="text-sm text-gray-500 mt-1">Consulta el historial de contratos y realiza seguimientos post-adopción.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent border-none text-sm font-medium text-gray-700 outline-none pr-2 py-1 cursor-pointer"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <span className="text-gray-300">|</span>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent border-none text-sm font-medium text-gray-700 outline-none pl-2 py-1 cursor-pointer"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <FileDown size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha de Contrato</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Adoptante</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Animal Adoptado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Legal</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No hay registros de adopción para este mes.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(item.signedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{item.candidate.fullName}</p>
                      <p className="text-xs text-gray-500">{item.candidate.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-blue-600">{item.animal.name}</p>
                      <p className="text-xs text-gray-500">{item.animal.species} • {item.animal.breed}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <ShieldCheck size={14} /> Contrato Firmado
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenFollowUp(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        Ver Seguimiento
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Seguimiento Post-Adopción (usando un mix de MUI y Tailwind para agilizar) */}
      <Dialog open={openFollowUpModal} onClose={() => setOpenFollowUpModal(false)} maxWidth="md" fullWidth>
        {selectedAdoption && (
          <>
            <DialogTitle sx={{ p: 0 }}>
              <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity size={20} /> Seguimiento Post-Adopción
                </h3>
              </div>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 min-h-[400px]">
                
                {/* Lado Izquierdo: Info de Contacto */}
                <div className="bg-gray-50 p-6 border-r border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 uppercase mb-4">Información de Contacto</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User size={14}/> Adoptante</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedAdoption.candidate.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail size={14}/> Correo</p>
                      <p className="text-sm text-gray-900 break-words">{selectedAdoption.candidate.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone size={14}/> Teléfono</p>
                      <p className="text-sm text-gray-900">{selectedAdoption.candidate.phone}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 mt-4">
                      <p className="text-xs text-gray-500 mb-1">Animal en custodia</p>
                      <p className="text-base font-bold text-blue-600">{selectedAdoption.animal.name}</p>
                      <p className="text-sm text-gray-600">{selectedAdoption.animal.species}</p>
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Historial de Seguimientos */}
                <div className="col-span-2 p-6 flex flex-col">
                  <h4 className="text-sm font-bold text-gray-900 uppercase mb-4">Bitácora de Monitoreo</h4>
                  
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {followUps.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No hay seguimientos registrados aún. Es recomendable realizar la primera llamada a las 2 semanas.</p>
                    ) : (
                      followUps.map(fu => (
                        <div key={fu.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {new Date(fu.followUpDate).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              Estado: <strong className="text-gray-900">{fu.condition}</strong>
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{fu.comments}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Formulario de Nuevo Seguimiento */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h5 className="text-xs font-bold text-gray-700 mb-3">Registrar Nueva Llamada / Visita</h5>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <select 
                          value={newCondition}
                          onChange={e => setNewCondition(e.target.value)}
                          className="w-full border border-gray-300 rounded-md text-sm p-2 outline-none focus:border-blue-500"
                        >
                          <option value="Excelente">Excelente</option>
                          <option value="Buena">Buena</option>
                          <option value="Regular - En adaptación">Regular - En adaptación</option>
                          <option value="Alerta - Posible retiro">Alerta - Posible retiro</option>
                        </select>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Comentarios o reporte familiar..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md text-sm px-3 py-2 outline-none focus:border-blue-500"
                          />
                          <button 
                            onClick={handleSaveFollowUp}
                            disabled={!newComment.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Guardar
                          </button>
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                </div>

              </div>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#F9FAFB' }}>
              <Button onClick={() => setOpenFollowUpModal(false)} variant="outlined">Cerrar Expediente</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
