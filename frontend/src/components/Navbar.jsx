import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Book, LayoutDashboard, Sun, Moon, Coffee, Zap, ListTodo, Code, FolderOpen } from 'lucide-react';

import { clsx } from 'clsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={clsx(
          "text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-lg",
          isActive ? "text-accent bg-accent/5" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Icon size={18} />
        {children}
      </Link>
    );
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tighter">
          STUDY<span className="text-accent">VAULT</span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/vault" icon={Book}>Vault</NavLink>
              <NavLink to="/tasks" icon={ListTodo}>Tasks</NavLink>
              <NavLink to="/snippets" icon={Code}>Snippets</NavLink>
              <NavLink to="/resources" icon={FolderOpen}>Resources</NavLink>
            </>
          ) : (
            <>
              <Link to="/#features" className="text-sm font-bold text-muted-foreground hover:text-foreground px-4 py-2">Features</Link>
              <Link to="/#pricing" className="text-sm font-bold text-muted-foreground hover:text-foreground px-4 py-2">Pricing</Link>
              <Link to="/about" className="text-sm font-bold text-muted-foreground hover:text-foreground px-4 py-2 mr-4">About</Link>
            </>
          )}
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
            <button 
              onClick={() => toggleTheme('light')}
              className={clsx("p-1.5 rounded-lg transition-all", theme === 'light' ? "bg-background shadow-sm text-accent" : "text-muted-foreground hover:text-foreground")}
            >
              <Sun size={16} />
            </button>
            <button 
              onClick={() => toggleTheme('dark')}
              className={clsx("p-1.5 rounded-lg transition-all", theme === 'dark' ? "bg-background shadow-sm text-accent" : "text-muted-foreground hover:text-foreground")}
            >
              <Moon size={16} />
            </button>
            <button 
              onClick={() => toggleTheme('midnight')}
              className={clsx("p-1.5 rounded-lg transition-all", theme === 'midnight' ? "bg-background shadow-sm text-accent" : "text-muted-foreground hover:text-foreground")}
            >
              <Zap size={16} />
            </button>
            <button 
              onClick={() => toggleTheme('sepia')}
              className={clsx("p-1.5 rounded-lg transition-all", theme === 'sepia' ? "bg-background shadow-sm text-accent" : "text-muted-foreground hover:text-foreground")}
            >
              <Coffee size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-2" />
          
          {user ? (
            <button 
              onClick={() => logout().then(() => navigate('/'))}
              className="text-sm font-bold text-red-500 hover:bg-red-500/5 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-bold hover:text-accent px-4">Sign In</Link>
              <Link to="/signup" className="btn btn-primary h-11 px-6 rounded-xl text-sm shadow-lg shadow-accent/10">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
