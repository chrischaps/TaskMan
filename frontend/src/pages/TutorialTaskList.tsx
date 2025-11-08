import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import type { Task } from "../types/task";

interface TutorialResponse {
  tasks: Task[];
}

const TASK_TYPE_COLORS: Record<string, string> = {
  sort_list: "bg-blue-500",
  color_match: "bg-purple-500",
  arithmetic: "bg-green-500",
  group_separation: "bg-yellow-500",
  defragmentation: "bg-red-500",
};

const TASK_TYPE_LABELS: Record<string, string> = {
  sort_list: "Sort List",
  color_match: "Color Match",
  arithmetic: "Arithmetic",
  group_separation: "Group Separation",
  defragmentation: "Defragmentation",
};

export default function TutorialTaskList() {
  const navigate = useNavigate();

  // Fetch tutorial tasks
  const { data, isLoading, error } = useQuery({
    queryKey: ["tutorialTasks"],
    queryFn: async () => {
      const response = await apiClient.get<TutorialResponse>(
        "/api/tasks/tutorial"
      );
      return response.data;
    },
    refetchInterval: 30000, // 30 second polling
    refetchOnWindowFocus: true,
  });

  const tasks = data?.tasks || [];
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalCount = tasks.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleStartTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tutorial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Error Loading Tutorial
          </h2>
          <p className="text-gray-700">
            {error instanceof Error
              ? error.message
              : "Failed to load tutorial tasks"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to TaskMan! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Complete these {totalCount} tasks to learn how TaskMan works and
            unlock the main task board.
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span className="font-semibold">
                {completedCount} of {totalCount} complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {completedCount > 0 && completedCount < totalCount && (
            <p className="text-indigo-600 font-medium">
              You're doing great! Keep going! 💪
            </p>
          )}

          {completedCount === totalCount && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-bold text-lg">
                🎊 Congratulations! Tutorial Complete!
              </p>
              <p className="text-green-700 mt-1">
                You've unlocked the task board. Ready to start earning tokens?
              </p>
              <button
                onClick={() => navigate("/tasks/backlog")}
                className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Go to Task Board →
              </button>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const isCompleted = task.status === "completed";
            const taskNumber = index + 1;
            const typeColor = TASK_TYPE_COLORS[task.type] || "bg-gray-500";
            const typeLabel = TASK_TYPE_LABELS[task.type] || task.type;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${
                  isCompleted ? "opacity-60" : "hover:shadow-lg"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Task Number Circle */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      isCompleted ? "bg-green-500" : "bg-indigo-500"
                    }`}
                  >
                    {isCompleted ? "✓" : taskNumber}
                  </div>

                  {/* Task Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {task.title}
                      </h3>
                      {isCompleted && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Task Type Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-3 py-1 ${typeColor} text-white rounded-md text-sm font-medium`}
                      >
                        {typeLabel}
                      </span>
                      <span className="text-yellow-600 font-medium">
                        {"★".repeat(task.difficulty || 1)}
                        <span className="text-gray-300">
                          {"★".repeat(5 - (task.difficulty || 1))}
                        </span>
                      </span>
                      <span className="text-gray-600 text-sm">
                        {task.difficulty === 1 && "Easy"}
                        {task.difficulty === 2 && "Medium"}
                        {task.difficulty === 3 && "Hard"}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-4">{task.description}</p>

                    {/* Reward Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-green-600 text-lg">
                          {task.tokenReward}
                        </span>
                        <span>tokens</span>
                      </span>
                      <span>•</span>
                      <span>~{Math.ceil((task.estimatedTime || 0) / 60)}m</span>
                    </div>

                    {/* Action Button */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleStartTask(task.id)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors duration-200"
                      >
                        Start Task →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Encouragement Footer */}
        {completedCount > 0 && completedCount < totalCount && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-700">
              💡 <span className="font-semibold">Tip:</span> Take your time with
              each task. The goal is to learn how TaskMan works!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
