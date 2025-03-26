export interface CreateExamQuestionDto {
  name: string;
  tempId?: string; // temp uuid used when create exam question until real id is made in backend
  subQuestions?: CreateExamQuestionDto[] | null;
  writtenPrompt?: string | null;
  teacherFeedback?: boolean | null;
  autoMarking?: boolean | null;
  type?: string;
  timed?: boolean | null;
  time?: number | null;
  randomQuestionOrder?: boolean | null;
  partialMarking?: boolean | null;
  caseSensitive?: boolean | null; // for fill-in-blanks question, the student will have to get the case correct to score the points
  multipleChoiceQuestionList?: { text: string; correct: boolean }[] | null; // todo - seperate
  reorderSentenceQuestionList?: { text: string }[] | null;
  fillBlanksQuestionList?:
    | { text: string; blanks: { text: string }[] }[]
    | null;
  matchOptionQuestionList?:
    | { leftOption: string; rightOption: string }[]
    | null;
  totalPointsMin?: number | null;
  totalPointsMax?: number | null;
  length?: number | null;
  prompt1?: { fileString: string; type: string; fileName: string } | null;
  prompt2?: { fileString: string; type: string; fileName: string } | null;
  prompt3?: { fileString: string; type: string; fileName: string } | null;
  expanded?: boolean;
  parent?: string | null;
  [key: string]: unknown;
  studentResponse?: StudentQuestionReponse[];
}

export interface ExamQuestionDto extends CreateExamQuestionDto {
  _id: string;
  examId: string;
  subQuestions?: ExamQuestionDto[] | null;
}

export interface StudentQuestionReponse {
  studentId?: string | null;
  response?: string | null;
  mark?: {
    vocabMark?: number | string | null;
    grammarMark?: number | string | null;
    contentMark?: number | string | null;
    fluencyMark?: number | string | null;
    pronunciationMark?: number | string | null;
    accuracyMark?: number | string | null;
    totalMark?: number | string | null;
    [key: string]: unknown;
  } | null;
  feedback?: { text: string; teacher: string } | null;
}
