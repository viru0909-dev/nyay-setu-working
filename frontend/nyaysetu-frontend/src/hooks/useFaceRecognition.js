import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceRecognition = () => {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load face-api models on mount
    // TEMPORARILY DISABLED - Model compatibility issues
    /*
    useEffect(() => {
        loadModels();
    }, []);
    */

    const loadModels = async () => {
        try {
            setIsLoading(true);
            const MODEL_URL = '/models';  // Models should be in public/models folder

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

    const detectFace = async (videoElement) => {
        if (!modelsLoaded) {
            throw new Error('Models not loaded yet');
        }

        try {
            const detection = await faceapi
                .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                return null;
            }

            return {
                descriptor: Array.from(detection.descriptor),
                box: detection.detection.box,
                score: detection.detection.score
            };
        } catch (err) {
            console.error('Error detecting face:', err);
            throw err;
        }
    };

    const enrollFace = async (userId, descriptor, token) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/face/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId,
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
            const response = await fetch('http://localhost:8080/api/auth/face/login', {
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
