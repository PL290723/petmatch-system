import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1A237E', // Azul índigo profundo y premium
      light: '#534BAE',
      dark: '#000051',
    },
    secondary: {
      main: '#00BFA5', // Teal vibrante y moderno
      light: '#5DF2D6',
      dark: '#008E76',
    },
    background: {
      default: '#F5F7FA', // Gris perlado muy suave con tinte azul
      paper: '#FFFFFF',
    },
    error: {
      main: '#FF5252',
    },
    warning: {
      main: '#FFC107',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: '-1px',
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16, // Bordes mucho más redondeados, estilo moderno
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s ease-in-out',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #1A237E 30%, #534BAE 90%)',
          boxShadow: '0 4px 15px 0 rgba(26, 35, 126, 0.4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #000051 30%, #1A237E 90%)',
            boxShadow: '0 6px 20px 0 rgba(26, 35, 126, 0.6)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
