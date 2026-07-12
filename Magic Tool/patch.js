const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/os/page.tsx', 'utf-8');

const additionalComponents = `
import { STRATEGY_EXTRAS } from './strategyData';

function WeeklyFocusCard({ phase, currentWeek, lastCheckin }: { phase: any, currentWeek: number, lastCheckin: any }) {
  const meta = STRATEGY_EXTRAS[phase.id] || STRATEGY_EXTRAS['launch-month'];
  
  let rawVal = '0';
  if (lastCheckin && lastCheckin.metrics_input && Object.keys(lastCheckin.metrics_input).length > 0) {
    if (meta.metricKey in lastCheckin.metrics_input) {
      rawVal = lastCheckin.metrics_input[meta.metricKey] || '0';
    } else {
      rawVal = Object.values(lastCheckin.metrics_input)[0] as string || '0';
    }
  }
  
  let numVal = parseInt(String(rawVal).replace(/[^0-9.-]+/g,"")) || 0;
  if (!lastCheckin) numVal = 0;
  
  const pct = Math.min(100, Math.max(0, (numVal / meta.targetValue) * 100));
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-[#E24B4A]';
  const gap = Math.max(0, meta.targetValue - numVal);

  return (
    <div className="w-full bg-[#F5F5F3] border-4 border-black p-6 md:p-10 mb-16 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b-2 border-black">
        <span className="font-mono text-sm uppercase font-black bg-black text-white px-3 py-1">WEEK {currentWeek} OF 520</span>
        <span className="font-mono text-sm uppercase font-black text-[#E24B4A] border-2 border-[#E24B4A] px-3 py-1">{phase.name}</span>
        <span className="font-mono text-sm uppercase text-gray-500 font-bold ml-auto">{new Date().toISOString().split('T')[0]}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
        <div className="md:pr-10 pt-4 md:pt-0">
          <div className="font-mono text-xs uppercase text-[#E24B4A] font-black mb-4">THIS WEEK'S ONE TASK</div>
          <p className="text-xl font-black uppercase leading-tight">{meta.task}</p>
        </div>
        
        <div className="md:px-10 pt-10 md:pt-0">
          <div className="font-mono text-xs uppercase font-black mb-4">CONTENT TARGET: {meta.contentTargetTitle}</div>
          <p className="text-base font-bold uppercase leading-snug text-gray-600">{meta.contentTarget}</p>
        </div>
        
        <div className="md:pl-10 pt-10 md:pt-0">
          <div className="font-mono text-xs uppercase font-black mb-4">MOVE THIS NUMBER</div>
          {!lastCheckin ? (
            <p className="text-sm font-bold uppercase text-gray-500 italic">Submit check-in to activate tracker.</p>
          ) : (
            <div>
              <div className="flex justify-between items-end mb-4 border-b-2 border-gray-200 pb-2">
                <span className="font-mono font-bold text-gray-500 uppercase text-[10px]">Current OMTM</span>
                <span className="font-mono text-2xl font-black">{rawVal}</span>
              </div>
              <div className="flex justify-between items-end mb-6">
                <span className="font-mono font-bold text-gray-500 uppercase text-[10px]">Phase Target</span>
                <span className="font-mono text-lg font-black">{meta.targetValue.toLocaleString()}</span>
              </div>
              <div className="w-full h-4 bg-gray-200 border-2 border-black mb-3">
                <div className={\`h-full \${barColor} transition-all duration-1000\`} style={{ width: \`\${pct}%\` }}></div>
              </div>
              <div className="font-mono text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">
                Gap: {gap.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DailyRoutine({ phaseId }: { phaseId: string }) {
  const [open, setOpen] = useState(false);
  const meta = STRATEGY_EXTRAS[phaseId];
  if (!meta) return null;

  return (
    <div className="border-4 border-black bg-white mt-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full p-6 flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors uppercase font-black tracking-tighter text-2xl"
      >
        <span>Daily Routine This Phase</span>
        <span className="text-4xl">{open ? '−' : '＋'}</span>
      </button>
      {open && (
        <div className="p-8 space-y-10 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white">
          <div className="border-l-8 border-black pl-6">
            <h3 className="font-mono text-xs uppercase font-black text-gray-400 mb-6 tracking-widest">TACTICAL EXECUTION</h3>
            <div className="font-bold text-sm uppercase leading-[1.8]">
              {meta.doRoutine.split(/(EVERY.*?:|WEEKLY.*?:|TRACK.*?:)/g).map((text: string, i: number) => {
                if (text.match(/^(EVERY|WEEKLY|TRACK)/)) {
                  return <span key={i} className="font-black bg-black text-white px-2 py-1 inline-block mt-6 mb-2 tracking-widest">{text}</span>;
                }
                return <span key={i} className="block mb-2">{text}</span>;
              })}
            </div>
          </div>
          
          <div className="border-l-8 border-[#E24B4A] pl-6 bg-red-50/50 p-6">
            <h3 className="font-mono text-xs uppercase font-black text-[#E24B4A] mb-6 tracking-widest">RED LINE INSTRUCTIONS</h3>
            <div className="font-bold text-sm uppercase leading-[1.8] text-red-900">
              {meta.doNotRoutine.split(/(DO NOT.*?:|NEVER.*?:)/g).map((text: string, i: number) => {
                if (text.match(/^(DO NOT|NEVER)/)) {
                  return <span key={i} className="font-black bg-[#E24B4A] text-white px-2 py-1 inline-block mt-6 mb-2 tracking-widest">{text}</span>;
                }
                return <span key={i} className="block mb-2">{text}</span>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KeywordIntelTab() {
  const [data, setData] = useState<any[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Golden Triangle': true
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.from('keyword_progress').select('*').then(res => {
      if (res.data) setData(res.data);
      setLoading(false);
    });
  }, []);

  const toggleStatus = async (kw: string, currentStatus: string) => {
    const next = currentStatus === 'pending' ? 'published' : 'pending';
    // Optimistic UI update
    setData(prev => prev.map(k => k.keyword === kw ? { ...k, status: next } : k));
    await supabase.from('keyword_progress').update({ status: next }).eq('keyword', kw);
  };

  const toggleSection = (name: string) => setOpenSections(p => ({ ...p, [name]: !p[name] }));

  const sections = [
    { name: 'Golden Triangle', label: '130 keywords — 646,600 total monthly searches — attack these before anything else. A new domain can rank for KD under 15 within 60 to 90 days of publishing quality content.' },
    { name: 'Meaning', label: '1,335 meaning keywords identified — the highest volume low-competition cluster in the dataset. Build one programmatic page per subject at /meaning/[subject]. These pages rank within 60 days and compound over time.' },
    { name: 'Aftercare', label: '788,600 total monthly searches in aftercare and healing keywords. This is TattoosMap\\'s Blue Ocean content category — no competitor owns medical-grade aftercare authority.' },
    { name: 'Placement', label: '2,247 placement keywords identified. The interactive tattoo pain chart is the single highest-leverage tool to build in this cluster.' },
    { name: 'Commercial', label: 'These are transactional keywords — people searching these are ready to book. Rank for these after the platform has artist supply in the relevant cities.' }
  ];

  if (loading) return <div className="font-mono p-10 bg-black text-white animate-pulse">FETCHING INTEL...</div>;

  return (
    <div className="space-y-8 font-sans">
      {sections.map(s => {
        const isOpen = openSections[s.name];
        const items = data.filter(d => d.cluster === s.name).sort((a,b) => b.monthly_volume - a.monthly_volume);
        
        return (
          <div key={s.name} className="border-4 border-black bg-white">
            <button onClick={() => toggleSection(s.name)} className="w-full text-left p-6 flex justify-between items-center bg-black text-white hover:bg-gray-800 transition-colors">
              <div className="font-mono text-sm uppercase font-black">THE {s.name.toUpperCase()} CLUSTER</div>
              <span className="font-black text-xl">{isOpen ? '−' : '＋'}</span>
            </button>
            {isOpen && (
              <div className="p-6">
                <p className="text-sm font-bold uppercase mb-8 text-gray-500 tracking-wide leading-relaxed border-l-4 border-[#E24B4A] pl-4">{s.label}</p>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-4 border-black font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                      <th className="py-4 px-2 w-12 border-r-2 border-black">STAT</th>
                      <th className="py-4 px-4 border-r-2 border-black">Keyword Target</th>
                      <th className="py-4 px-4 w-32 border-r-2 border-black">Volume</th>
                      <th className="py-4 px-4 w-20 border-r-2 border-black">KD</th>
                      <th className="py-4 px-4">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(i => {
                      const done = i.status === 'published' || i.status === 'ranking' || i.status === 'page1';
                      return (
                        <tr key={i.id} className={cn("border-b-2 border-gray-100 transition-colors", done ? "opacity-40 bg-gray-50 strikethrough" : "hover:bg-amber-50")}>
                          <td className="py-4 px-4 border-r-2 border-gray-100 flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={done} 
                              onChange={() => toggleStatus(i.keyword, i.status)}
                              className="accent-green-500 w-5 h-5 cursor-pointer"
                            />
                          </td>
                          <td className={cn("py-4 px-4 font-black text-sm uppercase border-r-2 border-gray-100", done && "line-through text-gray-400")}>{i.keyword}</td>
                          <td className="py-4 px-4 font-mono text-sm border-r-2 border-gray-100 font-bold">{i.monthly_volume?.toLocaleString()}</td>
                          <td className="py-4 px-4 font-mono text-sm border-r-2 border-gray-100 font-bold text-[#E24B4A]">{i.keyword_difficulty}</td>
                          <td className="py-4 px-4 font-mono text-xs font-bold text-gray-500">{i.priority_period}</td>
                        </tr>
                      );
                    })}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center font-mono text-xs uppercase text-gray-400 bg-gray-50">NO DATA FOUND FOR {s.name}. PLEASE RUN THE SEED MIGRATION.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
      
      <div className="bg-black text-white p-8 font-mono text-sm leading-loose mt-16 shadow-[8px_8px_0px_0px_rgba(226,75,74,1)] border-4 border-[#E24B4A]">
        <div>GOLDEN TRIANGLE: 130 keywords | 646,600 monthly searches | Attack immediately</div>
        <div>MEANING CLUSTER: 1,335 keywords | Est. 2M+ monthly searches | Attack Month 2-3</div>
        <div>AFTERCARE CLUSTER: 788,600 monthly searches | Attack Month 3-6</div>
        <div>PLACEMENT CLUSTER: 2,247 keywords | Attack Month 4-6</div>
        <div>COMMERCIAL CLUSTER: 220+ keywords | Attack Month 6-12</div>
        <div className="mt-6 pt-6 border-t font-black border-white/20 text-[#E24B4A]">TOTAL OPPORTUNITY: 32,300+ keywords across both datasets</div>
      </div>
    </div>
  );
}
`;

