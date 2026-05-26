# Virtual Lawyer Consultation - Frontend Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing the frontend components for the Virtual Lawyer Consultation System using React + Vite.

---

## Step 1: Project Setup & Dependencies

### Update `frontend/nyaysetu-frontend/package.json`

Add these dependencies:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "@stripe/react-stripe-js": "^2.4.0",
    "@stripe/stripe-js": "^2.4.0",
    "date-fns": "^2.30.0",
    "react-calendar": "^4.2.1",
    "react-icons": "^4.12.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "react-hot-toast": "^2.4.1",
    "simple-peer": "^9.11.1",
    "socket.io-client": "^4.7.0",
    "tailwindcss": "^3.3.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

### Install dependencies

```bash
cd frontend/nyaysetu-frontend
npm install
```

---

## Step 2: Directory Structure

Create the following directory structure in `frontend/nyaysetu-frontend/src/`:

```
src/
├── components/
│   ├── LawyerMarketplace/
│   │   ├── LawyerList.jsx
│   │   ├── LawyerCard.jsx
│   │   ├── LawyerDetail.jsx
│   │   ├── LawyerFilter.jsx
│   │   └── LawyerReviews.jsx
│   ├── Booking/
│   │   ├── BookingFlow.jsx
│   │   ├── BookingStep1.jsx
│   │   ├── BookingStep2.jsx
│   │   ├── BookingStep3.jsx
│   │   ├── BookingStep4.jsx
│   │   ├── CalendarWidget.jsx
│   │   └── ConfirmationModal.jsx
│   ├── Payment/
│   │   ├── PaymentForm.jsx
│   │   ├── StripeCheckout.jsx
│   │   ├── PaymentConfirmation.jsx
│   │   └── InvoiceDownload.jsx
│   ├── VirtualConsultation/
│   │   ├── ConsultationLobby.jsx
│   │   ├── VideoConsole.jsx
│   │   ├── ChatPanel.jsx
│   │   ├── DocumentSharing.jsx
│   │   └── CaseWorkspace.jsx
│   └── Common/
│       ├── Header.jsx
│       ├── Navigation.jsx
│       └── LoadingSpinner.jsx
├── pages/
│   ├── LawyerMarketplaceMain.jsx
│   ├── LawyerDetailPage.jsx
│   ├── BookingPage.jsx
│   ├── PaymentPage.jsx
│   ├── ConsultationPage.jsx
│   ├── DashboardPage.jsx
│   └── NotFound.jsx
├── services/
│   ├── api.js
│   ├── lawyerService.js
│   ├── consultationService.js
│   ├── paymentService.js
│   └── websocketService.js
├── store/
│   ├── useBookingStore.js
│   ├── useUserStore.js
│   └── usePaymentStore.js
├── hooks/
│   ├── useApi.js
│   ├── useAuth.js
│   ├── usePayment.js
│   └── useWebSocket.js
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
├── styles/
│   ├── globals.css
│   └── components.css
├── config/
│   └── stripe.js
└── App.jsx
```

---

## Step 3: API Service Setup

### `services/api.js`

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### `services/lawyerService.js`

```javascript
import apiClient from './api';

export const lawyerService = {
  // Get all lawyers with optional filters
  getAllLawyers: (filters = {}) => {
    return apiClient.get('/lawyers', { params: filters });
  },

  // Get single lawyer details
  getLawyerById: (id) => {
    return apiClient.get(`/lawyers/${id}`);
  },

  // Search lawyers by specialization
  searchLawyers: (query) => {
    return apiClient.get(`/lawyers/search`, { params: { q: query } });
  },

  // Get lawyers by specialization
  getLawyersBySpecialization: (specialization) => {
    return apiClient.get(`/lawyers/specialization/${specialization}`);
  },

  // Get lawyer availability
  getAvailability: (lawyerId, date) => {
    return apiClient.get(`/lawyers/${lawyerId}/availability`, {
      params: { date }
    });
  },

  // Get lawyer reviews
  getReviews: (lawyerId) => {
    return apiClient.get(`/lawyers/${lawyerId}/reviews`);
  },

  // Submit review
  submitReview: (lawyerId, consultationId, rating, reviewText) => {
    return apiClient.post(`/lawyers/${lawyerId}/reviews`, {
      consultationId,
      rating,
      reviewText,
    });
  },
};
```

### `services/consultationService.js`

