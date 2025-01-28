import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import ConnectionManager from './utils/connectionManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Add these lines to serve static files
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/styles', express.static(path.join(__dirname, '../frontend/public/styles')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

// Add catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Rest of the WebSocket setup remains the same
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const connectionManager = new ConnectionManager();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join', () => {
        connectionManager.addUser(socket.id);
        const peer = connectionManager.findPartner(socket.id);

        if(peer) {
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
        if(room) io.to(room.partner).emit('partnerDisconnected');
        console.log(`User disconnected: ${socket.id}`);
    });

    socket.on('chatMessage', ({ roomId, message }) => {
        socket.to(roomId).emit('chatMessage', message);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
