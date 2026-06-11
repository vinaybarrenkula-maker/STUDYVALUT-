import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle, Clock, Star, ArrowRight, BookOpen, 
  ListTodo, Code, BarChart3, Zap, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyFocus, setDailyFocus] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, focusRes] = await Promise.all([
        api.get('/resources/stats'),
        api.get('/resources/daily-focus')
      ]);
      setStats(statsRes.data.data);
      setDailyFocus(focusRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (id) => {
    try {
      await api.patch(`/resources/${id}/review`);
      setDailyFocus(dailyFocus.filter(item => item._id !== id));
      // Refresh stats
      const { data } = await api.get('/resources/stats');
      setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto py-20 px-6 animate-pulse">
      <div className="h-20 w-1/3 bg-muted rounded-2xl mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
      </div>
      <div className="h-96 bg-muted rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <header className="mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-2">
          Welcome back, <span className="text-accent">{user?.name ? user.name.split(' ')[0] : ''}</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Your academic workspace is synced and ready.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<BookOpen size={20} />} 
          label="Subjects" 
          value={stats?.totalSubjects || 0} 
          color="bg-blue-500/10 text-blue-500" 
        />
        <StatCard 
          icon={<Zap size={20} />} 
          label="Total Revisions" 
          value={stats?.totalRevisions || 0} 
          color="bg-amber-500/10 text-amber-500" 
        />
        <StatCard 
          icon={<ListTodo size={20} />} 
          label="Pending Tasks" 
          value={stats?.pendingTasks || 0} 
          color="bg-emerald-500/10 text-emerald-500" 
        />
        <StatCard 
          icon={<BarChart3 size={20} />} 
          label="Avg. Mastery" 
          value={`${stats?.averageMastery || 0}/5`} 
          color="bg-purple-500/10 text-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Section: Daily Focus */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="text-accent" />
              Daily Revision Focus
            </h2>
            <Link to="/vault" className="text-sm font-semibold text-accent hover:underline">View All</Link>
          </div>

          {dailyFocus.length > 0 ? (
            <div className="space-y-4">
              {dailyFocus.map((item) => (
                <div key={item._id} className="card group flex items-center justify-between p-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      {item.priority === 'High' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                      <h3 className="font-bold text-lg truncate group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-accent text-accent" />
                        Lvl {item.masteryLevel}
                      </span>
                      <span>•</span>
                      <span>Revised {item.revisionCount || 0} times</span>
                      {item.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-2">
                            {item.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="bg-muted px-2 py-0.5 rounded">#{tag}</span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Link to={`/editor/${item._id}`} className="btn btn-outline h-10 w-10 p-0 rounded-full">
                      <ArrowRight size={18} />
                    </Link>
                    <button 
                      onClick={() => markAsReviewed(item._id)}
                      className="btn btn-primary h-10 px-5 rounded-full text-sm"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-muted/20">
              <p className="text-muted-foreground font-medium">No urgent reviews today. Great job!</p>
            </div>
          )}
        </section>

        {/* Sidebar: Recent & Tasks */}
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-accent" />
              Recently Viewed
            </h2>
            <div className="space-y-3">
              {stats?.recentlyReviewed?.map(item => (
                <Link 
                  key={item._id} 
                  to={`/editor/${item._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <BookOpen size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {new Date(item.lastReviewed).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-accent/5 rounded-2xl p-6 border border-accent/10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Code size={18} className="text-accent" />
              Snippet Vault
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Quickly access your algorithms and reusable code blocks.
            </p>
            <Link to="/snippets" className="btn btn-primary w-full rounded-xl">
              Open Snippets
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="card p-6 flex flex-col gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  </div>
);

export default Dashboard;
