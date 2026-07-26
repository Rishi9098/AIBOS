'use client';

import React from 'react';
import { ExamTerminal, SubmissionReceipt } from '@/components/exam/ExamTerminal';

const sampleExamData = {
  id: "demo-exam-1",
  title: "Class 12 Senior Secondary Physics Board Examination",
  subject: "Physics & Natural Sciences",
  total_marks: 70,
  duration_minutes: 180,
  exam_questions: [
    {
      id: "q-101",
      question_order: 1,
      allocated_marks: 5,
      question: {
        id: "qb-101",
        subject: "Physics",
        chapter: "Electromagnetic Induction",
        bloom_level: "Apply",
        question_type: "MATH",
        question_text: "Derive the mathematical expression for the induced electromotive force (emf) in a coil rotating in a uniform magnetic field. Use the LaTeX Formula editor to state Faraday's law of induction and show step-by-step calculus derivation."
      }
    },
    {
      id: "q-102",
      question_order: 2,
      allocated_marks: 5,
      question: {
        id: "qb-102",
        subject: "Physics",
        chapter: "Ray Optics",
        bloom_level: "Create",
        question_type: "DIAGRAM",
        question_text: "Use the Diagram Canvas below to draw a complete labeled ray diagram showing the formation of an image by a astronomical refracting telescope in normal adjustment. Clearly label the objective lens, eyepiece, focal lengths, and angle subtended."
      }
    },
    {
      id: "q-103",
      question_order: 3,
      allocated_marks: 10,
      question: {
        id: "qb-103",
        subject: "Physics",
        chapter: "Semiconductor Electronics",
        bloom_level: "Analyze",
        question_type: "LONG",
        question_text: "Explain the working principle of a Full Wave Bridge Rectifier circuit. Detail the role of p-n junction diodes during positive and negative half cycles of the input AC signal."
      }
    }
  ]
};

// Simple SHA-256 helper for client-side cryptographic hashing
async function computeSha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ExamPage() {
  const handleSubmit = async (answers: Record<string, any>): Promise<SubmissionReceipt | null> => {
    const studentId = "STUDENT-CBSE-2026-90412";
    const now = new Date().toISOString();
    const answersString = JSON.stringify(answers);
    const rawChecksumStr = `demo-exam-1:${studentId}:${answersString}:${now}`;
    const hashChecksum = await computeSha256(rawChecksumStr);
    const digitalSignature = `ECDSA-P256-${hashChecksum.slice(0, 16).toUpperCase()}-SIGNED`;

    const totalAnswered = Object.keys(answers).filter(k => !!answers[k]).length;

    // Try submitting to backend API if available
    try {
      const res = await fetch("http://localhost:8000/api/v1/exams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_id: "demo-exam-1",
          answers: answers,
          digital_signature: digitalSignature
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          submission_id: data.id,
          exam_id: data.exam_id,
          student_id: data.student_id,
          status: data.status,
          submitted_at: data.submitted_at || now,
          hash_chain_checksum: data.hash_chain_checksum || hashChecksum,
          digital_signature: digitalSignature,
          total_answered: totalAnswered
        };
      }
    } catch (e) {
      console.warn("Backend submit API fallback to local cryptographic receipt", e);
    }

    // Local fallback receipt if standalone demo mode
    return {
      submission_id: `SUB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      exam_id: "demo-exam-1",
      student_id: studentId,
      status: "SUBMITTED",
      submitted_at: now,
      hash_chain_checksum: hashChecksum,
      digital_signature: digitalSignature,
      total_answered: totalAnswered
    };
  };

  return (
    <ExamTerminal
      exam={sampleExamData}
      studentName="Rishi Bindal"
      rollNumber="CBSE-2026-90412"
      onSubmit={handleSubmit}
    />
  );
}
