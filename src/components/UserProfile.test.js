import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from './UserProfile';
import { AuthProvider } from '../context/AuthContext';

describe('UserProfile Component', () => {
  test('renders UserProfile component', () => {
    render(
      <AuthProvider>
        <UserProfile />
      </AuthProvider>
    );

    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });

  test('updates username and password', () => {
    render(
      <AuthProvider>
        <UserProfile />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'newusername' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'newpassword' },
    });

    expect(screen.getByDisplayValue('newusername')).toBeInTheDocument();
    expect(screen.getByDisplayValue('newpassword')).toBeInTheDocument();
  });
});
