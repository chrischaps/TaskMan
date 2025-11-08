import { useState } from "react";
import type { Initiative } from "../types/initiative";
import type { Task } from "../types/task";
import TaskRow from "./TaskRow";
import { useUserStore } from "../stores/userStore";

interface InitiativeGroupProps {
  initiative?: Initiative; // undefined for "Ungrouped Tasks"
  tasks: Task[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAcceptTask?: (taskId: string) => void;
}

export default function InitiativeGroup({
  initiative,
  tasks,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAcceptTask,
}: InitiativeGroupProps) {
  const { user } = useUserStore();
  const [showTooltip, setShowTooltip] = useState(false);

  const taskCount = tasks.length;
  const totalRewards = tasks.reduce((sum, task) => sum + task.tokenReward, 0);

  // Check if current user is the creator
  const isCreator = initiative && user && initiative.creatorId === user.id;

  // Determine styling for ungrouped section
  const isUngrouped = !initiative;
  const headerBgColor = isUngrouped ? "bg-gray-100" : "bg-blue-50";
  const borderColor = isUngrouped ? "border-gray-200" : "border-blue-200";

  return (
    <div
      className={`border ${borderColor} rounded-lg overflow-hidden shadow-sm mb-4 bg-white`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full ${headerBgColor} hover:bg-opacity-80 transition-colors duration-150`}
      >
        <div className="flex items-center justify-between p-4">
          {/* Left Side: Arrow + Title + Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Expand/Collapse Arrow */}
            <svg
              className={`w-5 h-5 flex-shrink-0 text-gray-600 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>

            {/* Title and Description */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 truncate">
                  {initiative ? initiative.title : "Ungrouped Tasks"}
                </h3>
                {initiative && initiative.description && (
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="text-gray-400 hover:text-gray-600"
                      type="button"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {showTooltip && (
                      <div className="absolute left-0 top-6 z-10 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg max-w-xs">
                        {initiative.description}
                        <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {taskCount} {taskCount === 1 ? "task" : "tasks"} •{" "}
                {totalRewards} tokens total
              </div>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Edit Button (only for creator) */}
            {initiative && isCreator && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                title="Edit initiative"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}

            {/* Delete Button (only for creator) */}
            {initiative && isCreator && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-md transition-colors"
                title="Delete initiative"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </button>

      {/* Task List (Expanded) */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>
                {isUngrouped
                  ? "✓ All tasks are organized into initiatives!"
                  : "This initiative has no tasks yet. Create a task and assign it here."}
              </p>
            </div>
          ) : (
            <div>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} onAccept={onAcceptTask} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
