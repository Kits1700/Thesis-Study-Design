import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, ArrowDown } from "lucide-react";

interface FlowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StudyFlowchartProps {
  currentStep: string;
  completedTasks: any[];
}

export default function StudyFlowchart({ currentStep, completedTasks }: StudyFlowchartProps) {
  const getStepStatus = (stepId: string): 'completed' | 'current' | 'upcoming' => {
    if (stepId === 'prelim_questionnaire' && currentStep !== 'prelim_questionnaire') {
      return 'completed';
    }
    if (stepId === 'task_selection' && ['task_selection', 'task_1', 'task_2', 'task_3', 'questionnaire', 'completion'].includes(currentStep)) {
      return currentStep === 'task_selection' ? 'current' : 'completed';
    }
    if (stepId === 'tasks' && ['task_1', 'task_2', 'task_3', 'questionnaire', 'completion'].includes(currentStep)) {
      return ['task_1', 'task_2', 'task_3'].includes(currentStep) ? 'current' : 'completed';
    }
    if (stepId === 'post_questionnaires' && ['questionnaire', 'completion'].includes(currentStep)) {
      return currentStep === 'questionnaire' ? 'current' : 'completed';
    }
    if (stepId === 'completion' && currentStep === 'completion') {
      return 'current';
    }
    if (stepId === currentStep) {
      return 'current';
    }
    return 'upcoming';
  };

  const steps: FlowStep[] = [
    {
      id: 'prelim_questionnaire',
      title: 'Preliminary Questionnaire',
      description: 'Assessment of AI familiarity and experience',
      status: getStepStatus('prelim_questionnaire')
    },
    {
      id: 'task_selection',
      title: 'Task Selection',
      description: 'Choose your preferred research tasks',
      status: getStepStatus('task_selection')
    },
    {
      id: 'tasks',
      title: 'Research Tasks',
      description: 'Complete AI-assisted academic tasks',
      status: getStepStatus('tasks')
    },
    {
      id: 'post_questionnaires',
      title: 'Post-Task Questionnaires',
      description: 'Feedback on each completed task',
      status: getStepStatus('post_questionnaires')
    },
    {
      id: 'completion',
      title: 'Study Completion',
      description: 'Data export and final summary',
      status: getStepStatus('completion')
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'current':
        return <Circle className="w-6 h-6 text-blue-600 fill-blue-100" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'current':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Study Flow</h2>
        <p className="text-muted-foreground">Your progress through the research study</p>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <Card className={`w-full ${getStatusColors(step.status)} transition-colors duration-200`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-1 ${
                      step.status === 'current' ? 'text-blue-900' : 
                      step.status === 'completed' ? 'text-green-900' : 
                      'text-gray-600'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      step.status === 'current' ? 'text-blue-700' : 
                      step.status === 'completed' ? 'text-green-700' : 
                      'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                    {step.id === 'tasks' && completedTasks.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-600">
                          Completed: {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {index < steps.length - 1 && (
              <div className="flex justify-center my-2">
                <ArrowDown className={`w-5 h-5 ${
                  step.status === 'completed' ? 'text-green-400' : 
                  step.status === 'current' ? 'text-blue-400' : 
                  'text-gray-300'
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-blue-600 fill-blue-100" />
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
}