import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ChatWindow.css';

let socket;

const ChatWindow = () => {
    const { roomId } = useParams();
    const { user } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [file, setFile] = useState(null);

    useEffect(() => {
        socket = io('http://localhost:4000');

        socket.emit('joinRoom', { userId: user.id, roomId });

        socket.on('userStatus', (userStatus) => {
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u._id === userStatus.userId ? { ...u, status: userStatus.status, avatar: userStatus.avatar } : u
                )
            );
        });

        socket.on('message', (message) => {
            setMessages((msgs) => [...msgs, message]);
            if (message.sender !== user.id) {
                toast.info(`New message from ${message.sender.username}`);
            }
        });

        socket.on('typing', ({ userId, isTyping }) => {
            setTypingUsers((prevTypingUsers) => {
                if (isTyping) {
                    return [...prevTypingUsers, userId];
                } else {
                    return prevTypingUsers.filter((id) => id !== userId);
                }
            });
        });

        socket.on('reaction', ({ messageId, reaction }) => {
            setMessages((msgs) =>
                msgs.map((msg) =>
                    msg._id === messageId ? { ...msg, reactions: [...msg.reactions, reaction] } : msg
                )
            );
        });

        return () => {
            socket.disconnect();
            socket.off();
        };
    }, [roomId, user.id]);

    const sendMessage = async (e) => {
        e.preventDefault();

        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('http://localhost:4000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const filePath = response.data.filePath;
            socket.emit('sendMessage', { userId: user.id, roomId, content: message, file: filePath }, () => {
                setMessage('');
                setFile(null);
            });
            socket.emit('typing', { userId: user.id, roomId, isTyping: false });
        } else if (message) {
            socket.emit('sendMessage', { userId: user.id, roomId, content: message }, () => setMessage(''));
            socket.emit('typing', { userId: user.id, roomId, isTyping: false });
        }
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);
        socket.emit('typing', { userId: user.id, roomId, isTyping: !!e.target.value });
    };

    const addEmoji = (emoji) => {
        setMessage(message + emoji.native);
        setShowEmojiPicker(false);
    };

    const reactToMessage = (messageId, emoji) => {
        const reaction = { user: user.id, emoji: emoji.native };
        socket.emit('reaction', { messageId, reaction });
    };

    return (
        <div className="container chat-window">
            <h2>Chat Room</h2>
            <div className="users-list mb-3">
                {users.map((u) => (
                    <div key={u._id} className="user d-flex align-items-center">
                        {u.avatar && <img src={`http://localhost:4000${u.avatar}`} alt="avatar" style={{ width: '30px', marginRight: '10px' }} />}
                        {u.username} - {u.status}
                        {typingUsers.includes(u._id) && ' (typing...)'}
                    </div>
                ))}
            </div>
            <div className="chat-messages mb-3 p-3 border rounded">
                {messages.map((msg, index) => (
                    <div key={index} className="message mb-2">
                        {msg.content}
                        {msg.file && <a href={`http://localhost:4000${msg.file}`} target="_blank" rel="noopener noreferrer">Download File</a>}
                        <div className="reactions">
                            {msg.reactions && msg.reactions.map((reaction, idx) => (
                                <span key={idx}>{reaction.emoji}</span>
                            ))}
                            <button type="button" className="btn btn-light btn-sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>React</button>
                            {showEmojiPicker && <Picker data={data} onEmojiSelect={(emoji) => reactToMessage(msg._id, emoji)} />}
                        </div>
                    </div>
                ))}
            </div>
            <form className="message-input d-flex align-items-center" onSubmit={sendMessage}>
                <input
                    type="text"
                    className="form-control me-2"
                    value={message}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                />
                <input type="file" className="form-control me-2" onChange={(e) => setFile(e.target.files[0])} />
                <button type="button" className="btn btn-light me-2" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
                <button type="submit" className="btn btn-primary">Send</button>
            </form>
            {showEmojiPicker && <Picker data={data} onEmojiSelect={addEmoji} />}
            <ToastContainer />
        </div>
    );
};

export default ChatWindow;
