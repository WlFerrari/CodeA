import { quizzes as seedQuizzes, Quiz, Question } from '@/data/quizData';

const KEY = 'academic_quizzes';

function seedIfEmpty() {
  const existing = localStorage.getItem(KEY);
  if (!existing) {
    localStorage.setItem(KEY, JSON.stringify(seedQuizzes));
  }
}

export function getQuizzes(): Quiz[] {
  seedIfEmpty();
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveQuizzes(all: Quiz[]) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function addQuiz(partial: Omit<Quiz, 'id' | 'totalPoints'> & { id?: string }): Quiz {
  const all = getQuizzes();
  const id = partial.id ?? `quiz-${Date.now()}`;
  const totalPoints = calculateTotalPoints(partial.questions);
  const newQuiz: Quiz = { ...partial, id, totalPoints };
  all.push(newQuiz);
  saveQuizzes(all);
  return newQuiz;
}

export function updateQuiz(updated: Quiz) {
  const all = getQuizzes();
  const idx = all.findIndex(q => q.id === updated.id);
  if (idx !== -1) {
    const totalPoints = calculateTotalPoints(updated.questions);
    all[idx] = { ...updated, totalPoints };
    saveQuizzes(all);
  }
}

export function deleteQuiz(id: string) {
  const all = getQuizzes().filter(q => q.id !== id);
  saveQuizzes(all);
}

export function getQuiz(id: string): Quiz | undefined {
  return getQuizzes().find(q => q.id === id);
}

export function calculateTotalPoints(questions: Question[]): number {
  // simples: 10 pontos por questão
  return (questions?.length || 0) * 10;
}

