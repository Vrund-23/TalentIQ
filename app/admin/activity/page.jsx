
'use client';
import { useEffect, useState } from 'react';
import { Users, Calendar, Plus, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ActivityLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/admin/activity');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (error) {
                console.error("Error fetching activity logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Users': return Users;
            case 'Calendar': return Calendar;
            case 'Plus': return Plus;
            case 'Activity': return Activity;
            default: return Activity;
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Activity Log</h1>
                    <p className="text-[#94A3B8] mt-2">Track all recent actions and system events.</p>
                </div>
                <Link href="/admin" className="text-[#3B82F6] hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>

            <div className="bg-[#111827] border border-[#3B82F6]/8 rounded-2xl p-6">
                <div className="space-y-6">
                    {logs.length === 0 ? (
                        <p className="text-[#94A3B8] text-center py-8">No activity logs found.</p>
                    ) : (
                        logs.map((log) => {
                            const Icon = getIcon(log.icon);
                            return (
                                <div key={log._id} className="flex gap-4 group items-start border-b border-[#3B82F6]/5 pb-4 last:border-0 last:pb-0">
                                    <div className="w-10 h-10 rounded-full bg-[#1E293B] border border-[#3B82F6]/10 flex items-center justify-center shrink-0">
                                        <Icon className="w-4 h-4 text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-[#E2E8F0]">
                                            <span className="font-semibold text-white">{log.user}</span> {log.action} <span className="text-[#3B82F6] font-medium">{log.target}</span>    
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-[#94A3B8]">{new Date(log.timestamp).toLocaleString()}</span>
                                            {/* We can calculate relative time here if needed */}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
