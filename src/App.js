import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ChatRoomList from './components/ChatRoomList';
import ChatWindow from './components/ChatWindow';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import UserProfile from './components/UserProfile';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                    <Route path="/" element={<PrivateRoute><ChatRoomList /></PrivateRoute>} />
                    <Route path="/chat/:roomId" element={<PrivateRoute><ChatWindow /></PrivateRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
