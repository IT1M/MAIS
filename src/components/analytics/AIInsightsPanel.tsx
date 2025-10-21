'use client';

import { useState, useEffect } from 'react';
import { DashboardData, AIInsights } from '@/types/analytics';
import toast from 'react-hot-toast';

interface AIInsightsPanelProps {
  dashboardData: DashboardData;
}

export default function AIInsightsPanel({ dashboardData }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const generateInsights = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'analyze',
          data: {
            items: [],
            totalQuantity: dashboardData.kpis.totalQuantity.value,
            rejectRate: dashboardData.kpis.rejectRate.value,
            byDestination: dashboardData.charts.byDestination,
            byCategory: dashboardData.charts.byCategory,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const result = await response.json();
      setInsights(result);
      setGeneratedAt(new Date());
      toast.success('AI insights generated successfully');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setLoading(false);
    }
  };

  const askFollowUp = async () => {
    if (!question.trim()) return;

    try {
      setAskingQuestion(true);
      
      const response = await fetch('/api/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'question',
          question,
          data: dashboardData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const result = await response.json();
      setAnswer(result.answer);
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to get answer');
    } finally {
      setAskingQuestion(false);
    }
  };

  useEffect(() => {
    if (dashboardData) {
      generateInsights();
    }
  }, [dashboardData.metadata.startDate, dashboardData.metadata.endDate]);

  const exampleQuestions = [
    'Why is the reject rate high?',
    'Which category needs attention?',
    'What trends should I be aware of?',
    'How can we improve efficiency?',
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI-Powered Insights
            </h3>
            {generatedAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generated at {generatedAt.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              generateInsights();
            }}
            disabled={loading}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            🔄 Refresh
          </button>
          <span className="text-gray-500 dark:text-gray-400">
            {expanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Analyzing your data with AI...
                </p>
              </div>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              {/* Key Findings */}
              {insights.insights.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>💡</span> Key Findings
                  </h4>
                  <ul className="space-y-2">
                    {insights.insights.map((insight, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alerts */}
              {insights.alerts.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>⚠️</span> Alerts
                  </h4>
                  <div className="space-y-2">
                    {insights.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded text-red-800 dark:text-red-300"
                      >
                        {alert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>✅</span> Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {insights.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-700 dark:text-gray-300 p-3 bg-green-50 dark:bg-green-900/20 rounded"
                      >
                        <span className="text-green-500 mt-1">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confidence Score */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Confidence Score
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-green-500"
                        style={{ width: `${insights.confidenceScore * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(insights.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Follow-up Questions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Ask a Follow-up Question
                </h4>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && askFollowUp()}
                    placeholder="Ask Gemini about this data..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={askingQuestion}
                  />
                  <button
                    onClick={askFollowUp}
                    disabled={askingQuestion || !question.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {askingQuestion ? '...' : 'Ask'}
                  </button>
                </div>

                {/* Example questions */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {exampleQuestions.map((q, index) => (
                    <button
                      key={index}
                      onClick={() => setQuestion(q)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Answer */}
                {answer && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {answer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Click refresh to generate AI insights
            </div>
          )}
        </div>
      )}
    </div>
  );
}
