import { useState, useEffect } from 'react';
import { hearingAPI } from '../services/api';

/**
 * useUpcomingHearings - Custom hook to fetch and process upcoming hearings
 * Features:
 * - Filters for future hearings only
 * - Sorts by nearest date first
 * - Identifies the nearest upcoming hearing
 * - Handles loading and error states
 * 
 * @returns {Object} { upcomingHearings, nearestHearing, loading, error }
 */
export default function useUpcomingHearings() {
    const [upcomingHearings, setUpcomingHearings] = useState([]);
    const [nearestHearing, setNearestHearing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUpcomingHearings();
    }, []);

    const fetchUpcomingHearings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await hearingAPI.getMyHearings();
            const hearings = response.data || [];

            // Parse and enrich hearing data
            const enrichedHearings = hearings.map(hearing => {
                const scheduledDate = hearing.scheduledDate ? new Date(hearing.scheduledDate) : null;
                return {
                    id: hearing.id,
                    caseTitle: hearing.caseTitle || 'Untitled Case',
                    scheduledDate,
                    formattedDate: scheduledDate ? scheduledDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                    }) : 'TBD',
                    formattedTime: scheduledDate ? scheduledDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        hour12: true 
                    }) : 'TBD',
                    status: hearing.status || 'Scheduled',
                    videoRoomId: hearing.videoRoomId || 'N/A',
                    caseId: hearing.caseId,
                };
            });

            // Filter for future hearings only (today and onwards)
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Set to midnight for date comparison
            
            const filtered = enrichedHearings.filter(h => {
                if (!h.scheduledDate) return false;
                const hearingDate = new Date(h.scheduledDate);
                hearingDate.setHours(0, 0, 0, 0);
                return hearingDate >= now;
            });

            // Sort by date (nearest first)
            const sorted = filtered.sort((a, b) => {
                const dateA = new Date(a.scheduledDate);
                const dateB = new Date(b.scheduledDate);
                return dateA - dateB;
            });

            // Identify the nearest hearing (first in sorted list)
            const nearest = sorted.length > 0 ? sorted[0] : null;

            setUpcomingHearings(sorted);
            setNearestHearing(nearest);
        } catch (err) {
            console.error('Failed to fetch upcoming hearings:', err);
            setError(err.message || 'Failed to load hearings');
        } finally {
            setLoading(false);
        }
    };

    return {
        upcomingHearings,
        nearestHearing,
        loading,
        error,
        refetch: fetchUpcomingHearings
    };
}
