import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudyStore } from "@/lib/study-store";
import { Circle, CheckCircle } from "lucide-react";

export default function TaskSelection() {
  const { setCurrentStep, setCurrentTask, completedTasks } = useStudyStore();

  // Auto-start Task 1 if no tasks are completed
  useEffect(() => {
    if (completedTasks.length === 0) {
      const firstTask = {
        id: 1,
        title: "Literature Review",
        type: "Full AI Assistance",
        description: "Immediate access to AI responses",
        color: "secondary",
        taskType: "literature_review",
        frictionType: "full_ai",
      };
      setCurrentTask(firstTask as any);
      setCurrentStep("literature_review");
    }
  }, [completedTasks.length, setCurrentTask, setCurrentStep]);

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
    <section className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Complete Four Tasks</h1>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Circle className="w-3 h-3 fill-secondary text-secondary" />
              <span className="text-lg">
                <strong>Full AI Assistance:</strong> Immediate access to AI responses
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Circle className="w-3 h-3 fill-primary text-primary" />
              <span className="text-lg">
                <strong>Selective Friction AI Assistance:</strong> Complete preparatory work before accessing AI
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
                className={`surface border border-border transition-colors ${
                  isAvailable ? `hover:border-${task.color}/50 cursor-pointer` : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={isAvailable ? () => handleStartTask(task) : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 ${isSecondary ? 'bg-secondary text-black' : 'bg-primary text-white'} rounded-full flex items-center justify-center font-bold ${
                      !isAvailable ? 'opacity-50' : ''
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        task.id
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold mb-2 ${!isAvailable ? 'text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      <p className={`text-sm font-medium mb-1 ${
                        !isAvailable ? 'text-muted-foreground' : isSecondary ? 'text-secondary' : 'text-primary'
                      }`}>
                        {task.type}
                      </p>
                      <p className={`text-sm ${!isAvailable ? 'text-muted-foreground' : 'text-secondary'}`}>
                        {task.description}
                      </p>
                      {!isAvailable && !isCompleted && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
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
            className="px-8 py-3 btn-surface"
          >
            Back
          </Button>
        </div>
      </div>
    </section>
  );
}