import { useState } from 'react';
import { X } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

type TaskType = 'sort_list' | 'color_match' | 'arithmetic' | 'group_separation' | 'defragmentation';

const TASK_TYPES: { value: TaskType; label: string; description: string }[] = [
  { value: 'arithmetic', label: 'Arithmetic', description: 'Math calculation tasks' },
  { value: 'sort_list', label: 'Sort List', description: 'Alphabetical or numerical sorting' },
  { value: 'color_match', label: 'Color Match', description: 'RGB color matching' },
  { value: 'group_separation', label: 'Group Items', description: 'Categorize items by attributes' },
  { value: 'defragmentation', label: 'Defragmentation', description: 'Group colors contiguously' },
];

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const { user } = useUserStore();
  const { addNotification } = useUIStore();

  const [step, setStep] = useState<'type' | 'details'>('type');
  const [taskType, setTaskType] = useState<TaskType>('arithmetic');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tokenReward, setTokenReward] = useState(10);
  const [difficulty, setDifficulty] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState(60);

  // Task-specific data
  const [arithmeticExpression, setArithmeticExpression] = useState('');
  const [arithmeticAnswer, setArithmeticAnswer] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const listingFee = Math.ceil(tokenReward * 0.2);
  const totalCost = tokenReward + listingFee;
  const canAfford = (user?.tokenBalance || 0) >= totalCost;

  const handleClose = () => {
    setStep('type');
    setTitle('');
    setDescription('');
    setTokenReward(10);
    setDifficulty(1);
    setEstimatedTime(60);
    setArithmeticExpression('');
    setArithmeticAnswer('');
    onClose();
  };

  const handleTypeSelect = (type: TaskType) => {
    setTaskType(type);
    setStep('details');
  };

  const handleBack = () => {
    setStep('type');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAfford) {
      addNotification({
        type: 'error',
        message: 'Insufficient tokens to create this task',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let taskData: any;
      let solution: any;

      // Build task data based on type
      if (taskType === 'arithmetic') {
        taskData = { expression: arithmeticExpression };
        solution = { answer: parseFloat(arithmeticAnswer) };
      } else {
        // For other types, we'll need specific forms (to be implemented)
        addNotification({
          type: 'error',
          message: 'This task type is not yet implemented',
          duration: 3000,
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Creating task with data:', {
        type: taskType,
        title,
        description,
        data: taskData,
        solution,
        tokenReward,
        difficulty,
        estimatedTime,
      });

      const response = await apiClient.post('/api/tasks', {
        type: taskType,
        title,
        description,
        data: taskData,
        solution,
        tokenReward,
        difficulty,
        estimatedTime,
      });

      console.log('Task created successfully:', response.data);

      addNotification({
        type: 'success',
        message: `Task created successfully! Cost: ${totalCost} tokens`,
        duration: 3000,
      });

      // Update user balance
      if (user) {
        useUserStore.setState({
          user: {
            ...user,
            tokenBalance: user.tokenBalance - totalCost,
          },
        });
      }

      handleClose();
      onTaskCreated?.();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      const message = error.response?.data?.message || 'Failed to create task';
      addNotification({
        type: 'error',
        message,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'type' ? 'Choose Task Type' : 'Create Task'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'type' ? (
            // Task Type Selection
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TASK_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          ) : (
            // Task Details Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Back Button */}
              <button
                type="button"
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to task types
              </button>

              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Quick Math Problem"
                  required
                  minLength={3}
                  maxLength={255}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional context or instructions..."
                  maxLength={1000}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Task-Specific Fields */}
              {taskType === 'arithmetic' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Math Expression *
                    </label>
                    <input
                      type="text"
                      value={arithmeticExpression}
                      onChange={(e) => setArithmeticExpression(e.target.value)}
                      placeholder="e.g., 5 + 3 * 2"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correct Answer *
                    </label>
                    <input
                      type="number"
                      value={arithmeticAnswer}
                      onChange={(e) => setArithmeticAnswer(e.target.value)}
                      placeholder="e.g., 11"
                      required
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Reward & Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Reward *
                  </label>
                  <input
                    type="number"
                    value={tokenReward}
                    onChange={(e) => setTokenReward(parseInt(e.target.value) || 5)}
                    min={5}
                    max={1000}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty (1-5)
                  </label>
                  <input
                    type="number"
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseInt(e.target.value) || 1)}
                    min={1}
                    max={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Est. Time (sec)
                  </label>
                  <input
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 10)}
                    min={10}
                    max={3600}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-gray-900 mb-2">Cost Breakdown</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Task Reward:</span>
                  <span className="font-medium">{tokenReward} tokens</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Listing Fee (20%):</span>
                  <span className="font-medium">{listingFee} tokens</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total Cost:</span>
                  <span className={canAfford ? 'text-green-600' : 'text-red-600'}>
                    {totalCost} tokens
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Your Balance: {user?.tokenBalance || 0} tokens
                </div>
                {!canAfford && (
                  <p className="text-sm text-red-600 font-medium">
                    Insufficient tokens! You need {totalCost - (user?.tokenBalance || 0)} more tokens.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !canAfford}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
