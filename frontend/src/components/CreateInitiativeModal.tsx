import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInitiative } from "../services/initiativeService";
import type { CreateInitiativeDto } from "../types/initiative";
import { useUIStore } from "../stores/uiStore";

interface CreateInitiativeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateInitiativeModal({
  isOpen,
  onClose,
}: CreateInitiativeModalProps) {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  const createMutation = useMutation({
    mutationFn: (data: CreateInitiativeDto) => createInitiative(data),
    onSuccess: (response) => {
      addNotification(
        `Initiative "${response.initiative.title}" created successfully!`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["initiatives"] });
      handleClose();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || "Failed to create initiative";
      addNotification(message, "error");
    },
  });

  const validate = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 255) {
      newErrors.title = "Title must be 255 characters or less";
    }

    if (description && description.length > 5000) {
      newErrors.description = "Description must be 5000 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: CreateInitiativeDto = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    createMutation.mutate(data);
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Initiative
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={createMutation.isPending}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <p className="text-gray-600 mb-6">
            Initiatives help you organize related tasks together. Create an
            initiative to group tasks by theme, goal, or project.
          </p>

          {/* Title Field */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Q1 Data Processing, User Onboarding"
              maxLength={255}
              disabled={createMutation.isPending}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {title.length}/255 characters
            </p>
          </div>

          {/* Description Field */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Describe the purpose and goals of this initiative..."
              rows={4}
              maxLength={5000}
              disabled={createMutation.isPending}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/5000 characters
            </p>
          </div>

          {/* Token Reward Placeholder */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">💡 Coming Soon:</span> Token
              reward mechanics for initiative creators! You'll earn tokens when
              tasks in your initiatives are completed by other users.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={createMutation.isPending || !title.trim()}
            >
              {createMutation.isPending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Initiative"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
