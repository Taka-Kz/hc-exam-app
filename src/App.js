import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, RotateCcw, Award, AlertCircle, FileText, Clock, AlertTriangle, HelpCircle, CheckCircle } from 'lucide-react';

// ★ここで作成したデータファイルを読み込みます★
import { EXAM_VERSIONS, THEME_CONFIG } from './data';

// --- Components Section ---

// 1. ExplanationBox
const ExplanationBox = ({ text, mode, theme }) => {
  if (mode !== 'result' || !text) return null;
  return (
    <div className={`mt-6 p-4 rounded-lg border ${theme.successBg} ${theme.successBorder}`}>
      <div className={`flex items-start gap-2 font-bold mb-2 ${theme.successText}`}>
        <HelpCircle size={20} className={theme.infoIcon} />
        <span>解説</span>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
        {text}
      </div>
    </div>
  );
};

// 2. FillInBlankQuestion
const FillInBlankQuestion = React.memo(({ data, userAnswers, handleAnswerChange, mode, theme }) => {
  return (
    <div className="space-y-6">
      <div className="leading-8 text-gray-800 text-lg">
        {data.textSegments.map((segment, idx) => {
          if (typeof segment === 'string') return <span key={idx}>{segment}</span>;
          if (segment.break) return <div key={idx} className="h-4 basis-full" />;
            
          const answerKey = `${data.id}_${segment.id}`;
          const selectedId = userAnswers[answerKey];
          const isCorrect = mode === 'result' ? selectedId === data.answers[segment.id] : null;

          // 見直しモードでの表示用データ取得
          const selectedOption = data.options.find(o => o.id === selectedId);
          const correctOption = data.options.find(o => o.id === data.answers[segment.id]);

          if (mode === 'result') {
              return (
                  <span key={idx} className="inline-block mx-1">
                      <span className={`
                          px-2 py-0.5 rounded text-base font-bold border-b-2
                          ${isCorrect ? `${theme.successBg} ${theme.border} ${theme.successText}` : "bg-red-50 border-red-500 text-red-800"}
                      `}>
                          {selectedOption ? selectedOption.text : "（未回答）"}
                      </span>
                      {!isCorrect && (
                           <span className={`${theme.success} text-sm font-bold ml-1`}>
                              （正: {correctOption ? correctOption.text : ""}）
                           </span>
                      )}
                  </span>
              );
          }

          return (
            <span key={idx} className="inline-block mx-1 relative">
              <select
                disabled={mode === 'result'}
                value={selectedId || ""}
                onChange={(e) => handleAnswerChange(data.id, segment.id, e.target.value)}
                className={`appearance-none bg-gray-100 border-b-2 border-gray-300 font-bold py-1 px-3 text-center min-w-[3rem] focus:outline-none focus:${theme.border} text-blue-600`}
              >
                <option value="" disabled hidden>{segment.id}</option>
                {data.options.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.id}. {opt.text}</option>
                ))}
              </select>
            </span>
          );
        })}
      </div>
        
      {/* 選択肢一覧（参考用） */}
      {mode !== 'result' && (
        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-bold text-gray-500 mb-2">語群リスト</h4>
          <div className="flex flex-wrap gap-2">
            {data.options.map((opt) => (
              <span key={opt.id} className="bg-white px-2 py-1 border rounded text-sm text-gray-700 shadow-sm">
                <span className={`font-bold ${theme.text} mr-1`}>{opt.id}.</span>
                {opt.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <ExplanationBox text={data.explanation} mode={mode} theme={theme} />
    </div>
  );
});

// 3. ScenarioJudgmentQuestion
const ScenarioJudgmentQuestion = React.memo(({ data, userAnswers, handleAnswerChange, mode, theme }) => {
  return (
    <div className="space-y-6">
      {data.context && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 text-sm text-blue-800 mb-4">
          <p className="font-bold">前提条件:</p>
          <p>{data.context}</p>
        </div>
      )}

      <div className="space-y-4">
        {data.scenarios.map((scene) => {
          const isQuestion = !!scene.questionNo;
            
          // 設問でない行
          if (!isQuestion) {
            return (
               <div key={scene.id} className="bg-gray-50 p-4 border border-gray-200 rounded-lg shadow-sm opacity-90">
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 font-bold px-2 py-1 rounded text-xs mt-1 whitespace-nowrap ${scene.speaker && (scene.speaker === '天見' || scene.speaker === '牧田') ? `${theme.bgSoft} ${theme.textDark}` : 'bg-gray-200 text-gray-700'}`}>
                      {scene.speaker}
                    </span>
                    <p className="text-gray-600 leading-relaxed text-sm">{scene.text}</p>
                  </div>
               </div>
            );
          }

          // 設問行
          const answerKey = `${data.id}_${scene.questionNo}`;
          const selected = userAnswers[answerKey];
          const isCorrect = mode === 'result' ? selected === data.answers[scene.questionNo] : null;

          // 正解のテキストを取得するためのロジック
          const correctId = data.answers[scene.questionNo];
          const correctOption = data.reasonOptions.find(opt => opt.id === correctId);
          const correctText = correctOption ? correctOption.text : "";

          return (
            <div key={scene.id} className={`bg-white p-4 border-2 ${theme.borderLight} rounded-lg shadow-sm`}>
              <div className="mb-3 flex items-start gap-3">
                <span className={`flex-shrink-0 font-bold px-2 py-1 rounded text-xs mt-1 whitespace-nowrap ${scene.speaker && (scene.speaker === '天見' || scene.speaker === '牧田') ? `${theme.bgSoft} ${theme.textDark}` : 'bg-gray-200 text-gray-700'}`}>
                  {scene.speaker}
                </span>
                <p className="text-gray-800 leading-relaxed font-medium">{scene.text}</p>
              </div>
                
              <div className="pl-0 md:pl-12 mt-3">
                <div className={`${theme.bgLight} p-3 rounded-md`}>
                    <p className={`text-xs ${theme.text} mb-2 font-bold flex items-center gap-1`}>
                      <Award size={14}/> 設問（{scene.questionNo}）: この対応は適切ですか？
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                          disabled={mode === 'result'}
                          onClick={() => handleAnswerChange(data.id, scene.questionNo, "A")}
                          className={`
                            py-2 px-3 text-sm rounded border text-left flex items-center gap-2 transition-all
                            ${selected === "A" ? `${theme.bgSoft} ${theme.border} ${theme.textDarker} font-bold shadow-sm` : "bg-white border-gray-300 hover:bg-gray-50"}
                            ${mode === 'result' && data.answers[scene.questionNo] === "A" ? `ring-2 ${theme.successRing} ${theme.successBg}` : ""}
                          `}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected === "A" ? theme.border : "border-gray-400"}`}>
                            {selected === "A" && <div className={`w-2 h-2 ${theme.bg} rounded-full`} />}
                          </div>
                          A. 適切である
                        </button>
                          
                        <select
                          disabled={mode === 'result'}
                          value={selected !== "A" ? selected || "" : ""}
                          onChange={(e) => handleAnswerChange(data.id, scene.questionNo, e.target.value)}
                          className={`
                            py-2 px-3 text-sm rounded border bg-white transition-all
                            ${selected && selected !== "A" ? `${theme.bgSoft} ${theme.border} ${theme.textDarker} font-bold shadow-sm` : "border-gray-300"}
                            ${mode === 'result' && selected !== "A" && selected === data.answers[scene.questionNo] ? `ring-2 ${theme.successRing} ${theme.successBg}` : ""}
                          `}
                        >
                          {/* 変更点: disabled と hidden を追加して選択不可にしました */}
                          <option value="" disabled hidden>不適切な場合の理由を選択...</option>
                          {data.reasonOptions.filter(r => r.id !== "A").map(r => (
                            <option key={r.id} value={r.id}>{r.id}. {r.text}</option>
                          ))}
                        </select>
                    </div>
                    {mode === 'result' && (
                      <div className="mt-3 space-y-2">
                        <div className={`text-sm font-bold ${isCorrect ? theme.success : 'text-red-600'}`}>
                          {isCorrect ? "○ 正解" : `× 不正解（正解: ${correctId}${correctText ? `. ${correctText}` : ""}）`}
                        </div>
                        {scene.explanation && (
                          <div className="text-sm text-gray-600 bg-white/50 p-2 rounded border border-gray-200">
                            <span className="font-bold">解説:</span> {scene.explanation}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ExplanationBox text={data.explanation} mode={mode} theme={theme} />
    </div>
  );
});

// 4. MultipleChoiceQuestion
const MultipleChoiceQuestion = React.memo(({ data, userAnswers, handleAnswerChange, mode, theme }) => {
  return (
    <div className="space-y-8">
      {data.context && (
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm text-gray-700 mb-4">
              <strong>参考:</strong> {data.context}
          </div>
      )}

      {data.questions.map((q) => {
        const answerKey = `${data.id}_${q.subId}`;
        const selected = userAnswers[answerKey];
        const isCorrect = mode === 'result' ? selected === q.demoAnswer : null;
        const choices = data.commonChoices || q.choices || [];

        return (
          <div key={q.subId} className="bg-white p-5 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex gap-2">
              <span className={`${theme.bgSoft} ${theme.textDark} text-xs px-2 py-1 rounded h-fit mt-1 flex-shrink-0`}>（{q.subId}）</span>
              {q.text}
            </h3>

            {choices.length > 0 ? (
                <div className={`grid ${choices.length > 4 ? "grid-cols-2 gap-2" : "grid-cols-1 gap-2"}`}>
                  {choices.map((choice) => (
                    <button
                      key={choice.id}
                      disabled={mode === 'result'}
                      onClick={() => handleAnswerChange(data.id, q.subId, choice.id)}
                      className={`
                        w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3
                        ${selected === choice.id 
                          ? (mode === 'result' && !isCorrect ? "bg-red-50 border-red-300" : `${theme.bgLight} ${theme.border} ring-1 ${theme.ring}`) 
                          : "bg-white border-gray-200 hover:bg-gray-50"}
                        ${mode === 'result' && choice.id === q.demoAnswer ? `${theme.successBg} ${theme.border} ring-1 ${theme.successRing}` : ""}
                      `}
                    >
                      <div className={`
                        flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mt-0.5
                        ${selected === choice.id ? `${theme.border} ${theme.text}` : "border-gray-300 text-gray-400"}
                        ${mode === 'result' && choice.id === q.demoAnswer ? `!${theme.border} !${theme.success}` : ""}
                      `}>
                        {mode === 'result' && choice.id === q.demoAnswer ? <CheckCircle size={14}/> : choice.id}
                      </div>
                      <span className="text-sm">{choice.text}</span>
                    </button>
                  ))}
                </div>
            ) : (
                 <p className="text-red-500">選択肢データがありません</p>
            )}
              
            {mode === 'result' && (
               <div className="mt-3">
                  {!isCorrect && (
                        <p className="text-red-600 text-sm font-bold mb-2">正解: {q.demoAnswer}</p>
                  )}
                  {q.explanation && (
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 border border-gray-200">
                            <span className="font-bold text-gray-700">解説: </span>
                            {q.explanation}
                        </div>
                  )}
               </div>
            )}
          </div>
        );
      })}
      {/* セクション全体の解説がある場合 */}
      <ExplanationBox text={data.explanation} mode={mode} theme={theme} />
    </div>
  );
});

// --- App Component Parts ---

const Header = ({ mode, theme, timeLeft, handleFinishButton, toggleExamVersion, examVersion, progress, formatTime, handleStart }) => (
  <div className="sticky top-0 z-10 shadow-md">
    <div className={`${theme.bg} text-white p-4 flex flex-col md:flex-row justify-between items-center gap-2`}>
      <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center space-x-2">
            <Award size={24} />
            <h1 className="font-bold text-lg md:text-xl">HC検定3級対策</h1>
        </div>
      </div>
        
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {mode === 'exam' && (
          <>
            <button
              onClick={handleFinishButton}
              className="bg-red-500 hover:bg-red-600 text-white text-xs md:text-sm px-3 py-1.5 rounded font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              終了する
            </button>
            <div className={`flex items-center gap-2 font-mono text-lg md:text-xl font-bold px-3 py-1 rounded ${timeLeft < 300 ? 'bg-red-500 animate-pulse' : theme.timer}`}>
              <Clock size={18} />
              {formatTime(timeLeft)}
            </div>
          </>
        )}

        {/* 見直しモード時に再挑戦ボタンを表示 */}
        {mode === 'result' && (
          <button
            onClick={handleStart}
            className="bg-white/20 hover:bg-white/30 text-white text-xs md:text-sm px-3 py-1.5 rounded-full font-bold transition-colors border border-white/40 flex items-center gap-1"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">再挑戦する</span>
            <span className="sm:hidden">再挑戦</span>
          </button>
        )}

        {/* モード切り替えボタン（試験中以外のみ有効） */}
        <button 
            onClick={toggleExamVersion}
            disabled={mode === 'exam'}
            className={`
                text-xs md:text-sm px-3 py-1.5 rounded-full whitespace-nowrap border transition-all flex items-center gap-1
                ${mode !== 'exam' ? 'bg-white/20 hover:bg-white/30 border-white/40 cursor-pointer' : 'bg-white/10 border-transparent cursor-default opacity-80'}
            `}
        >
          <span>{EXAM_VERSIONS[examVersion].title}</span>
          {mode !== 'exam' && <RotateCcw size={12} className="opacity-80" />}
        </button>
      </div>
    </div>

    {/* 進捗バー */}
    {mode !== 'home' && (
      <div className="w-full bg-gray-200 h-2">
        <div 
          className={`${theme.progress} h-2 transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);

const ConfirmModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" />
          確認
        </h3>
        <p className="text-gray-600 mb-6">
          テストを終了して採点しますか？<br/>
          <span className="text-xs text-gray-400">※未回答の問題がある場合もそのまま採点されます。</span>
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
            キャンセル
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow-sm">
            終了する
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

export default function App() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [mode, setMode] = useState('home'); // home, exam, result
  const [examVersion, setExamVersion] = useState('98'); // '98' or '99'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
    
  // Timer State
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // データ取得
  const currentExamData = EXAM_VERSIONS[examVersion].data;
  const currentQuestionData = currentExamData[currentSectionIndex];
  const themeColor = EXAM_VERSIONS[examVersion].color;
  const theme = THEME_CONFIG[themeColor];
    
  // 進捗率
  const progress = currentExamData.length > 0 ? ((currentSectionIndex + 1) / currentExamData.length) * 100 : 0;

  // タイマーロジック
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setMode('result');
      setCurrentSectionIndex(0);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ハンドラー
  const handleStart = () => {
    if (currentExamData.length === 0) return;
    setMode('exam');
    setCurrentSectionIndex(0);
    setUserAnswers({});
    setTimeLeft(60 * 60);
    setIsTimerRunning(true);
  };

  const handleFinishButton = () => setShowConfirmModal(true);
    
  const confirmFinish = () => {
    setShowConfirmModal(false);
    setIsTimerRunning(false);
    setMode('result');
    setCurrentSectionIndex(0);
  };

  const handleAnswerChange = useCallback((questionId, subId, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [`${questionId}_${subId}`]: value
    }));
  }, []);

  const nextQuestion = () => {
    if (currentSectionIndex < currentExamData.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleFinishButton();
    }
  };

  const prevQuestion = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const toggleExamVersion = () => {
      if (mode === 'exam') return;
      const newVersion = examVersion === '98' ? '99' : '98';
      setExamVersion(newVersion);
      // リセット
      if (mode !== 'home') {
          setMode('home');
          setCurrentSectionIndex(0);
          setUserAnswers({});
          setIsTimerRunning(false);
      }
  };

  // --- Rendering ---

  // 1. ホーム画面
  if (mode === 'home') {
    return (
      <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
        <Header mode={mode} theme={theme} toggleExamVersion={toggleExamVersion} examVersion={examVersion} handleStart={handleStart} />
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
                <div className={`${theme.homeIconBg} p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center ${theme.homeIcon}`}>
                  <BookOpen size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">学習を始める</h2>
                  <p className="text-gray-600 mb-2">{EXAM_VERSIONS[examVersion].title}</p>
                  <p className="text-xs text-gray-400">※右上のボタンで回を切り替えられます</p>
                </div>
                  
                {currentExamData.length > 0 ? (
                    <>
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-left text-sm text-blue-800">
                            <p className="flex items-start gap-2">
                                <Clock size={16} className="mt-1 flex-shrink-0" />
                                <span>試験時間は60分です。開始ボタンを押すとタイマーが作動します。</span>
                            </p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-left text-sm text-yellow-800">
                            <p className="flex items-start gap-2">
                                <AlertCircle size={16} className="mt-1 flex-shrink-0" />
                                <span>本アプリは学習用です。正誤判定はデモ用の仮定解であり、公式の解答とは異なります。</span>
                            </p>
                        </div>
                        <button 
                          onClick={handleStart}
                          className={`w-full ${theme.bg} ${theme.bgHover} text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2`}
                        >
                          <span>試験開始（60分）</span>
                          <ChevronRight size={20} />
                        </button>
                    </>
                ) : (
                    <div className="bg-gray-100 border border-gray-300 p-6 rounded-lg text-center">
                        <p className="text-gray-500 font-bold mb-2">準備中</p>
                        <p className="text-sm text-gray-400">この回の問題データはまだ登録されていません。</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  // 2. 結果画面
  if (mode === 'result' && currentSectionIndex >= 0) {
      let totalQuestions = 0;
      let correctCount = 0;

      // 採点ロジック
      currentExamData.forEach(section => {
        if (section.type === 'fill-in-blank') {
            section.textSegments.forEach(seg => {
            if (typeof seg === 'object' && seg.id) {
                totalQuestions++;
                if (userAnswers[`${section.id}_${seg.id}`] === section.answers[seg.id]) correctCount++;
            }
            });
        } else if (section.type === 'scenario-judgment') {
            section.scenarios.forEach(s => {
                if (s.questionNo) {
                    totalQuestions++;
                    if (userAnswers[`${section.id}_${s.questionNo}`] === section.answers[s.questionNo]) correctCount++;
                }
            });
        } else if (section.type === 'multiple-choice' || section.type === 'binary-choice') {
            section.questions.forEach(q => {
                totalQuestions++;
                if (userAnswers[`${section.id}_${q.subId}`] === q.demoAnswer) correctCount++;
            });
        }
      });

      const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        
      // 結果表示（最後の問題を過ぎたら表示）
      if (currentSectionIndex >= currentExamData.length) {
        return (
            <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
                <Header mode={mode} theme={theme} toggleExamVersion={toggleExamVersion} examVersion={examVersion} handleStart={handleStart} />
                <div className="max-w-2xl mx-auto p-6 space-y-8">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">試験結果</h2>
                    <div className={`text-6xl font-black ${theme.text} mb-2`}>{percentage}<span className="text-2xl">%</span></div>
                    <p className="text-gray-500">正解数: {correctCount} / {totalQuestions}</p>
                      
                    <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => setCurrentSectionIndex(0)} className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
                            <FileText size={18} />
                            回答を見直す
                        </button>
                        <button onClick={handleStart} className={`flex items-center justify-center gap-2 px-6 py-3 ${theme.bg} text-white rounded-lg ${theme.bgHover}`}>
                            <RotateCcw size={18} />
                            再挑戦
                        </button>
                    </div>
                    </div>
                </div>
            </div>
        )
      }
  }

  // 3. 試験画面 / 見直し画面
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <Header 
        mode={mode} theme={theme} timeLeft={timeLeft} progress={progress} 
        handleFinishButton={handleFinishButton} toggleExamVersion={toggleExamVersion} examVersion={examVersion} formatTime={formatTime} handleStart={handleStart}
      />
        
      <ConfirmModal show={showConfirmModal} onConfirm={confirmFinish} onCancel={() => setShowConfirmModal(false)} />
        
      <main className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-end mb-4">
            <div>
                <span className={`${theme.text} font-bold tracking-wider text-sm`}>{currentQuestionData.section}</span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{currentQuestionData.title}</h2>
            </div>
            {mode === 'result' && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold border border-red-200 whitespace-nowrap ml-2">
                    見直しモード
                </span>
            )}
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-start gap-3 mb-6 bg-gray-50 p-3 rounded text-gray-700 text-sm">
            <AlertCircle size={18} className={`mt-0.5 ${theme.text} flex-shrink-0`} />
            <p>{currentQuestionData.instruction}</p>
          </div>

          {/* 問題のタイプに応じてコンポーネントを切り替え */}
          {currentQuestionData.type === 'fill-in-blank' && 
             <FillInBlankQuestion 
                data={currentQuestionData} 
                userAnswers={userAnswers}
                handleAnswerChange={handleAnswerChange}
                mode={mode}
                theme={theme}
             />
          }
          {currentQuestionData.type === 'scenario-judgment' && 
             <ScenarioJudgmentQuestion 
                data={currentQuestionData} 
                userAnswers={userAnswers}
                handleAnswerChange={handleAnswerChange}
                mode={mode}
                theme={theme}
             />
          }
          {(currentQuestionData.type === 'multiple-choice' || currentQuestionData.type === 'binary-choice') && (
              <MultipleChoiceQuestion 
                 data={currentQuestionData} 
                 userAnswers={userAnswers}
                 handleAnswerChange={handleAnswerChange}
                 mode={mode}
                 theme={theme}
              />
          )}
        </div>

      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center max-w-full z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={prevQuestion}
          disabled={currentSectionIndex === 0}
          className={`flex items-center gap-1 px-4 py-2 rounded font-medium ${currentSectionIndex === 0 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">前へ</span>
        </button>
        
        <span className="text-gray-400 font-medium text-sm">
          {currentSectionIndex + 1} / {currentExamData.length}
        </span>

        <button 
          onClick={nextQuestion}
          className={`flex items-center gap-1 px-6 py-2 ${theme.bg} text-white rounded-lg shadow ${theme.bgHover} font-bold transition-transform active:scale-95`}
        >
          {currentSectionIndex === currentExamData.length - 1 ? (mode === 'result' ? "結果に戻る" : "採点する") : "次へ"}
          <ChevronRight size={20} />
        </button>
      </footer>
    </div>
  );
}