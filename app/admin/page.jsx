'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, Trophy, Activity, TrendingUp, Clock, Plus, ArrowUpRight, Search, MoreHorizontal, Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ volunteers: 0, contests: 0, participants: 0 });
    const [topSolvers, setTopSolvers] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('Last 30 Days');
    const [generatingReport, setGeneratingReport] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [volRes, conRes, partRes, actRes] = await Promise.all([
                    fetch('/api/admin/volunteers'),
                    fetch('/api/admin/contests'),
                    fetch('/api/admin/participants'),
                    fetch('/api/admin/activity')
                ]);
                const volData = await volRes.json();
                const conData = await conRes.json();
                const partData = await partRes.json();
                
                let actData = [];
                if (actRes.ok) {
                    actData = await actRes.json();
                }

                setStats({
                    volunteers: volData.count || 0,
                    contests: conData.count || 0,
                    participants: partData.count || 0,
                });

                if (partData.success && Array.isArray(partData.data)) {
                    setTopSolvers(partData.data.slice(0, 5));
                }

                if (Array.isArray(actData)) {
                    setRecentActivity(actData.slice(0, 4));
                }
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Volunteers', value: stats.volunteers, icon: Users, color: 'text-[#3B82F6]', bg: 'from-[#3B82F6]/20 to-[#3B82F6]/5', trend: '+12%', trendUp: true },
        { title: 'Active Contests', value: stats.contests, icon: Calendar, color: 'text-[#22D3EE]', bg: 'from-[#22D3EE]/20 to-[#22D3EE]/5', trend: '+2', trendUp: true },
        { title: 'Total Participants', value: stats.participants, icon: Trophy, color: 'text-[#F59E0B]', bg: 'from-[#F59E0B]/20 to-[#F59E0B]/5', trend: '+24%', trendUp: true },
        { title: 'System Health', value: '98%', icon: Activity, color: 'text-[#10B981]', bg: 'from-[#10B981]/20 to-[#10B981]/5', trend: 'Stable', trendUp: true },
    ];

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Users': return Users;
            case 'Calendar': return Calendar;
            case 'Plus': return Plus;
            case 'Activity': return Activity;
            default: return Activity;
        }
    };

    const handleTimeRangeChange = () => {
        const ranges = ['Last 7 Days', 'Last 30 Days', 'All Time'];
        const currentIndex = ranges.indexOf(timeRange);
        const nextRange = ranges[(currentIndex + 1) % ranges.length];
        setTimeRange(nextRange);
        toast.success(`Time range updated to: ${nextRange}`);
        // Here you would typically refetch data with the new range
        // fetchStats(nextRange); 
    };

    const handleCreateReport = () => {
        setGeneratingReport(true);
        try {
            // Generate CSV content
            const csvRows = [];
            
            // Header
            csvRows.push(['CodeArena Admin Report', new Date().toLocaleString()]);
            csvRows.push([]);
            
            // Summary Stats
            csvRows.push(['Summary Statistics']);
            csvRows.push(['Metric', 'Value']);
            cards.forEach(c => csvRows.push([c.title, c.value]));
            csvRows.push([]);

            // Top Solvers
            csvRows.push(['Top Solvers']);
            csvRows.push(['Rank', 'Name', 'Email', 'Problems Solved']);
            topSolvers.forEach((s, i) => csvRows.push([i + 1, s.name, s.email, s.solvedCount]));
            csvRows.push([]);

            // Recent Activity
            csvRows.push(['Recent Activity']);
            csvRows.push(['User', 'Action', 'Target', 'Time']);
            recentActivity.forEach(a => csvRows.push([a.user, a.action, a.target, new Date(a.timestamp).toLocaleString()]));

            // Convert to CSV string
            const csvContent = "data:text/csv;charset=utf-8," 
                + csvRows.map(e => e.join(",")).join("\n");

            // Download
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `admin_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Report generated successfully");
        } catch (error) {
            console.error("Report generation failed", error);
            toast.error("Failed to generate report");
        } finally {
            setGeneratingReport(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-[#94A3B8] mt-2">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleTimeRangeChange}
                        className="px-4 py-2 bg-[#111827] hover:bg-[#1E293B] text-white rounded-lg text-sm font-medium transition-colors border border-[#3B82F6]/10 flex items-center gap-2 min-w-[140px] justify-center"
                    >
                        <Clock className="w-4 h-4 text-[#94A3B8]" />
                        {timeRange}
                    </button>
                    <button 
                        onClick={handleCreateReport}
                        disabled={generatingReport}
                        className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-[#3B82F6]/20 flex items-center gap-2 min-w-[150px] justify-center"
                    >
                        {generatingReport ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {generatingReport ? 'Generating...' : 'Create Report'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index} 
                        className="relative overflow-hidden bg-[#111827] border border-[#3B82F6]/8 p-6 rounded-2xl hover:border-[#3B82F6]/20 transition-all group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-[#1E293B] ring-1 ring-[#3B82F6]/10 ${card.color}`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-[#1E293B] border border-[#3B82F6]/5 ${card.trendUp ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                                    {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                    {card.trend}
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
                            <p className="text-[#94A3B8] text-sm font-medium mt-1">{card.title}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-[#111827] border border-[#3B82F6]/8 rounded-2xl p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-white">Top Solvers</h3>
                        <Trophy className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[#94A3B8]/60 text-xs uppercase tracking-wider border-b border-[#3B82F6]/5">
                                <tr>
                                    <th className="pb-3 pl-2">Rank</th>
                                    <th className="pb-3">Student</th>
                                    <th className="pb-3 text-right">Problems Solved</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3B82F6]/5">
                                {topSolvers.map((student, index) => (
                                    <tr key={student._id} className="group hover:bg-[#1E293B] transition-colors">
                                        <td className="py-4 pl-2 font-medium">
                                            <span className={index < 3 ? 'text-[#F59E0B]' : 'text-[#3B82F6]'}>#{index + 1}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{student.name}</span>
                                                <span className="text-[#475569] text-xs">{student.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                                                {student.solvedCount} Solved
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {topSolvers.length === 0 && (
                                    <tr><td colSpan="3" className="py-8 text-center text-[#475569]">No data available yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#111827] border border-[#3B82F6]/8 rounded-2xl p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                        <MoreHorizontal className="w-5 h-5 text-[#475569] cursor-pointer hover:text-white" />
                    </div>
                    <div className="space-y-6">
                        {recentActivity.map((item, index) => {
                            const Icon = getIcon(item.icon);
                            return (
                                <div key={index} className="flex gap-4 group">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-[#1E293B] border border-[#3B82F6]/10 flex items-center justify-center group-hover:border-[#3B82F6]/30 group-hover:bg-[#3B82F6]/10 transition-all">
                                            <Icon className="w-4 h-4 text-[#94A3B8]/60 group-hover:text-[#3B82F6]" />
                                        </div>
                                        {index !== recentActivity.length - 1 && (
                                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-[#3B82F6]/5 my-2" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-[#94A3B8]">
                                            <span className="font-semibold text-white hover:underline cursor-pointer">{item.user}</span> {item.action} <span className="text-[#3B82F6]">{item.target}</span>
                                        </p>
                                        <p className="text-xs text-[#475569] mt-1" suppressHydrationWarning>{new Date(item.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <Link href="/admin/activity">
                        <button className="w-full mt-6 py-3 rounded-xl bg-[#1E293B] hover:bg-[#3B82F6]/10 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors border border-[#3B82F6]/5">
                            View All Activity
                        </button>
                    </Link>
                </motion.div>
            </div>


        </div>
    );
}