// Insert the new components above the Dashboard Page export
content = content.replace('export default function MagicTool', additionalComponents + '\nexport default function MagicTool');

// Insert WeeklyFocusCard
content = content.replace(
  '{/* LAYER 1: ROADMAP NAVIGATOR */}\n        <section className="mb-32">\n          \n          <SnapshotTable ',
  '{/* LAYER 1: ROADMAP NAVIGATOR */}\n        <section className="mb-32">\n          \n          <WeeklyFocusCard phase={phase} currentWeek={launchDate ? Math.ceil((new Date().getTime() - new Date(launchDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) : 0} lastCheckin={lastCheckins[0]} />\n\n          <SnapshotTable '
);

// Insert DailyRoutine 
content = content.replace(
  '                      </div>\n                    </div>\n                  ))}\n                </div>\n              </div>\n            </div>\n\n            {/* Sidebar */}',
  '                      </div>\n                    </div>\n                  ))}\n                </div>\n              </div>\n\n              {/* Addition 3: Daily Routine */}\n              <DailyRoutine phaseId={phase.id} />\n            </div>\n\n            {/* Sidebar */}'
);

// Update Growth Intelligence tabs (add Keyword Intel)
content = content.replace(
  "{['AHA MOMENTS', 'INVESTOR DATA', 'FAILURE LAB', 'SEO PLAYBOOK'].map((t, i) =>",
  "{['AHA MOMENTS', 'INVESTOR DATA', 'FAILURE LAB', 'SEO PLAYBOOK', 'KEYWORD INTEL'].map((t, i) =>"
);
content = content.replace(
  '              <div className="grid grid-cols-2 lg:grid-cols-4 bg-black gap-1 p-1">',
  '              <div className="grid grid-cols-2 lg:grid-cols-5 bg-black gap-1 p-1">'
);

