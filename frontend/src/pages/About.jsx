import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Heart, Sparkles, BrainCircuit, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const team = [
    {
      name: "Alex Rivers",
      role: "Lead Developer",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Sarah Chen",
      role: "Research Head",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Marcus Thorne",
      role: "Product Designer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Elena Vance",
      role: "AI Engineer",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="pt-20 pb-32">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">
            WE ARE ON A MISSION <br />
            <span className="text-accent">TO EMPOWER MINDS.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Study Vault wasn't built in a boardroom. It was born in late-night library sessions, 
            driven by the need for a tool that understands how we actually learn.
          </p>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">The Story Behind <br /> Study Vault.</h2>
            <div className="prose">
              <p className="mb-6">
                In 2024, a group of graduate students realized that while information was abundant, 
                true knowledge was becoming harder to manage. We were drowning in open tabs, 
                disconnected PDFs, and scattered notes.
              </p>
              <p className="mb-6">
                We decided to build something different. Not just another note-taking app, 
                but a "Second Brain"—a digital extension of your own cognitive processes.
              </p>
              <p>
                Today, Study Vault is used by thousands of students and researchers worldwide 
                to transform their academic chaos into structured mastery.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-accent/5 rounded-[40px] border border-accent/10 flex items-center justify-center overflow-hidden p-12">
               <div className="grid grid-cols-2 gap-4 w-full h-full">
                  <div className="bg-background rounded-3xl border border-border shadow-xl p-6 flex flex-col justify-between">
                    <BrainCircuit size={40} className="text-accent" />
                    <div className="h-2 w-12 bg-accent/20 rounded-full" />
                  </div>
                  <div className="bg-background rounded-3xl border border-border shadow-xl p-6 translate-y-12 flex flex-col justify-between">
                    <Target size={40} className="text-green-500" />
                    <div className="h-2 w-12 bg-green-500/20 rounded-full" />
                  </div>
                  <div className="bg-background rounded-3xl border border-border shadow-xl p-6 -translate-y-12 flex flex-col justify-between">
                    <Users size={40} className="text-orange-500" />
                    <div className="h-2 w-12 bg-orange-500/20 rounded-full" />
                  </div>
                  <div className="bg-background rounded-3xl border border-border shadow-xl p-6 flex flex-col justify-between">
                    <Heart size={40} className="text-red-500" />
                    <div className="h-2 w-12 bg-red-500/20 rounded-full" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-muted/30 py-32 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Our Core Values</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
              These principles guide every feature we build and every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ValueCard 
              icon={<Sparkles size={32} />}
              title="Focus First"
              description="We believe in deep work. Our interface is designed to disappear, letting your thoughts take center stage."
            />
            <ValueCard 
              icon={<ShieldCheck size={32} />}
              title="Radical Privacy"
              description="Your notes are your intellectual property. We use industry-leading encryption to keep them yours."
            />
            <ValueCard 
              icon={<BrainCircuit size={32} />}
              title="Smart Assistance"
              description="AI should augment, not replace. Our tools are built to enhance your critical thinking."
            />
          </div>
        </div>
      </section>

      {/* Team / Contributors */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Built by Students, <br /> for Students.</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
            Our team is composed of developers, researchers, and designers from top universities.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          {team.map((member, i) => (
            <div key={i} className="text-center group">
              <div className="aspect-square rounded-3xl mb-6 overflow-hidden border border-border group-hover:border-accent/40 transition-all duration-500 relative">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-2xl font-black mb-1 tracking-tight">{member.name}</h4>
              <p className="text-sm text-accent font-bold uppercase tracking-widest">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto py-20 px-6">
        <div className="bg-foreground text-background rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Join the next generation <br /> of thinkers.</h2>
          <Link to="/signup" className="btn btn-primary bg-white text-black hover:bg-gray-100 border-none h-16 px-12 rounded-2xl text-xl gap-2">
            Get Started
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>
    </div>
  );
};

const ValueCard = ({ icon, title, description }) => (
  <div className="text-center flex flex-col items-center">
    <div className="w-20 h-20 rounded-3xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4 tracking-tight">{title}</h3>
    <p className="text-muted-foreground font-medium leading-relaxed max-w-xs">{description}</p>
  </div>
);

export default About;
