import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { FolderOpen, Plus, ExternalLink, Globe, FileText, Trash2, Search, Link as LinkIcon } from 'lucide-react';
import { clsx } from 'clsx';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState('link');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [searchTerm]);

  const fetchResources = async () => {
    try {
      const { data } = await api.get('/resources', { 
        params: { search: searchTerm } 
      });
      setResources(data.data.filter(r => r.type === 'link' || r.type === 'file' || r.url));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/resources', {
        title: newTitle,
        url: newUrl,
        type: 'link',
        tags: ['link']
      });
      setResources([data.data, ...resources]);
      setNewTitle('');
      setNewUrl('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === resources.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(resources.map(r => r._id));
    }
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} resources permanently?`)) return;
    try {
      await api.delete('/resources', { data: { ids: selectedIds } });
      setResources(resources.filter(r => !selectedIds.includes(r._id)));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm('Remove this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter(r => r._id !== id));
      setSelectedIds(selectedIds.filter(i => i !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setUploading(true);
    try {
      const { data } = await api.post('/resources/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResources([...data.data, ...resources]);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-4 flex items-center gap-4">
            <FolderOpen className="text-accent" size={48} />
            Resource Hub
          </h1>
          <p className="text-muted-foreground text-lg">Central storage for PDFs, YouTube playlists, and GitHub links.</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={bulkDelete}
              className="btn bg-red-500 hover:bg-red-600 text-white gap-2 rounded-2xl px-6 h-auto shadow-xl shadow-red-500/10 transition-all animate-in zoom-in-95"
            >
              <Trash2 size={18} />
              Delete {selectedIds.length}
            </button>
          )}
          <label className="btn btn-outline gap-2 rounded-2xl px-6 cursor-pointer hover:bg-accent/5 hover:border-accent/20 transition-all">
            <Plus size={18} />
            Import Folder
            <input 
              type="file" 
              className="hidden" 
              webkitdirectory="true" 
              directory="" 
              multiple 
              onChange={handleFileUpload}
            />
          </label>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary gap-2 rounded-2xl px-8 py-4 h-auto shadow-xl shadow-accent/10"
          >
            <Plus size={20} />
            Add Resource
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between mb-8">
        <div className="relative flex-grow mr-6 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="input pl-14 h-14 rounded-2xl text-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {resources.length > 0 && (
          <button 
            onClick={selectAll}
            className="text-sm font-bold text-muted-foreground hover:text-accent transition-colors whitespace-nowrap px-4"
          >
            {selectedIds.length === resources.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.length > 0 ? (
            resources.map(res => (
              <div 
                key={res._id} 
                onClick={() => selectedIds.length > 0 && toggleSelect(res._id)}
                className={clsx(
                  "card group p-6 transition-all duration-300 relative overflow-hidden",
                  selectedIds.includes(res._id) ? "border-accent ring-2 ring-accent/20" : "hover:border-accent/40",
                  selectedIds.length > 0 && "cursor-pointer"
                )}
              >
                {/* Selection Overlay/Checkbox */}
                <div className={clsx(
                  "absolute top-4 right-4 z-10 transition-all duration-300",
                  selectedIds.includes(res._id) ? "opacity-100 scale-100" : "opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100"
                )}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(res._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(res._id);
                    }}
                    className="w-5 h-5 rounded-md border-border text-accent focus:ring-accent"
                  />
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                    {res.url?.includes('youtube.com') ? <Globe size={24} /> : res.type === 'file' ? <FileText size={24} /> : <LinkIcon size={24} />}
                  </div>
                  {selectedIds.length === 0 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteResource(res._id);
                      }} 
                      className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-2 truncate">{res.title}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <a 
                    href={res.url.startsWith('http') ? res.url : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000'}${res.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                  >
                    Visit Resource
                    <ExternalLink size={14} />
                  </a>
                  <span className="text-[10px] font-black uppercase text-muted-foreground/40">{res.type}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 border border-dashed border-border rounded-3xl bg-muted/10">
              <p className="text-muted-foreground font-medium">No external resources yet.</p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-background border rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black mb-6">Add New Resource</h2>
            
            <div className="mb-8 p-6 border-2 border-dashed border-border rounded-2xl text-center hover:border-accent/40 transition-all cursor-pointer relative group">
              <input 
                type="file" 
                multiple 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2">
                <Plus size={32} className="text-muted-foreground group-hover:text-accent transition-colors" />
                <p className="text-sm font-bold text-muted-foreground">Drop files or click to upload</p>
                <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">PDF, Images, etc.</p>
              </div>
            </div>

            <div className="relative flex items-center mb-8">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">OR ADD LINK</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Title</label>
                <input 
                  type="text" 
                  className="input h-12 rounded-xl"
                  placeholder="e.g. React Docs, YT Playlist..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">URL</label>
                <input 
                  type="url" 
                  className="input h-12 rounded-xl"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn btn-outline h-12 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 btn btn-primary h-12 rounded-xl"
                >
                  {uploading ? 'Uploading...' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
