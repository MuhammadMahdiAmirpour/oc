import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url'; // Import fileURLToPath
import ConnectionManager from './utils/connectionManager.js';
import ChatMessage from './models/ChatMessage.js';

// Emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the directory name

// MongoDB connection URL
const MONGO_URI = 'mongodb://mongo-db:27017/webrtc_chat'; // Replace with your MongoDB URI

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API endpoint to fetch chat history for a room
app.get('/api/chat/:roomId', async (req, res) => {
    const { roomId } = req.params;
    try {
        const messages = await ChatMessage.find({ roomId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
});

// Initialize ConnectionManager
const connectionManager = new ConnectionManager();

// WebSocket event handlers
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join', () => {
        connectionManager.addUser(socket.id);
        const peer = connectionManager.findPartner(socket.id);
        if (peer) {
            socket.emit('matched', peer);
            io.to(peer).emit('matched', socket.id);
            connectionManager.createRoom(socket.id, peer);
        }
    });

    socket.on('signal', ({ to, signal }) => {
        io.to(to).emit('signal', { from: socket.id, signal });
    });

    socket.on('disconnect', () => {
        const room = connectionManager.removeUser(socket.id);
        if (room) io.to(room.partner).emit('partnerDisconnected');
        console.log(`User disconnected: ${socket.id}`);
    });

    // Save chat messages to MongoDB
    socket.on('chatMessage', async ({ roomId, senderId, message }) => {
        try {
            console.log('Received chat message:', { roomId, senderId, message }); // Log the received message
            const chatMessage = new ChatMessage({ roomId, senderId, message });
            await chatMessage.save();
            console.log('Message saved to database:', chatMessage); // Log the saved message
            socket.to(roomId).emit('chatMessage', { senderId, message });
        } catch (error) {
            console.error('Error saving chat message:', error);
        }
    });

});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// import cors from 'cors';
// import express from 'express';
// import http from 'http';
// import { Server } from 'socket.io';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import ConnectionManager from './utils/connectionManager.js';
//
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
//
// const app = express();
// const server = http.createServer(app);
//
// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true
// }));
//
// // Add these lines to serve static files
// app.use(express.static(path.join(__dirname, '../frontend/public')));
// app.use('/styles', express.static(path.join(__dirname, '../frontend/public/styles')));
// app.use('/src', express.static(path.join(__dirname, '../frontend/src')));
//
// // Add catch-all route for SPA
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
// });
//
// // Rest of the WebSocket setup remains the same
// const io = new Server(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });
//
// const connectionManager = new ConnectionManager();
//
// io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.id}`);
//
//     socket.on('join', () => {
//         connectionManager.addUser(socket.id);
//         const peer = connectionManager.findPartner(socket.id);
//
//         if(peer) {
//             socket.emit('matched', peer);
//             io.to(peer).emit('matched', socket.id);
//             connectionManager.createRoom(socket.id, peer);
//         }
//     });
//
//     socket.on('signal', ({ to, signal }) => {
//         io.to(to).emit('signal', { from: socket.id, signal });
//     });
//
//     socket.on('disconnect', () => {
//         const room = connectionManager.removeUser(socket.id);
//         if(room) io.to(room.partner).emit('partnerDisconnected');
//         console.log(`User disconnected: ${socket.id}`);
//     });
//
//     socket.on('chatMessage', ({ roomId, message }) => {
//         socket.to(roomId).emit('chatMessage', message);
//     });
// });
//
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
