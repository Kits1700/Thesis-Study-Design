import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Task {
  id: number;
  title: string;
  taskType: string;
  frictionType: string;
  color: string;
}

interface StudyStore {
  participantId: string;
  currentStep: string;
  currentTask: Task | null;
  completedTasks: number[];
  progress: number;
  
  // Actions
  initializeParticipant: (id: string) => void;
  setCurrentStep: (step: string) => void;
  setCurrentTask: (task: Task) => void;
  markTaskComplete: (taskId: number) => void;
  updateProgress: () => void;
}

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      participantId: '',
      currentStep: 'overview',
      currentTask: null,
      completedTasks: [],
      progress: 0,

      initializeParticipant: (id: string) => {
        set({ participantId: id });
      },

      setCurrentStep: (step: string) => {
        set({ currentStep: step });
        get().updateProgress();
      },

      setCurrentTask: (task: Task) => {
        set({ currentTask: task });
      },

      markTaskComplete: (taskId: number) => {
        const { completedTasks } = get();
        if (!completedTasks.includes(taskId)) {
          set({ completedTasks: [...completedTasks, taskId] });
        }
      },

      updateProgress: () => {
        const { currentStep, completedTasks } = get();
        const progressMap: Record<string, number> = {
          overview: 25,
          literature_review: 50,
          argument_exploration: 75,
          questionnaire: 90,
          completion: 100,
        };
        
        let baseProgress = progressMap[currentStep] || 0;
        
        // Add bonus progress for completed tasks
        const taskBonus = Math.min(completedTasks.length * 5, 20);
        const totalProgress = Math.min(baseProgress + taskBonus, 100);
        
        set({ progress: totalProgress });
      },
    }),
    {
      name: 'study-storage',
      partialize: (state) => ({
        participantId: state.participantId,
        completedTasks: state.completedTasks,
      }),
    }
  )
);
