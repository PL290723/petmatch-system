import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';

export default function AbuseReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      if (window.api) {
        const data = await window.api.getAbuseReports();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      if (window.api) {
        await window.api.resolveAbuseReport(id);
        loadReports(); // Recargar para actualizar UI
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
  }

  const pendingReports = reports.filter(r => !r.resolved);
  const resolvedReports = reports.filter(r => r.resolved);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Buzón de Reportes de Maltrato</h2>
          <p className="text-sm text-gray-500 mt-1">Atiende y da seguimiento a denuncias de maltrato animal vinculadas al refugio.</p>
        </div>
      </div>

      {pendingReports.length === 0 && resolvedReports.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-500">No hay reportes de abuso registrados.</p>
        </div>
      ) : null}

      {pendingReports.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle size={20} /> Reportes Críticos Pendientes ({pendingReports.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReports.map(report => (
              <div key={report.id} className="bg-white border-l-4 border-l-red-500 border border-gray-200 rounded-lg p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-md">Alerta Pendiente</span>
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <Calendar size={14} />
                    {new Date(report.reportDate).toLocaleDateString()}
                  </div>
                </div>
                
                <p className="text-gray-900 font-medium mb-1">
                  Animal: <span className="text-blue-600">{report.animal.name}</span> <span className="text-gray-500 text-sm">({report.animal.species})</span>
                </p>
                <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded italic border border-gray-100">
                  "{report.description}"
                </p>
                
                <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    Denunciante: <span className="text-gray-900">{report.reporterName}</span>
                  </p>
                  <button 
                    onClick={() => handleResolve(report.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
                  >
                    Marcar como Resuelto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolvedReports.length > 0 && (
        <div className="space-y-4 pt-6">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" /> Historial Resuelto ({resolvedReports.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resolvedReports.map(report => (
              <div key={report.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-green-700 flex items-center gap-1">
                    <CheckCircle size={14} /> Resuelto
                  </span>
                  <span className="text-xs text-gray-400">{new Date(report.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">{report.animal.name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2" title={report.description}>{report.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
