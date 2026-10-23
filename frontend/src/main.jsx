import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import App from './App';
import './index.css';

const routerBasename = import.meta.env.PROD
  ? import.meta.env.BASE_URL.replace(/\/$/, '')
  : '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={routerBasename}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
