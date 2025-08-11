import React from 'react';
import { 
  Home, 
  FileText, 
  Send, 
  BarChart3, 
  Users, 
  MessageSquare,
  Calculator,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'answer-sheets', label: 'Answer Sheets', icon: FileText },
    { id: 'submissions', label: 'Submissions', icon: Send },
    { id: 'grading', label: 'Auto Grading', icon: Calculator },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'board', label: 'Student Board', icon: MessageSquare },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">MathTrack</h1>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-slate-800 transition-colors ${
                activeSection === item.id ? 'bg-slate-800 border-r-2 border-blue-400' : ''
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;