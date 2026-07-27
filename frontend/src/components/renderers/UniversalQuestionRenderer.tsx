'use client';

import React from 'react';
import {
  MCQPlugin,
  MultiSelectPlugin,
  TrueFalsePlugin,
  FillInBlanksPlugin,
  ShortAnswerPlugin,
  LongAnswerPlugin,
  NumericalPlugin,
  MatchingPlugin,
  MatrixMatchPlugin,
  ProgrammingCodePlugin,
  AudioQuestionPlugin
} from './QuestionPlugins';
import { MathEditor } from '../exam/MathEditor';
import { DiagramCanvas } from '../exam/DiagramCanvas';

export interface QuestionData {
  id: string;
  question_type: string;
  question_text: string;
  options?: any[];
  left?: string[];
  right?: string[];
  tolerance?: string;
}

export interface UniversalQuestionProps {
  question: QuestionData;
  value: any;
  onChange: (val: any) => void;
  isReadOnly?: boolean;
  isReviewMode?: boolean;
}

export const UniversalQuestionRenderer: React.FC<UniversalQuestionProps> = ({
  question,
  value,
  onChange,
  isReadOnly = false,
  isReviewMode = false,
}) => {
  const type = (question.question_type || 'SHORT').toUpperCase();

  const renderContent = () => {
    switch (type) {
      case 'MCQ':
      case 'MULTIPLE_CHOICE':
        return <MCQPlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      case 'MULTIPLE_SELECT':
      case 'MULTI_SELECT':
        return <MultiSelectPlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      case 'TRUE_FALSE':
        return <TrueFalsePlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      case 'FILL_IN_BLANKS':
      case 'BLANK':
        return <FillInBlanksPlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      case 'SHORT':
      case 'SHORT_ANSWER':
        return <ShortAnswerPlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      case 'LONG':
      case 'LONG_ANSWER':
      case 'ESSAY':
        return <LongAnswerPlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      case 'NUMERICAL':
      case 'NUMBER':
        return <NumericalPlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      case 'MATCHING':
        return <MatchingPlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      case 'MATRIX_MATCH':
      case 'MATRIX':
        return <MatrixMatchPlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      case 'MATH':
      case 'MATHEMATICAL_EQUATION':
      case 'CHEMICAL_EQUATION':
      case 'PHYSICS_FORMULA':
        return <MathEditor value={value || ''} onChange={onChange} />;

      case 'DIAGRAM':
      case 'DIAGRAM_DRAWING':
      case 'GRAPH_PLOTTING':
      case 'IMAGE_ANNOTATION':
        return <DiagramCanvas initialData={value} onChange={onChange} />;

      case 'PROGRAMMING_CODE':
      case 'CODE':
        return <ProgrammingCodePlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      case 'AUDIO_QUESTION':
      case 'VIDEO_QUESTION':
        return <AudioQuestionPlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;

      default:
        return <ShortAnswerPlugin question={question} value={value} onChange={onChange} isReadOnly={isReadOnly} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Prompt */}
      <div className="text-slate-100 text-base leading-relaxed font-sans font-medium">
        {question.question_text}
      </div>

      {/* Rendered Plugin Component */}
      <div className="pt-2">
        {renderContent()}
      </div>
    </div>
  );
};
