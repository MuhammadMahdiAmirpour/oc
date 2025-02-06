import UIManager from './uiManager.js';
import WebRTCHandler from './webrtcHandler.js';

class App {
    constructor() {
        this.ui = new UIManager();
        this.socket = io();
        this.webrtc = new WebRTCHandler(this.ui, this.socket);
        this.initializeSocket();
        this.setupEventListeners();
    }

    initializeSocket() {
        this.socket.on('matched', async (partnerId) => {
            console.log('Matched with partner:', partnerId);

            // Use the partner ID as the room ID
            const roomId = partnerId;

            // Fetch chat history for the room
            try {
                const response = await fetch(`/api/chat/${roomId}`);
                const messages = await response.json();
                this.ui.loadChatHistory(messages); // Load historical messages into the UI
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }

            // Initiate the WebRTC call
            this.webrtc.initiateCall(partnerId);
        });

        this.socket.on('signal', async ({ from, signal }) => {
            console.log('Received signal:', signal.type, 'from:', from);
            await this.webrtc.handleSignal(from, signal);
        });

        this.socket.on('partnerDisconnected', () => {
            this.ui.showNotification('Partner disconnected. Searching for new connection...');
            this.webrtc.closeConnection();
            this.socket.emit('join');
        });

        this.socket.on('chatMessage', ({ senderId, message }) => {
            const type = senderId === this.socket.id ? 'sent' : 'received';
            this.ui.addMessage(message, type);
        });
    }

    setupEventListeners() {
        document.getElementById('connectBtn').addEventListener('click', () => {
            this.socket.emit('join');
            this.ui.toggleLoader(true);
        });

        document.getElementById('disconnectBtn').addEventListener('click', () => {
            this.webrtc.closeConnection();
            this.socket.emit('disconnect');
            this.ui.resetUI();
        });

        document.getElementById('sendMessageBtn').addEventListener('click', () => {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (message) {
                // Send the message via WebSocket to the server
                this.socket.emit('chatMessage', {
                    roomId: this.webrtc.currentPeer, // Use the current peer's ID as the room ID
                    senderId: this.socket.id,       // Sender's socket ID
                    message,                        // The actual message
                });

                // Add the message to the UI locally
                this.ui.addMessage(message, 'sent');
                input.value = '';
            }
        });

        // Handle Enter key for sending messages
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('sendMessageBtn').click();
            }
        });
    }
}

new App();
