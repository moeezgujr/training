import { Course, Module, ModuleContent, Quiz, QuizQuestion, Assignment } from '@shared/schema';
import { db } from './db';
import { courses, modules, moduleContents, quizzes, quizQuestions, assignments } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

const sampleCourses = [
  {
    id: uuidv4(),
    title: 'Introduction to Psychology',
    description: 'Learn the fundamental concepts, theories, and methods of psychology in this introductory course.',
    imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    instructorId: '', // Will be filled with admin ID
    status: 'published',
    duration: 20, // hours
    tags: ['psychology', 'introduction', 'mental health'],
  },
  {
    id: uuidv4(),
    title: 'Cognitive Behavioral Therapy Techniques',
    description: 'Master the practical techniques of cognitive behavioral therapy (CBT) for addressing mental health challenges.',
    imageUrl: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    instructorId: '', // Will be filled with admin ID
    status: 'published',
    duration: 15, // hours
    tags: ['psychology', 'therapy', 'cbt', 'techniques'],
  },
  {
    id: uuidv4(),
    title: 'Child Development and Psychology',
    description: 'Explore the developmental stages of children and adolescents from psychological perspectives.',
    imageUrl: 'https://images.unsplash.com/photo-1569148958141-2b22e82e437c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    instructorId: '', // Will be filled with admin ID
    status: 'published',
    duration: 18, // hours
    tags: ['psychology', 'child development', 'parenting'],
  },
  {
    id: uuidv4(),
    title: 'Positive Psychology and Well-being',
    description: 'Discover the science of happiness, well-being, and optimal human functioning in this comprehensive course.',
    imageUrl: 'https://images.unsplash.com/photo-1582564279110-81ac52889aa7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    instructorId: '', // Will be filled with admin ID
    status: 'published',
    duration: 12, // hours
    tags: ['psychology', 'positive psychology', 'well-being', 'happiness'],
  },
  {
    id: uuidv4(),
    title: 'Psychology of Leadership',
    description: 'Understand the psychological principles behind effective leadership and team management.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    instructorId: '', // Will be filled with admin ID
    status: 'published',
    duration: 14, // hours
    tags: ['psychology', 'leadership', 'management', 'organizational'],
  },
];

// Sample module data for the Introduction to Psychology course
const createModulesForCourse = (courseId: string) => {
  const moduleIds: string[] = [];
  
  // Module 1: Introduction to Psychology
  const module1Id = uuidv4();
  moduleIds.push(module1Id);
  
  // Module 2: Research Methods in Psychology
  const module2Id = uuidv4();
  moduleIds.push(module2Id);
  
  // Module 3: Biological Basis of Behavior
  const module3Id = uuidv4();
  moduleIds.push(module3Id);
  
  // Module 4: Sensation and Perception
  const module4Id = uuidv4();
  moduleIds.push(module4Id);
  
  // Module 5: Learning and Memory
  const module5Id = uuidv4();
  moduleIds.push(module5Id);
  
  return [
    {
      id: module1Id,
      title: 'Introduction to Psychology',
      description: 'This module introduces you to the field of psychology, its history, and major concepts.',
      courseId,
      order: 1,
    },
    {
      id: module2Id,
      title: 'Research Methods in Psychology',
      description: 'Learn about scientific methods used to study human behavior and mental processes.',
      courseId,
      order: 2,
    },
    {
      id: module3Id,
      title: 'Biological Basis of Behavior',
      description: 'Explore how the brain and nervous system influence our thoughts, feelings, and behaviors.',
      courseId,
      order: 3,
    },
    {
      id: module4Id,
      title: 'Sensation and Perception',
      description: 'Understand how we detect and interpret information from the world around us.',
      courseId,
      order: 4,
    },
    {
      id: module5Id,
      title: 'Learning and Memory',
      description: 'Study how we acquire, process, and retain information throughout our lives.',
      courseId,
      order: 5,
    },
  ];
};

// Sample module content for Introduction module
const createContentForModule = (moduleId: string, moduleOrder: number) => {
  const contentItems = [];
  
  // Video content
  contentItems.push({
    id: uuidv4(),
    moduleId,
    title: `Introduction to Module ${moduleOrder}`,
    type: 'video',
    url: 'https://www.youtube.com/embed/vo4pMVb0R6M',
    description: 'An overview of the key concepts covered in this module.',
    order: 1,
    duration: 15, // minutes
  });
  
  // PDF content
  contentItems.push({
    id: uuidv4(),
    moduleId,
    title: 'Key Concepts and Terminology',
    type: 'pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'A glossary of important terms and concepts for this module.',
    order: 2,
  });
  
  // Audio content
  contentItems.push({
    id: uuidv4(),
    moduleId,
    title: 'Expert Interview',
    type: 'audio',
    url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
    description: 'Listen to a psychology expert discuss key concepts from this module.',
    order: 3,
    duration: 20, // minutes
  });
  
  // Additional video content
  contentItems.push({
    id: uuidv4(),
    moduleId,
    title: 'Practical Applications',
    type: 'video',
    url: 'https://www.youtube.com/embed/PL9_CQWKofU',
    description: 'Learn how to apply the concepts from this module in real-world settings.',
    order: 4,
    duration: 12, // minutes
  });
  
  return contentItems;
};

