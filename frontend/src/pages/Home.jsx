import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Zap, Sparkles, 
  ArrowRight, BrainCircuit, Layout,
  Shield, Layers, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto pt-32 pb-20 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-bold mb-8">
            <Sparkles size={16} />
            The Future of Academic Productivity
          </div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            YOUR SECOND BRAIN <br />
            <span className="text-accent">FOR DEEP LEARNING.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium">
            Study Vault is a professional academic workspace designed to help you organize, 
            track, and master your knowledge with precision.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn btn-primary h-16 px-10 rounded-2xl text-lg shadow-2xl shadow-accent/20 gap-2">
              Get Started for Free
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-outline h-16 px-10 rounded-2xl text-lg border-2">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto py-32 px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Everything you need <br /> to excel.</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From quick thoughts to complex algorithms, Study Vault provides the tools to manage your academic life.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BrainCircuit size={32} />}
            title="Smart Organization"
            description="Categorize your studies by subjects, folders, and tags. Never lose a note again."
          />
          <FeatureCard 
            icon={<Zap size={32} />}
            title="Revision Tracker"
            description="Spaced repetition logic surfaces what you need to review, right when you need it."
          />
          <FeatureCard 
            icon={<Layout size={32} />}
            title="Snippet Vault"
            description="Store and organize reusable code blocks and algorithms with syntax highlighting."
          />
          <FeatureCard 
            icon={<Shield size={32} />}
            title="Secure & Private"
            description="Your data is encrypted and synced across all your devices securely."
          />
          <FeatureCard 
            icon={<Sparkles size={32} />}
            title="AI Assisted"
            description="Get help with complex topics using our integrated AI study companion."
          />
          <FeatureCard 
            icon={<Layers size={32} />}
            title="Resource Hub"
            description="Keep your PDFs, external links, and study materials in one organized place."
          />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-7xl mx-auto py-32 px-6 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Built for the <br /> modern student.</h2>
            <div className="space-y-6">
              <AboutItem 
                title="Minimalist Design"
                description="A distraction-free interface that puts your focus where it belongs: on your studies."
              />
              <AboutItem 
                title="Cloud Synchronized"
                description="Access your vault from any device, anywhere in the world. Your notes are always with you."
              />
              <AboutItem 
                title="Built by Scholars"
                description="Designed by students who understand the challenges of managing complex academic workloads."
              />
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-accent/20 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="aspect-square bg-muted rounded-[40px] border border-border overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=1200" 
                alt="Modern Study Workspace" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 bg-background/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Deep Learning Mode</p>
                    <p className="text-xs text-muted-foreground">Optimized for maximum focus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto py-32 px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Simple, transparent <br /> pricing for everyone.</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that fits your academic journey. Start for free and upgrade as you grow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard 
            title="Student"
            price="0"
            description="Perfect for individuals starting their academic journey."
            features={[
              "Up to 100 Notes",
              "Basic Revision Tracker",
              "Snippet Vault (50 blocks)",
              "Cloud Sync (2 devices)",
              "Community Support"
            ]}
          />
          <PricingCard 
            title="Scholar"
            price="9"
            description="Advanced tools for serious researchers and students."
            highlight={true}
            features={[
              "Unlimited Notes",
              "Smart AI Companion",
              "Advanced Analytics",
              "Unlimited Devices",
              "Priority Support",
              "Resource Hub (5GB)"
            ]}
          />
          <PricingCard 
            title="Institution"
            price="29"
            description="Custom solutions for teams and academic departments."
            features={[
              "Everything in Scholar",
              "Collaborative Vaults",
              "Admin Dashboard",
              "Custom Integrations",
              "SSO Authentication",
              "Dedicated Manager"
            ]}
          />
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <Stat value="10k+" label="Active Students" />
          <Stat value="500k+" label="Notes Created" />
          <Stat value="99.9%" label="Sync Uptime" />
          <Stat value="4.9/5" label="User Rating" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto py-32 px-6">
        <div className="bg-foreground text-background rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Ready to transform <br /> your study habits?</h2>
          <Link to="/signup" className="btn btn-primary bg-white text-black hover:bg-gray-100 border-none h-16 px-12 rounded-2xl text-xl">
            Join the Vault Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto py-12 px-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-2xl font-black tracking-tighter">
          STUDY<span className="text-accent">VAULT</span>
        </div>
        <div className="flex gap-8 text-sm font-bold text-muted-foreground">
          <a href="/#features" className="hover:text-accent transition-colors">Features</a>
          <a href="/#pricing" className="hover:text-accent transition-colors">Pricing</a>
          <Link to="/about" className="hover:text-accent transition-colors">About</Link>
          <Link to="/login" className="hover:text-accent transition-colors">Sign In</Link>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          © 2026 Study Vault. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="card p-10 group hover:border-accent/40 transition-all duration-500">
    <div className="w-16 h-16 rounded-2xl bg-accent/5 flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4 tracking-tight">{title}</h3>
    <p className="text-muted-foreground font-medium leading-relaxed">{description}</p>
  </div>
);

const AboutItem = ({ title, description }) => (
  <div className="flex gap-6 items-start">
    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
      <CheckCircle size={20} />
    </div>
    <div>
      <h4 className="text-lg font-black tracking-tight mb-1">{title}</h4>
      <p className="text-muted-foreground text-sm font-medium leading-relaxed">{description}</p>
    </div>
  </div>
);

const PricingCard = ({ title, price, description, features, highlight = false }) => (
  <div className={clsx(
    "card p-10 flex flex-col relative",
    highlight && "border-accent ring-4 ring-accent/10 scale-105 z-10"
  )}>
    {highlight && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
        Most Popular
      </div>
    )}
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <div className="flex items-baseline gap-1 mb-4">
      <span className="text-4xl font-black">${price}</span>
      <span className="text-muted-foreground font-medium">/month</span>
    </div>
    <p className="text-muted-foreground text-sm font-medium mb-8 min-h-[40px]">{description}</p>
    
    <div className="space-y-4 mb-10 flex-grow">
      {features.map((feature, i) => (
        <div key={i} className="flex gap-3 items-center text-sm font-medium">
          <CheckCircle size={16} className="text-accent" />
          {feature}
        </div>
      ))}
    </div>
    
    <Link 
      to="/signup" 
      className={clsx(
        "btn w-full h-12 rounded-xl",
        highlight ? "btn-primary" : "btn-outline"
      )}
    >
      Get Started
    </Link>
  </div>
);

const Stat = ({ value, label }) => (
  <div>
    <p className="text-4xl font-black text-foreground mb-2 tracking-tighter">{value}</p>
    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
  </div>
);

export default Home;
