import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [username, setUsername] = useState(user ? user.username : '');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            };
            const { data } = await axios.get('http://localhost:4000/api/users/profile', config);
            setUsername(data.username);
            setAvatar(data.avatar);
        };

        fetchUserProfile();
    }, []);

    const updateUserProfile = async (e) => {
        e.preventDefault();
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        };

        const { data } = await axios.put(
            'http://localhost:4000/api/users/profile',
            { username, password, avatar },
            config
        );

        setUser(data);
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };

        const { data } = await axios.post('http://localhost:4000/api/upload', formData, config);
        setAvatar(data.filePath);
    };

    return (
        <div className="container">
            <h2>User Profile</h2>
            <form onSubmit={updateUserProfile}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                        Username
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="avatar" className="form-label">
                        Avatar
                    </label>
                    <input
                        type="file"
                        className="form-control"
                        id="avatar"
                        onChange={handleAvatarChange}
                    />
                    {avatar && <img src={`http://localhost:4000${avatar}`} alt="avatar" style={{ width: '100px', marginTop: '10px' }} />}
                </div>
                <button type="submit" className="btn btn-primary">
                    Update
                </button>
            </form>
        </div>
    );
};

export default UserProfile;
