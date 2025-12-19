import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';

const SIGNALING_SERVER = 'http://localhost:3001';

export const useWebRTC = (roomId, userId, userName) => {
    const [peers, setPeers] = useState({});
    const [localStream, setLocalStream] = useState(null);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const socketRef = useRef();
    const peersRef = useRef({});
    const localStreamRef = useRef();

    // Initialize media and socket connection
    useEffect(() => {
        if (!roomId || !userId) return;

        const init = async () => {
            try {
                // Get user media
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                setLocalStream(stream);
                localStreamRef.current = stream;

                // Connect to signaling server
                socketRef.current = io(SIGNALING_SERVER);

                socketRef.current.on('connect', () => {
                    console.log('Connected to signaling server');
                    socketRef.current.emit('join-room', roomId, userId, userName);
                });

                // Handle existing participants
                socketRef.current.on('existing-participants', (participants) => {
                    console.log('Existing participants:', participants);
                    participants.forEach(participantId => {
                        createPeer(participantId, true, stream);
                    });
                });

                // Handle new user joining
                socketRef.current.on('user-connected', (remoteUserId, remoteUserName) => {
                    console.log(`User connected: ${remoteUserName}`);
                });

                // Handle WebRTC signaling
                socketRef.current.on('signal', ({ signal, from, userName: senderName }) => {
                    if (peersRef.current[from]) {
                        peersRef.current[from].signal(signal);
                    } else {
                        createPeer(from, false, stream, signal);
                    }
                });

                // Handle user disconnect
                socketRef.current.on('user-disconnected', (userId) => {
                    console.log(`User disconnected: ${userId}`);
                    if (peersRef.current[userId]) {
                        peersRef.current[userId].destroy();
                        delete peersRef.current[userId];
                        setPeers(prev => {
                            const updated = { ...prev };
                            delete updated[userId];
                            return updated;
                        });
                    }
                });

                // Handle audio/video toggles
                socketRef.current.on('user-audio-toggle', (userId, isOn) => {
                    setPeers(prev => ({
                        ...prev,
                        [userId]: { ...prev[userId], isAudioOn: isOn }
                    }));
                });

                socketRef.current.on('user-video-toggle', (userId, isOn) => {
                    setPeers(prev => ({
                        ...prev,
                        [userId]: { ...prev[userId], isVideoOn: isOn }
                    }));
                });

            } catch (error) {
                console.error('Error accessing media devices:', error);
                alert('Please allow camera and microphone access');
            }
        };

        init();

        return () => {
            // Cleanup
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.emit('leave-room', roomId);
                socketRef.current.disconnect();
            }
            Object.values(peersRef.current).forEach(peer => peer.destroy());
        };
    }, [roomId, userId, userName]);

    const createPeer = (remotePeerId, initiator, stream, incomingSignal = null) => {
        const peer = new Peer({
            initiator,
            trickle: false,
            stream: stream || localStreamRef.current,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        peer.on('signal', signal => {
            socketRef.current.emit('signal', {
                to: remotePeerId,
                signal,
                userName
            });
        });

        peer.on('stream', remoteStream => {
            setPeers(prev => ({
                ...prev,
                [remotePeerId]: {
                    peer,
                    stream: remoteStream,
                    isAudioOn: true,
                    isVideoOn: true
                }
            }));
        });

        peer.on('error', err => {
            console.error('Peer error:', err);
        });

        if (incomingSignal) {
            peer.signal(incomingSignal);
        }

        peersRef.current[remotePeerId] = peer;
    };

    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
                socketRef.current.emit('toggle-audio', roomId, audioTrack.enabled);
            }
        }
    }, [roomId]);

    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
                socketRef.current.emit('toggle-video', roomId, videoTrack.enabled);
            }
        }
    }, [roomId]);

    const leaveCall = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit('leave-room', roomId);
        }
    }, [roomId]);

    return {
        localStream,
        peers,
        isAudioOn,
        isVideoOn,
        toggleAudio,
        toggleVideo,
        leaveCall
    };
};
