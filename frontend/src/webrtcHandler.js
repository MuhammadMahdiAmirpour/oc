export default class WebRTCHandler {
    constructor(ui, socket) {
        this.ui = ui;
        this.socket = socket;
        this.peerConnection = null;
        this.localStream = null;
        this.currentPeer = null;
        this.dataChannel = null;
        this.isInitiator = false;
    }

    async setupLocalStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            this.ui.setLocalVideo(this.localStream);
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }

    createPeerConnection() {
        const configuration = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };

        this.peerConnection = new RTCPeerConnection(configuration);

        // Add local tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }

        // Handle remote tracks
        this.peerConnection.ontrack = (event) => {
            console.log('Received remote track');
            if (event.streams[0]) {
                this.ui.setRemoteVideo(event.streams[0]);
            }
        };

        // ICE connection monitoring
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', this.peerConnection.iceConnectionState);
        };

        // ICE candidate handling
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('signal', {
                    to: this.currentPeer,
                    signal: {
                        type: 'candidate',
                        candidate: event.candidate
                    }
                });
            }
        };

        // Data channel setup
        if (this.isInitiator) {
            this.dataChannel = this.peerConnection.createDataChannel('chat');
            this.setupDataChannel(this.dataChannel);
        } else {
            this.peerConnection.ondatachannel = (event) => {
                this.dataChannel = event.channel;
                this.setupDataChannel(this.dataChannel);
            };
        }
    }

    setupDataChannel(channel) {
        channel.onopen = () => {
            console.log('Data channel opened');
        };

        channel.onmessage = (event) => {
            this.ui.addMessage(event.data, 'received');
        };

        channel.onclose = () => {
            console.log('Data channel closed');
        };

        channel.onerror = (error) => {
            console.error('Data channel error:', error);
        };
    }

    async initiateCall(partnerId) {
        try {
            this.currentPeer = partnerId;
            this.isInitiator = true;
            await this.setupLocalStream();
            this.createPeerConnection();

            // Add a small delay to ensure stream synchronization
            await new Promise(resolve => setTimeout(resolve, 500));

            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            this.socket.emit('signal', {
                to: partnerId,
                signal: {
                    type: 'offer',
                    sdp: offer
                }
            });
        } catch (error) {
            console.error('Error initiating call:', error);
        }
    }

    async handleOffer(partnerId, offer) {
        try {
            this.currentPeer = partnerId;
            this.isInitiator = false;
            await this.setupLocalStream();
            this.createPeerConnection();

            // First set remote description
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            // Add a small delay for stream synchronization
            await new Promise(resolve => setTimeout(resolve, 500));

            // Then create and set local description
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            this.socket.emit('signal', {
                to: partnerId,
                signal: {
                    type: 'answer',
                    sdp: answer
                }
            });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }

    async handleCandidate(candidate) {
        try {
            if (this.peerConnection && this.peerConnection.remoteDescription) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (error) {
            if (!error.message.includes('Unknown ufrag')) {
                console.error('Error handling ICE candidate:', error);
            }
        }
    }

    async handleSignal(from, signal) {
        if (signal.type === 'offer') {
            await this.handleOffer(from, signal.sdp);
        } else if (signal.type === 'answer') {
            await this.handleAnswer(signal.sdp);
        } else if (signal.type === 'candidate' && signal.candidate) {
            await this.handleCandidate(signal.candidate);
        }
    }

    sendMessage(message) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(message);
            return true;
        }
        return false;
    }

    closeConnection() {
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        this.currentPeer = null;
        this.isInitiator = false;
    }
}

