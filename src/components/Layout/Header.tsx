import React from 'react';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 ml-64">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{user?.email || 'Administrator'}</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;