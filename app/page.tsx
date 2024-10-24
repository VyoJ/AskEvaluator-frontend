"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [aboutMe, setAboutMe] = useState("");
  const [aboutStakeholder, setAboutStakeholder] = useState("");
  const [ask, setAsk] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/evaluate-ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          about_me: aboutMe,
          about_stakeholder: aboutStakeholder,
          ask,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to evaluate ask");
      }
      const data = await response.json();
      setEvaluation(data.evaluation);
      toast({
        title: "Evaluation Complete",
        description: "Your ask has been evaluated successfully.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to evaluate ask. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Evaluate Your Ask</CardTitle>
          <CardDescription>
            Refine your ask for better collaboration with stakeholders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="aboutMe">About You</Label>
                <Textarea
                  id="aboutMe"
                  placeholder="Describe yourself and your business"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="aboutStakeholder">About the Stakeholder</Label>
                <Textarea
                  id="aboutStakeholder"
                  placeholder="Describe the stakeholder you're approaching"
                  value={aboutStakeholder}
                  onChange={(e) => setAboutStakeholder(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="ask">Your Ask</Label>
                <Textarea
                  id="ask"
                  placeholder="What are you asking for?"
                  value={ask}
                  onChange={(e) => setAsk(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="mt-4" disabled={isLoading}>
              {isLoading ? "Evaluating..." : "Evaluate Ask"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {evaluation && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Evaluation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{evaluation}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
