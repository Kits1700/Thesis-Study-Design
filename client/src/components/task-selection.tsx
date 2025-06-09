import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudyStore } from "@/lib/study-store";
import { Circle, CheckCircle } from "lucide-react";

export default function TaskSelection() {
  const { setCurrentStep, setCurrentTask, completedTasks } = useStudyStore();

  // Remove auto-start logic - let users click to start tasks

  const tasks = [
    {
      id: 1,
      title: "Literature Review",
      type: "Full AI Assistance",
      description: "Immediate access to AI responses",
      color: "secondary",
      taskType: "literature_review",
      frictionType: "full_ai",
    },
    {
      id: 2,
      title: "Literature Review", 
      type: "Selective Friction AI Assistance",
      description: "Complete preparatory work before accessing AI",
      color: "primary",
      taskType: "literature_review",
      frictionType: "selective_friction",
    },
    {
      id: 3,
      title: "Argument Exploration",
      type: "Full AI Assistance", 
      description: "Immediate access to AI responses",
      color: "secondary",
      taskType: "argument_exploration",
      frictionType: "full_ai",
    },
    {
      id: 4,
      title: "Argument Exploration",
      type: "Selective Friction AI Assistance",
      description: "Complete preparatory work before accessing AI",
      color: "primary",
      taskType: "argument_exploration", 
      frictionType: "selective_friction",
    },
  ];

  const handleStartTask = (task: any) => {
    // Only allow sequential task completion
    const nextTaskId = completedTasks.length + 1;
    if (task.id !== nextTaskId) {
      return; // Prevent clicking on non-sequential tasks
    }
    
    setCurrentTask(task);
    if (task.taskType === "literature_review") {
      setCurrentStep("literature_review");
    } else {
      setCurrentStep("argument_exploration");
    }
  };

  const getNextTaskId = () => completedTasks.length + 1;

  const handleBack = () => {
    setCurrentStep("important_notes");
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-white">Complete Four Tasks</h1>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Circle className="w-3 h-3 fill-teal-400 text-teal-400" />
              <span className="text-lg text-gray-300">
                <strong>Summative Task:</strong> Immediate access to AI responses
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Circle className="w-3 h-3 fill-purple-400 text-purple-400" />
              <span className="text-lg text-gray-300">
                <strong>Generative Task:</strong> Complete preparatory work before accessing AI
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {tasks.map((task) => {
            const isCompleted = completedTasks.includes(task.id);
            const isNext = task.id === getNextTaskId();
            const isAvailable = isCompleted || isNext;
            const isSecondary = task.color === "secondary";
            
            return (
              <Card 
                key={task.id}
                className={`bg-gray-800 border border-gray-700 transition-colors ${
                  isAvailable ? 'hover:border-gray-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={isAvailable ? () => handleStartTask(task) : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 ${isSecondary ? 'bg-teal-500 text-white' : 'bg-purple-600 text-white'} rounded-full flex items-center justify-center font-bold ${
                      !isAvailable ? 'opacity-50' : ''
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        task.id
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold mb-2 ${!isAvailable ? 'text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <p className={`text-sm font-medium mb-1 ${
                        !isAvailable ? 'text-gray-500' : isSecondary ? 'text-teal-400' : 'text-purple-400'
                      }`}>
                        {isSecondary ? 'Summative Task' : 'Generative Task'}
                      </p>
                      <p className={`text-sm ${!isAvailable ? 'text-gray-500' : 'text-gray-300'}`}>
                        {task.description}
                      </p>
                      {!isAvailable && !isCompleted && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Complete previous tasks first
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleBack}
            variant="outline" 
            className="px-8 py-3 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}