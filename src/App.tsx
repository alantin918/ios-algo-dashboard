import { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Code, 
  Zap, 
  Layers, 
  Cpu, 
  Copy, 
  Check, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  Smartphone,
  Info
} from 'lucide-react';
import { initialAlgorithms } from './data/algorithms';

function App() {
  const algorithms = initialAlgorithms;
  const [selectedId, setSelectedId] = useState<string>(initialAlgorithms[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'全部' | '資料結構' | '演算法'>('全部');
  
  // Flashcard Mode 狀態
  const [flashcardMode, setFlashcardMode] = useState<boolean>(false);
  const [revealComplexity, setRevealComplexity] = useState<boolean>(false);
  const [revealCode, setRevealCode] = useState<boolean>(false);
  
  // 複製狀態
  const [copied, setCopied] = useState<boolean>(false);

  // 選中的演算法
  const currentAlgo = useMemo(() => {
    return algorithms.find(a => a.id === selectedId) || algorithms[0];
  }, [algorithms, selectedId]);

  // 過濾後的清單
  const filteredAlgos = useMemo(() => {
    return algorithms.filter(algo => {
      const matchesSearch = 
        algo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        algo.mindset.some(line => line.toLowerCase().includes(searchQuery.toLowerCase())) ||
        algo.iosApplication.some(line => line.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        categoryFilter === '全部' || 
        algo.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [algorithms, searchQuery, categoryFilter]);

  // Swift 語法高亮解析器
  const highlightSwift = (code: string) => {
    // HTML 轉義以防注入
    let html = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. 佔位符保存註解
    const comments: string[] = [];
    html = html.replace(/(\/\/.*)/g, (match) => {
      comments.push(match);
      return `___COMMENT_PLACEHOLDER_${comments.length - 1}___`;
    });

    // 2. 佔位符保存字串
    const strings: string[] = [];
    html = html.replace(/("[^"\\]*(?:\\.[^"\\]*)*")/g, (match) => {
      strings.push(match);
      return `___STRING_PLACEHOLDER_${strings.length - 1}___`;
    });

    // 3. Swift 關鍵字
    const keywords = [
      'class', 'struct', 'func', 'let', 'var', 'if', 'else', 'return', 
      'guard', 'defer', 'private', 'public', 'init', 'weak', 'import', 
      'self', 'in', 'while', 'for', 'where', 'true', 'false', 'nil', 
      'default', 'switch', 'case', 'break', 'protocol', 'extension', 
      'mutating', 'throws', 'try', 'catch', 'do', 'as', 'is', 'any', 'some'
    ];
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    html = html.replace(keywordRegex, '<span class="swift-keyword">$1</span>');

    // 4. 系統與自定義類型
    const types = [
      'Int', 'String', 'Double', 'Float', 'Bool', 'Array', 'Dictionary', 
      'Hashable', 'Character', 'ListNode', 'LRUNode', 'LRUCache', 'Trie', 'TrieNode', 
      'NSRecursiveLock', 'Any', 'Void', 'max', 'ListNode?', 'LRUNode?', 'Key', 'Value', 'Character:', 'TrieNode<'
    ];
    const typeRegex = new RegExp(`\\b(${types.join('|')})\\b`, 'g');
    html = html.replace(typeRegex, '<span class="swift-type">$1</span>');

    // 5. 函數呼叫
    html = html.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/g, '<span class="swift-function">$1</span>');

    // 6. 還原字串與註解
    strings.forEach((str, index) => {
      html = html.replace(`___STRING_PLACEHOLDER_${index}___`, `<span class="swift-string">${str}</span>`);
    });

    comments.forEach((comment, index) => {
      html = html.replace(`___COMMENT_PLACEHOLDER_${index}___`, `<span class="swift-comment">${comment}</span>`);
    });

    return html;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectAlgo = (id: string) => {
    setSelectedId(id);
    // 切換時重置 Flashcard 揭露狀態
    setRevealComplexity(false);
    setRevealCode(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      {/* 背景發光裝飾球 */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-glow-purple -z-10 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-glow-blue -z-10 animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-2/3 w-[400px] h-[400px] bg-glow-orange -z-10 animate-pulse-slow pointer-events-none" style={{ animationDelay: '4s' }}></div>

      {/* 左側 Sidebar 側邊導覽列 */}
      <aside className="w-full md:w-80 glass-panel md:min-h-screen border-b md:border-b-0 md:border-r border-slate-800 flex flex-col z-10 shrink-0">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              iOS Senior 面試複習
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">演算法 & 資料結構儀表板</p>
        </div>

        {/* 搜尋與篩選 */}
        <div className="p-4 space-y-3 border-b border-slate-800/40">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋主題、標籤、iOS應用..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-500 transition-all"
            />
          </div>

          {/* 分類篩選 Segmented Control */}
          <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/80 text-xs">
            {(['全部', '資料結構', '演算法'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setCategoryFilter(tab)}
                className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
                  categoryFilter === tab 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 主題清單 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[350px] md:max-h-none">
          {filteredAlgos.length > 0 ? (
            filteredAlgos.map(algo => (
              <button
                key={algo.id}
                onClick={() => handleSelectAlgo(algo.id)}
                className={`w-full text-left p-3 rounded-lg transition-all flex justify-between items-center ${
                  selectedId === algo.id 
                    ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border border-purple-500/30 text-white font-medium'
                    : 'bg-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm">{algo.title}</span>
                  <span className="text-[10px] opacity-70 flex items-center gap-1 font-mono">
                    <span className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-400">
                      {algo.category}
                    </span>
                    {algo.timeComplexity !== 'N/A' && (
                      <span className="text-blue-400">T: {algo.timeComplexity}</span>
                    )}
                  </span>
                </div>
                <BookOpen className={`w-4 h-4 shrink-0 transition-transform ${selectedId === algo.id ? 'translate-x-1 text-purple-400' : 'opacity-40'}`} />
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              沒有找到符合的主題
            </div>
          )}
        </div>

        {/* 口訣速查快捷區 (Gemini Mnemonic Suite) */}
        <div className="p-4 border-t border-slate-800/60 mt-auto bg-slate-950/20">
          <button
            onClick={() => handleSelectAlgo('leetcode-mnemonics')}
            className={`w-full py-2.5 px-3 rounded-lg flex items-center justify-between transition-all border ${
              selectedId === 'leetcode-mnemonics'
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500 text-white font-semibold'
                : 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-slate-800/80 text-purple-300 hover:border-purple-500/40 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-xs tracking-wide">Gemini 記憶口訣秘笈</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          </button>
        </div>
      </aside>

      {/* 右側 Main Content 主內容區 */}
      <main className="flex-1 p-5 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-screen">
        {/* Content Header & Flashcard Mode Controller */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-tr from-purple-500/10 to-blue-500/10 border border-purple-500/30 text-purple-400">
                {currentAlgo.category}
              </span>
              {currentAlgo.tags.map(tag => (
                <span key={tag} className="text-xs text-slate-500 font-mono">#{tag}</span>
              ))}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{currentAlgo.title}</h2>
          </div>

          {/* Flashcard Controller */}
          <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => {
                setFlashcardMode(!flashcardMode);
                setRevealComplexity(false);
                setRevealCode(false);
              }}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md font-medium transition-all ${
                flashcardMode 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {flashcardMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>模擬面試模式</span>
            </button>
            {flashcardMode && (
              <span className="text-[10px] text-purple-400 px-1 font-semibold animate-pulse">
                ON
              </span>
            )}
          </div>
        </div>

        {/* 核心指標：時間複雜度 & 空間複雜度 */}
        {currentAlgo.timeComplexity !== 'N/A' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 時間複雜度 */}
            <div className="glass-panel p-4 rounded-xl relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">時間複雜度 (Time Complexity)</p>
                  <h3 className="text-xl font-bold font-mono tracking-wide text-white">
                    {flashcardMode && !revealComplexity ? (
                      <span className="blur-sm select-none opacity-40">O(1)</span>
                    ) : (
                      currentAlgo.timeComplexity
                    )}
                  </h3>
                </div>
              </div>
              {flashcardMode && !revealComplexity && (
                <button
                  onClick={() => setRevealComplexity(true)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>顯示複雜度</span>
                </button>
              )}
            </div>

            {/* 空間複雜度 */}
            <div className="glass-panel p-4 rounded-xl relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">空間複雜度 (Space Complexity)</p>
                  <h3 className="text-xl font-bold font-mono tracking-wide text-white">
                    {flashcardMode && !revealComplexity ? (
                      <span className="blur-sm select-none opacity-40">O(n)</span>
                    ) : (
                      currentAlgo.spaceComplexity
                    )}
                  </h3>
                </div>
              </div>
              {flashcardMode && !revealComplexity && (
                <button
                  onClick={() => setRevealComplexity(true)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>顯示複雜度</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Gemini 專屬記憶卡 (如有提供) */}
        {currentAlgo.geminiTips && (
          <div className="border border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-amber-400">Gemini 面試複習悄悄話</h4>
                  <p className="text-xs text-slate-400 mt-0.5">針對此主題的生動比喻與 LeetCode 聯想口訣</p>
                </div>
                
                {currentAlgo.geminiTips.metaphor && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-500/70 tracking-wider">生動比喻 (Mental Metaphor)</span>
                    <p className="text-sm text-slate-200 italic font-medium leading-relaxed">
                      「{currentAlgo.geminiTips.metaphor}」
                    </p>
                  </div>
                )}

                {currentAlgo.geminiTips.mnemonic && (
                  <div className="space-y-1 pt-1 border-t border-slate-800/40">
                    <span className="text-[10px] uppercase font-bold text-purple-400/80 tracking-wider">LeetCode 記憶口訣</span>
                    <pre className="text-sm text-purple-300 font-medium whitespace-pre-wrap font-sans">
                      {currentAlgo.geminiTips.mnemonic}
                    </pre>
                  </div>
                )}
                
                {currentAlgo.geminiTips.note && (
                  <div className="flex gap-1.5 items-start text-xs text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 mt-1">
                    <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{currentAlgo.geminiTips.note}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 解題思維 (Mindset) */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2.5">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-semibold text-white">核心解題思維 (Mindset)</h3>
          </div>
          <ul className="space-y-3">
            {currentAlgo.mindset.map((line, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-sm text-slate-300">
                <span className="mt-1 flex w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* iOS 實戰應用 (iOS Application) */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2.5">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">iOS 實戰應用場景 (iOS Core Context)</h3>
          </div>
          <div className="space-y-3">
            {currentAlgo.iosApplication.map((line, idx) => {
              // 對對比點做標題上色
              const isHighlight = line.includes('Kingfisher') || line.includes('NSCache') || line.includes('對比') || line.includes('註冊') || line.includes('自動補全') || line.includes('Spotlight');
              return (
                <div key={idx} className="text-sm text-slate-300 pl-4 border-l-2 border-slate-800 leading-relaxed font-sans">
                  {isHighlight ? (
                    <span className="font-semibold text-slate-200">{line}</span>
                  ) : (
                    <span>{line}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Swift 程式碼區塊 (Code Snippet) */}
        {currentAlgo.codeSnippet && (
          <div className="glass-panel rounded-xl overflow-hidden relative flex flex-col">
            {/* Code Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800/60 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-semibold">
                <Code className="w-4 h-4 text-purple-400" />
                <span>Swift 實作範例</span>
              </div>
              <button
                onClick={() => handleCopyCode(currentAlgo.codeSnippet || '')}
                className="flex items-center gap-1.5 py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已複製' : '複製代碼'}</span>
              </button>
            </div>

            {/* Code Body with Custom Syntax Highlighting */}
            <div className="relative p-4 bg-[#0a0d16] overflow-x-auto select-text font-mono max-h-[500px]">
              {flashcardMode && !revealCode ? (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-5 text-center">
                  <HelpCircle className="w-8 h-8 text-purple-400 animate-bounce" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">模擬面試挑戰</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      請先在腦中默寫或構思 Swift 實作邏輯與資料結構。準備好後，點擊下方按鈕展開參考程式碼。
                    </p>
                  </div>
                  <button
                    onClick={() => setRevealCode(true)}
                    className="py-1.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md transition-all mt-1"
                  >
                    展開程式碼範例
                  </button>
                </div>
              ) : null}
              
              <pre className="text-xs swift-code whitespace-pre">
                <code dangerouslySetInnerHTML={{ __html: highlightSwift(currentAlgo.codeSnippet) }}></code>
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
