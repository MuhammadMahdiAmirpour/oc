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
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
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
}



// frontend/src/uiManager.js
// export default class UIManager {
//     constructor() {
//         this.initUIElements();
//         this.setupEventListeners();
//     }
//
//     initUIElements() {
//         this.elements = {
//             localVideo: document.getElementById('localVideo'),
//             remoteVideo: document.getElementById('remoteVideo'),
//             chatMessages: document.getElementById('chatMessages'),
//             messageInput: document.getElementById('messageInput'),
//             connectBtn: document.getElementById('connectBtn'),
//             disconnectBtn: document.getElementById('disconnectBtn'),
//             loader: document.getElementById('loader')
//         };
//
//
//         // Initialize video elements with proper attributes
//         if (this.elements.localVideo) {
//             this.elements.localVideo.autoplay = true;
//             this.elements.localVideo.playsInline = true;
//             this.elements.localVideo.muted = true;
//         }
//
//         if (this.elements.remoteVideo) {
//             this.elements.remoteVideo.autoplay = true;
//             this.elements.remoteVideo.playsInline = true;
//         }
//     }
//
//     setupEventListeners() {
//         window.addEventListener('resize', this.handleWindowResize.bind(this));
//
//         // Add play event listeners for videos
//         if (this.elements.localVideo) {
//             this.elements.localVideo.addEventListener('loadedmetadata', () => {
//                 this.elements.localVideo.play().catch(error =>
//                     console.log('Local video autoplay failed:', error)
//                 );
//             });
//         }
//
//         if (this.elements.remoteVideo) {
//             this.elements.remoteVideo.addEventListener('loadedmetadata', () => {
//                 this.elements.remoteVideo.play().catch(error =>
//                     console.log('Remote video autoplay failed:', error)
//                 );
//             });
//         }
//     }
//
//     // setLocalVideo(stream) {
//     //     this.clearVideoElement(this.elements.localVideo);
//     //     const video = this.createVideoElement(stream, true);
//     //     this.elements.localVideo.appendChild(video);
//     //     this.adjustVideoLayout();
//     // }
//     //
//     // setRemoteVideo(stream) {
//     //     this.clearVideoElement(this.elements.remoteVideo);
//     //     const video = this.createVideoElement(stream, false);
//     //     this.elements.remoteVideo.appendChild(video);
//     //     this.adjustVideoLayout();
//     // }
//
//     // setLocalVideo(stream) {
//     //     const localVideo = document.getElementById('localVideo');
//     //     if (localVideo) {
//     //         localVideo.srcObject = stream;
//     //         localVideo.play().catch(error => console.error('Error playing local video:', error));
//     //     }
//     // }
//     //
//     // setRemoteVideo(stream) {
//     //     const remoteVideo = document.getElementById('remoteVideo');
//     //     if (remoteVideo) {
//     //         remoteVideo.srcObject = stream;
//     //         remoteVideo.play().catch(error => console.error('Error playing remote video:', error));
//     //     }
//     // }
//
//
//     setLocalVideo(stream) {
//         if (!this.elements.localVideo) {
//             console.error('Local video element not found');
//             return;
//         }
//
//         try {
//             this.elements.localVideo.srcObject = stream;
//             console.log('Local video stream set');
//         } catch (error) {
//             console.error('Error setting local video stream:', error);
//         }
//     }
//
//     setRemoteVideo(stream) {
//         if (!this.elements.remoteVideo) {
//             console.error('Remote video element not found');
//             return;
//         }
//
//         try {
//             this.elements.remoteVideo.srcObject = stream;
//             console.log('Remote video stream set');
//
//             // Handle autoplay
//             const playPromise = this.elements.remoteVideo.play();
//             if (playPromise !== undefined) {
//                 playPromise
//                     .then(() => {
//                         console.log('Remote video playing successfully');
//                     })
//                     .catch(error => {
//                         console.log('Remote video autoplay failed, adding click-to-play listener');
//                         // Add click-to-play functionality
//                         const playButton = document.createElement('button');
//                         playButton.textContent = 'Click to Play';
//                         playButton.className = 'play-button';
//                         playButton.onclick = () => {
//                             this.elements.remoteVideo.play();
//                             playButton.remove();
//                         };
//                         this.elements.remoteVideo.parentElement.appendChild(playButton);
//                     });
//             }
//         } catch (error) {
//             console.error('Error setting remote video stream:', error);
//         }
//     }
//
//     createVideoElement(stream, isLocal) {
//         const video = document.createElement('video');
//         video.srcObject = stream;
//         video.autoplay = true;
//         video.playsInline = true;
//         video.muted = isLocal;
//         video.classList.add('video-element');
//
//         if (isLocal) {
//             video.classList.add('local-video');
//             video.style.transform = 'scaleX(-1)'; // Mirror local video
//         } else {
//             video.classList.add('remote-video');
//         }
//
//         return video;
//     }
//
//     clearVideoElement(container) {
//         if (container && container.srcObject) {
//             const stream = container.srcObject;
//             if (stream) {
//                 stream.getTracks().forEach(track => track.stop());
//             }
//             container.srcObject = null;
//         }
//     }
//
//     addMessage(message, type) {
//         const messageElement = document.createElement('div');
//         messageElement.classList.add('message', type);
//
//         const messageContent = document.createElement('div');
//         messageContent.classList.add('message-content');
//         messageContent.textContent = message;
//
//         messageElement.appendChild(messageContent);
//         this.elements.chatMessages.appendChild(messageElement);
//
//         // Scroll to bottom
//         this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
//     }
//
//     toggleLoader(show) {
//         this.elements.loader.style.display = show ? 'block' : 'none';
//         this.elements.connectBtn.disabled = show;
//     }
//
//     showNotification(message, duration = 3000) {
//         const notification = document.createElement('div');
//         notification.classList.add('notification');
//         notification.textContent = message;
//
//         document.body.appendChild(notification);
//
//         setTimeout(() => {
//             notification.classList.add('fade-out');
//             setTimeout(() => notification.remove(), 500);
//         }, duration);
//     }
//
//     resetUI() {
//         this.clearVideoElement(this.elements.localVideo);
//         this.clearVideoElement(this.elements.remoteVideo);
//         if (this.elements.chatMessages) {
//             this.elements.chatMessages.innerHTML = '';
//         }
//         if (this.elements.messageInput) {
//             this.elements.messageInput.value = '';
//         }
//         this.toggleLoader(false);
//     }
//
//     handleWindowResize() {
//         this.adjustVideoLayout();
//     }
//
//     adjustVideoLayout() {
//         const videos = document.querySelectorAll('.video-element');
//         const container = document.querySelector('.video-container');
//
//         if (!container || videos.length === 0) return;
//
//         const containerWidth = container.clientWidth;
//         const containerHeight = container.clientHeight;
//         const videoCount = videos.length;
//
//         videos.forEach(video => {
//             if (videoCount === 1) {
//                 video.style.width = '100%';
//                 video.style.height = '100%';
//             } else {
//                 video.style.width = `${containerWidth / 2 - 10}px`;
//                 video.style.height = `${containerHeight}px`;
//             }
//         });
//     }
//
//     toggleConnectionButtons(connected) {
//         this.elements.connectBtn.disabled = connected;
//         this.elements.disconnectBtn.disabled = !connected;
//     }
//
//     showError(message) {
//         const errorElement = document.createElement('div');
//         errorElement.classList.add('error-message');
//         errorElement.textContent = message;
//
//         document.body.appendChild(errorElement);
//         setTimeout(() => errorElement.remove(), 5000);
//     }
// }