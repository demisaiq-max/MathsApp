import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthContainer from './components/Auth/AuthContainer';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import AnswerSheets from './components/AnswerSheets/AnswerSheets';
import Submissions from './components/Submissions/Submissions';
import AutoGrading from './components/Grading/AutoGrading';
import Results from './components/Results/Results';
import Students from './components/Students/Students';
import StudentBoard from './components/Board/StudentBoard';
import StudentPortal from './components/Student/StudentPortal';
import AdminPortal from './components/Admin/AdminPortal';
import { LogOut } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthContainer />;
  }

  // Show loading while profile is being fetched
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect students to a different interface (for now, show message)
  if (profile.role === 'student') {
    return <StudentPortal />;
  }

  // Show new admin portal
  if (profile.role === 'admin') {
    return <AdminPortal />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'answer-sheets':
        return <AnswerSheets />;
      case 'submissions':
        return <Submissions />;
      case 'grading':
        return <AutoGrading />;
      case 'results':
        return <Results />;
      case 'students':
        return <Students />;
      case 'board':
        return <StudentBoard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <Header />
      <main className="ml-64 pt-16">
        {renderContent()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;