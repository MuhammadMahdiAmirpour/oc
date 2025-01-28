export default class WebRTCHandler {
    constructor(ui, socket) {
        this.ui = ui;
        this.socket = socket;
        this.peerConnection = null;
        this.localStream = null;
        this.currentPeer = null;
        this.isInitiator = false;
    }

    // async initiateCall(partnerId) {
    //     try {
    //         this.currentPeer = partnerId;
    //         this.localStream = await navigator.mediaDevices.getUserMedia({
    //             video: true,
    //             audio: true
    //         }).catch(error => {
    //             console.error('Media device error:', error);
    //             this.ui.showNotification('Please enable camera/microphone permissions!');
    //             throw error;
    //         });
    //
    //         this.ui.setLocalVideo(this.localStream);
    //         this.createPeerConnection();
    //
    //         const offer = await this.peerConnection.createOffer();
    //         await this.peerConnection.setLocalDescription(offer);
    //
    //         this.socket.emit('signal', {
    //             to: partnerId,
    //             signal: this.peerConnection.localDescription
    //         });
    //     } catch (error) {
    //         console.error('Error initiating call:', error);
    //         this.ui.toggleLoader(false);
    //     }
    // }

    async setupLocalStream() {
        if (!this.localStream) {
            try {
                this.localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                this.ui.setLocalVideo(this.localStream);
            } catch (error) {
                console.error('Error getting user media:', error);
                throw new Error('Failed to access camera/microphone');
            }
        }
    }


    async initiateCall(partnerId) {
        try {
            this.currentPeer = partnerId;
            this.isInitiator = true;
            await this.setupLocalStream();
            this.createPeerConnection();

            // Create and send offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            this.socket.emit('signal', {
                to: partnerId,
                signal: {
                    type: 'offer',
                    sdp: this.peerConnection.localDescription
                }
            });
        } catch (error) {
            console.error('Error initiating call:', error);
            this.ui.showNotification('Failed to initiate call');
            this.ui.toggleLoader(false);
        }
    }

    createPeerConnection() {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);

        // Add local stream tracks to peer connection
        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });

        // Handle ICE candidates
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

        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
        };

        // Handle ICE connection state changes
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.peerConnection.iceConnectionState);
        };

        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            console.log('Received remote track');
            if (event.streams && event.streams[0]) {
                this.ui.setRemoteVideo(event.streams[0]);
                this.ui.toggleLoader(false);
            }
        };
    }



    // createPeerConnection() {
    //     const configuration = {
    //         iceServers: [
    //             {urls: 'stun:stun.l.google.com:19302'},
    //             {urls: 'stun:global.stun.twilio.com:3478?transport=udp'}
    //         ]
    //     };
    //
    //     this.peerConnection = new RTCPeerConnection(configuration);
    //
    //     this.peerConnection.onicecandidate = ({candidate}) => {
    //         if (candidate) {
    //             this.socket.emit('signal', {
    //                 to: this.currentPeer,
    //                 signal: candidate
    //             });
    //         }
    //     };
    //
    //     this.peerConnection.ontrack = ({streams}) => {
    //         this.ui.setRemoteVideo(streams[0]);
    //         this.ui.toggleLoader(false);
    //     };
    //
    //     this.localStream.getTracks().forEach(track => {
    //         this.peerConnection.addTrack(track, this.localStream);
    //     });
    // }

    // async handleOffer(partnerId, offer) {
    //     this.currentPeer = partnerId;
    //     this.createPeerConnection();
    //
    //     await this.peerConnection.setRemoteDescription(offer);
    //     const answer = await this.peerConnection.createAnswer();
    //     await this.peerConnection.setLocalDescription(answer);
    //
    //     this.socket.emit('signal', {
    //         to: partnerId,
    //         signal: this.peerConnection.localDescription
    //     });
    // }

    async handleOffer(partnerId, offer) {
        try {
            this.currentPeer = partnerId;

            // Get local stream if not already available
            if (!this.localStream) {
                this.localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                this.ui.setLocalVideo(this.localStream);
            }

            this.createPeerConnection();

            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            this.socket.emit('signal', {
                to: partnerId,
                signal: this.peerConnection.localDescription
            });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    async handleAnswer(answer) {
        await this.peerConnection.setRemoteDescription(answer);
    }

    async handleICECandidate(candidate) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        try {
            if (this.peerConnection) {
                await this.peerConnection.addIceCandidate(candidate);
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }

    async handleSignal(from, signal) {
        try {
            if (!this.peerConnection) {
                await this.setupLocalStream();
                this.createPeerConnection();
            }

            if (signal.type === 'offer') {
                console.log('Handling offer');
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);

                this.socket.emit('signal', {
                    to: from,
                    signal: {
                        type: 'answer',
                        sdp: this.peerConnection.localDescription
                    }
                });
            }
            else if (signal.type === 'answer') {
                console.log('Handling answer');
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            }
            else if (signal.type === 'candidate') {
                console.log('Handling ICE candidate');
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
        } catch (error) {
            console.error('Error handling signal:', error);
        }
    }

    closeConnection() {
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

    // closeConnection() {
    //     if (this.peerConnection) {
    //         this.peerConnection.close();
    //         this.peerConnection = null;
    //     }
    //     if (this.localStream) {
    //         this.localStream.getTracks().forEach(track => track.stop());
    //     }
    // }
}
