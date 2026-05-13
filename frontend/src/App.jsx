import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Installation from './pages/Installation';
import Survey from './pages/Survey';
import ThankYou from './pages/ThankYou';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';
import { AuthContext } from './utils/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './utils/firebase';

function App() {
  const [user, setUser] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [surveyData, setSurveyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef(null);

  const startRealtimeListener = () => {
    if (unsubscribeRef.current) return;
    unsubscribeRef.current = onSnapshot(
      collection(db, 'surveyResponses'),
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSurveyData(docs);
      },
      (error) => {
        console.error('Firestore listener error:', error);
        // Reset so the listener can be restarted on next auth state change
        unsubscribeRef.current = null;
      }
    );
  };

  const stopRealtimeListener = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const freshToken = await firebaseUser.getIdToken();
        localStorage.setItem('jwtToken', freshToken);
        localStorage.setItem('user', JSON.stringify({
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        }));
        setUser({ email: firebaseUser.email, uid: firebaseUser.uid });
        setIsAuthenticated(true);
        startRealtimeListener();
      } else {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        setUser({});
        setIsAuthenticated(false);
        stopRealtimeListener();
        setSurveyData([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      stopRealtimeListener();
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      surveyData,
      setSurveyData,
      startRealtimeListener,
      stopRealtimeListener
    }}>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/installation-selection' element={<Installation />} />
          <Route path='/survey/:installationId' element={<Survey />} />
          <Route path='/survey-complete' element={<ThankYou />} />
          <Route path='/login' element={<Login />} />
          <Route path='/sign-up' element={<Signup />} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
