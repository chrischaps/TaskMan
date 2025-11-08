import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Task } from "../types/task";
import {
  enrichTaskWithStatus,
  getStatusColor,
  getStatusLabel,
} from "../utils/taskStatus";

const TASK_TYPE_ICONS: Record<string, string> = {
  sort_list: "📊",
  color_match: "🎨",
  arithmetic: "🔢",
  group_separation: "📦",
  defragmentation: "🧩",
};

const TASK_TYPE_COLORS: Record<string, string> = {
  sort_list: "bg-blue-500",
  color_match: "bg-purple-500",
  arithmetic: "bg-green-500",
  group_separation: "bg-yellow-500",
  defragmentation: "bg-red-500",
};

interface TaskRowProps {
  task: Task;
  onAccept?: (taskId: string) => void;
}

export default function TaskRow({ task, onAccept }: TaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Enrich task with status label
  const enrichedTask = enrichTaskWithStatus(task);
  const statusLabel = enrichedTask.statusLabel || "available";

  const icon = TASK_TYPE_ICONS[task.type] || "📝";
  const typeColor = TASK_TYPE_COLORS[task.type] || "bg-gray-500";

  const handleAccept = () => {
    if (onAccept) {
      onAccept(task.id);
    } else {
      navigate(`/tasks/${task.id}`);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
      {/* Main Row */}
      <div className="flex items-center gap-3 p-3">
        {/* Type Icon */}
        <div
          className={`flex-shrink-0 w-8 h-8 ${typeColor} rounded-md flex items-center justify-center text-white text-lg`}
          title={task.type}
        >
          {icon}
        </div>

        {/* Title (Expandable) */}
        <button
          onClick={toggleExpand}
          className="flex-1 text-left hover:text-indigo-600 transition-colors min-w-0"
        >
          <span className="font-medium text-gray-900 truncate block">
            {task.title}
          </span>
        </button>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
              statusLabel
            )}`}
          >
            {getStatusLabel(statusLabel)}
          </span>
        </div>

        {/* Difficulty Stars */}
        <div className="flex-shrink-0 hidden sm:block">
          <span className="text-yellow-500 text-sm">
            {"★".repeat(task.difficulty || 1)}
          </span>
        </div>

        {/* Token Reward */}
        <div className="flex-shrink-0">
          <span className="font-bold text-green-600 text-sm">
            {task.tokenReward}t
          </span>
        </div>

        {/* Creator (Hidden on mobile/tablet) */}
        <div className="flex-shrink-0 hidden lg:block">
          <span className="text-gray-600 text-sm">
            @{task.creator.username}
            <span className="text-gray-400 ml-1">Lv{task.creator.level}</span>
          </span>
        </div>

        {/* Estimated Time (Hidden on mobile/tablet) */}
        <div className="flex-shrink-0 hidden md:block">
          <span className="text-gray-500 text-sm">
            ~{Math.ceil((task.estimatedTime || 0) / 60)}m
          </span>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {task.isOwnTask ? (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
              Your Task
            </span>
          ) : (
            <button
              onClick={handleAccept}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors"
            >
              Accept
            </button>
          )}
        </div>

        {/* Expand Arrow */}
        <button
          onClick={toggleExpand}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Expanded Description */}
      {isExpanded && (
        <div className="bg-blue-50 p-4 border-t border-blue-100">
          <p className="text-gray-700 text-sm mb-3">{task.description}</p>

          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Type:</span>{" "}
              {task.type.replace("_", " ")}
            </div>
            <div>
              <span className="font-medium">Difficulty:</span>{" "}
              {"★".repeat(task.difficulty || 1)}
            </div>
            <div className="sm:hidden">
              <span className="font-medium">Creator:</span>{" "}
              {task.creator.username} (Lv
              {task.creator.level})
            </div>
            <div className="md:hidden">
              <span className="font-medium">Time:</span> ~
              {Math.ceil((task.estimatedTime || 0) / 60)} minutes
            </div>
            {task.initiative && (
              <div>
                <span className="font-medium">Initiative:</span>{" "}
                {task.initiative.title}
              </div>
            )}
            {task.isTutorial && (
              <div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-medium">
                  Tutorial
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
