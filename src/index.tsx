import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.scss';
import App from './app/App';
import { store } from './app/store';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';

const container = document.getElementById('root');

const root = container && createRoot(container);

const Root: React.FC = () => (
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router basename={import.meta.env.BASE_URL}>
          <App />
        </Router>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

root && root.render(<Root />);

export default Root;
