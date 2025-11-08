import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTaskBoard } from "../hooks/useTaskBoard";
import { getInitiatives } from "../services/initiativeService";
import type { Task } from "../types/task";
import InitiativeGroup from "../components/InitiativeGroup";
import CreateInitiativeModal from "../components/CreateInitiativeModal";
import { useUserStore } from "../stores/userStore";
import { useUIStore } from "../stores/uiStore";

type SortOption =
  | "newest"
  | "oldest"
  | "highest_reward"
  | "lowest_reward"
  | "hardest"
  | "easiest"
  | "longest"
  | "shortest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest_reward", label: "Highest Reward" },
  { value: "lowest_reward", label: "Lowest Reward" },
  { value: "hardest", label: "Hardest First" },
  { value: "easiest", label: "Easiest First" },
  { value: "longest", label: "Longest First" },
  { value: "shortest", label: "Shortest First" },
];

export default function TaskBoardBacklog() {
  const navigate = useNavigate();
  useUserStore();
  const { addNotification } = useUIStore();

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [minReward, setMinReward] = useState<string>("");
  const [maxReward, setMaxReward] = useState<string>("");
  const [hideOwnTasks, setHideOwnTasks] = useState<boolean>(false);

  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const saved = localStorage.getItem("taskBoardSort");
    return (saved as SortOption) || "newest";
  });

  // Collapsed sections state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => {
      const saved = localStorage.getItem("taskBoardCollapsed");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
  );

  // Modal states
  const [showCreateInitiativeModal, setShowCreateInitiativeModal] =
    useState(false);

  // Save sort preference
  useEffect(() => {
    localStorage.setItem("taskBoardSort", sortBy);
  }, [sortBy]);

  // Save collapsed state
  useEffect(() => {
    localStorage.setItem(
      "taskBoardCollapsed",
      JSON.stringify(Array.from(collapsedSections))
    );
  }, [collapsedSections]);

  // Fetch tasks
  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useTaskBoard({
    type: typeFilter,
    difficulty: difficultyFilter,
    minReward: minReward,
    maxReward: maxReward,
    hideOwnTasks: hideOwnTasks,
  });

  // Fetch initiatives
  const { data: initiativesData, isLoading: initiativesLoading } = useQuery({
    queryKey: ["initiatives"],
    queryFn: () => getInitiatives({ status: "active" }),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const tasks = tasksData?.tasks || [];
  const initiatives = initiativesData?.initiatives || [];

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const tasksCopy = [...tasks];

    switch (sortBy) {
      case "oldest":
        return tasksCopy.sort(
          (a, b) =>
            new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
        );
      case "highest_reward":
        return tasksCopy.sort((a, b) => b.tokenReward - a.tokenReward);
      case "lowest_reward":
        return tasksCopy.sort((a, b) => a.tokenReward - b.tokenReward);
      case "hardest":
        return tasksCopy.sort(
          (a, b) => (b.difficulty || 0) - (a.difficulty || 0)
        );
      case "easiest":
        return tasksCopy.sort(
          (a, b) => (a.difficulty || 0) - (b.difficulty || 0)
        );
      case "longest":
        return tasksCopy.sort(
          (a, b) => (b.estimatedTime || 0) - (a.estimatedTime || 0)
        );
      case "shortest":
        return tasksCopy.sort(
          (a, b) => (a.estimatedTime || 0) - (b.estimatedTime || 0)
        );
      case "newest":
      default:
        return tasksCopy.sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
    }
  }, [tasks, sortBy]);

  // Group tasks by initiative
  const tasksByInitiative = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    const ungrouped: Task[] = [];

    sortedTasks.forEach((task) => {
      if (task.initiativeId) {
        if (!grouped[task.initiativeId]) {
          grouped[task.initiativeId] = [];
        }
        grouped[task.initiativeId].push(task);
      } else {
        ungrouped.push(task);
      }
    });

    return { grouped, ungrouped };
  }, [sortedTasks]);

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAcceptTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleRefresh = () => {
    refetchTasks();
    addNotification("Refreshing tasks...", "info");
  };

  const handleClearFilters = () => {
    setTypeFilter("");
    setDifficultyFilter("");
    setMinReward("");
    setMaxReward("");
    setHideOwnTasks(false);
  };

  const isLoading = tasksLoading || initiativesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Backlog</h1>
              <p className="text-gray-600 mt-1">
                Organize and complete tasks to earn tokens
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => setShowCreateInitiativeModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Initiative
              </button>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option value="sort_list">Sort List</option>
              <option value="color_match">Color Match</option>
              <option value="arithmetic">Arithmetic</option>
              <option value="group_separation">Group Separation</option>
              <option value="defragmentation">Defragmentation</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Difficulties</option>
              <option value="1">★ Easy</option>
              <option value="2">★★ Medium</option>
              <option value="3">★★★ Hard</option>
              <option value="4">★★★★ Very Hard</option>
              <option value="5">★★★★★ Expert</option>
            </select>

            {/* Min Reward */}
            <input
              type="number"
              placeholder="Min tokens"
              value={minReward}
              onChange={(e) => setMinReward(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            {/* Max Reward */}
            <input
              type="number"
              placeholder="Max tokens"
              value={maxReward}
              onChange={(e) => setMaxReward(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Sort and Options */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hideOwnTasks}
                onChange={(e) => setHideOwnTasks(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Hide my tasks
            </label>

            <button
              onClick={handleClearFilters}
              className="ml-auto px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Initiative Groups */}
        <div className="space-y-4">
          {initiatives.map((initiative) => {
            const initiativeTasks =
              tasksByInitiative.grouped[initiative.id] || [];
            if (initiativeTasks.length === 0) return null;

            return (
              <InitiativeGroup
                key={initiative.id}
                initiative={initiative}
                tasks={initiativeTasks}
                isExpanded={!collapsedSections.has(initiative.id)}
                onToggle={() => toggleSection(initiative.id)}
                onEdit={() => {
                  // TODO: Open edit modal
                  addNotification(
                    "Edit initiative feature coming soon!",
                    "info"
                  );
                }}
                onDelete={() => {
                  // TODO: Open delete confirmation
                  addNotification(
                    "Delete initiative feature coming soon!",
                    "info"
                  );
                }}
                onAcceptTask={handleAcceptTask}
              />
            );
          })}

          {/* Ungrouped Tasks Section */}
          {tasksByInitiative.ungrouped.length > 0 && (
            <InitiativeGroup
              tasks={tasksByInitiative.ungrouped}
              isExpanded={!collapsedSections.has("ungrouped")}
              onToggle={() => toggleSection("ungrouped")}
              onAcceptTask={handleAcceptTask}
            />
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tasks available
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or check back later for new tasks.
              </p>
              {(typeFilter || difficultyFilter || minReward || maxReward) && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Initiative Modal */}
      <CreateInitiativeModal
        isOpen={showCreateInitiativeModal}
        onClose={() => setShowCreateInitiativeModal(false)}
      />
    </div>
  );
}