// Sample quiz for a module
const createQuizForModule = (moduleId: string) => {
  const quizId = uuidv4();
  
  const quiz = {
    id: quizId,
    moduleId,
    title: 'Module Assessment Quiz',
    description: 'Test your knowledge of the concepts covered in this module.',
    passingScore: 70, // percentage
  };
  
  const questions = [
    {
      id: uuidv4(),
      quizId,
      questionText: 'Which of the following is NOT a major approach in psychology?',
      questionType: 'multiple_choice',
      options: ['Behavioral', 'Cognitive', 'Psychoanalytic', 'Telepathic'],
      correctAnswer: JSON.stringify(['Telepathic']),
      explanation: 'Telepathic is not a recognized approach in psychology. The major approaches include behavioral, cognitive, psychoanalytic, humanistic, and biological.',
      points: 2,
    },
    {
      id: uuidv4(),
      quizId,
      questionText: 'The scientific study of behavior and mental processes defines which field?',
      questionType: 'multiple_choice',
      options: ['Sociology', 'Anthropology', 'Psychology', 'Psychiatry'],
      correctAnswer: JSON.stringify(['Psychology']),
      explanation: 'Psychology is defined as the scientific study of behavior and mental processes.',
      points: 1,
    },
    {
      id: uuidv4(),
      quizId,
      questionText: 'The brain and spinal cord make up the central nervous system.',
      questionType: 'true_false',
      options: ['True', 'False'],
      correctAnswer: JSON.stringify(['True']),
      explanation: 'The central nervous system consists of the brain and spinal cord, while the peripheral nervous system includes all other nerves.',
      points: 1,
    },
    {
      id: uuidv4(),
      quizId,
      questionText: 'Fill in the blank: The ________ perspective focuses on how individuals think, understand, and know about the world.',
      questionType: 'fill_blank',
      correctAnswer: JSON.stringify(['cognitive']),
      explanation: 'The cognitive perspective in psychology focuses on mental processes such as thinking, memory, problem-solving, and decision-making.',
      points: 2,
    },
    {
      id: uuidv4(),
      quizId,
      questionText: 'Which research method involves carefully observing and recording behavior without interfering?',
      questionType: 'multiple_choice',
      options: ['Experiment', 'Survey', 'Naturalistic observation', 'Case study'],
      correctAnswer: JSON.stringify(['Naturalistic observation']),
      explanation: 'Naturalistic observation involves studying subjects in their natural environment without intervention.',
      points: 2,
    },
  ];
  
  return { quiz, questions };
};

// Sample assignment for a module
const createAssignmentForModule = (moduleId: string) => {
  return {
    id: uuidv4(),
    moduleId,
    title: 'Module Reflection Paper',
    description: 'Write a 500-word reflection paper applying the concepts from this module to a real-world scenario or personal experience.',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    submissionType: 'text',
  };
};

export const seedDatabase = async (adminId: string) => {
  try {
    console.log('Starting database seeding...');
    
    // Update course instructor IDs
    const coursesToInsert = sampleCourses.map(course => ({
      ...course,
      instructorId: adminId
    }));
    
    // Insert courses
    console.log('Inserting courses...');
    for (const course of coursesToInsert) {
      await db.insert(courses).values(course).onConflictDoNothing();
      
      // Create modules for each course
      const modulesToInsert = createModulesForCourse(course.id);
      console.log(`Inserting ${modulesToInsert.length} modules for course: ${course.title}...`);
      
      for (const module of modulesToInsert) {
        await db.insert(modules).values(module).onConflictDoNothing();
        
        // Create content for each module
        const contentToInsert = createContentForModule(module.id, module.order);
        console.log(`Inserting ${contentToInsert.length} content items for module: ${module.title}...`);
        
        for (const content of contentToInsert) {
          await db.insert(moduleContents).values(content).onConflictDoNothing();
        }
        
        // Create quiz for each module
        const { quiz, questions } = createQuizForModule(module.id);
        console.log(`Inserting quiz for module: ${module.title}...`);
        
        await db.insert(quizzes).values(quiz).onConflictDoNothing();
        
        for (const question of questions) {
          await db.insert(quizQuestions).values(question).onConflictDoNothing();
        }
        
        // Create assignment for each module
        const assignment = createAssignmentForModule(module.id);
        console.log(`Inserting assignment for module: ${module.title}...`);
        
        await db.insert(assignments).values(assignment).onConflictDoNothing();
      }
    }
    
    console.log('Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};