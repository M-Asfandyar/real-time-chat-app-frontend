import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { AuthProvider } from '../context/AuthContext';

describe('App Component', () => {
  test('renders App component', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  });
});