```javascript
import apiClient from './api';

export const consultationService = {
  // Get available slots
  getAvailableSlots: (lawyerId, date) => {
    return apiClient.get('/consultations/available-slots', {
      params: { lawyerId, date }
    });
  },

  // Create new consultation booking
  createConsultation: (bookingData) => {
    return apiClient.post('/consultations', bookingData);
  },

  // Get user's consultations
  getUserConsultations: (userId) => {
    return apiClient.get(`/consultations/user/${userId}`);
  },

  // Get consultation details
  getConsultationById: (consultationId) => {
    return apiClient.get(`/consultations/${consultationId}`);
  },

  // Reschedule consultation
  rescheduleConsultation: (consultationId, newDate, newTime) => {
    return apiClient.put(`/consultations/${consultationId}/reschedule`, {
      newDate,
      newTime,
    });
  },

  // Cancel consultation
  cancelConsultation: (consultationId, reason) => {
    return apiClient.post(`/consultations/${consultationId}/cancel`, { reason });
  },

  // Get meeting link
  getMeetingLink: (consultationId) => {
    return apiClient.get(`/consultations/${consultationId}/meeting-link`);
  },
};
```

### `services/paymentService.js`

```javascript
import apiClient from './api';

export const paymentService = {
  // Create payment intent
  createPaymentIntent: (consultationId, amount, userId) => {
    return apiClient.post('/payments/create-intent', {
      consultationId,
      amount,
      userId,
    });
  },

  // Confirm payment
  confirmPayment: (intentId) => {
    return apiClient.post('/payments/confirm', { intentId });
  },

  // Get payment details
  getPaymentDetails: (paymentId) => {
    return apiClient.get(`/payments/${paymentId}`);
  },

  // Request refund
  requestRefund: (paymentId, reason) => {
    return apiClient.post(`/payments/${paymentId}/refund`, { reason });
  },

  // Download invoice
  downloadInvoice: (invoiceId) => {
    return apiClient.get(`/invoices/${invoiceId}`, { responseType: 'blob' });
  },

  // Get payment history
  getPaymentHistory: (userId) => {
    return apiClient.get(`/payments/history/${userId}`);
  },
};
```

### `services/websocketService.js`

```javascript
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket = null;

export const websocketService = {
  connect: () => {
    socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('authToken'),
      },
    });
    return socket;
  },

  disconnect: () => {
    if (socket) socket.disconnect();
  },

  emit: (event, data) => {
    if (socket) socket.emit(event, data);
  },

  on: (event, callback) => {
    if (socket) socket.on(event, callback);
  },

  off: (event) => {
    if (socket) socket.off(event);
  },

  getSocket: () => socket,
};
```

---

## Step 4: Zustand Store Setup

### `store/useBookingStore.js`

```javascript
import { create } from 'zustand';

export const useBookingStore = create((set) => ({
  bookingData: {
    lawyerId: null,
    lawyerDetails: null,
    consultationType: 'VIDEO',
    selectedDate: null,
    selectedTime: null,
    caseDescription: '',
    consultationFee: 0,
  },

  setLawyer: (lawyerId, lawyerDetails) =>
    set((state) => ({
      bookingData: { ...state.bookingData, lawyerId, lawyerDetails },
    })),

  setConsultationType: (consultationType) =>
    set((state) => ({
      bookingData: { ...state.bookingData, consultationType },
    })),

  setDateAndTime: (date, time, fee) =>
    set((state) => ({
      bookingData: {
        ...state.bookingData,
        selectedDate: date,
        selectedTime: time,
        consultationFee: fee,
      },
    })),

  setCaseDescription: (caseDescription) =>
    set((state) => ({
      bookingData: { ...state.bookingData, caseDescription },
    })),

  resetBooking: () =>
    set({
      bookingData: {
        lawyerId: null,
        lawyerDetails: null,
        consultationType: 'VIDEO',
        selectedDate: null,
        selectedTime: null,
        caseDescription: '',
        consultationFee: 0,
      },
    }),
}));
```

### `store/usePaymentStore.js`

```javascript
import { create } from 'zustand';

export const usePaymentStore = create((set) => ({
  paymentData: {
    consultationId: null,
    amount: 0,
    status: 'PENDING',
    intentId: null,
    clientSecret: null,
  },

  setPaymentData: (data) =>
    set((state) => ({
      paymentData: { ...state.paymentData, ...data },
    })),

  updatePaymentStatus: (status) =>
    set((state) => ({
      paymentData: { ...state.paymentData, status },
    })),

  clearPaymentData: () =>
    set({
      paymentData: {
        consultationId: null,
        amount: 0,
        status: 'PENDING',
        intentId: null,
        clientSecret: null,
      },
    }),
}));
```

