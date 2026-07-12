'use client';

import React, { useState } from 'react';
import { updateKeyword } from './actions';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ContentTrackerClient({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [filterCluster, setFilterCluster] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Track edits per row
  const [edits, setEdits] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const clusters = ['All', ...Array.from(new Set(initialData.map(d => d.cluster))).sort()];
  const statuses = ['All', 'pending', 'published', 'ranking', 'page1'];

  const filteredData = data.filter(d => {
    if (filterCluster !== 'All' && d.cluster !== filterCluster) return false;
    if (filterStatus !== 'All' && d.status !== filterStatus) return false;
    return true;
  });

  const totalTracked = data.length;
  const totalPublished = data.filter(d => ['published', 'ranking', 'page1'].includes(d.status)).length;
  const totalPage1 = data.filter(d => d.status === 'page1').length;

  const handleEdit = (id: string, field: string, value: any) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async (id: string) => {
    const rowEdits = edits[id];
    if (!rowEdits) return;

    setSaving(prev => ({ ...prev, [id]: true }));
    const result = await updateKeyword(id, rowEdits);
    setSaving(prev => ({ ...prev, [id]: false }));

    if (result.success) {
      // Clear edits and update local data
      setData(prev => prev.map(d => d.id === id ? { ...d, ...rowEdits } : d));
      setEdits(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      alert('Failed to update. Check console.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] font-sans text-black pb-32">
      {/* Header */}
      <header className="border-b-4 border-black p-6 md:p-10 bg-white flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase font-black tracking-[0.3em] text-[#E24B4A] mb-2">Tactical Execution</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">Content Tracker</h1>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase font-black text-gray-400 mb-1">Admin Data Integrity</div>
          <a href="/dashboard/os" className="font-mono text-sm font-bold border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">← Back to OS</a>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-6 md:p-10">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="font-mono text-xs uppercase font-black text-gray-400 mb-2">Total Tracked</div>
            <div className="text-4xl font-black">{totalTracked} <span className="text-sm text-gray-400">/ 32,300</span></div>
          </div>
          <div className="border-4 border-black bg-black text-white p-6 shadow-[8px_8px_0px_0px_rgba(226,75,74,1)]">
            <div className="font-mono text-xs uppercase font-black mb-2 text-[#E24B4A]">Total Published</div>
            <div className="text-4xl font-black">{totalPublished}</div>
          </div>
          <div className="border-4 border-[#E24B4A] bg-white p-6 shadow-[8px_8px_0px_0px_rgba(226,75,74,1)]">
            <div className="font-mono text-xs uppercase font-black text-[#E24B4A] mb-2">Ranking Page 1</div>
            <div className="text-4xl font-black">{totalPage1}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 p-6 border-4 border-black bg-white items-end">
          <div className="flex-1">
            <label className="font-mono text-[10px] uppercase font-black block mb-2 text-gray-400">Filter Cluster</label>
            <select 
              value={filterCluster} 
              onChange={e => setFilterCluster(e.target.value)}
              className="w-full border-2 border-black p-3 font-bold uppercase outline-none focus:bg-gray-50"
            >
              {clusters.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="font-mono text-[10px] uppercase font-black block mb-2 text-gray-400">Filter Status</label>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full border-2 border-black p-3 font-bold uppercase outline-none focus:bg-gray-50"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="hidden md:block w-32 border-b-4 border-[#E24B4A] mb-4"></div>
        </div>

        {/* Table */}
        <div className="border-4 border-black bg-white overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-black text-white font-mono text-[10px] uppercase font-black tracking-widest border-b-4 border-black">
                <th className="p-4 border-r border-[#333]">Keyword</th>
                <th className="p-4 border-r border-[#333]">Volume</th>
                <th className="p-4 border-r border-[#333]">KD</th>
                <th className="p-4 border-r border-[#333]">Priority</th>
                <th className="p-4 border-r border-[#333]">Status</th>
                <th className="p-4 border-r border-[#333]">Pub Date</th>
                <th className="p-4 border-r border-[#333]">Rank pos</th>
                <th className="p-4 w-24 text-center">Save</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {filteredData.map(row => {
                const isEdited = edits[row.id] !== undefined && Object.keys(edits[row.id]).length > 0;
                const isSaving = saving[row.id];
                
                const currentStatus = edits[row.id]?.status || row.status;
                const currentPubDate = edits[row.id]?.published_date || row.published_date || '';
                const currentRank = edits[row.id]?.ranking_position || row.ranking_position || '';

                const isDone = ['published', 'ranking', 'page1'].includes(currentStatus);

                return (
                  <tr key={row.id} className={cn(
                    "border-b border-gray-200 hover:bg-amber-50 transition-colors",
                    isDone ? "bg-green-50/20" : ""
                  )}>
                    <td className="p-4 border-r border-gray-200">
                      <div className="flex flex-col">
                        <span className="font-bold font-sans uppercase mb-1">{row.keyword}</span>
                        <span className="text-[9px] uppercase tracking-wider text-[#E24B4A]">{row.cluster}</span>
                      </div>
                    </td>
                    <td className="p-4 border-r border-gray-200 font-bold">{row.monthly_volume?.toLocaleString()}</td>
                    <td className={cn("p-4 border-r border-gray-200 font-bold", row.keyword_difficulty < 15 ? 'text-green-600' : 'text-amber-600')}>{row.keyword_difficulty}</td>
                    <td className="p-4 border-r border-gray-200 text-xs text-gray-500">{row.priority_period}</td>
                    
                    <td className="p-4 border-r border-gray-200">
                      <select 
                        value={currentStatus}
                        onChange={e => handleEdit(row.id, 'status', e.target.value)}
                        className={cn("border-2 p-2 outline-none font-bold uppercase text-[10px]", 
                          currentStatus === 'page1' ? 'bg-[#E24B4A] text-white border-black' :
                          currentStatus === 'published' ? 'bg-green-100 text-green-900 border-green-300' :
                          'bg-white border-gray-300'
                        )}
                      >
                        <option value="pending">Pending</option>
                        <option value="published">Published</option>
                        <option value="ranking">Ranking</option>
                        <option value="page1">Page 1</option>
                      </select>
                    </td>
                    
                    <td className="p-4 border-r border-gray-200">
                      <input 
                        type="date"
                        value={currentPubDate ? new Date(currentPubDate).toISOString().split('T')[0] : ''}
                        onChange={e => handleEdit(row.id, 'published_date', e.target.value)}
                        className="border p-2 outline-none w-32"
                      />
                    </td>
                    
                    <td className="p-4 border-r border-gray-200">
                      <input 
                        type="number"
                        placeholder="--"
                        value={currentRank}
                        onChange={e => handleEdit(row.id, 'ranking_position', parseInt(e.target.value) || null)}
                        className="border p-2 outline-none w-16"
                      />
                    </td>
                    
                    <td className="p-4 text-center">
                      <button 
                        disabled={!isEdited || isSaving}
                        onClick={() => handleSave(row.id)}
                        className={cn(
                          "px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all",
                          isSaving ? "bg-gray-200 text-gray-400" :
                          isEdited ? "bg-black text-white hover:bg-[#E24B4A]" : "bg-gray-100 text-gray-400"
                        )}
                      >
                        {isSaving ? '....' : isEdited ? 'SAVE' : '---'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 uppercase tracking-widest font-black">
                    No keywords found for these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
