import React from "react";
import { Question, SubjectInfo, TestData } from "../types";
import { QuestionPalette } from "./QuestionPalette";
import { PerformanceStats } from "./PerformanceStats";

interface SidebarProps {
  isOpen: boolean;
  testData: TestData;
  activeQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    partial: number;
    totalMarks: number;
  };
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  testData,
  activeQuestionIndex,
  onQuestionSelect,
  stats,
  onCloseMobile,
}) => {
  const sidebarClasses =
    "fixed lg:relative top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[90] transition-all duration-300 ease-in-out flex flex-col overflow-hidden " +
    (isOpen
      ? "w-[300px] translate-x-0"
      : "w-0 -translate-x-full lg:translate-x-0");

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-[80] lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="w-[300px] flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-hidden flex flex-col">
            <QuestionPalette
              testData={testData}
              activeIndex={activeQuestionIndex}
              onSelect={(idx) => {
                onQuestionSelect(idx);
                if (window.innerWidth < 1024) onCloseMobile();
              }}
              total={stats.total}
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 transition-colors">
            <PerformanceStats stats={stats} />
          </div>
        </div>
      </aside>
    </>
  );
};
