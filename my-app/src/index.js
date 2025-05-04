import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Optional: Create a custom theme
const theme = extendTheme({
  colors: {
    brand: {
      100: "#f7fafc",
      900: "#1a202c",
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
  <ChakraProvider theme={theme}>
    <App />
    
  </ChakraProvider>
  </ErrorBoundary>
);

function ErrorBoundary({ children }) {
  console.log('ErrorBoundary');
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {children}
    </React.Suspense>
  );
}