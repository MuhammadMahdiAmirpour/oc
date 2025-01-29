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

            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
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



// export default class WebRTCHandler {
//     constructor(ui, socket) {
//         this.ui = ui;
//         this.socket = socket;
//         this.peerConnection = null;
//         this.localStream = null;
//         this.currentPeer = null;
//         this.pendingCandidates = [];
//         this.isInitiator = false;
//     }
//
//     // async initiateCall(partnerId) {
//     //     try {
//     //         this.currentPeer = partnerId;
//     //         this.localStream = await navigator.mediaDevices.getUserMedia({
//     //             video: true,
//     //             audio: true
//     //         }).catch(error => {
//     //             console.error('Media device error:', error);
//     //             this.ui.showNotification('Please enable camera/microphone permissions!');
//     //             throw error;
//     //         });
//     //
//     //         this.ui.setLocalVideo(this.localStream);
//     //         this.createPeerConnection();
//     //
//     //         const offer = await this.peerConnection.createOffer();
//     //         await this.peerConnection.setLocalDescription(offer);
//     //
//     //         this.socket.emit('signal', {
//     //             to: partnerId,
//     //             signal: this.peerConnection.localDescription
//     //         });
//     //     } catch (error) {
//     //         console.error('Error initiating call:', error);
//     //         this.ui.toggleLoader(false);
//     //     }
//     // }
//
//     async setupLocalStream() {
//         if (!this.localStream) {
//             try {
//                 this.localStream = await navigator.mediaDevices.getUserMedia({
//                     video: true,
//                     audio: true
//                 });
//                 this.ui.setLocalVideo(this.localStream);
//             } catch (error) {
//                 console.error('Error getting user media:', error);
//                 throw new Error('Failed to access camera/microphone');
//             }
//         }
//     }
//
//     async initiateCall(partnerId) {
//         try {
//             this.currentPeer = partnerId;
//             this.isInitiator = true;
//             await this.setupLocalStream();
//             this.createPeerConnection();
//
//             // Create and send offer
//             const offer = await this.peerConnection.createOffer();
//             await this.peerConnection.setLocalDescription(offer);
//
//             this.socket.emit('signal', {
//                 to: partnerId,
//                 signal: {
//                     type: 'offer',
//                     sdp: this.peerConnection.localDescription
//                 }
//             });
//         } catch (error) {
//             console.error('Error initiating call:', error);
//             this.ui.showNotification('Failed to initiate call');
//             this.ui.toggleLoader(false);
//         }
//     }
//
//     createPeerConnection() {
//         if (this.peerConnection) {
//             console.log('Closing existing peer connection');
//             this.peerConnection.close();
//         }
//
//         const configuration = {
//             iceServers: [
//                 { urls: 'stun:stun.l.google.com:19302' },
//                 { urls: 'stun:stun1.l.google.com:19302' }
//             ]
//         };
//
//         console.log('Creating new peer connection');
//         this.peerConnection = new RTCPeerConnection(configuration);
//
//         // Add local stream tracks to peer connection
//         if (this.localStream) {
//             this.localStream.getTracks().forEach(track => {
//                 console.log('Adding local track:', track.kind);
//                 this.peerConnection.addTrack(track, this.localStream);
//             });
//         }
//
//         // Handle ICE candidates
//         this.peerConnection.onicecandidate = (event) => {
//             if (event.candidate) {
//                 console.log('Generated local ICE candidate');
//                 this.socket.emit('signal', {
//                     to: this.currentPeer,
//                     signal: {
//                         type: 'candidate',
//                         candidate: event.candidate
//                     }
//                 });
//             }
//         };
//
//         // Handle connection state changes
//         this.peerConnection.onconnectionstatechange = () => {
//             console.log('Connection state changed:', this.peerConnection.connectionState);
//         };
//
//         // Handle ICE connection state changes
//         this.peerConnection.oniceconnectionstatechange = () => {
//             console.log('ICE connection state changed:', this.peerConnection.iceConnectionState);
//         };
//
//         // Handle remote stream
//         this.peerConnection.ontrack = (event) => {
//             console.log('Received remote track:', event.track.kind);
//             if (event.streams && event.streams[0]) {
//                 this.ui.setRemoteVideo(event.streams[0]);
//             }
//         };
//
//         return this.peerConnection;
//     }
//
//     // createPeerConnection() {
//     //     const configuration = {
//     //         iceServers: [
//     //             {urls: 'stun:stun.l.google.com:19302'},
//     //             {urls: 'stun:global.stun.twilio.com:3478?transport=udp'}
//     //         ]
//     //     };
//     //
//     //     this.peerConnection = new RTCPeerConnection(configuration);
//     //
//     //     this.peerConnection.onicecandidate = ({candidate}) => {
//     //         if (candidate) {
//     //             this.socket.emit('signal', {
//     //                 to: this.currentPeer,
//     //                 signal: candidate
//     //             });
//     //         }
//     //     };
//     //
//     //     this.peerConnection.ontrack = ({streams}) => {
//     //         this.ui.setRemoteVideo(streams[0]);
//     //         this.ui.toggleLoader(false);
//     //     };
//     //
//     //     this.localStream.getTracks().forEach(track => {
//     //         this.peerConnection.addTrack(track, this.localStream);
//     //     });
//     // }
//
//     // async handleOffer(partnerId, offer) {
//     //     this.currentPeer = partnerId;
//     //     this.createPeerConnection();
//     //
//     //     await this.peerConnection.setRemoteDescription(offer);
//     //     const answer = await this.peerConnection.createAnswer();
//     //     await this.peerConnection.setLocalDescription(answer);
//     //
//     //     this.socket.emit('signal', {
//     //         to: partnerId,
//     //         signal: this.peerConnection.localDescription
//     //     });
//     // }
//
//     async handleOffer(partnerId, offer) {
//         try {
//             this.currentPeer = partnerId;
//             this.isInitiator = false;
//
//             // Ensure local stream is set up
//             await this.setupLocalStream();
//
//             // Create peer connection if it doesn't exist
//             if (!this.peerConnection) {
//                 this.createPeerConnection();
//             }
//
//             console.log('Setting remote description from offer');
//             await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//
//             // Process any pending ICE candidates
//             if (this.pendingCandidates.length > 0) {
//                 console.log('Processing pending ICE candidates');
//                 const candidates = [...this.pendingCandidates];
//                 this.pendingCandidates = [];
//                 for (const candidate of candidates) {
//                     await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//                 }
//             }
//
//             console.log('Creating answer');
//             const answer = await this.peerConnection.createAnswer();
//             console.log('Setting local description');
//             await this.peerConnection.setLocalDescription(answer);
//
//             this.socket.emit('signal', {
//                 to: partnerId,
//                 signal: {
//                     type: 'answer',
//                     sdp: this.peerConnection.localDescription
//                 }
//             });
//         } catch (error) {
//             console.error('Error handling offer:', error);
//         }
//     }
//
//     // async handleAnswer(answer) {
//     //     await this.peerConnection.setRemoteDescription(answer);
//     // }
//
//     async setRemoteDescription(description) {
//         await this.peerConnection.setRemoteDescription(description);
//         this.pendingCandidates.forEach(candidate => this.peerConnection.addIceCandidate(candidate));
//         this.pendingCandidates = []; // Clear after processing
//     }
//
//     async handleAnswer(signal) {
//         if (!this.peerConnection) return;
//
//         if (this.peerConnection.signalingState !== "have-remote-offer" && this.peerConnection.signalingState !== "stable") {
//             console.warn("Peer connection is not in a valid state to accept an answer:", this.peerConnection.signalingState);
//             return;
//         }
//
//         try {
//             console.log("Setting remote description for answer...");
//             await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
//         } catch (error) {
//             console.error("Error setting remote description:", error);
//         }
//     }
//
//     async handleICECandidate(candidate) {
//         if (!this.peerConnection) {
//             console.warn('No peer connection available for ICE candidate');
//             return;
//         }
//
//         try {
//             if (this.peerConnection.remoteDescription) {
//                 await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//                 console.log('ICE candidate added successfully');
//             } else {
//                 console.log('Queuing ICE candidate');
//                 this.pendingCandidates.push(candidate);
//             }
//         } catch (error) {
//             console.error('Error handling ICE candidate:', error);
//         }
//     }
//
//     // async handleICECandidate(candidate) {
//     //     this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)); // Unnecessary call
//     //     try {
//     //         if (this.peerConnection) {
//     //             await this.peerConnection.addIceCandidate(candidate);
//     //         }
//     //     } catch (error) {
//     //         console.error('Error adding ICE candidate:', error);
//     //     }
//     // }
//
//
//     // async handleSignal(from, signal) {
//     //     try {
//     //         if (!this.peerConnection) {
//     //             await this.setupLocalStream();
//     //             this.createPeerConnection();
//     //         }
//     //
//     //         if (signal.type === 'offer') {
//     //             console.log('Handling offer');
//     //             await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
//     //             const answer = await this.peerConnection.createAnswer();
//     //             await this.peerConnection.setLocalDescription(answer);
//     //
//     //             this.socket.emit('signal', {
//     //                 to: from,
//     //                 signal: {
//     //                     type: 'answer',
//     //                     sdp: this.peerConnection.localDescription
//     //                 }
//     //             });
//     //         } else if (signal.type === 'answer') {
//     //             console.log('Handling answer');
//     //             await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
//     //         } else if (signal.type === 'candidate') {
//     //             console.log('Handling ICE candidate');
//     //             await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
//     //         }
//     //     } catch (error) {
//     //         console.error('Error handling signal:', error);
//     //     }
//     // }
//
//     // async handleSignal(from, signal) {
//     //     if (signal.type === 'offer') {
//     //         await this.handleOffer(from, signal);
//     //     } else if (signal.type === 'answer') {
//     //         if (!this.peerConnection.remoteDescription) {
//     //             console.warn("Remote description is missing. Setting it now...");
//     //         }
//     //         await this.handleAnswer(signal);
//     //     } else if (signal.candidate) {
//     //         if (!this.peerConnection.remoteDescription) {
//     //             console.warn("Skipping ICE candidate since remoteDescription is not set.");
//     //             return;
//     //         }
//     //         await this.handleICECandidate(signal);
//     //     }
//     // }
//
//     async handleSignal(from, signal) {
//         try {
//             console.log('Received signal:', signal.type, 'from:', from);
//
//             // Initialize peer connection if it doesn't exist
//             if (!this.peerConnection) {
//                 console.log('Creating new peer connection');
//                 await this.setupLocalStream();
//                 this.createPeerConnection();
//             }
//
//             if (signal.type === 'offer') {
//                 console.log('Processing offer');
//                 await this.handleOffer(from, signal.sdp);
//             } else if (signal.type === 'answer') {
//                 console.log('Processing answer');
//                 if (this.isInitiator) {
//                     await this.handleAnswer(signal.sdp);
//                 }
//             } else if (signal.type === 'candidate' && signal.candidate) {
//                 console.log('Processing ICE candidate');
//                 if (!this.peerConnection) {
//                     console.warn('No peer connection available for ICE candidate');
//                     return;
//                 }
//                 await this.handleICECandidate(signal.candidate);
//             }
//         } catch (error) {
//             console.error('Error handling signal:', error);
//         }
//     }
//
//     closeConnection() {
//         if (this.peerConnection) {
//             this.peerConnection.close();
//             this.peerConnection = null;
//         }
//         if (this.localStream) {
//             this.localStream.getTracks().forEach(track => track.stop());
//             this.localStream = null;
//         }
//         this.currentPeer = null;
//         this.isInitiator = false;
//     }
//
//     // closeConnection() {
//     //     if (this.peerConnection) {
//     //         this.peerConnection.close();
//     //         this.peerConnection = null;
//     //     }
//     //     if (this.localStream) {
//     //         this.localStream.getTracks().forEach(track => track.stop());
//     //     }
//     // }
//
//     cleanup() {
//         if (this.peerConnection) {
//             this.peerConnection.close();
//             this.peerConnection = null;
//         }
//         this.pendingCandidates = [];
//         this.isInitiator = false;
//         this.currentPeer = null;
//     }
// }
