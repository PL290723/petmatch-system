import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { Home, Heart, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';

export default function Dashboard({ setCurrentView }) {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (window.api) {
          const statsData = await window.api.getDashboardStats();
          const candidatesData = await window.api.getCandidates();
          const historyData = await window.api.getAdoptionHistory();
          
          setStats(statsData);
          setCandidates(candidatesData.slice(0, 5)); // Solo los 5 más recientes

          // Calcular adopciones por mes (Nov=10, Dic=11, Ene=0...)
          const monthCounts = { 10: 0, 11: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
          historyData.forEach(a => {
            const d = new Date(a.signedDate);
            if (monthCounts[d.getMonth()] !== undefined) {
              monthCounts[d.getMonth()]++;
            }
          });
          
          setHistoricalData([
            { name: 'Nov', adopciones: monthCounts[10] },
            { name: 'Dic', adopciones: monthCounts[11] },
            { name: 'Ene', adopciones: monthCounts[0] },
            { name: 'Feb', adopciones: monthCounts[1] },
            { name: 'Mar', adopciones: monthCounts[2] },
            { name: 'Abr', adopciones: monthCounts[3] },
            { name: 'May', adopciones: monthCounts[4] },
          ]);

        } else {
          // Fallback
          setStats({ totalAnimals: 0, activeAdoptions: 0, pendingReports: 0 });
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
        setError(err.message || "Error de conexión con el servidor");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center font-medium shadow-sm border border-red-200">
        <AlertCircle size={32} className="mx-auto mb-2 opacity-80" />
        <p>No se pudo conectar con el servidor.</p>
        <p className="text-sm opacity-80 mt-1">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header text */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resumen del Refugio</h2>
        <p className="text-sm text-gray-500 mt-1">Monitorea la población animal y las métricas de adopción en tiempo real.</p>
      </div>

      {/* Métricas (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div 
          onClick={() => setCurrentView('directory')}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Home size={24} />
            </div>
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs font-semibold">
              <TrendingUp size={14} /> +2% mes anterior
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Animales en Refugio</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAnimals}</p>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => setCurrentView('adoptionHistory')}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col cursor-pointer hover:border-pink-400 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
              <Heart size={24} />
            </div>
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs font-semibold">
              <TrendingUp size={14} /> Historial Activo
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Adopciones Históricas</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{historicalData.reduce((acc, curr) => acc + curr.adopciones, 0)}</p>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => setCurrentView('abuseReports')}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col cursor-pointer hover:border-orange-400 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${stats.pendingReports > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
              {stats.pendingReports > 0 ? 'Requieren atención' : 'Todo en orden'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Reportes Pendientes</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingReports}</p>
        </div>
      </div>

      {/* Contenido Principal (Gráfico y Tabla) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Gráfico de Tendencia */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900">Tendencia de Adopciones</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">Ver reporte completo</button>
          </div>
          <div className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="adopciones" 
                  stroke="#2563EB" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Últimos Candidatos */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900">Últimos Candidatos</h3>
            <button 
              onClick={() => setCurrentView('adopters')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              Ver todos <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <ul className="divide-y divide-gray-100">
              {candidates.map((candidate) => {
                const q = candidate.questionnaires?.[0];
                const isRejected = q?.adoptionPurpose === 'Guardia' || q?.adoptionPurpose === 'Regalo';
                // Mock score for visual purposes
                const score = isRejected ? 20 : (Math.floor(Math.random() * 30) + 70); 

                return (
                  <li key={candidate.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900">{candidate.fullName}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isRejected ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {isRejected ? 'Rechazado' : 'Aprobado'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <p className="text-xs text-gray-500">Interés: {q?.adoptionPurpose || 'No definido'}</p>
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Compat.</span>
                          <span className="font-semibold text-gray-700">{score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${isRejected ? 'bg-red-500' : 'bg-blue-600'}`} 
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
