import type { Feedback, FeedbackRequest } from '../types';

interface FeedbackSectionProps {
  feedbacks?: Feedback[];
  showForm: boolean;
  formData: FeedbackRequest;
  submitting: boolean;
  deletingId: number | null;
  currentUsername?: string;
  onToggleForm: () => void;
  onFormChange: (data: FeedbackRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (feedbackId: number) => void;
}

export const FeedbackSection = ({
  feedbacks,
  showForm,
  formData,
  submitting,
  deletingId,
  currentUsername,
  onToggleForm,
  onFormChange,
  onSubmit,
  onDelete,
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
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="aiPolish"
              checked={formData.useAiPolish}
              onChange={(e) => onFormChange({ ...formData, useAiPolish: e.target.checked })}
              className="mr-2"
              disabled={submitting}
            />
            <label htmlFor="aiPolish" className="text-sm text-gray-700">
              Use AI to polish my feedback {formData.useAiPolish && '(may take a few seconds)'}
            </label>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (formData.useAiPolish ? 'Polishing...' : 'Submitting...') : 'Submit Feedback'}
          </button>
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

