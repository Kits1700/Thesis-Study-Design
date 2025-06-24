import React, { useState } from "react";
import { useStudyStore } from "@/lib/study-store";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function Questionnaire() {
  const {
    currentTask,
    setCurrentStep,
    completedTasks,
    saveQuestionnaireResponse,
  } = useStudyStore();

  const showFrictionQuestions = currentTask?.id === 3 || currentTask?.id === 4;

  const scaleDescriptions: Record<string, { low: string; high: string }> = {
    mental_demand: { low: "Very Low", high: "Very High" },
    usefulness: { low: "Not at all useful", high: "Extremely useful" },
    satisfaction: { low: "Very Unsatisfied", high: "Very Satisfied" },
    critical_evaluation: {
      low: "Did not evaluate critically",
      high: "Evaluated very critically",
    },
    reliance: {
      low: "Relied entirely on own ideas",
      high: "Relied entirely on AI's output",
    },
    dependable: { low: "Not at all", high: "Extremely" },
    confidence: { low: "Not at all", high: "Extremely" },
    integrity: { low: "Not at all", high: "Extremely" },
    reliable: { low: "Not at all", high: "Extremely" },
    trust: { low: "Not at all", high: "Extremely" },
    friction_step_value: {
      low: "A frustrating obstacle",
      high: "A helpful step for reflection",
    },
    friction_step_impact: {
      low: "No influence",
      high: "Made me much more critical",
    },
    ux_control: { low: "Strongly disagree", high: "Strongly agree" },
    ux_clarity: { low: "Strongly disagree", high: "Strongly agree" },
    ux_responsiveness: { low: "Strongly disagree", high: "Strongly agree" },
  };

  const questionSections = [
    {
      title: "Section A: Task Workload (NASA-TLX)",
      subtitle: "Source: Hart, S. G., & Staveland, L. E. (1988). Development of NASA-TLX...",
      scale: "1 = Very Low, 7 = Very High",
      items: [
        { id: "mental_demand", text: "1. How mentally demanding was the task?" },
        { id: "physical_demand", text: "2. How physically demanding was the task?" },
        { id: "temporal_demand", text: "3. How hurried or rushed was the pace of the task?" },
        { id: "performance", text: "4. How successful were you in accomplishing what you were asked to do?" },
        { id: "effort", text: "5. How hard did you have to work to accomplish your level of performance?" },
        { id: "frustration", text: "6. How insecure, discouraged, irritated, stressed, and annoyed were you?" },
      ],
    },
    {
      title: "Section B: Task Usefulness & Satisfaction",
      scale: "1 = Not at all useful/Very Unsatisfied, 7 = Extremely useful/Very Satisfied",
      items: [
        { id: "usefulness", text: "7. How useful was the AI-generated output for accomplishing your task goal?" },
        { id: "satisfaction", text: "8. How satisfied are you with the quality of the final output you created?" },
      ],
    },
    {
      title: "Section C: Reliance & Critical Engagement",
      scale: "1 = Not at all/Relied entirely on own ideas, 7 = Very critically/Relied entirely on AI's output",
      items: [
        { id: "critical_evaluation", text: "9. To what extent did you critically evaluate the AI's response instead of accepting it as correct?" },
        { id: "reliance", text: "10. Please rate your reliance on the AI's output for this task." },
      ],
    },
    {
      title: "Section D: Perceived AI Trustworthiness (TPA)",
      subtitle: "Source: Jian, J.-Y., Bisantz, A. M., & Drury, C. G. (2000). Foundations for an empirically determined scale of trust in automated systems.",
      scale: "1 = Strongly Disagree, 7 = Strongly Agree",
      items: [
        { id: "dependable", text: "11. The AI is dependable." },
        { id: "confident", text: "12. I am confident in the AI." },
        { id: "integrity", text: "13. The AI has integrity." },
        { id: "reliable", text: "14. The AI is reliable." },
      ],
    },
    {
      section: "C",
      title: "Perceived AI Trustworthiness for This Task",
      items: [
        { id: "dependable", text: "The AI is dependable." },
        { id: "confidence", text: "I am confident in the AI." },
        { id: "integrity", text: "The AI has integrity." },
        { id: "reliable", text: "The AI is reliable." },
        { id: "trust", text: "I can trust the AI." },
      ],
    },
    ...(showFrictionQuestions
      ? [
          {
            section: "D",
            title: "Reflection on Extra Step",
            items: [
              {
                id: "friction_step_value",
                text:
                  currentTask?.taskType === "literature_review"
                    ? "This task required you to find 5 abstracts before seeing the AI’s response. How did this extra step feel to you?"
                    : "This task required you to provide a counter-argument before seeing the AI’s response. How did this extra step feel to you?",
              },
              {
                id: "friction_step_impact",
                text: "How did this extra step influence your approach to the AI-generated text?",
              },
            ],
          },
        ]
      : []),
    {
      section: "E",
      title: "User Experience",
      items: [
        {
          id: "ux_control",
          text: "I felt in control while using the system.",
        },
        {
          id: "ux_clarity",
          text: "The interface was well organized and clear.",
        },
        {
          id: "ux_responsiveness",
          text: "The system responded quickly to my actions.",
        },
      ],
    },
  ];

  const [responses, setResponses] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    questionSections.forEach((section) => {
      section.items.forEach((item) => {
        initial[item.id] = 4; // default middle value
      });
    });
    return initial;
  });

  const handleChange = (id: string, value: number) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    console.log("Submitted questionnaire responses:", responses);

    if (currentTask?.id) {
      saveQuestionnaireResponse(currentTask.id, responses);

      const totalCompleted = new Set([
        ...completedTasks.map((t) => t.taskId),
        currentTask.id,
      ]).size;

      if (totalCompleted >= 4) {
        if (completedTasks.length >= 4) {
          setCurrentStep("final_questionnaire");
        } else {
          setCurrentStep("task_selection");
        }
      } else {
        setCurrentStep("task_selection");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">
        Post-Task Questionnaire
      </h1>

      {questionSections.map((section) => (
        <div key={section.title} className="mb-10">
          <h2 className="text-xl font-semibold text-gray-200 mb-3">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-sm text-gray-400 italic mb-2">{section.subtitle}</p>
          )}
          {section.scale && (
            <p className="text-sm text-gray-400 mb-3">({section.scale})</p>
          )}
          <div className="space-y-6">
            {section.items.map((q) => (
              <Card key={q.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <Label htmlFor={q.id} className="text-white block mb-1">
                    {q.text}
                  </Label>
                  <div className="flex justify-between text-xs text-gray-400 mb-2 px-1 select-none">
                    <span>1 = {scaleDescriptions[q.id]?.low || "Low"}</span>
                    <span>7 = {scaleDescriptions[q.id]?.high || "High"}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id={q.id}
                      name={q.id}
                      min={1}
                      max={7}
                      step={1}
                      value={[responses[q.id]]}
                      onValueChange={(val) => handleChange(q.id, val[0])}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-300 w-6 text-center">
                      {responses[q.id]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Friction-specific questions for tasks 3 and 4 */}
      {showFrictionQuestions && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Section E: Friction-Specific Questions
            </h3>
            <p className="text-sm text-gray-400">Only for "friction" tasks</p>
          </div>
          <div className="space-y-4">
            {frictionQuestions.map((q) => (
              <Card key={q.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <Label htmlFor={q.id} className="text-white block mb-1">
                    {q.text}
                  </Label>
                  <p className="text-sm text-gray-400 mb-2">({q.scale})</p>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id={q.id}
                      name={q.id}
                      min={1}
                      max={7}
                      step={1}
                      value={[responses[q.id] || 4]}
                      onValueChange={(val) => handleChange(q.id, val[0])}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-300 w-6 text-center">
                      {responses[q.id] || 4}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Section F: User Experience */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            Section F: User Experience
          </h3>
          <p className="text-sm text-gray-400">(1 = Strongly Disagree, 7 = Strongly Agree)</p>
        </div>
        <div className="space-y-4">
          {uxQuestions.map((q) => (
            <Card key={q.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <Label htmlFor={q.id} className="text-white block mb-1">
                  {q.text}
                </Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id={q.id}
                    name={q.id}
                    min={1}
                    max={7}
                    step={1}
                    value={[responses[q.id] || 4]}
                    onValueChange={(val) => handleChange(q.id, val[0])}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-300 w-6 text-center">
                    {responses[q.id] || 4}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={handleSubmit} className="px-8 py-3">
          Submit
        </Button>
      </div>
    </div>
  );
}
