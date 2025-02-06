export default class UIManager {
    constructor() {
        this.initUIElements();
    }

    initUIElements() {
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendMessageBtn = document.getElementById('sendMessageBtn');
        this.setupVideoElements();
        this.preventVideoPause();
    }

    setupVideoElements() {
        const videoConfig = {
            autoplay: true,
            playsInline: true,
            muted: true,
        };
        if (this.localVideo) {
            Object.assign(this.localVideo, videoConfig);
            this.localVideo.setAttribute('playsinline', '');
        }
        if (this.remoteVideo) {
            Object.assign(this.remoteVideo, { ...videoConfig, muted: false });
            this.remoteVideo.setAttribute('playsinline', '');
        }
    }

    preventVideoPause() {
        const playVideos = async () => {
            try {
                if (this.localVideo?.srcObject && this.localVideo.paused) {
                    await this.localVideo.play();
                }
                if (this.remoteVideo?.srcObject && this.remoteVideo.paused) {
                    await this.remoteVideo.play();
                }
            } catch (error) {
                console.log('Auto-resume handled:', error.message);
            }
        };
        ['visibilitychange', 'focus', 'blur', 'click', 'touchstart'].forEach(event => {
            document.addEventListener(event, playVideos, true);
        });
        // Keep checking video state periodically
        setInterval(playVideos, 1000);
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.remoteVideo?.srcObject) {
                this.remoteVideo.play();
            }
        });
    }

    async setLocalVideo(stream) {
        if (this.localVideo) {
            this.localVideo.srcObject = stream;
            try {
                await this.localVideo.play();
            } catch (error) {
                this.localVideo.muted = true;
                await this.localVideo.play();
            }
        }
    }

    async setRemoteVideo(stream) {
        if (this.remoteVideo) {
            this.remoteVideo.srcObject = stream;
            try {
                await this.remoteVideo.play();
            } catch (error) {
                console.log('Retrying remote video playback');
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.remoteVideo.play().catch(e => {
                    console.log('Second attempt to play remote video:', e.message);
                });
            }
        }
    }

    addMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = message;
        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    toggleLoader(show) {
        const loader = document.querySelector('.loader');
        if (show) {
            loader.style.display = 'flex';
        } else {
            loader.style.display = 'none';
        }
    }

    resetUI() {
        if (this.localVideo) {
            this.localVideo.srcObject = null;
        }
        if (this.remoteVideo) {
            this.remoteVideo.srcObject = null;
        }
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }
        this.toggleLoader(false);
    }

    /**
     * Load historical chat messages into the chat UI.
     * @param {Array} messages - An array of message objects containing `senderId` and `message`.
     */
    loadChatHistory(messages) {
        messages.forEach(({ senderId, message }) => {
            const type = senderId === this.socket.id ? 'sent' : 'received';
            this.addMessage(message, type);
        });
    }
}
