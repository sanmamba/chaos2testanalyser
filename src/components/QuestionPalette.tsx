import React, { useMemo } from "react";
import { TestData, Question, SubjectInfo } from "../types";

interface QuestionPaletteProps {
  testData: TestData;
  activeIndex: number;
  onSelect: (index: number) => void;
  total: number;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  testData,
  activeIndex,
  onSelect,
  total,
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
  };

  const groupedQuestions = useMemo(() => {
    const groups: Record<
      string,
      {
        subject: SubjectInfo;
        questions: (Question & { originalIndex: number })[];
        subjectMarks: number;
        subjectTime: number;
      }
    > = {};

    if (testData.subject) {
      testData.subject.forEach((sub) => {
        groups[sub._id.$oid] = {
          subject: sub,
          questions: [],
          subjectMarks: 0,
          subjectTime: 0,
        };
      });
    }

    testData.data.forEach((q, idx) => {
      const subId = q.subject?.$oid || "default";
      if (!groups[subId]) {
        groups[subId] = {
          subject: { _id: { $oid: subId }, title: "General Section" },
          questions: [],
          subjectMarks: 0,
          subjectTime: 0,
        };
      }
      groups[subId].questions.push({ ...q, originalIndex: idx });
      groups[subId].subjectMarks += (q.p_score || 0) + (q.n_score || 0);
      groups[subId].subjectTime += q.time_taken || 0;
    });
    return groups;
  }, [testData]);

  const getStatusClass = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "correct")
      return "bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-700 shadow-sm";
    if (s === "incorrect")
      return "bg-rose-500 dark:bg-rose-600 text-white border-rose-600 dark:border-rose-700 shadow-sm";
    if (s === "partial")
      return "bg-amber-400 dark:bg-amber-500 text-white border-amber-500 dark:border-amber-600 shadow-sm";
    return "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm";
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0 transition-colors">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Question Palette
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
          {total}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
        {Object.entries(groupedQuestions).map(
          ([id, group]) =>
            group.questions.length > 0 && (
              <div key={id}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-indigo-400 dark:bg-indigo-600 rounded-full"></span>{" "}
                    {group.subject.title}
                  </p>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase">
                    <span className="text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                      {group.subjectMarks} Marks
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                      {formatTime(group.subjectTime)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {group.questions.map((q) => {
                    const isActive = activeIndex === q.originalIndex;
                    const baseBtnClass =
                      "w-9 h-9 text-[10px] font-bold rounded-lg border-2 transition-all flex items-center justify-center ";
                    const activeClass = isActive
                      ? "ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-indigo-500 scale-110 z-10 "
                      : "hover:border-indigo-400 ";
                    const statusClass = getStatusClass(q.ans_status);

                    return (
                      <button
                        key={q._id.$oid}
                        onClick={() => onSelect(q.originalIndex)}
                        className={baseBtnClass + activeClass + statusClass}
                      >
                        {q.originalIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};
