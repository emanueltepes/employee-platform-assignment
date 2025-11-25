import type { Feedback, FeedbackRequest } from '../types';

interface FeedbackSectionProps {
  feedbacks?: Feedback[];
  showForm: boolean;
  formData: FeedbackRequest;
  submitting: boolean;
  deletingId: number | null;
  currentUsername?: string;
  loadingSuggestions: boolean;
  suggestions: string[];
  selectedSuggestion: number | null;
  onToggleForm: () => void;
  onFormChange: (data: FeedbackRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (feedbackId: number) => void;
  onGetSuggestions: () => void;
  onSelectSuggestion: (index: number) => void;
  onClearSuggestions: () => void;
}

export const FeedbackSection = ({
  feedbacks,
  showForm,
  formData,
  submitting,
  deletingId,
  currentUsername,
  loadingSuggestions,
  suggestions,
  selectedSuggestion,
  onToggleForm,
  onFormChange,
  onSubmit,
  onDelete,
  onGetSuggestions,
  onSelectSuggestion,
  onClearSuggestions,
}: FeedbackSectionProps) => {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Feedback</h2>
        <button
          onClick={onToggleForm}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Leave Feedback'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
            <textarea
              required
              className="input"
              rows={4}
              value={formData.content}
              onChange={(e) => onFormChange({ ...formData, content: e.target.value })}
              placeholder="Share your thoughts about this colleague..."
              disabled={suggestions.length > 0}
            />
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">Select a version:</h4>
                <button 
                  type="button"
                  onClick={onClearSuggestions}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  ← Edit original
                </button>
              </div>

              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => onSelectSuggestion(index)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedSuggestion === index
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600">Option {index + 1}</span>
                    {selectedSuggestion === index && (
                      <span className="text-purple-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons - Horizontal Layout */}
          <div className="flex items-center gap-3">
            {suggestions.length === 0 && (
              <button 
                type="button"
                onClick={onGetSuggestions}
                className="btn bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loadingSuggestions || !formData.content.trim()}
              >
                {loadingSuggestions ? 'Generating AI Suggestions...' : 'Get AI Suggestions ✨'}
              </button>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || (suggestions.length > 0 && selectedSuggestion === null)}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      )}

      {feedbacks && feedbacks.length > 0 && (
        <div className="mt-6 space-y-3">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{feedback.authorName}</span>
                  {feedback.isPolished && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      AI Polished
                    </span>
                  )}
                </div>
                {feedback.authorName === currentUsername && (
                  <button
                    onClick={() => onDelete(feedback.id)}
                    disabled={deletingId === feedback.id}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete feedback"
                  >
                    {deletingId === feedback.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
              <p className="text-gray-700">
                {feedback.isPolished && feedback.polishedContent
                  ? feedback.polishedContent
                  : feedback.originalContent}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(feedback.createdAt!).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

