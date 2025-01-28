// frontend/src/uiManager.js
export default class UIManager {
    constructor() {
        this.initUIElements();
        this.setupEventListeners();
    }

    initUIElements() {
        this.elements = {
            localVideo: document.getElementById('localVideo'),
            remoteVideo: document.getElementById('remoteVideo'),
            chatMessages: document.getElementById('chatMessages'),
            messageInput: document.getElementById('messageInput'),
            connectBtn: document.getElementById('connectBtn'),
            disconnectBtn: document.getElementById('disconnectBtn'),
            loader: document.getElementById('loader')
        };
    }

    setupEventListeners() {
        // Add any UI-specific event listeners here
        window.addEventListener('resize', this.handleWindowResize.bind(this));
    }

    // setLocalVideo(stream) {
    //     this.clearVideoElement(this.elements.localVideo);
    //     const video = this.createVideoElement(stream, true);
    //     this.elements.localVideo.appendChild(video);
    //     this.adjustVideoLayout();
    // }
    //
    // setRemoteVideo(stream) {
    //     this.clearVideoElement(this.elements.remoteVideo);
    //     const video = this.createVideoElement(stream, false);
    //     this.elements.remoteVideo.appendChild(video);
    //     this.adjustVideoLayout();
    // }

    // setLocalVideo(stream) {
    //     const localVideo = document.getElementById('localVideo');
    //     if (localVideo) {
    //         localVideo.srcObject = stream;
    //         localVideo.play().catch(error => console.error('Error playing local video:', error));
    //     }
    // }
    //
    // setRemoteVideo(stream) {
    //     const remoteVideo = document.getElementById('remoteVideo');
    //     if (remoteVideo) {
    //         remoteVideo.srcObject = stream;
    //         remoteVideo.play().catch(error => console.error('Error playing remote video:', error));
    //     }
    // }

    setLocalVideo(stream) {
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = stream;
        }
    }

    setRemoteVideo(stream) {
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = stream;
        }
    }

    createVideoElement(stream, isLocal) {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = isLocal;
        video.classList.add('video-element');

        if (isLocal) {
            video.classList.add('local-video');
            video.style.transform = 'scaleX(-1)'; // Mirror local video
        } else {
            video.classList.add('remote-video');
        }

        return video;
    }

    clearVideoElement(container) {
        while (container.firstChild) {
            container.firstChild.remove();
        }
    }

    addMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = message;

        messageElement.appendChild(messageContent);
        this.elements.chatMessages.appendChild(messageElement);

        // Scroll to bottom
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    toggleLoader(show) {
        this.elements.loader.style.display = show ? 'block' : 'none';
        this.elements.connectBtn.disabled = show;
    }

    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, duration);
    }

    resetUI() {
        this.clearVideoElement(this.elements.localVideo);
        this.clearVideoElement(this.elements.remoteVideo);
        this.elements.chatMessages.innerHTML = '';
        this.elements.messageInput.value = '';
        this.toggleLoader(false);
    }

    handleWindowResize() {
        this.adjustVideoLayout();
    }

    adjustVideoLayout() {
        const videos = document.querySelectorAll('.video-element');
        const container = document.querySelector('.video-container');

        if (!container || videos.length === 0) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const videoCount = videos.length;

        videos.forEach(video => {
            if (videoCount === 1) {
                video.style.width = '100%';
                video.style.height = '100%';
            } else {
                video.style.width = `${containerWidth / 2 - 10}px`;
                video.style.height = `${containerHeight}px`;
            }
        });
    }

    toggleConnectionButtons(connected) {
        this.elements.connectBtn.disabled = connected;
        this.elements.disconnectBtn.disabled = !connected;
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        errorElement.textContent = message;

        document.body.appendChild(errorElement);
        setTimeout(() => errorElement.remove(), 5000);
    }
}