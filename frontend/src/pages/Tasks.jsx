import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Plus, CheckCircle2, Circle, Trash2, Calendar, Tag as TagIcon, ListTodo } from 'lucide-react';
import { clsx } from 'clsx';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [category, setCategory] = useState('General');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const { data } = await api.post('/tasks', { title: newTaskTitle, category });
      setTasks([data.data, ...tasks]);
      setNewTaskTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map(t => t._id === id ? data.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
          <ListTodo className="text-accent" size={32} />
          Study Goals
        </h1>
        <p className="text-muted-foreground">Keep track of your assignments, goals, and checklists.</p>
      </header>

      <form onSubmit={addTask} className="mb-12 flex gap-3">
        <input 
          type="text" 
          placeholder="What's the next goal? (e.g. Finish React Hooks)" 
          className="input h-14 rounded-2xl text-lg flex-1"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <select 
          className="input h-14 w-40 rounded-2xl font-bold"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="General">General</option>
          <option value="Assignment">Assignment</option>
          <option value="Revision">Revision</option>
          <option value="Interview">Interview</option>
        </select>
        <button type="submit" className="btn btn-primary h-14 w-14 rounded-2xl p-0">
          <Plus size={24} />
        </button>
      </form>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <div 
                key={task._id} 
                className={clsx(
                  "card p-4 flex items-center gap-4 transition-all duration-300",
                  task.completed ? "opacity-50 grayscale" : "hover:scale-[1.01]"
                )}
              >
                <button 
                  onClick={() => toggleTask(task._id, task.completed)}
                  className={clsx(
                    "transition-colors",
                    task.completed ? "text-emerald-500" : "text-muted-foreground hover:text-accent"
                  )}
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={clsx("font-bold text-lg truncate", task.completed && "line-through text-muted-foreground")}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] uppercase tracking-widest font-black text-accent bg-accent/5 px-2 py-0.5 rounded">
                      {task.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 uppercase tracking-widest">
                      <Calendar size={10} />
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-muted/10">
              <p className="text-muted-foreground font-medium">All clear! No pending goals.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
