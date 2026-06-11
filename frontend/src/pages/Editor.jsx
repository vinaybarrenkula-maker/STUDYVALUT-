import React, { useState, useEffect, useRef } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAutosave } from '../hooks/useAutosave';
import ReactMarkdown from 'react-markdown';
import { Save, Eye, Edit3, ArrowLeft, Maximize2, Minimize2, Trash2, Tag, BookOpen, X, Sparkles, Send } from 'lucide-react';

import { clsx } from 'clsx';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [isZen, setIsZen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const titleRef = useRef(null);

  // AI Assistant States
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiTab, setAiTab] = useState('summary'); // 'summary', 'terms', 'chat', 'quiz'
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiTerms, setAiTerms] = useState('');
  const [aiQuiz, setAiQuiz] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAiOpen && aiTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, aiTab, isAiOpen]);

  const handleLoadSummary = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/summarize-note', { resourceId: id });
      setAiSummary(data.summary);
    } catch (err) {
      console.error(err);
      setAiSummary('Failed to generate summary. Make sure the note has content.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleLoadTerms = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/explain-terms', { resourceId: id });
      setAiTerms(data.terms);
    } catch (err) {
      console.error(err);
      setAiTerms('Failed to explain terms.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleLoadQuiz = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/generate-quiz', { resourceId: id });
      setAiQuiz(data.quiz);
    } catch (err) {
      console.error(err);
      setAiQuiz('Failed to generate quiz.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendDoubt = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || aiLoading) return;

    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const question = chatInput;
    setChatInput('');
    setAiLoading(true);

    try {
      const { data } = await api.post('/ai/ask-note-doubt', { resourceId: id, question });
      setChatMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Error trying to connect and clear your doubt.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const { saving } = useAutosave(!isNew ? id : null, { title, content, tags: (tags || '').split(',').map(t => t.trim()).filter(Boolean) });

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [title]);

  useEffect(() => {
    fetchSubjects();
    if (!isNew) {
      fetchResource();
    }
  }, [id]);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResource = async () => {
    try {
      const { data } = await api.get(`/resources/${id}`);
      setTitle(data.data.title);
      setContent(data.data.content);
      setTags(data.data.tags ? data.data.tags.join(', ') : '');
      setSubjectId(data.data.subjectId || '');
      setChatMessages([
        { role: 'bot', text: `Hi! I'm your AI Study Companion. I have analyzed your note "${data.data.title}". Ask me any questions or doubts you have about this topic!` }
      ]);
    } catch (err) {
      console.error(err);
      navigate('/vault');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const finalTitle = title.trim() || 'Untitled Wisdom';
      const { data } = await api.post('/resources', {
        title: finalTitle,
        content,
        subjectId: subjectId || null,
        tags: (tags || '').split(',').map(t => t.trim()).filter(Boolean),
        masteryLevel: 1
      });
      navigate(`/editor/${data.data._id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create note. Please try again.';
      alert(msg);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this resource permanently?')) {
      try {
        await api.delete(`/resources/${id}`);
        navigate('/vault');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-12">Loading...</div>;

  return (
    <div className={clsx("min-h-screen bg-background transition-all duration-500 selection:bg-accent/20 flex", isZen && "fixed inset-0 z-[100] overflow-y-auto")}>
      <div className={clsx("flex-1 transition-all duration-500 no-scrollbar", isZen ? "zen-mode" : "max-w-5xl mx-auto py-12 px-6", isAiOpen && !isZen && "xl:mr-[420px]")}>
        {/* Toolbar */}
        <div className={clsx("flex items-center justify-between mb-16", isZen && "opacity-0 hover:opacity-100 transition-opacity duration-500 focus-within:opacity-100")}>
          <div className="flex items-center gap-4">
            {!isZen && (
              <button onClick={() => navigate('/vault')} className="btn btn-outline p-2.5 h-10 w-10 rounded-full border-none hover:bg-accent/5 hover:text-accent">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className={clsx("w-2 h-2 rounded-full", saving ? "bg-amber-400 animate-pulse" : "bg-emerald-500")} />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                {saving ? 'Syncing' : 'Synced'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isNew && (
              <button 
                onClick={() => {
                  setIsAiOpen(!isAiOpen);
                  if (!aiSummary && !isAiOpen) {
                    handleLoadSummary();
                  }
                }} 
                className={clsx("btn btn-outline gap-2 border-none rounded-full bg-accent/5 text-accent hover:bg-accent hover:text-white transition-all", isAiOpen && "bg-accent text-white hover:bg-accent/90")}
              >
                <Sparkles size={18} />
                AI Helper
              </button>
            )}
            <button 
              onClick={() => setIsPreview(!isPreview)} 
              className={clsx("btn btn-outline gap-2 border-none rounded-full", isPreview && "bg-accent/10 text-accent")}
            >
              {isPreview ? <Edit3 size={18} /> : <Eye size={18} />}
              {isPreview ? 'Edit' : 'Preview'}
            </button>
            <button 
              onClick={() => setIsZen(!isZen)} 
              className={clsx("btn btn-outline gap-2 border-none rounded-full", isZen && "bg-accent/10 text-accent")}
            >
              {isZen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              {isZen ? 'Exit' : 'Focus'}
            </button>
            {isNew ? (
              <button onClick={handleCreate} className="btn btn-primary rounded-full px-8">Create</button>
            ) : (
              <button onClick={handleDelete} className="btn text-red-500 hover:bg-red-50 p-2.5 rounded-full">
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="space-y-10">
          <textarea 
            ref={titleRef}
            rows="1"
            placeholder="Untitled Wisdom"
            className="text-6xl font-black w-full bg-transparent border-none focus:ring-0 placeholder:text-foreground/10 tracking-tighter resize-none overflow-hidden leading-tight text-foreground"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <div className="flex flex-col md:flex-row gap-6 mb-10">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-focus-within:bg-accent/20 group-focus-within:text-accent transition-colors">
                  <Tag size={14} />
                </div>
                <input 
                  type="text" 
                  placeholder="ADD TAGS SEPARATED BY COMMAS..."
                  className="text-xs font-bold uppercase tracking-[0.2em] w-full bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground/40"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-3 group">
                <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-focus-within:bg-accent/20 group-focus-within:text-accent transition-colors">
                  <BookOpen size={14} />
                </div>
                <select 
                  className="text-xs font-bold uppercase tracking-[0.2em] w-full bg-transparent border-none focus:ring-0 text-foreground"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {isPreview ? (
            <div className="prose max-w-none min-h-[60vh] animate-in fade-in slide-in-from-bottom-2 duration-500 text-foreground/90">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <textarea 
              placeholder="The deep dive starts here..."
              className="w-full min-h-[60vh] bg-transparent border-none focus:ring-0 resize-none text-xl leading-relaxed placeholder:text-muted-foreground/30 font-medium no-scrollbar text-foreground"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}
        </div>

      </div>

      {/* AI Assistant Sidebar */}
      {isAiOpen && !isZen && (
        <div className="fixed top-0 right-0 h-screen w-full md:w-[420px] bg-background border-l border-border/80 shadow-2xl flex flex-col z-[80] animate-in slide-in-from-right duration-300 font-sans">
          {/* Header */}
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="bg-accent/10 p-2 rounded-xl text-accent">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">AI Note Companion</h3>
                <span className="text-xs text-muted-foreground font-medium">Clear doubts & analyze content</span>
              </div>
            </div>
            <button 
              onClick={() => setIsAiOpen(false)}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/50 p-2 gap-1 bg-muted/10">
            {[
              { id: 'summary', label: 'Summary' },
              { id: 'terms', label: 'Terms' },
              { id: 'chat', label: 'Doubt Chat' },
              { id: 'quiz', label: 'Practice Quiz' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setAiTab(tab.id);
                  if (tab.id === 'summary' && !aiSummary) handleLoadSummary();
                  if (tab.id === 'terms' && !aiTerms) handleLoadTerms();
                  if (tab.id === 'quiz' && !aiQuiz) handleLoadQuiz();
                }}
                className={clsx(
                  "flex-1 py-2 px-1 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                  aiTab === tab.id 
                    ? "bg-foreground text-background shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {aiLoading && (
              <div className="space-y-4 py-8 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-24 bg-muted rounded w-full" />
              </div>
            )}

            {!aiLoading && aiTab === 'summary' && (
              <div className="prose max-w-none text-sm text-foreground/90 leading-relaxed dark:prose-invert">
                {aiSummary ? (
                  <>
                    <ReactMarkdown>{aiSummary}</ReactMarkdown>
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleLoadSummary} className="btn btn-outline btn-sm rounded-full gap-1">
                        Regenerate
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">No summary generated yet.</p>
                    <button onClick={handleLoadSummary} className="btn btn-primary btn-sm rounded-full">Generate Summary</button>
                  </div>
                )}
              </div>
            )}

            {!aiLoading && aiTab === 'terms' && (
              <div className="prose max-w-none text-sm text-foreground/90 leading-relaxed dark:prose-invert">
                {aiTerms ? (
                  <>
                    <ReactMarkdown>{aiTerms}</ReactMarkdown>
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleLoadTerms} className="btn btn-outline btn-sm rounded-full gap-1">
                        Regenerate
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">No terms analyzed yet.</p>
                    <button onClick={handleLoadTerms} className="btn btn-primary btn-sm rounded-full">Analyze Terms</button>
                  </div>
                )}
              </div>
            )}

            {!aiLoading && aiTab === 'quiz' && (
              <div className="prose max-w-none text-sm text-foreground/90 leading-relaxed dark:prose-invert">
                {aiQuiz ? (
                  <>
                    <ReactMarkdown>{aiQuiz}</ReactMarkdown>
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleLoadQuiz} className="btn btn-outline btn-sm rounded-full gap-1">
                        Regenerate
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">No practice quiz generated yet.</p>
                    <button onClick={handleLoadQuiz} className="btn btn-primary btn-sm rounded-full">Generate Quiz</button>
                  </div>
                )}
              </div>
            )}

            {aiTab === 'chat' && (
              <div className="flex flex-col h-full -mx-6 -my-6">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                      <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold tracking-tighter",
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
                  {aiLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold">
                        AI
                      </div>
                      <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendDoubt} className="p-4 border-t border-border/50 bg-background bg-card">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a doubt about this note..."
                      className="w-full bg-muted border-none rounded-xl pl-4 pr-12 py-3 text-xs focus:ring-1 focus:ring-accent transition-all text-foreground"
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim() || aiLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-foreground text-background disabled:opacity-30 transition-opacity"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;


