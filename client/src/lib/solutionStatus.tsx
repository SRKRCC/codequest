import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Code, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { slugify } from './slugify';
interface ProblemStatusProps {
  problem: {
    id: string;
    status: string;
    createdAt: Date;
    title?: string;
    description?: string;
    problemUrl?: string;
  };
}

const SolutionStatus: React.FC<ProblemStatusProps> = ({ problem }) => {
  // Function to check if solution button should be displayed
  const canShowSolutionButton = () => {
    const createdDate = new Date(problem.createdAt);
    const nextDay = new Date(createdDate);
    nextDay.setDate(createdDate.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    const now = new Date();
    return user && now >= nextDay;
  };

  const handleViewSolution = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const slug = slugify(problem.title || '');
    navigate(`/challenges/solution/${slug}`, {
      state: {
        problemId: problem.id,
      }
    });
  };

  const navigate = useNavigate();
  const { user } = useAuth();

  const isSolved = problem.status === "Solved" ? "Solved" : "Not Solved";

  return (
    <div className="flex flex-col w-full gap-2 self-start sm:self-center">
      {isSolved === "Solved" ? (
        <div className="flex flex-col w-full gap-2">
          <Button
            size="sm"
            className="w-full text-xs py-1 px-2 bg-green-600 hover:bg-green-700 text-white border-0 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              window.open(problem.problemUrl, "_blank");
            }}
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Solved
          </Button>
          {canShowSolutionButton() && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs py-1 px-2 border-blue-500 hover:bg-blue-500/10 hover:text-blue-500 transition-colors duration-200 text-foreground"
              onClick={handleViewSolution}
            >
              <Eye className="h-3 w-3 mr-1" /> View Solution
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col w-full gap-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs py-1 px-2 border-primary hover:bg-primary/10 hover:text-primary transition-colors duration-200 text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              window.open(problem.problemUrl, "_blank");
            }}
          >
            <Code className="h-3 w-3 mr-1" /> Solve Now
          </Button>
          {canShowSolutionButton() && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs py-1 px-2 border-blue-500 hover:bg-blue-500/10 hover:text-blue-500 transition-colors duration-200 text-foreground"
              onClick={handleViewSolution}
            >
              <Eye className="h-3 w-3 mr-1" /> View Solution
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SolutionStatus;