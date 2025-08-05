export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  totalPoints: number;
}

export const sampleQuestions: Question[] = [
  {
    id: '1',
    question: 'Qual é a complexidade de tempo da busca binária?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    subject: 'Algoritmos',
    difficulty: 'medium',
    explanation: 'A busca binária divide o espaço de busca pela metade a cada iteração.'
  },
  {
    id: '2',
    question: 'Em programação orientada a objetos, o que é herança?',
    options: [
      'Um método para criar objetos',
      'A capacidade de uma classe derivar propriedades de outra classe',
      'Um tipo de variável',
      'Uma função especial'
    ],
    correctAnswer: 1,
    subject: 'POO',
    difficulty: 'easy',
    explanation: 'Herança permite que uma classe filha herde atributos e métodos da classe pai.'
  },
  {
    id: '3',
    question: 'Qual é o resultado de 2^3 + 4 * 2?',
    options: ['12', '16', '20', '24'],
    correctAnswer: 1,
    subject: 'Matemática',
    difficulty: 'easy',
    explanation: '2³ = 8, e 4 * 2 = 8, então 8 + 8 = 16.'
  },
  {
    id: '4',
    question: 'O que é um deadlock em sistemas operacionais?',
    options: [
      'Um erro de sintaxe',
      'Uma situação onde processos ficam bloqueados indefinidamente',
      'Um tipo de algoritmo',
      'Uma função do kernel'
    ],
    correctAnswer: 1,
    subject: 'Sistemas Operacionais',
    difficulty: 'hard',
    explanation: 'Deadlock ocorre quando dois ou mais processos ficam bloqueados esperando recursos uns dos outros.'
  },
  {
    id: '5',
    question: 'Qual protocolo é usado para transferir páginas web?',
    options: ['FTP', 'SMTP', 'HTTP', 'SSH'],
    correctAnswer: 2,
    subject: 'Redes',
    difficulty: 'easy',
    explanation: 'HTTP (HyperText Transfer Protocol) é o protocolo padrão para transferir páginas web.'
  }
];

export const quizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Fundamentos de Algoritmos',
    subject: 'Algoritmos',
    difficulty: 'medium',
    questions: sampleQuestions.filter(q => q.subject === 'Algoritmos'),
    totalPoints: 100
  },
  {
    id: 'quiz-2',
    title: 'Programação Orientada a Objetos',
    subject: 'POO',
    difficulty: 'easy',
    questions: sampleQuestions.filter(q => q.subject === 'POO'),
    totalPoints: 50
  },
  {
    id: 'quiz-3',
    title: 'Matemática Básica',
    subject: 'Matemática',
    difficulty: 'easy',
    questions: sampleQuestions.filter(q => q.subject === 'Matemática'),
    totalPoints: 50
  },
  {
    id: 'quiz-4',
    title: 'Sistemas Operacionais',
    subject: 'Sistemas Operacionais',
    difficulty: 'hard',
    questions: sampleQuestions.filter(q => q.subject === 'Sistemas Operacionais'),
    totalPoints: 150
  },
  {
    id: 'quiz-5',
    title: 'Redes de Computadores',
    subject: 'Redes',
    difficulty: 'easy',
    questions: sampleQuestions.filter(q => q.subject === 'Redes'),
    totalPoints: 50
  }
];