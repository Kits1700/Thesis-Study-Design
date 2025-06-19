import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, ArrowDown, Users, FileText, PenTool, MessageSquare, Download } from "lucide-react";
import { useStudyStore } from "@/lib/study-store";
import { Button } from "@/components/ui/button";

export default function FlowchartPage() {
  const { currentStep, completedTasks, setCurrentStep } = useStudyStore();

  const getStepStatus = (stepId: string): 'completed' | 'current' | 'upcoming' => {
    const stepOrder = ['important_notes', 'pre_study_questionnaire', 'task_selection', 'task_1', 'task_2', 'task_3', 'questionnaire', 'completion'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const steps = [
    {
      id: 'pre_study_questionnaire',
      title: 'Preliminary Questionnaire',
      description: 'Assessment of AI familiarity and experience (5 questions)',
      icon: <FileText className="w-5 h-5" />,
      status: getStepStatus('pre_study_questionnaire')
    },
    {
      id: 'task_selection',
      title: 'Task Selection',
      description: 'Choose your preferred research tasks from available options',
      icon: <Users className="w-5 h-5" />,
      status: getStepStatus('task_selection')
    },
    {
      id: 'tasks',
      title: 'Research Tasks',
      description: 'Complete AI-assisted academic tasks (Literature Review, Argument Exploration)',
      icon: <PenTool className="w-5 h-5" />,
      status: completedTasks.length > 0 ? 'completed' : (currentStep.includes('task_') ? 'current' : 'upcoming')
    },
    {
      id: 'questionnaire',
      title: 'Post-Task Questionnaires',
      description: 'Feedback questionnaire after each completed task',
      icon: <MessageSquare className="w-5 h-5" />,
      status: getStepStatus('questionnaire')
    },
    {
      id: 'completion',
      title: 'Study Completion',
      description: 'Data export and final summary of your participation',
      icon: <Download className="w-5 h-5" />,
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Study Flow</h1>
          <p className="text-gray-600 text-lg">Your progress through the research study</p>
        </div>
        
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <Card className={`w-full ${getStatusColors(step.status)} transition-colors duration-200`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      <div className={`p-2 rounded-lg ${
                        step.status === 'current' ? 'bg-blue-100' : 
                        step.status === 'completed' ? 'bg-green-100' : 
                        'bg-gray-100'
                      }`}>
                        {step.icon}
                      </div>
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
                <div className="flex justify-center my-3">
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
        
        <div className="text-center space-y-4">
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
          
          <Button 
            onClick={() => setCurrentStep('important_notes')}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white"
          >
            Back to Study
          </Button>
        </div>
      </div>
    </div>
  );
}