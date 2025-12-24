
export interface MongoId {
  $oid: string;
}

export interface SubjectInfo {
  _id: MongoId;
  title: string;
}

export interface Passage {
  _id: MongoId;
  passage: string;
  lang: string;
  font: string;
}

export interface Question {
  _id: MongoId;
  question: string;
  subject: MongoId;
  marks_positive: string;
  marks_negative: string;
  question_type: string;
  opt1: string;
  opt2: string;
  opt3: string;
  opt4: string;
  ans: string;
  std_ans: string | null;
  ans_status: "correct" | "incorrect" | "Unattempted" | "unattempted" | "partial";
  time_taken: number;
  p_score?: number;
  n_score?: number;
  passage_desc?: Passage[];
  __order: number;
}

export interface TestData {
  status: boolean;
  data: Question[];
  subject: SubjectInfo[];
  subjectmap: Record<string, string>;
}

export enum QuestionStatus {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  UNATTEMPTED = 'unattempted',
  PARTIAL = 'partial'
}
