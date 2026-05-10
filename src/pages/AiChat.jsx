import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import {
  Bot, Send, Plus, Trash2, MessageSquare,
  Sparkles, BarChart2, Search, FileText, ChevronRight, Loader2, X
} from 'lucide-react';

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="ai-code">$1</code>')
    .replace(/\n•\s/g, '\n• ')
    .replace(/\n/g, '<br/>');
}

// ─── Quick prompt chips ───────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: 'Overdue invoices',      text: 'How many overdue invoices do we have?' },
  { label: 'Top customers',         text: 'Who are our top 5 customers by revenue?' },
  { label: 'Active jobs',           text: 'List all currently active jobs.' },
  { label: 'Revenue this month',    text: 'What is our total revenue this month?' },
  { label: 'Unpaid balances',       text: 'Which customers have unpaid balances?' },
  { label: 'Services summary',      text: 'Give me a summary of our available services.' },
];

export default function AiChat() {
  const [sessions, setSessions]         = useState([]);
  const [sessionId, setSessionId]       = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [activeTab, setActiveTab]       = useState('chat'); // chat | insights | summary
  const [insights, setInsights]         = useState([]);
  const [summary, setSummary]           = useState('');
  const [summaryPeriod, setSummaryPeriod] = useState('today');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading]   = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Load sessions on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetchSessions();
  }, []);

  // ── Scroll to bottom on new messages ───────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function fetchSessions() {
    try {
      setLoadingSessions(true);
      const { data } = await api.get('/ai/sessions');
      setSessions(data.sessions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadSession(id) {
    try {
      const { data } = await api.get(`/ai/sessions/${id}`);
      setSessionId(id);
      setMessages(data.session.messages || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function newChat() {
    setSessionId(null);
    setMessages([]);
    inputRef.current?.focus();
  }

  async function deleteSession(id, e) {
    e.stopPropagation();
    await api.delete(`/ai/sessions/${id}`);
    if (sessionId === id) newChat();
    fetchSessions();
  }

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: msg, sessionId });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (!sessionId) {
        setSessionId(data.sessionId);
        fetchSessions();
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInsights() {
    setInsightsLoading(true);
    try {
      const { data } = await api.post('/ai/insights');
      setInsights(data.insights || []);
    } catch (e) {
      console.error(e);
    } finally {
      setInsightsLoading(false);
    }
  }

  async function fetchSummary(period) {
    setSummaryLoading(true);
    setSummaryPeriod(period);
    try {
      const { data } = await api.get(`/ai/summary?period=${period}`);
      setSummary(data.summary || '');
    } catch (e) {
      console.error(e);
    } finally {
      setSummaryLoading(false);
    }
  }

  async function fetchSearch() {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const { data } = await api.post('/ai/search', { query: searchQuery });
      setSearchResults(data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  }

  const insightColors = {
    info:    'border-blue-500/30 bg-blue-500/5 text-blue-400',
    warning: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
    success: 'border-green-500/30 bg-green-500/5 text-green-400',
    danger:  'border-red-500/30 bg-red-500/5 text-red-400',
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0d0d1a] overflow-hidden">

      {/* ── Sessions Sidebar ── */}
      <div className="w-64 flex-shrink-0 bg-white dark:bg-[#111120] border-r border-gray-200 dark:border-white/5 flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-white/5">
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-4 gap-1 p-3 border-b border-gray-100 dark:border-white/5">
          {[
            { id: 'chat',     icon: <MessageSquare size={14}/> },
            { id: 'insights', icon: <BarChart2 size={14}/> },
            { id: 'search',   icon: <Search size={14}/> },
            { id: 'summary',  icon: <FileText size={14}/> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'insights' && insights.length === 0) fetchInsights();
                if (tab.id === 'summary' && !summary) fetchSummary('today');
              }}
              className={`flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title={tab.id}
            >
              {tab.icon}
            </button>
          ))}
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="animate-spin text-indigo-400" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8 px-4">No conversations yet.<br/>Start a new chat!</p>
          ) : (
            sessions.map(s => (
              <button
                key={s._id}
                onClick={() => { loadSession(s._id); setActiveTab('chat'); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all group ${
                  sessionId === s._id
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                }`}
              >
                <MessageSquare size={13} className="flex-shrink-0 opacity-60" />
                <span className="text-xs font-medium truncate flex-1">{s.title}</span>
                <button
                  onClick={(e) => deleteSession(s._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={11} />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Main Panel ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── CHAT TAB ── */}
        {activeTab === 'chat' && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">FlowPOS AI Assistant</h2>
                    <p className="text-sm text-gray-400">Ask anything about your jobs, invoices, customers, or payments.</p>
                  </div>
                  {/* Quick prompts */}
                  <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
                    {QUICK_PROMPTS.map(p => (
                      <button
                        key={p.label}
                        onClick={() => sendMessage(p.text)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-500 transition-all text-left group"
                      >
                        <ChevronRight size={13} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 mt-0.5">
                        <Bot size={14} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/20'
                        : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-200 rounded-tl-sm'
                    }`}>
                      {m.role === 'assistant'
                        ? <span dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                        : m.content
                      }
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#111120]">
              <div className="flex gap-3 items-end max-w-4xl mx-auto">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                  }}
                  placeholder="Ask about invoices, jobs, customers..."
                  rows={1}
                  className="flex-1 resize-none px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 flex-shrink-0"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}

        {/* ── INSIGHTS TAB ── */}
        {activeTab === 'insights' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Business Insights</h2>
                  <p className="text-sm text-gray-400">AI-powered analysis of your business data</p>
                </div>
                <button
                  onClick={fetchInsights}
                  disabled={insightsLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {insightsLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Refresh
                </button>
              </div>

              {insightsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Analyzing your business data...</p>
                  </div>
                </div>
              ) : insights.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Click Refresh to generate insights</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.map((ins, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${insightColors[ins.type] || insightColors.info}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg font-bold opacity-40">#{ins.priority}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{ins.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{ins.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SEARCH TAB ── */}
        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Smart Search</h2>
                <p className="text-sm text-gray-400">Search customers, services, and jobs in natural language</p>
              </div>
              <div className="flex gap-3 mb-6">
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchSearch()}
                  placeholder='e.g. "customers from Japan" or "hull coating jobs"'
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
                />
                <button
                  onClick={fetchSearch}
                  disabled={searchLoading || !searchQuery.trim()}
                  className="px-4 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {searchLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>

              {searchResults && (
                <div className="space-y-4">
                  {['customers', 'services', 'jobs'].map(type => (
                    searchResults[type]?.length > 0 && (
                      <div key={type}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{type}</h3>
                        <div className="space-y-2">
                          {searchResults[type].map((item, i) => (
                            <div key={i} className="px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300">
                              <p className="font-semibold">{item.name || item.jobNumber || item.title}</p>
                              {item.company && <p className="text-xs text-gray-400">{item.company}</p>}
                              {item.status && <p className="text-xs text-gray-400 capitalize">{item.status}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                  {Object.values(searchResults).every(v => !v?.length) && (
                    <p className="text-center text-gray-400 py-8">No results found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SUMMARY TAB ── */}
        {activeTab === 'summary' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Business Summary</h2>
                <p className="text-sm text-gray-400">AI-generated report of your business activity</p>
              </div>
              <div className="flex gap-2 mb-6">
                {['today', 'week', 'month'].map(p => (
                  <button
                    key={p}
                    onClick={() => fetchSummary(p)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                      summaryPeriod === p
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {summaryLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Generating summary...</p>
                  </div>
                </div>
              ) : summary ? (
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                      <FileText size={13} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">{summaryPeriod} Summary</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{summary}</p>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Select a period to generate a summary</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ai-code {
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.8em;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}