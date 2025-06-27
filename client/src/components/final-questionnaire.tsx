import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useStudyStore } from "@/lib/study-store";

function LikertSlider({
  value,
  onChange,
  label,
  minLabel,
  maxLabel,
  name,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  minLabel: string;
  maxLabel: string;
  name: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-white text-base">{label}</Label>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400 px-1 select-none">
          <span>1 = {minLabel}</span>
          <span className="text-gray-300 font-medium">4 = Neutral</span>
          <span>7 = {maxLabel}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="range"
              min="1"
              max="7"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full accent-blue-500"
              name={name}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span className="font-bold text-gray-300">4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
            </div>
          </div>
          <span className="text-sm text-gray-300 w-8 text-center font-medium bg-gray-700 px-2 py-1 rounded">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FinalQuestionnaire() {
  const { saveQuestionnaireResponse, setCurrentStep } = useStudyStore();
  const [responses, setResponses] = useState<Record<string, any>>({
    // Initialize with default values so they register as responses
    deepThinkingNoFriction: "4",
    deepThinkingWithFriction: "4",
    outputQualityNoFriction: "4",
    outputQualityWithFriction: "4",
    aiDeceptive: "4",
    aiUnderhanded: "4",
    aiSuspicious: "4",
    aiConfident: "4",
    aiHarmful: "4",
    aiSecurity: "4",
    aiIntegrity: "4",
    aiDependable: "4",
    aiReliable: "4",
    aiTrustworthy: "4",
    workingRelationship: "4",
    finalThoughts: ""
  });

  const handleSubmit = async () => {
    console.log("Final questionnaire responses:", responses);
    saveQuestionnaireResponse(999, responses);
    setCurrentStep("completion");
  };

  const handleResponseChange = (questionKey: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  const isFormValid = () => {
    const requiredFields = [
      "deepThinkingNoFriction",
      "deepThinkingWithFriction",
      "outputQualityNoFriction",
      "outputQualityWithFriction",
      "workingRelationship",
      "aiDeceptive",
      "aiUnderhanded",
      "aiSuspicious",
      "aiHarmful",
      "aiConfident",
      "aiSecurity",
      "aiIntegrity",
      "aiDependable",
      "aiReliable",
      "aiTrustworthy",
      "uxControl",
      "uxClarity",
      "uxResponsiveness",
    ];
    return requiredFields.every((field) => responses[field]);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Final Overall Questionnaire
          </h1>
          <p className="text-gray-300">
            Please reflect on your entire experience across all four tasks.
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 space-y-8">
            {/* Section A: Comparative Judgment */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Section A: Comparative Judgment (Friction vs. No Friction)
              </h2>

              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">
                  1. Rate how much each format encouraged you to think deeply and critically:
                </h3>
                
                <LikertSlider
                  name="deepThinkingNoFriction"
                  value={responses.deepThinkingNoFriction || "4"}
                  onChange={(value) => handleResponseChange("deepThinkingNoFriction", value)}
                  label="The format WITHOUT the extra 'friction' step."
                  minLabel="Did not encourage at all"
                  maxLabel="Encouraged very much"
                />

                <LikertSlider
                  name="deepThinkingWithFriction"
                  value={responses.deepThinkingWithFriction || "4"}
                  onChange={(value) => handleResponseChange("deepThinkingWithFriction", value)}
                  label="The format WITH the extra 'friction' step."
                  minLabel="Did not encourage at all"
                  maxLabel="Encouraged very much"
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">
                  2. Rate the quality of the final output you produced with each format:
                </h3>
                
                <LikertSlider
                  name="outputQualityNoFriction"
                  value={responses.outputQualityNoFriction || "4"}
                  onChange={(value) => handleResponseChange("outputQualityNoFriction", value)}
                  label="The output from the format WITHOUT friction."
                  minLabel="Very Low Quality"
                  maxLabel="Very High Quality"
                />

                <LikertSlider
                  name="outputQualityWithFriction"
                  value={responses.outputQualityWithFriction || "4"}
                  onChange={(value) => handleResponseChange("outputQualityWithFriction", value)}
                  label="The output from the format WITH friction."
                  minLabel="Very Low Quality"
                  maxLabel="Very High Quality"
                />
              </div>
            </div>

            {/* Section B: Trust & Distrust */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Section B: Overall Trust & Distrust in the AI
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                The following questions ask for your overall impression of the
                AI you interacted with across all tasks. (Scale: 1 = Not at all,
                7 = Extremely)
              </p>

              <h3 className="text-lg font-medium text-white">
                Distrust Subscale
              </h3>
              {[
                { key: "aiDeceptive", text: "3. The AI is deceptive." },
                {
                  key: "aiUnderhanded",
                  text: "4. The AI behaves in an underhanded manner.",
                },
                {
                  key: "aiSuspicious",
                  text: "5. I am suspicious of the AI's intent, action, or outputs.",
                },
                {
                  key: "aiHarmful",
                  text: "6. The AI's actions will have a harmful or injurious outcome.",
                },
              ].map((item) => (
                <LikertSlider
                  key={item.key}
                  name={item.key}
                  value={responses[item.key] || "4"}
                  onChange={(value) => handleResponseChange(item.key, value)}
                  label={item.text}
                  minLabel="Not at all"
                  maxLabel="Extremely"
                />
              ))}

              <h3 className="text-lg font-medium text-white mt-8">
                Trust Subscale
              </h3>
              {[
                { key: "aiConfident", text: "7. I am confident in the AI." },
                { key: "aiSecurity", text: "8. The AI provides security." },
                { key: "aiIntegrity", text: "9. The AI has integrity." },
                { key: "aiDependable", text: "10. The AI is dependable." },
                { key: "aiReliable", text: "11. The AI is reliable." },
                { key: "aiTrustworthy", text: "12. I can trust the AI." },
              ].map((item) => (
                <LikertSlider
                  key={item.key}
                  name={item.key}
                  value={responses[item.key] || "4"}
                  onChange={(value) => handleResponseChange(item.key, value)}
                  label={item.text}
                  minLabel="Not at all"
                  maxLabel="Extremely"
                />
              ))}
            </div>

            {/* Section C: Final Reflections */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Section C: Final Reflections & Behavioral Intent
              </h2>

              <LikertSlider
                name="workingRelationship"
                value={responses.workingRelationship || "4"}
                onChange={(value) =>
                  handleResponseChange("workingRelationship", value)
                }
                label="13. Overall, how would you describe your final working relationship with the AI across the tasks?"
                minLabel="Passively accepted"
                maxLabel="Actively collaborated"
              />


            </div>

            {/* Section D: UX Reflections */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Section D: User Experience Across All Tasks
              </h2>

              <p className="text-gray-300 text-sm mb-4">
                Please reflect on how it felt to interact with the system
                interface throughout the entire study. (Scale: 1 = Strongly
                disagree, 7 = Strongly agree)
              </p>

              {[
                {
                  key: "uxControl",
                  text: "14. I felt in control while using the system.",
                },
                {
                  key: "uxClarity",
                  text: "15. The interface was well organized and clear.",
                },
                {
                  key: "uxResponsive",
                  text: "16. The system responded quickly to my actions.",
                },
              ].map((item) => (
                <LikertSlider
                  key={item.key}
                  name={item.key}
                  value={responses[item.key] || "4"}
                  onChange={(value) => handleResponseChange(item.key, value)}
                  label={item.text}
                  minLabel="Strongly disagree"
                  maxLabel="Strongly agree"
                />
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                disabled={!isFormValid()}
              >
                Submit Final Questionnaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