---

## Step 5: Key Components

### `components/LawyerMarketplace/LawyerList.jsx`

```jsx
import { useState, useEffect } from 'react';
import { lawyerService } from '../../services/lawyerService';
import LawyerCard from './LawyerCard';
import LawyerFilter from './LawyerFilter';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function LawyerList() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    minRating: 0,
    maxFee: 500,
  });

  useEffect(() => {
    fetchLawyers();
  }, [filters]);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const response = await lawyerService.getAllLawyers(filters);
      setLawyers(response.data);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Find Your Lawyer
        </h1>

        <LawyerFilter filters={filters} setFilters={setFilters} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {lawyers.map((lawyer) => (
            <LawyerCard key={lawyer.id} lawyer={lawyer} />
          ))}
        </div>

        {lawyers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No lawyers found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### `components/LawyerMarketplace/LawyerCard.jsx`

```jsx
import { Link } from 'react-router-dom';
import { Star, Clock, DollarSign } from 'react-icons/fa';

export default function LawyerCard({ lawyer }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      {/* Profile Image */}
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
        {lawyer.profileImageUrl ? (
          <img
            src={lawyer.profileImageUrl}
            alt={lawyer.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        )}
      </div>

      {/* Lawyer Info */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {lawyer.name}
      </h3>

      <p className="text-sm text-gray-600 mb-2">{lawyer.specialization}</p>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={
                i < Math.round(lawyer.rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          ({lawyer.totalConsultations} consultations)
        </span>
      </div>

      {/* Experience */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Clock size={16} />
        <span>{lawyer.experienceYears} years experience</span>
      </div>

      {/* Fee */}
      <div className="flex items-center gap-2 text-lg font-semibold text-green-600 mb-4">
        <DollarSign size={18} />
        <span>${lawyer.hourlyRate}/hour</span>
      </div>

      {/* Action Button */}
      <Link
        to={`/lawyer/${lawyer.id}`}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        View Profile & Book
      </Link>
    </div>
  );
}
```

### `components/Booking/BookingFlow.jsx`

```jsx
import { useState } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import BookingStep1 from './BookingStep1';
import BookingStep2 from './BookingStep2';
import BookingStep3 from './BookingStep3';
import BookingStep4 from './BookingStep4';
import ConfirmationModal from './ConfirmationModal';

export default function BookingFlow({ lawyerId, lawyerDetails }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const bookingData = useBookingStore((state) => state.bookingData);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowConfirmation(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BookingStep1 lawyerId={lawyerId} onNext={handleNext} />;
      case 2:
        return (
          <BookingStep2
            lawyerId={lawyerId}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <BookingStep3 onNext={handleNext} onBack={handleBack} />
        );
      case 4:
        return (
          <BookingStep4 onNext={handleNext} onBack={handleBack} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Type</span>
            <span>Date & Time</span>
            <span>Case Info</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {renderStep()}
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <ConfirmationModal
            bookingData={bookingData}
            lawyerDetails={lawyerDetails}
            onClose={() => setShowConfirmation(false)}
          />
        )}
      </div>
    </div>
  );
}
```

### `components/Payment/StripeCheckout.jsx`

```jsx
import { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { paymentService } from '../../services/paymentService';
import { usePaymentStore } from '../../store/usePaymentStore';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

function StripeCheckoutForm({ consultationId, amount, userId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const setPaymentData = usePaymentStore((state) => state.setPaymentData);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    try {
      setLoading(true);

      // Create payment intent
      const intentResponse = await paymentService.createPaymentIntent(
        consultationId,
        amount,
        userId
      );

      const { clientSecret, intentId } = intentResponse.data;

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        setPaymentData({
          consultationId,
          amount,
          status: 'COMPLETED',
          intentId,
        });
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-gray-300 rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#fa755a' },
            },
          }}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Consultation Fee</p>
        <p className="text-2xl font-bold text-gray-900">${amount}</p>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Processing...' : 'Complete Payment'}
      </button>
    </form>
  );
}

export default function StripeCheckout({ consultationId, amount, userId, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm
        consultationId={consultationId}
        amount={amount}
        userId={userId}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
```

### `components/VirtualConsultation/VideoConsole.jsx`

```jsx
import { useEffect, useRef, useState } from 'react';
import { websocketService } from '../../services/websocketService';
import { Mic, MicOff, Video, VideoOff, Phone, Share2 } from 'react-icons/fa';
import ChatPanel from './ChatPanel';
import DocumentSharing from './DocumentSharing';

export default function VideoConsole({ consultationId, lawyerId, userId }) {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const peerConnectionRef = useRef();

  useEffect(() => {
    initializeVideo();
    connectWebSocket();

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      websocketService.disconnect();
    };
  }, []);

  const initializeVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing media:', error);
    }
  };

  const connectWebSocket = () => {
    const socket = websocketService.connect();

    socket.on('connect', () => {
      socket.emit('join_consultation', {
        consultationId,
        userId,
      });
    });

    socket.on('remote_stream', (data) => {
      // Handle remote stream
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  };

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Remote Video */}
        <div className="flex-1 bg-gray-900 relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Local Video (Picture in Picture) */}
        <div className="absolute bottom-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Controls */}
        <div className="bg-gray-900 p-4 flex justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? (
              <MicOff size={24} className="text-white" />
            ) : (
              <Mic size={24} className="text-white" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              !isVideoOn
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {!isVideoOn ? (
              <VideoOff size={24} className="text-white" />
            ) : (
              <Video size={24} className="text-white" />
            )}
          </button>

          <button
            onClick={() => setShowDocuments(!showDocuments)}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Share2 size={24} className="text-white" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            💬
          </button>

          <button className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors">
            <Phone size={24} className="text-white" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
        {showChat && (
          <ChatPanel consultationId={consultationId} />
        )}
        {showDocuments && (
          <DocumentSharing consultationId={consultationId} />
        )}
      </div>
    </div>
  );
}
```

---

## Step 6: Routing Setup

### `App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navigation from './components/Common/Navigation';
import LawyerMarketplaceMain from './pages/LawyerMarketplaceMain';
import LawyerDetailPage from './pages/LawyerDetailPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import ConsultationPage from './pages/ConsultationPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/lawyer-consultation" element={<LawyerMarketplaceMain />} />
        <Route path="/lawyer/:id" element={<LawyerDetailPage />} />
        <Route path="/booking/:lawyerId" element={<BookingPage />} />
        <Route path="/booking/:consultationId/payment" element={<PaymentPage />} />
        <Route path="/consultation/:consultationId" element={<ConsultationPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
```

---

## Step 7: Environment Variables

### `.env.local` (for frontend)

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

---

## Step 8: Styling

Add to `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Smooth transitions */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Step 9: Development Workflow

### Run Frontend Dev Server

```bash
cd frontend/nyaysetu-frontend
npm run dev
```

This will start the Vite dev server at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Key Features Implemented

✅ **Lawyer Marketplace**
- Browse and search lawyers
- Filter by specialization, rating, fees
- View detailed profiles

✅ **Booking System**
- Step-by-step booking wizard
- Real-time availability calendar
- Consultation type selection

✅ **Payment Integration**
- Secure Stripe checkout
- Payment status tracking
- Invoice download

✅ **Virtual Consultation**
- WebRTC video/audio
- Real-time chat
- Document sharing
- Case workspace

✅ **User Dashboard**
- View upcoming consultations
- Past consultation history
- Payment records
- Leave reviews

---

## Testing Stripe Payments

Use these test card numbers:

- **Successful**: 4242 4242 4242 4242
- **Requires Auth**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 0002

**Expiry**: Any future date  
**CVC**: Any 3-digit number

---

## Common Issues & Solutions

### CORS Issues
If you see CORS errors, update your backend CORS configuration:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("*")
            .allowCredentials(true);
    }
}
```

### WebSocket Connection Issues
Ensure signaling server is running:
```bash
cd signaling-server
npm start
```

### Stripe Key Not Found
Check that `.env.local` contains:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Next Steps

1. ✅ Set up Vite + React project structure
2. ✅ Install dependencies
3. ✅ Create API services
4. ✅ Build core components
5. ⏳ Integrate with backend APIs
6. ⏳ Test Stripe payment flow
7. ⏳ Implement WebRTC video
8. ⏳ Add real-time features
9. ⏳ Deploy to production

---

**Version**: 1.0  
**Last Updated**: May 22, 2026  
**Status**: Ready for Implementation
