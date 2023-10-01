/* eslint-disable linebreak-style *//* eslint-disable prettier/prettier */
import { LessonDTO, LessonTypeDTO } from './models/lesson.model';

export const demoLessonTypes: LessonTypeDTO[] = [
  { name: 'General English', shortName: 'General' },
  { name: 'PTE Exam Prep', shortName: 'PTE' },
  { name: 'IELTS Prep', shortName: 'IELTS' },
  { name: 'Cambridge Prep', shortName: 'Cambridge' },
];

export const demoLevels: string[] = [
  'A2 Beginner','B1 Lower-intermediate','B2 Upper-intermediate','C1 Advanced'
];

export const demoLessons: LessonDTO[] = [
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2023-11-10T17:00:00', // 10-November-2023 5:00 PM
    duration: 120,
    level: [demoLevels[3]],
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
    level: [demoLevels[2]],
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
    level: [demoLevels[1]],
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
    level: [demoLevels[0],demoLevels[1]],
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
  {
    teacher: 'buddyholly@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2023-11-11T10:00:00',
    duration: 60,
    level: [demoLevels[2],demoLevels[3]],
    name: 'English speaking class',
    description: 'Conversational classes to improve your English speaking ability.',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'buddyholly@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2023-11-11T11:00:00',
    duration: 60,
    level: [demoLevels[0],demoLevels[1],demoLevels[2]],
    name: 'English speaking class',
    description: 'Conversational classes to improve your English speaking ability.',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'buddyholly@gmail.com',
    type: demoLessonTypes[3],
    startTime: '2023-11-11T13:00:00',
    duration: 60,
    level: ['All'],
    name: 'Cambridge speaking prep classes',
    description: 'In the class, we are going to cover the tips and tricks needed to master the speaking seciton of the Cambridge exam',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'buddyholly@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2023-11-09T13:00:00',
    duration: 60,
    level: [demoLevels[0],demoLevels[1],demoLevels[2]],
    name: 'English speaking class',
    description: 'Conversational classes to improve your English speaking ability.',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'buddyholly@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2023-11-09T10:00:00',
    duration: 60,
    level: [demoLevels[2],demoLevels[3]],
    name: 'English speaking class',
    description: 'Conversational classes to improve your English speaking ability.',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'buddyholly@gmail.com',
    type: demoLessonTypes[3],
    startTime: '2023-11-09T11:00:00', 
    duration: 60,
    level: ['All'],
    name: 'Cambridge speaking prep',
    description: 'In the class, we are going to cover the tips and tricks needed to master the speaking seciton of the Cambridge exam',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'elvispresley@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2023-11-13T14:00:00', 
    duration: 60,
    level: [demoLevels[3]],
    name: 'Accent reduction classes',
    description: 'These classes are designed to help you sound more like a native',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'elvispresley@gmail.com',
    type: demoLessonTypes[1],
    startTime: '2023-11-14T14:00:00', 
    duration: 190,
    level: ['All'],
    name: 'Intensive PTE Prep classes',
    description: 'These lessons will help you ace the PTE exam. We are going to cover all sections with a 15 minute break only.',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'elvispresley@gmail.com',
    type: demoLessonTypes[2],
    startTime: '2023-11-14T14:00:00', 
    duration: 190,
    level: ['All'],
    name: 'Intensive IELTS Prep classes',
    description: 'These lessons will help you ace the IELTS exam. We are going to cover all sections with a 15 minute break only.',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'elvispresley@gmail.com',
    type: demoLessonTypes[3],
    startTime: '2023-11-14T14:00:00', 
    duration: 190,
    level: ['All'],
    name: 'Intensive Cambridge Prep classes',
    description: 'These lessons will help you ace the IELTS exam. We are going to cover all sections with a 15 minute break only.',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'elvispresley@gmail.com',
    type: demoLessonTypes[3],
    startTime: '2022-11-14T14:00:00', 
    duration: 190,
    level: ['All'],
    name: 'Intensive Cambridge Prep classes',
    description: 'These lessons will help you ace the IELTS exam. We are going to cover all sections with a 15 minute break only.',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2022-11-10T17:00:00', // 10-November-2023 5:00 PM
    duration: 120,
    level: [demoLevels[3]],
    name: 'Advanced General English classes',
    description: 'General English class for advanced students who have mastered the basics of English and want to speak like a native by improving their accent, communication and advanced vocabulary.',
    casualPrice: 10,
    maxStudents: 15,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'buddyholly@gmail.com',
    type: demoLessonTypes[3],
    startTime: '2022-11-09T11:00:00', 
    duration: 60,
    level: ['All'],
    name: 'Cambridge speaking prep',
    description: 'In the class, we are going to cover the tips and tricks needed to master the speaking seciton of the Cambridge exam',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'elvispresley@gmail.com',
    type: demoLessonTypes[3],
    startTime: '2021-11-14T14:00:00', 
    duration: 190,
    level: ['All'],
    name: 'Intensive Cambridge Prep classes',
    description: 'These lessons will help you ace the IELTS exam. We are going to cover all sections with a 15 minute break only.',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'test@gmail.com',
    type: demoLessonTypes[0],
    startTime: '2021-11-10T17:00:00', // 10-November-2023 5:00 PM
    duration: 120,
    level: [demoLevels[3]],
    name: 'Advanced General English classes',
    description: 'General English class for advanced students who have mastered the basics of English and want to speak like a native by improving their accent, communication and advanced vocabulary.',
    casualPrice: 10,
    maxStudents: 15,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
  {
    teacher: 'buddyholly@gmail.com',
    type: demoLessonTypes[3],
    startTime: '2021-11-09T11:00:00', 
    duration: 60,
    level: ['All'],
    name: 'Cambridge speaking prep',
    description: 'In the class, we are going to cover the tips and tricks needed to master the speaking seciton of the Cambridge exam',
    casualPrice: 5,
    maxStudents: 10,
    studentsEnrolled: [],
    disableFirtsLesson: false,
  },
];
