/* eslint-disable linebreak-style *//* eslint-disable prettier/prettier */
import { LessonDTO, LessonTypeDTO } from './models/lesson.model';

export const demoLessonTypes: LessonTypeDTO[] = [
  { name: 'General English', shortName: 'General' },
  { name: 'PTE Exam Prep', shortName: 'PTE' },
  { name: 'IELTS Prep', shortName: 'IELTS' },
  { name: 'Cambridge Prep', shortName: 'Cambridge' },
];

export const demoLessons: LessonDTO[] = [
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2023-11-10T17:00:00', // 10-November-2023 5:00 PM
    duration: 120,
    level: ['C1'],
    name: 'Advanced General English classes',
    description: 'General English class for advanced students who have mastered the basics of English and want to speak like a native by improving their accent, communication and advanced vocabulary.',
    casualPrice: 10,
    maxStudents: 15,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2023-11-10T19:00:00', // 10-November-2023 7:00 PM
    duration: 120,
    level: ['B2'],
    name: 'Conversational General English classes',
    description: 'General English class to improve your grammar, vocab, conversational skills, listening and speaking.',
    casualPrice: 10,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2023-11-23T21:00:00', // 10-November-2023 9:00 PM
    duration: 120,
    level: ['B1'],
    name: 'Conversational General English classes',
    description: 'General English class to improve your grammar, vocab, conversational skills, listening and speaking.',
    casualPrice: 10,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2023-11-10T23:00:00', // 10-November-2023 11:00 PM
    duration: 90,
    level: ['A1','A2'],
    name: 'Beginner General English classes',
    description: 'General English for students who want to learn the basics of the English language, including grammar, vocabulary, reading, writing, speaking and listening.',
    casualPrice: 10,
    maxStudents: 5,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[1],
    startTime: '2023-11-11T17:00:00', // 11-November-2023 11:00 PM
    duration: 120,
    level: ['All'],
    name: 'PTE Speaking Class',
    description: 'In the class, we will learn tips and hints to ace the speaking section of the PTE. We will apply our knowledge to real, timed practice questions.',
    casualPrice: 20,
    maxStudents: 15,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[1],
    startTime: '2023-11-13T17:00:00', // 13-November-2023 5:00 PM
    duration: 120,
    level: ['All'],
    name: 'PTE Reading Class',
    description: 'In the class, we will learn tips and hints to ace the reading section of the PTE. We will apply our knowledge to real, timed practice questions.',
    casualPrice: 20,
    maxStudents: 15,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[2],
    startTime: '2023-11-11T19:00:00', // 11-November-2023 7:00 PM
    duration: 120,
    level: ['All'],
    name: 'IELTS Speaking Class',
    description: 'In the class, we will learn tips and hints to ace the speaking section of the IELTS exam. We will apply our knowledge to real, timed practice questions.',
    casualPrice: 20,
    maxStudents: 15,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[2],
    startTime: '2023-11-13T19:00:00', // 13-November-2023 7:00 PM
    duration: 120,
    level: ['All'],
    name: 'IELTS Reading Class',
    description: 'In the class, we will learn tips and hints to ace the reading section of the IELTS exam. We will apply our knowledge to real, timed practice questions.',
    casualPrice: 20,
    maxStudents: 15,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
];
