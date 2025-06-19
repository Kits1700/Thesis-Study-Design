import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Task {
  id: number;
  title: string;
  taskType: string;
  frictionType: string;
  color: string;
}

interface CompletedTask {
  taskId: number;
  taskType: string;
  frictionType: string;
  topic: string;
  initialThoughts?: string;
  counterarguments?: string;
  generatedContent?: any;
  completedAt: string;
}

interface QuestionnaireResponse {
  taskId: number;
  responses: Record<string, any>;
  submittedAt: string;
}

interface StudyData {
  participantId: string;
  startTime: string;
  currentStep: string;
  completedTasks: CompletedTask[];
  questionnaireResponses: QuestionnaireResponse[];
  studyMetadata: {
    browser: string;
    userAgent: string;
    screenResolution: string;
    timezone: string;
  };
}

interface StudyStore extends StudyData {
  currentTask: Task | null;
  progress: number;
  
  // Actions
  initializeParticipant: (id: string) => void;
  setCurrentStep: (step: string) => void;
  setCurrentTask: (task: Task) => void;
  markTaskComplete: (taskData: Omit<CompletedTask, 'completedAt'>) => void;
  saveQuestionnaireResponse: (taskId: number, responses: Record<string, any>) => void;
  updateProgress: () => void;
  resetStudy: () => void;
  exportStudyData: () => StudyData;
}

const getBrowserMetadata = () => {
  return {
    browser: navigator.userAgent.split(' ').pop() || 'unknown',
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      participantId: '',
      startTime: '',
      currentStep: 'overview',
      currentTask: null,
      completedTasks: [],
      questionnaireResponses: [],
      studyMetadata: getBrowserMetadata(),
      progress: 0,

      initializeParticipant: async (id: string) => {
        const startTime = new Date().toISOString();
        set({ 
          participantId: id,
          startTime,
          completedTasks: [],
          questionnaireResponses: [],
          currentTask: null,
          progress: 0,
          studyMetadata: getBrowserMetadata()
        });
        
        // Create participant in database
        try {
          await fetch('/api/participant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              participantId: id,
              currentStep: 'overview',
              studyData: {
                startTime,
                metadata: getBrowserMetadata()
              }
            }),
          });
        } catch (error) {
          console.error('Failed to create participant in database:', error);
          // Continue with local state even if database fails
        }
      },

      setCurrentStep: async (step: string) => {
        const { participantId } = get();
        set({ currentStep: step });
        get().updateProgress();
        
        // Update participant in database
        if (participantId) {
          try {
            await fetch(`/api/participant/${participantId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                currentStep: step
              }),
            });
          } catch (error) {
            console.error('Failed to update participant step:', error);
            // Continue with local state even if database fails
          }
        }
      },

      setCurrentTask: (task: Task) => {
        set({ currentTask: task });
      },

      markTaskComplete: (taskData: Omit<CompletedTask, 'completedAt'>) => {
        const { completedTasks } = get();
        const completedTask: CompletedTask = {
          ...taskData,
          completedAt: new Date().toISOString()
        };
        
        // Check if task already completed
        const existingIndex = completedTasks.findIndex(t => t.taskId === taskData.taskId);
        if (existingIndex >= 0) {
          // Update existing task
          const updatedTasks = [...completedTasks];
          updatedTasks[existingIndex] = completedTask;
          set({ completedTasks: updatedTasks });
        } else {
          // Add new completed task
          set({ completedTasks: [...completedTasks, completedTask] });
        }
        
        get().updateProgress();
      },

      saveQuestionnaireResponse: (taskId: number, responses: Record<string, any>) => {
        const { questionnaireResponses } = get();
        const response: QuestionnaireResponse = {
          taskId,
          responses,
          submittedAt: new Date().toISOString()
        };
        
        // Check if response already exists
        const existingIndex = questionnaireResponses.findIndex(r => r.taskId === taskId);
        if (existingIndex >= 0) {
          // Update existing response
          const updatedResponses = [...questionnaireResponses];
          updatedResponses[existingIndex] = response;
          set({ questionnaireResponses: updatedResponses });
        } else {
          // Add new response
          set({ questionnaireResponses: [...questionnaireResponses, response] });
        }
      },

      updateProgress: () => {
        const { currentStep, completedTasks } = get();
        const progressMap: Record<string, number> = {
          overview: 20,
          important_notes: 25,
          task_selection: 30,
          literature_review: 50,
          argument_exploration: 70,
          questionnaire: 90,
          completion: 100,
        };
        
        let baseProgress = progressMap[currentStep] || 0;
        
        // Add bonus progress for completed tasks
        const taskBonus = Math.min(completedTasks.length * 10, 30);
        const totalProgress = Math.min(baseProgress + taskBonus, 100);
        
        set({ progress: totalProgress });
      },

      exportStudyData: () => {
        const state = get();
        return {
          participantId: state.participantId,
          startTime: state.startTime,
          currentStep: state.currentStep,
          completedTasks: state.completedTasks,
          questionnaireResponses: state.questionnaireResponses,
          studyMetadata: state.studyMetadata
        };
      },

      resetStudy: () => {
        set({
          participantId: '',
          startTime: '',
          currentStep: 'overview',
          currentTask: null,
          completedTasks: [],
          questionnaireResponses: [],
          studyMetadata: getBrowserMetadata(),
          progress: 0
        });
      },
    }),
    {
      name: 'study-storage',
      // Store all study data in local storage
      partialize: (state) => ({
        participantId: state.participantId,
        startTime: state.startTime,
        currentStep: state.currentStep,
        completedTasks: state.completedTasks,
        questionnaireResponses: state.questionnaireResponses,
        studyMetadata: state.studyMetadata,
        progress: state.progress
      }),
    }
  )
);
