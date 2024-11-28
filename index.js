const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Socket.IO Server is running.');
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a specific channel
    socket.on('join_channel', ({ channelId }) => {
        socket.join(channelId);
        console.log(`User ${socket.id} joined channel ${channelId}`);
        io.to(channelId).emit('channel_message', {
            userId: socket.id,
            message: `User ${socket.id} has joined the channel ${channelId}`,
        });
    });

    // Leave a specific channel
    socket.on('leave_channel', ({ channelId }) => {
        socket.leave(channelId);
        console.log(`User ${socket.id} left channel ${channelId}`);
        io.to(channelId).emit('channel_message', {
            userId: socket.id,
            message: `User ${socket.id} has left the channel ${channelId}`,
        });
    });

    // Handle chat messages within a channel
    socket.on('send_message', ({ channelId, message }) => {
        console.log(`Message from ${socket.id} in channel ${channelId}: ${message}`);
        io.to(channelId).emit('receive_message', {
            userId: socket.id,
            message,
            createdAt: new Date().toISOString(),
        });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
