import React, { useState, useEffect, useMemo } from "react";
import { TestData, Question, SubjectInfo } from "./types";
import { HtmlContent } from "./components/HtmlContent";
import { Sidebar } from "./components/Sidebar";
import { Icons, AVAILABLE_TESTS } from "./constants";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedTest, setSelectedTest] = useState(AVAILABLE_TESTS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(selectedTest);
        const json = await response.json();
        const data: TestData = json.data
          ? json
          : { status: true, data: json, subject: [], subjectmap: {} };
        setTestData(data);
        setActiveQuestionIndex(0);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTest]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--zoom-scale",
      zoomLevel.toString()
    );
  }, [zoomLevel]);

  const stats = useMemo(() => {
    if (!testData || !testData.data)
      return {
        total: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        partial: 0,
        totalMarks: 0,
      };
    return testData.data.reduce(
      (acc, q) => {
        const status = q.ans_status?.toLowerCase();
        acc.total++;
        if (status === "correct") acc.correct++;
        else if (status === "incorrect") acc.incorrect++;
        else if (status === "partial") acc.partial++;
        else acc.unattempted++;

        acc.totalMarks += (q.p_score || 0) + (q.n_score || 0);
        return acc;
      },
      {
        total: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        partial: 0,
        totalMarks: 0,
      }
    );
  }, [testData]);

  const handleExportPdf = () => {
    window.print();
  };

  const currentQuestion = testData?.data[activeQuestionIndex];

  if (loading && !testData)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors">
        <div className="w-10 h-10 border-4 border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[9px]">
          Syncing Analytics
        </p>
      </div>
    );

  return (
    <div
      className={
        "h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors overflow-hidden " +
        (darkMode ? "dark" : "")
      }
    >
      {/* Printable Area - Controlled by @media print in index.html */}
      <div className="hidden print:block print-view w-full p-0 bg-white text-slate-900">
        <div className="mb-6 border-b-2 border-indigo-600 pb-3 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase">
              Test Analysis Report
            </h1>
            <p className="text-indigo-600 font-bold tracking-widest text-xs uppercase">
              {selectedTest}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Score
            </p>
            <p className="text-2xl font-black text-slate-900">
              {stats.totalMarks}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase">
              Correct
            </p>
            <p className="text-lg font-black text-emerald-600">
              {stats.correct}
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase">
              Incorrect
            </p>
            <p className="text-lg font-black text-rose-600">
              {stats.incorrect}
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase">
              Skipped
            </p>
            <p className="text-lg font-black text-slate-400">
              {stats.unattempted}
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase">
              Questions
            </p>
            <p className="text-lg font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="space-y-4">
          {testData?.data.map((q, idx) => (
            <div
              key={q._id.$oid}
              className="question-card border border-slate-200 rounded-2xl p-4 bg-white"
            >
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md font-black text-xs">
                    Q{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      {testData?.subject.find(
                        (s) => s._id.$oid === q.subject.$oid
                      )?.title || "General"}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-slate-400 text-[9px] font-bold uppercase">
                    <Icons.Clock className="w-2.5 h-2.5" /> {q.time_taken}s
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      +{q.marks_positive}
                    </span>
                    <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                      -{q.marks_negative}
                    </span>
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      Score: {(q.p_score || 0) + (q.n_score || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <HtmlContent
                  content={q.question}
                  className="text-slate-800 font-semibold leading-relaxed text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {["a", "b", "c", "d"].map((key) => {
                  const optKey = ("opt" +
                    (["a", "b", "c", "d"].indexOf(key) + 1)) as keyof Question;
                  const content = q[optKey] as string;
                  if (!content) return null;
                  const isCorrect = q.ans
                    .toLowerCase()
                    .split(",")
                    .includes(key);
                  const isStudent = (q.std_ans || "")
                    .toLowerCase()
                    .split(",")
                    .includes(key);

                  let style =
                    "p-2 border rounded-lg flex items-center gap-2 text-[10px] ";
                  if (isStudent && isCorrect)
                    style +=
                      "bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400";
                  else if (isStudent && !isCorrect)
                    style += "bg-rose-50 border-rose-400 ring-1 ring-rose-400";
                  else if (isCorrect)
                    style += "bg-indigo-50 border-indigo-300 border-dashed";
                  else style += "bg-white border-slate-200";

                  return (
                    <div key={key} className={style}>
                      <span
                        className={
                          "w-5 h-5 rounded flex items-center justify-center font-bold flex-shrink-0 " +
                          (isStudent
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500")
                        }
                      >
                        {key.toUpperCase()}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <HtmlContent content={content} />
                      </div>
                      {isCorrect && (
                        <Icons.CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      )}
                      {isStudent && !isCorrect && (
                        <Icons.XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex justify-end gap-5 text-[9px] font-bold uppercase tracking-tight border-t border-slate-50 pt-2">
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[7px]">
                    Result Status
                  </span>
                  <span
                    className={
                      q.ans_status.toLowerCase() === "correct"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }
                  >
                    {q.ans_status}
                  </span>
                </div>
                <div className="flex flex-col items-end border-l border-slate-100 pl-4">
                  <span className="text-slate-400 text-[7px]">Your Answer</span>
                  <span className="text-slate-900">
                    {q.std_ans?.toUpperCase() || "SKIPPED"}
                  </span>
                </div>
                <div className="flex flex-col items-end border-l border-slate-100 pl-4">
                  <span className="text-slate-400 text-[7px]">
                    Correct Answer
                  </span>
                  <span className="text-indigo-600">{q.ans.toUpperCase()}</span>
                </div>
                <div className="flex flex-col items-end border-l border-slate-100 pl-4">
                  <span className="text-slate-400 text-[7px]">
                    Marks Awarded
                  </span>
                  <span className="text-slate-900">
                    {(q.p_score || 0) + (q.n_score || 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 shrink-0 z-[100] flex items-center justify-between px-4 transition-colors no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              S
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:inline-block">
              SmartAnalyzer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-none no-print"
            title="Export full test analysis to PDF"
          >
            <Icons.FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            title="Toggle Theme"
          >
            {darkMode ? (
              <Icons.Sun className="w-5 h-5" />
            ) : (
              <Icons.Moon className="w-5 h-5" />
            )}
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setZoomLevel((p) => Math.max(p - 0.1, 0.7))}
              className="px-3 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"
            >
              A-
            </button>
            <button
              onClick={() => setZoomLevel((p) => Math.min(p + 0.1, 1.7))}
              className="px-3 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"
            >
              A+
            </button>
          </div>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors"
          >
            {AVAILABLE_TESTS.map((test) => (
              <option key={test} value={test}>
                {test}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main App Content - Hidden during print */}
      <div className="flex-1 flex overflow-hidden no-print">
        {testData && (
          <Sidebar
            isOpen={isSidebarOpen}
            testData={testData}
            activeQuestionIndex={activeQuestionIndex}
            onQuestionSelect={setActiveQuestionIndex}
            stats={stats}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 flex flex-col bg-white dark:bg-slate-900 overflow-hidden relative transition-colors h-full">
          {currentQuestion && (
            <div className="flex flex-col h-full">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="px-2.5 py-1 bg-indigo-600 rounded-lg text-[10px] font-black text-white shrink-0">
                    Q{activeQuestionIndex + 1}
                  </div>
                  <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
                    {testData?.subject.find(
                      (s) => s._id.$oid === currentQuestion.subject.$oid
                    )?.title || "Uncategorized"}
                  </h2>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="flex items-center gap-3 border-r border-slate-200 dark:border-slate-800 pr-6">
                    <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 uppercase tracking-wider">
                      {currentQuestion.question_type}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Icons.Clock className="w-4 h-4" />
                      <span className="text-[11px] font-bold">
                        {currentQuestion.time_taken}s
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                      +{currentQuestion.marks_positive}
                    </span>
                    <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-800">
                      -{currentQuestion.marks_negative}
                    </span>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                      Score:{" "}
                      {(currentQuestion.p_score || 0) +
                        (currentQuestion.n_score || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar transition-colors">
                <div className="max-w-5xl mx-auto w-full">
                  {currentQuestion.passage_desc &&
                    currentQuestion.passage_desc.length > 0 && (
                      <div className="bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-6 mb-10 border border-slate-100 dark:border-slate-800 italic relative transition-colors">
                        <div className="absolute top-0 left-6 -translate-y-1/2 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700 text-[8px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-tighter transition-colors">
                          Passage Context
                        </div>
                        <HtmlContent
                          content={currentQuestion.passage_desc[0].passage}
                          style={{ fontSize: zoomLevel * 0.9 + "rem" }}
                        />
                      </div>
                    )}

                  <div className="mb-12">
                    <HtmlContent
                      content={currentQuestion.question}
                      className="font-semibold text-slate-800 dark:text-slate-100 leading-relaxed"
                      style={{ fontSize: zoomLevel * 1.15 + "rem" }}
                    />
                  </div>

                  <div className="space-y-3">
                    {["a", "b", "c", "d"].map((key) => {
                      const optKey = ("opt" +
                        (["a", "b", "c", "d"].indexOf(key) +
                          1)) as keyof Question;
                      const content = currentQuestion[optKey] as string;
                      if (!content) return null;

                      const isCorrect = currentQuestion.ans
                        .toLowerCase()
                        .split(",")
                        .includes(key);
                      const isStudent = (currentQuestion.std_ans || "")
                        .toLowerCase()
                        .split(",")
                        .includes(key);

                      let rowStyle =
                        "p-4 border rounded-xl flex items-center gap-4 transition-all ";
                      if (isStudent && isCorrect)
                        rowStyle +=
                          "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-700 shadow-sm";
                      else if (isStudent && !isCorrect)
                        rowStyle +=
                          "bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-700 shadow-sm";
                      else if (isCorrect)
                        rowStyle +=
                          "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 border-dashed";
                      else
                        rowStyle +=
                          "bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700";

                      return (
                        <div key={key} className={rowStyle}>
                          <div
                            className={
                              "w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-xs transition-colors " +
                              (isStudent
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500")
                            }
                          >
                            {key.toUpperCase()}
                          </div>
                          <div className="flex-1 overflow-x-auto">
                            <HtmlContent
                              content={content}
                              style={{ fontSize: zoomLevel + "rem" }}
                            />
                          </div>
                          {isCorrect && (
                            <Icons.CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                          )}
                          {isStudent && !isCorrect && (
                            <Icons.XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-14 grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">
                        Student Response
                      </p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {currentQuestion.std_ans?.toUpperCase() || "SKIPPED"}
                      </p>
                    </div>
                    <div className="text-center border-y sm:border-y-0 sm:border-x border-slate-200 dark:border-slate-700 py-4 sm:py-0 transition-colors">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">
                        Question Result
                      </p>
                      <p
                        className={
                          "text-sm font-black uppercase " +
                          (currentQuestion.ans_status.toLowerCase() ===
                          "correct"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : currentQuestion.ans_status.toLowerCase() ===
                              "partial"
                            ? "text-amber-500 dark:text-amber-400"
                            : "text-rose-500 dark:text-rose-400")
                        }
                      >
                        {currentQuestion.ans_status}
                      </p>
                    </div>
                    <div className="text-center sm:border-r border-slate-200 dark:border-slate-700 py-4 sm:py-0 transition-colors">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">
                        Correct Keys
                      </p>
                      <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {currentQuestion.ans.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">
                        Marks Obtained
                      </p>
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {(currentQuestion.p_score || 0) +
                          (currentQuestion.n_score || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 transition-colors">
                <button
                  disabled={activeQuestionIndex === 0}
                  onClick={() => setActiveQuestionIndex((p) => p - 1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2 text-[10px] uppercase tracking-wider"
                >
                  <Icons.ChevronRight className="w-4 h-4 rotate-180" /> Previous
                </button>
                <div className="text-slate-400 dark:text-slate-500 font-bold text-[9px] uppercase tracking-[0.3em] hidden sm:block">
                  {activeQuestionIndex + 1}{" "}
                  <span className="mx-2 text-slate-200 dark:text-slate-800">
                    /
                  </span>{" "}
                  {testData?.data.length}
                </div>
                <button
                  disabled={
                    activeQuestionIndex === (testData?.data.length || 0) - 1
                  }
                  onClick={() => setActiveQuestionIndex((p) => p + 1)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2 text-[10px] uppercase tracking-wider shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95"
                >
                  Next <Icons.ChevronRight className="w-4 h-4" />
                </button>
              </footer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
