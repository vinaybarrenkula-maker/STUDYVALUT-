import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Code, Plus, Copy, Check, Search, Tag as TagIcon, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Snippets = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchSnippets();
  }, [searchTerm]);

  const fetchSnippets = async () => {
    try {
      const { data } = await api.get('/resources', { 
        params: { type: 'snippet', search: searchTerm } 
      });
      setSnippets(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteSnippet = async (id) => {
    if (!window.confirm('Delete this snippet?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setSnippets(snippets.filter(s => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-4 flex items-center gap-4">
            <Code className="text-accent" size={48} />
            Snippet Vault
          </h1>
          <p className="text-muted-foreground text-lg">Reusable algorithms, templates, and boilerplates.</p>
        </div>
        <Link to="/editor/new?type=snippet" className="btn btn-primary gap-2 rounded-2xl px-8 py-4 h-auto shadow-xl shadow-accent/10">
          <Plus size={20} />
          Add Snippet
        </Link>
      </header>

      <div className="relative mb-12 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search snippets by title or tags..." 
          className="input pl-14 h-14 rounded-2xl text-lg shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {snippets.length > 0 ? (
            snippets.map(snippet => (
              <div key={snippet._id} className="card group p-0 overflow-hidden flex flex-col bg-muted/20 border-border/40 hover:border-accent/40 transition-all duration-500">
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-background">
                  <div className="min-w-0">
                    <h3 className="font-bold text-xl truncate">{snippet.title}</h3>
                    <div className="flex gap-2 mt-1">
                      {snippet.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => copyToClipboard(snippet.content, snippet._id)}
                      className="p-2 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all"
                    >
                      {copiedId === snippet._id ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    </button>
                    <Link to={`/editor/${snippet._id}`} className="p-2 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
                <div className="relative group/code">
                  <pre className="p-6 text-sm font-mono overflow-x-auto bg-[#0d1117] text-[#c9d1d9] min-h-[150px] max-h-[300px]">
                    <code>{snippet.content}</code>
                  </pre>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent opacity-40 pointer-events-none" />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-32 border border-dashed border-border rounded-3xl bg-muted/10">
              <p className="text-muted-foreground font-medium text-lg">No snippets found. Start building your library!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Snippets;
