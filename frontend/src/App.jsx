import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AIChatBoard from './components/AIChatBoard';

// Pages

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Vault from './pages/Vault';
import Editor from './pages/Editor';
import Tasks from './pages/Tasks';
import Snippets from './pages/Snippets';
import Resources from './pages/Resources';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>

      <Router>
        <div className="min-h-screen bg-background font-sans">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vault" 
                element={
                  <ProtectedRoute>
                    <Vault />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/snippets" 
                element={
                  <ProtectedRoute>
                    <Snippets />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resources" 
                element={
                  <ProtectedRoute>
                    <Resources />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/editor/:id" 
                element={
                  <ProtectedRoute>
                    <Editor />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <AIChatBoard />
        </div>

      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

