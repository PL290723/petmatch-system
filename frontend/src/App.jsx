import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import MainLayout from './layouts/MainLayout';
import Dashboard from './views/Dashboard';
import Directory from './views/Directory';
import Evaluation from './views/Evaluation';
import Adopters from './views/Adopters';
import AdoptionHistory from './views/AdoptionHistory';
import AbuseReports from './views/AbuseReports';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />;
      case 'directory': return <Directory />;
      case 'evaluation': return <Evaluation />;
      case 'adopters': return <Adopters />;
      case 'adoptionHistory': return <AdoptionHistory />;
      case 'abuseReports': return <AbuseReports />;
      default: return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <MainLayout currentView={currentView} setCurrentView={setCurrentView}>
        {renderView()}
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
