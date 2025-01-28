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

    // initializeSocket() {
    //     this.socket.on('matched', partnerId => {
    //         this.webrtc.initiateCall(partnerId);
    //     });
    //
    //     this.socket.on('signal', async ({ from, signal }) => {
    //         if(signal.type === 'offer') {
    //             await this.webrtc.handleOffer(from, signal);
    //         } else if(signal.type === 'answer') {
    //             await this.webrtc.handleAnswer(signal);
    //         } else if(signal.candidate) {
    //             this.webrtc.handleICECandidate(signal);
    //         }
    //     });
    //
    //     this.socket.on('partnerDisconnected', () => {
    //         this.ui.showNotification('Partner disconnected. Searching for new connection...');
    //         this.socket.emit('join');
    //     });
    //
    //     this.socket.on('chatMessage', message => {
    //         this.ui.addMessage(message, 'received');
    //     });
    // }

    initializeSocket() {
        this.socket.on('matched', partnerId => {
            console.log('Matched with partner:', partnerId);
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

        this.socket.on('chatMessage', message => {
            this.ui.addMessage(message, 'received');
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
            if(message) {
                this.socket.emit('chatMessage', {
                    roomId: this.webrtc.currentPeer,
                    message
                });
                this.ui.addMessage(message, 'sent');
                input.value = '';
            }
        });
    }
}

new App();
