import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudyStore } from "@/lib/study-store";
import { Circle, CheckCircle } from "lucide-react";

export default function TaskSelection() {
  const { setCurrentStep, setCurrentTask, completedTasks } = useStudyStore();
  const [taskOrder] = useState<"friction-first">("friction-first"); // Fixed

  interface Task {
    id: number;
    title: string;
    type: string;
    description: string;
    color: string;
    taskType: string;
    frictionType: string;
    category: string;
  }

  const tasks: Task[] = [
    {
      id: 1,
      title: "Literature Review",
      type: "Full AI Assistance",
      description: "Immediate access to AI responses",
      color: "teal",
      taskType: "literature_review",
      frictionType: "full_ai",
      category: "summative",
    },
    {
      id: 2,
      title: "Argument Exploration",
      type: "Full AI Assistance",
      description: "Immediate access to AI responses",
      color: "purple",
      taskType: "argument_exploration",
      frictionType: "full_ai",
      category: "generative",
    },
    {
      id: 3,
      title: "Literature Review",
      type: "AI Assistance with Brief Reflection Step",
      description: "Complete preparatory work before accessing AI",
      color: "teal",
      taskType: "literature_review",
      frictionType: "selective_friction",
      category: "summative",
    },
    {
      id: 4,
      title: "Argument Exploration",
      type: "AI Assistance with Brief Reflection Step",
      description: "Complete preparatory work before accessing AI",
      color: "purple",
      taskType: "argument_exploration",
      frictionType: "selective_friction",
      category: "generative",
    },
  ];

  const handleStartTask = (task: Task) => {
    const isCompleted = completedTasks.some((t) => t.taskId === task.id);
    if (isCompleted) return;

    const nextTaskId = completedTasks.length + 1;
    if (task.id !== nextTaskId) return;

    setCurrentTask(task);
    setCurrentStep(
      task.taskType === "literature_review"
        ? "literature_review"
        : "argument_exploration",
    );
  };

  const getNextTaskId = () => completedTasks.length + 1;

  const handleBack = () => {
    setCurrentStep("important_notes");
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-white">
            Complete Four Tasks
          </h1>
          <div className="space-y-4">
            <div className="text-center text-gray-300 mb-4">
              <p className="text-sm mb-2">
                <strong>Task Order:</strong> Friction tasks first (with
                reflection steps), then full AI assistance
              </p>
              <div className="text-xs text-gray-400 flex justify-center space-x-8">
                <div className="flex items-center space-x-1">
                  <Circle className="w-3 h-3 fill-teal-400 text-teal-400" />
                  <span>
                    <strong>Summative:</strong> Literature Review
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Circle className="w-3 h-3 fill-purple-400 text-purple-400" />
                  <span>
                    <strong>Generative:</strong> Argument Exploration
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {tasks.map((task: Task) => {
            const isCompleted = completedTasks.some(
              (t) => t.taskId === task.id,
            );
            const isNext = task.id === getNextTaskId();
            const isAvailable = !isCompleted && isNext;

            return (
              <Card
                key={task.id}
                className={`bg-gray-800 border border-gray-700 transition-colors ${
                  isCompleted
                    ? "border-green-600 bg-green-900/20 cursor-not-allowed"
                    : isAvailable
                      ? "hover:border-gray-500 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                }`}
                onClick={
                  isAvailable && !isCompleted
                    ? () => handleStartTask(task)
                    : undefined
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-10 h-10 ${task.color === "teal" ? "bg-teal-500" : "bg-purple-600"} text-white rounded-full flex items-center justify-center font-bold ${
                        !isAvailable ? "opacity-50" : ""
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        task.id
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-semibold mb-2 ${
                          isCompleted
                            ? "text-green-300"
                            : !isAvailable
                              ? "text-gray-500"
                              : "text-white"
                        }`}
                      >
                        {task.title} {isCompleted && "✓"}
                      </h3>
                      <p
                        className={`text-sm font-medium mb-1 ${
                          isCompleted
                            ? "text-green-400"
                            : !isAvailable
                              ? "text-gray-500"
                              : task.color === "teal"
                                ? "text-teal-400"
                                : "text-purple-400"
                        }`}
                      >
                        {task.color === "teal"
                          ? "Summative Task"
                          : "Generative Task"}
                      </p>
                      <p
                        className={`text-sm ${
                          isCompleted
                            ? "text-green-500"
                            : !isAvailable
                              ? "text-gray-500"
                              : "text-gray-300"
                        }`}
                      >
                        {isCompleted ? "Completed" : task.description}
                      </p>
                      {!isAvailable && !isCompleted && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Complete previous tasks first
                        </p>
                      )}
                      {isCompleted && (
                        <p className="text-xs text-green-600 mt-2 italic">
                          Task completed successfully
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
