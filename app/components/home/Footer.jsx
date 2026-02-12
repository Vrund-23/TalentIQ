import {
    Sparkles,
    Mail,
    MapPin
  } from 'lucide-react';
  
  export default function Footer() {
    return (
      <footer className="border-t border-primary/10 bg-[#0A0E1A] pt-16 pb-8 px-6">
          <div className="max-w-7xl mx-auto">
             {/* Contact Section */}
            <div className="pb-16 mb-16 border-b border-primary/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8 text-white">Get in Touch</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-4 hover:bg-primary/5 transition-colors group">
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1 text-white">Email Us</h3>
                                <a href="mailto:techtriquetra@gmail.com" className="text-slate-400 hover:text-primary transition-colors">techtriquetra@gmail.com</a>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-4 hover:bg-secondary/5 transition-colors group">
                            <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1 text-white">Visit Lab</h3>
                                <p className="text-slate-400">F-Block, Computer Dept.<br />BVM Engineering College</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              <div className="col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-xl text-white">Talent IQ</span>
                </div>
                <p className="text-slate-400/70 text-sm leading-relaxed mb-6">
                  The official coding platform for the Computer Engineering Department, designed to foster technical growth and coding culture on campus.
                </p>
              </div>
              {[
                { title: "Platform", links: ["Contests", "Problem Set", "Rankings", "Learn"] },
                { title: "Community", links: ["Blog", "Student Forum", "Notice Board", "Events"] },
                { title: "Legal", links: ["Privacy", "Terms", "Lab Guidelines", "Rules"] },
              ].map((col, i) => (
                <div key={i}>
                  <h4 className="font-bold text-white mb-6">{col.title}</h4>
                  <ul className="space-y-4">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <a href="#" className="text-sm text-slate-400/60 hover:text-primary transition-colors">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-400/50">© 2026 Talent IQ. BVM Engineering College. All rights reserved.</div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-slate-400/50 hover:text-primary transition-colors">Twitter</a>
                <a href="#" className="text-slate-400/50 hover:text-primary transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
    );
  }
