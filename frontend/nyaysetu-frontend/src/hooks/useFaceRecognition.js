import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceRecognition = () => {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load face-api models on mount
    // TEMPORARILY DISABLED - Model compatibility issues
    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            setIsLoading(true);
            // Using CDN for models since local models directory is empty
            const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights/';

            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);

            setModelsLoaded(true);
            console.log('Face recognition models loaded successfully');
        } catch (err) {
            console.error('Error loading face recognition models:', err);
            setError('Failed to load face recognition models');
        } finally {
            setIsLoading(false);
        }
    };

    const detectFace = async (videoElement, minScore = 0.6) => {
        if (!modelsLoaded) {
            throw new Error('Models not loaded yet');
        }

        try {
            const detection = await faceapi
                .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                return null;
            }

            // Check confidence score
            if (detection.detection.score < minScore) {
                return null;
            }

            // Check centering (the face should be roughly in the middle 60% of the frame)
            const box = detection.detection.box;
            const videoWidth = videoElement.videoWidth || videoElement.width;
            const videoHeight = videoElement.videoHeight || videoElement.height;

            const faceCenterX = box.x + box.width / 2;
            const faceCenterY = box.y + box.height / 2;

            const isCenteredX = faceCenterX > videoWidth * 0.2 && faceCenterX < videoWidth * 0.8;
            const isCenteredY = faceCenterY > videoHeight * 0.1 && faceCenterY < videoHeight * 0.9;

            if (!isCenteredX || !isCenteredY) {
                return {
                    descriptor: Array.from(detection.descriptor),
                    box: box,
                    score: detection.detection.score,
                    isCentered: false
                };
            }

            return {
                descriptor: Array.from(detection.descriptor),
                box: box,
                score: detection.detection.score,
                isCentered: true
            };
        } catch (err) {
            console.error('Error detecting face:', err);
            throw err;
        }
    };

    const enrollFace = async (descriptor, token) => {
        try {
            const response = await fetch('http://localhost:8080/api/face/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    faceDescriptor: JSON.stringify(descriptor)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to enroll face');
            }

            return await response.json();
        } catch (err) {
            console.error('Error enrolling face:', err);
            throw err;
        }
    };

    const loginWithFace = async (email, descriptor) => {
        try {
            const response = await fetch('http://localhost:8080/api/face/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    faceDescriptor: JSON.stringify(descriptor)
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Face login failed');
            }

            return await response.json();
        } catch (err) {
            console.error('Error in face login:', err);
            throw err;
        }
    };

    return {
        modelsLoaded,
        isLoading,
        error,
        detectFace,
        enrollFace,
        loginWithFace
    };
};
