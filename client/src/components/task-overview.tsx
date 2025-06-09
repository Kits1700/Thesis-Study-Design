import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudyStore } from "@/lib/study-store";
import { Circle, CheckCircle } from "lucide-react";

export default function TaskOverview() {
  const { setCurrentStep, setCurrentTask, completedTasks } = useStudyStore();

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
    setCurrentTask(task);
    if (task.taskType === "literature_review") {
      setCurrentStep("literature_review");
    } else {
      setCurrentStep("argument_exploration");
    }
  };

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Encouraging Thought Before Completion</h1>
          <h2 className="text-2xl text-secondary mb-4">The Role of Friction in AI - Assisted Tasks</h2>
          <p className="text-lg text-secondary italic mb-12">
            Exploring how reflective pauses influence user engagement and critical thinking in AI-powered workflows
          </p>
          
          <div className="max-w-3xl mx-auto surface border border-border rounded-lg p-8 mb-12">
            <h3 className="text-xl font-semibold mb-6">What you'll do</h3>
            <p className="text-secondary mb-8">
              You'll complete two types of tasks with different levels of AI assistance to help us understand 
              how friction affects thinking.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold mb-1">Literature Review</h4>
                  <p className="text-sm text-secondary">Generate comprehensive reviews with AI assistance</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold mb-1">Argument Exploration</h4>
                  <p className="text-sm text-secondary">Develop complex arguments with AI support</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Two Conditions</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-black font-bold text-xs">1</div>
                  <span className="text-sm"><strong>Full AI assistance with immediate access</strong></span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                  <span className="text-sm"><strong>AI assistance with brief reflection step</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 surface border border-border rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm font-medium">60 minutes</div>
              <div className="text-xs text-secondary">Estimated Duration</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 surface border border-border rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm font-medium">Interactive</div>
              <div className="text-xs text-secondary">Digital tasks</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 surface border border-border rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm font-medium">Voluntary</div>
              <div className="text-xs text-secondary">Participation</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {tasks.map((task) => {
            const isCompleted = completedTasks.includes(task.id);
            const isSecondary = task.color === "secondary";
            
            return (
              <Card 
                key={task.id}
                className={`surface border border-border hover:border-${task.color}/50 transition-colors cursor-pointer`}
                onClick={() => handleStartTask(task)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 ${isSecondary ? 'bg-secondary text-black' : 'bg-primary text-white'} rounded-full flex items-center justify-center font-bold`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        task.id
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                      <p className={`text-sm font-medium ${isSecondary ? 'text-secondary' : 'text-primary'} mb-1`}>
                        {task.type}
                      </p>
                      <p className="text-secondary text-sm">{task.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col items-center">
          <Button 
            onClick={() => setCurrentStep("important_notes")}
            className="px-12 py-4 bg-primary hover:bg-primary/90 text-lg mb-4"
          >
            Begin Study
          </Button>
          <p className="text-xs text-secondary text-center">
            By proceeding, you consent to participate in this research study
          </p>
        </div>
      </div>
    </section>
  );
}