// Update Growth Intelligence internal content rendering
const oldIntelRendering = `<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                  {(intelligenceTab === 0 ? AHA_MOMENTS : 
                    intelligenceTab === 1 ? INVESTOR_DATA : 
                    intelligenceTab === 2 ? FAILURE_DATA : SEO_PLAYBOOK).map((item, i) => (
                    <div key={i} className="border-4 border-black p-8 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                      <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl font-black uppercase leading-none tracking-tighter">{item.name}</span>
                          {item.source === 'HYPOTHESIS' && (
                            <span className="bg-black text-white font-mono text-[9px] px-2 py-1 font-black">HYPOTHESIS</span>
                          )}
                        </div>
                        <p className="text-sm font-bold leading-tight uppercase">{item.value}</p>
                      </div>
                      <span className="font-mono text-[10px] uppercase font-black text-gray-400">SOURCE: {item.source}</span>
                    </div>
                  ))}
                </div>`;

const newIntelRendering = `{intelligenceTab === 4 ? (<KeywordIntelTab />) : (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                  {(intelligenceTab === 0 ? AHA_MOMENTS : 
                    intelligenceTab === 1 ? INVESTOR_DATA : 
                    intelligenceTab === 2 ? FAILURE_DATA : SEO_PLAYBOOK).map((item, i) => (
                    <div key={i} className="border-4 border-black p-8 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                      <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl font-black uppercase leading-none tracking-tighter">{item.name}</span>
                          {item.source === 'HYPOTHESIS' && (
                            <span className="bg-black text-white font-mono text-[9px] px-2 py-1 font-black">HYPOTHESIS</span>
                          )}
                        </div>
                        <p className="text-sm font-bold leading-tight uppercase">{item.value}</p>
                      </div>
                      <span className="font-mono text-[10px] uppercase font-black text-gray-400">SOURCE: {item.source}</span>
                    </div>
                  ))}
                </div>
)}`;
content = content.replace(oldIntelRendering, newIntelRendering);

// Add Content Tracker Linking button
const trackingLink = `          <div className="py-6 border-b-4 border-black mb-10">
            <a href="/dashboard/os/content" className="inline-block bg-[rgba(226,75,74,1)] text-white hover:bg-black font-black uppercase tracking-widest px-8 py-5 text-sm transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">Open Interactive Content Tracker →</a>
          </div>\n`;
content = content.replace(
  '{/* LAYER 3: INTELLIGENCE LIBRARY */}\n        <section className="pb-32">\n          <button',
  `{/* LAYER 3: INTELLIGENCE LIBRARY */}\n        <section className="pb-32">\n${trackingLink}          <button`
);

fs.writeFileSync('src/app/dashboard/os/page.tsx', content, 'utf-8');
console.log('PATCH COMPLETE');
