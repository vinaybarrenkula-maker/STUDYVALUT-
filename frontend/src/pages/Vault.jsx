import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Search, Plus, Tag, ArrowUpRight, Folder, 
  ChevronLeft, MoreVertical, BookOpen, Clock, Sparkles, Send, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';

const Vault = () => {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // AI Subject Folder Optimizer States
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [optimizerTab, setOptimizerTab] = useState('analyze'); // 'analyze', 'quiz', 'chat'
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [optimizerAnalysis, setOptimizerAnalysis] = useState('');
  const [optimizerQuiz, setOptimizerQuiz] = useState('');
  const [folderChatMessages, setFolderChatMessages] = useState([]);
  const [folderChatInput, setFolderChatInput] = useState('');
  const folderMessagesEndRef = React.useRef(null);

  useEffect(() => {
    // Reset optimizer state when changing subjects
    setIsOptimizerOpen(false);
    setOptimizerAnalysis('');
    setOptimizerQuiz('');
    setFolderChatMessages([
      { role: 'bot', text: `Welcome to the Subject Folder Optimizer! Ask a question whose answer lies across any notes inside this folder.` }
    ]);
  }, [selectedSubject]);

  useEffect(() => {
    if (isOptimizerOpen && optimizerTab === 'chat') {
      folderMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [folderChatMessages, optimizerTab, isOptimizerOpen]);

  const handleLoadOptimization = async () => {
    if (!selectedSubject) return;
    setOptimizerLoading(true);
    try {
      const { data } = await api.post('/ai/optimize-subject', { 
        subjectId: selectedSubject._id,
        action: 'analyze'
      });
      setOptimizerAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setOptimizerAnalysis('Failed to load folder optimization suggestions.');
    } finally {
      setOptimizerLoading(false);
    }
  };

  const handleLoadFolderQuiz = async () => {
    if (!selectedSubject) return;
    setOptimizerLoading(true);
    try {
      const { data } = await api.post('/ai/optimize-subject', { 
        subjectId: selectedSubject._id,
        action: 'quiz'
      });
      setOptimizerQuiz(data.quiz);
    } catch (err) {
      console.error(err);
      setOptimizerQuiz('Failed to load composite subject quiz.');
    } finally {
      setOptimizerLoading(false);
    }
  };

  const handleSendFolderDoubt = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !folderChatInput.trim() || optimizerLoading) return;

    const userMsg = { role: 'user', text: folderChatInput };
    setFolderChatMessages(prev => [...prev, userMsg]);
    const question = folderChatInput;
    setFolderChatInput('');
    setOptimizerLoading(true);

    try {
      const { data } = await api.post('/ai/optimize-subject', { 
        subjectId: selectedSubject._id,
        action: 'chat',
        question
      });
      setFolderChatMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setFolderChatMessages(prev => [...prev, { role: 'bot', text: 'Error solving doubt across folder context.' }]);
    } finally {
      setOptimizerLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterTag, selectedSubject]);

  const fetchData = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterTag) params.tag = filterTag;
      if (selectedSubject) params.subjectId = selectedSubject._id;
      
      const [resRes, subRes] = await Promise.all([
        api.get('/resources', { params }),
        api.get('/subjects')
      ]);
      
      setResources(resRes.data.data);
      setSubjects(subRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      const { data } = await api.post('/subjects', { name: newSubjectName });
      setSubjects([...subjects, data.data]);
      setNewSubjectName('');
      setShowAddSubject(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <div className="flex items-center gap-4 mb-2">
            {selectedSubject && (
              <button 
                onClick={() => setSelectedSubject(null)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-5xl font-black tracking-tighter">
              {selectedSubject ? selectedSubject.name : 'Knowledge Vault'}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            {selectedSubject 
              ? `Exploring ${resources.length} topics in ${selectedSubject.name}` 
              : 'Your curated library of wisdom and second brain.'}
          </p>
        </div>
        <div className="flex gap-3">
          {selectedSubject && resources.length > 0 && (
            <button 
              onClick={() => {
                setIsOptimizerOpen(!isOptimizerOpen);
                if (!isOptimizerOpen && !optimizerAnalysis) {
                  handleLoadOptimization();
                }
              }}
              className={clsx(
                "btn btn-outline gap-2 rounded-2xl px-6 bg-accent/5 text-accent border-none hover:bg-accent hover:text-white transition-all shadow-md",
                isOptimizerOpen && "bg-accent text-white hover:bg-accent/90"
              )}
            >
              <Sparkles size={18} />
              AI Folder Optimizer
            </button>
          )}
          <button 
            onClick={() => setShowAddSubject(true)}
            className="btn btn-outline gap-2 rounded-2xl px-6"
          >
            <Folder size={18} />
            New Folder
          </button>
          <Link to="/editor/new" className="btn btn-primary gap-2 rounded-2xl px-8 shadow-lg shadow-accent/20">
            <Plus size={18} />
            New Entry
          </Link>
        </div>
      </div>

      {/* AI Subject Optimizer Dashboard Section */}
      {selectedSubject && isOptimizerOpen && (
         <div className="mb-12 bg-muted/20 border border-accent/20 rounded-3xl p-8 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden font-sans">
            {/* Background glowing effects for premium aesthetic */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 p-2 rounded-2xl text-accent">
                  <Sparkles size={24} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">AI Subject Optimizer</h2>
                  <p className="text-xs text-muted-foreground font-medium">Analyzing folder: {selectedSubject.name}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'analyze', label: 'Health & Weaknesses' },
                  { id: 'chat', label: 'Folder Doubt Chat' },
                  { id: 'quiz', label: 'Subject Practice Test' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setOptimizerTab(tab.id);
                      if (tab.id === 'analyze' && !optimizerAnalysis) handleLoadOptimization();
                      if (tab.id === 'quiz' && !optimizerQuiz) handleLoadFolderQuiz();
                    }}
                    className={clsx(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                      optimizerTab === tab.id 
                        ? "bg-foreground text-background shadow-sm" 
                        : "bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="h-px bg-border/50 w-full mb-6" />

            {optimizerLoading && (
              <div className="space-y-4 py-8 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-20 bg-muted rounded w-full" />
              </div>
            )}

            {!optimizerLoading && (
              <div className="text-sm leading-relaxed">
                {optimizerTab === 'analyze' && (
                  <div className="prose max-w-none text-foreground/90 dark:prose-invert">
                    <ReactMarkdown>{optimizerAnalysis}</ReactMarkdown>
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleLoadOptimization} className="btn btn-outline btn-sm rounded-xl">Refresh Analysis</button>
                    </div>
                  </div>
                )}

                {optimizerTab === 'quiz' && (
                  <div className="prose max-w-none text-foreground/90 dark:prose-invert">
                    <ReactMarkdown>{optimizerQuiz}</ReactMarkdown>
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleLoadFolderQuiz} className="btn btn-outline btn-sm rounded-xl">Generate New Test</button>
                    </div>
                  </div>
                )}

                {optimizerTab === 'chat' && (
                  <div className="flex flex-col min-h-[300px]">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[300px] pr-2 no-scrollbar">
                      {folderChatMessages.map((msg, idx) => (
                        <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                          <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                            msg.role === 'user' ? "bg-muted" : "bg-accent/10 text-accent"
                          )}>
                            {msg.role === 'user' ? 'YOU' : 'AI'}
                          </div>
                          <div className={clsx(
                            "max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed",
                            msg.role === 'user' 
                              ? "bg-foreground text-background rounded-tr-none" 
                              : "bg-muted text-foreground rounded-tl-none border border-border/50"
                          )}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      <div ref={folderMessagesEndRef} />
                    </div>

                    <form onSubmit={handleSendFolderDoubt} className="flex gap-2 items-center border-t border-border/50 pt-4 mt-2">
                      <input 
                        type="text" 
                        value={folderChatInput}
                        onChange={(e) => setFolderChatInput(e.target.value)}
                        placeholder={`Ask a question across all notes in ${selectedSubject.name}...`}
                        className="flex-1 bg-muted border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-accent transition-all text-foreground"
                      />
                      <button 
                        type="submit" 
                        disabled={!folderChatInput.trim() || optimizerLoading}
                        className="btn btn-primary rounded-xl px-6 py-3 text-xs flex gap-2 items-center"
                      >
                        <Send size={12} />
                        Ask doubt
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
         </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search within your vault..." 
            className="input pl-12 h-14 rounded-2xl text-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select 
            className="input w-48 h-14 rounded-2xl font-bold bg-muted/50 border-none"
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">All Tags</option>
            <option value="important">#important</option>
            <option value="revision">#revision</option>
            <option value="exam">#exam</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-3xl" />)}
        </div>
      ) : (
        <div className="space-y-16">
          {/* Subjects Section (Only show if not in a specific subject) */}
          {!selectedSubject && subjects.length > 0 && !searchTerm && (
            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                <Folder size={14} />
                Subject Folders
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subjects.map(sub => (
                  <button 
                    key={sub._id}
                    onClick={() => setSelectedSubject(sub)}
                    className="card group p-6 flex flex-col items-start gap-4 hover:border-accent/40 text-left transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                      <Folder size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{sub.name}</h3>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        {resources.filter(r => r.subjectId === sub._id).length} Topics
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Resources Section */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
              <BookOpen size={14} />
              {selectedSubject ? 'Subject Topics' : 'Recent Resources'}
            </h2>
            {resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resources.map(resource => (
                  <Link 
                    to={`/editor/${resource._id}`} 
                    key={resource._id} 
                    className="card group flex flex-col min-h-[200px] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] active:scale-95 transition-all duration-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-black tracking-tight group-hover:text-accent transition-colors line-clamp-2 leading-[1.1]">
                        {resource.title}
                      </h3>
                      <ArrowUpRight size={20} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {resource.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] uppercase tracking-widest font-black text-muted-foreground px-2 py-1 bg-muted rounded-md group-hover:text-accent group-hover:bg-accent/5 transition-colors">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        <span className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Lvl {resource.masteryLevel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(resource.lastReviewed).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-muted/20 rounded-3xl border border-dashed border-border">
                <p className="text-muted-foreground font-medium text-lg">Empty for now. Start adding knowledge!</p>
                <button onClick={() => {setSearchTerm(''); setFilterTag(''); setSelectedSubject(null);}} className="text-accent font-bold mt-2 hover:underline">Reset filters</button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-background border rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black mb-6">Create New Subject</h2>
            <form onSubmit={createSubject} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Subject Name</label>
                <input 
                  type="text" 
                  className="input h-14 rounded-2xl text-lg"
                  placeholder="e.g. Data Structures, OS..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddSubject(false)}
                  className="flex-1 btn btn-outline h-12 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn btn-primary h-12 rounded-xl"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vault;
