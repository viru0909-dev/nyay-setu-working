import { useCallback, useEffect, useState } from 'react';
import { hearingAPI } from '../services/api';

const POLL_INTERVAL_MS = 3000;

const tokenKey = (hearingId) =>
    `nyaysetu-hearing-access:${hearingId}`;

export function useHearingAdmission() {
    const [activeCall, setActiveCall] = useState(null);
    const [waitingHearing, setWaitingHearing] = useState(null);
    const [admissionStatus, setAdmissionStatus] = useState(null);
    const [admissionError, setAdmissionError] = useState('');
    const [requesting, setRequesting] = useState(false);

    const requestJoin = useCallback(async (hearing) => {
        setRequesting(true);
        setAdmissionError('');
        setAdmissionStatus('REQUESTING');

        try {
            const response = await hearingAPI.requestJoin(hearing.id);
            const { accessToken, status } = response.data;

            if (!accessToken) {
                throw new Error(
                    'The server did not return a participant access token.'
                );
            }

            sessionStorage.setItem(
                tokenKey(hearing.id),
                accessToken
            );

            setWaitingHearing(hearing);
            setAdmissionStatus(status || 'WAITING');
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                error.response?.data?.error ||
                error.message ||
                'Unable to request admission.';

            setAdmissionError(message);
            setAdmissionStatus('ERROR');
        } finally {
            setRequesting(false);
        }
    }, []);

    useEffect(() => {
        if (!waitingHearing) {
            return undefined;
        }

        if (
            admissionStatus === 'REJECTED' ||
            admissionStatus === 'EXPIRED' ||
            admissionStatus === 'ERROR'
        ) {
            return undefined;
        }

        let cancelled = false;

        const checkAdmission = async () => {
            const token = sessionStorage.getItem(
                tokenKey(waitingHearing.id)
            );

            if (!token) {
                if (!cancelled) {
                    setAdmissionStatus('ERROR');
                    setAdmissionError(
                        'Your hearing access token is missing.'
                    );
                }

                return;
            }

            try {
                const response = await hearingAPI.getJoinAccess(
                    waitingHearing.id,
                    token
                );

                if (cancelled) {
                    return;
                }

                const { status, videoRoomId } = response.data;

                setAdmissionStatus(status);

                if (status === 'ADMITTED' && videoRoomId) {
                    setActiveCall({
                        ...waitingHearing,
                        room: videoRoomId,
                        videoRoomId
                    });

                    setWaitingHearing(null);
                }
            } catch (error) {
                if (cancelled) {
                    return;
                }

                const message =
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    error.response?.data?.error ||
                    error.message ||
                    'Unable to check admission status.';

                const normalizedMessage =
                    message.toLowerCase();

                if (normalizedMessage.includes('reject')) {
                    setAdmissionStatus('REJECTED');
                    sessionStorage.removeItem(
                        tokenKey(waitingHearing.id)
                    );
                } else if (
                    normalizedMessage.includes('expired') ||
                    normalizedMessage.includes('ended') ||
                    error.response?.status === 410
                ) {
                    setAdmissionStatus('EXPIRED');
                    sessionStorage.removeItem(
                        tokenKey(waitingHearing.id)
                    );
                } else {
                    setAdmissionError(message);
                }
            }
        };

        checkAdmission();

        const intervalId = window.setInterval(
            checkAdmission,
            POLL_INTERVAL_MS
        );

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [waitingHearing, admissionStatus]);

    const endCall = useCallback(() => {
        setActiveCall(null);
    }, []);

    const cancelWaiting = useCallback(() => {
        if (waitingHearing) {
            sessionStorage.removeItem(
                tokenKey(waitingHearing.id)
            );
        }

        setWaitingHearing(null);
        setAdmissionStatus(null);
        setAdmissionError('');
    }, [waitingHearing]);

    return {
        activeCall,
        waitingHearing,
        waitingHearingId: waitingHearing?.id ?? null,
        admissionStatus,
        admissionError,
        requesting,
        requestJoin,
        endCall,
        cancelWaiting
    };
}