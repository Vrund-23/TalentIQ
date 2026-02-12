import {
    Trophy,
    Code2,
    Globe2,
    Filter,
    Layers,
    CheckCircle2
  } from 'lucide-react';
  
  export default function Features() {
    return (
      <section className="pt-12 pb-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-white">
                Everything you need to <br />
                <span className="text-gradient-primary">Win</span>
              </h2>
              <p className="text-slate-400 text-lg">
                From first-year basics to final-year interview prep, find the right challenges to level up your skills step-by-step.
              </p>
            </div>
  
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Department Rankings", desc: "Compete against peers in your year and track your standing on the college leaderboard.", icon: Trophy, gradient: "from-secondary to-cyan-500" },
                { title: "Real-time Editor", desc: "Advanced IDE with intelligent completion and instant test-case validation.", icon: Code2, gradient: "from-primary to-blue-600" },
                { title: "Performance Stats", desc: "Detailed analysis of your speed, accuracy, and weak topics after every contest.", icon: Globe2, gradient: "from-amber-500 to-amber-600" },
                { title: "Topic-wise Filtering", desc: "Practice specific areas like Arrays, Linked Lists, or Dynamic Programming based on your syllabus.", icon: Filter, gradient: "from-emerald-500 to-emerald-600" },
                { title: "Year-Specific Problem Sets", desc: "Access tailored question banks curated specifically for 1st, 2nd, and 3rd-year student difficulty levels.", icon: Layers, gradient: "from-rose-500 to-rose-600" },
                { title: "Cheat Detection", desc: "State-of-the-art plagiarism check ensures a fair playing field for everyone.", icon: CheckCircle2, gradient: "from-primary to-secondary" },
              ].map((feature, i) => (
                <div key={i} className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
    );
  }
