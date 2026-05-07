import React, { useState } from 'react';
import { LayoutDashboard, PawPrint, FileText, FileSpreadsheet, Search, Plus, Bell, CheckCircle } from 'lucide-react';
import AnimalRegistrationModal from '../components/AnimalRegistrationModal';

export default function MainLayout({ children, currentView, setCurrentView }) {
  const [openRegistration, setOpenRegistration] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Mock notificaciones
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Nuevo reporte de abuso pendiente', read: false },
    { id: 2, text: 'Candidato completó formulario ASPCA', read: false },
    { id: 3, text: 'Recordatorio de seguimiento post-adopción', read: false }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, view: 'dashboard' },
    { text: 'Directorio', icon: <PawPrint size={20} />, view: 'directory' },
    { text: 'Candidatos', icon: <FileText size={20} />, view: 'adopters' },
    { text: 'Formulario de Adopción', icon: <FileSpreadsheet size={20} />, view: 'evaluation' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar Fija */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-blue-600">
            <PawPrint size={28} className="fill-blue-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">PetMatch</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isSelected = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isSelected 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                {item.text}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              AR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Admin Refugio</p>
              <p className="text-xs text-gray-500 truncate">admin@petmatch.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-900">
            {menuItems.find(item => item.view === currentView)?.text || 'PetMatch'}
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar registros..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm w-64 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>
              
              {/* Dropdown Notificaciones */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 text-sm">Notificaciones</h3>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} nuevas</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">No hay notificaciones</div>
                    ) : (
                      <ul className="divide-y divide-gray-50">
                        {notifications.map(n => (
                          <li key={n.id} className={`p-4 transition-colors ${n.read ? 'opacity-60 bg-white' : 'bg-blue-50/30'}`}>
                            <div className="flex gap-3 items-start">
                              {!n.read && <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>}
                              <p className="text-sm text-gray-800 flex-1">{n.text}</p>
                              {!n.read && (
                                <button onClick={() => markAsRead(n.id)} className="text-gray-400 hover:text-green-600 transition-colors" title="Marcar como leída">
                                  <CheckCircle size={16} />
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Renderizar botón solo en dashboard o directory */}
            {(currentView === 'dashboard' || currentView === 'directory') && (
              <button 
                onClick={() => setOpenRegistration(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Plus size={18} />
                Nuevo Ingreso
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>

      <AnimalRegistrationModal 
        open={openRegistration} 
        onClose={() => setOpenRegistration(false)} 
        onSuccess={() => {
          setOpenRegistration(false);
          // Si quisieramos recargar la vista actual podríamos disparar un evento
          // Por simplicidad, si el usuario está en Directorio, podría necesitar recargar
        }} 
      />
    </div>
  );
}
