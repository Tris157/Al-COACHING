import { useEffect, useState } from 'react';
import { apiGet, getToken } from '../utils/api';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CardSkeleton, StatCardSkeleton } from '../components/LoadingSkeleton';

type Student = {
  id: number;
  email: string;
  full_name?: string;
  goal_score?: number;
};

type ProgressData = {
  total_sessions: number;  // Now represents total exercises
  completed_sessions: number;  // Now represents correct exercises
  completion_percent: number;
  completion_rate?: number;
  discipline_score: number;
  topics_mastered: number;
  weak_topics: number;
};

export default function HomePage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [coachingMessage, setCoachingMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    checkPlacementTestAndLoadDashboard();
  }, [router]);

  const checkPlacementTestAndLoadDashboard = async () => {
    try {
      // Check if user has taken placement test
      const response = await fetch('http://127.0.0.1:8000/ai/placement-test/status', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      // If no placement test found (404), redirect to placement test
      if (response.status === 404) {
        setLoading(false); // Important: Set loading false before redirect
        router.replace('/placement-test');
        return;
      }
      
      // If other error, just load dashboard (backward compatibility)
      if (!response.ok) {
        loadDashboard();
        return;
      }
      
      // If has placement test, load dashboard
      loadDashboard();
    } catch (err) {
      // If API doesn't exist yet or network error, just load dashboard
      console.log('Placement test check failed, loading dashboard:', err);
      loadDashboard();
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [studentData, progressData, coachingData] = await Promise.all([
        apiGet('/students/me').catch(() => null),
        apiGet('/progress/overview').catch(() => null),
        apiGet('/analysis/coaching-message').catch(() => ({ message: 'Chào mừng bạn đến với AI Learning Coach!' })),
      ]);
      
      setStudent(studentData);
      setProgress(progressData);
      setCoachingMessage(coachingData.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Skeleton for AI Coaching Message */}
        <div className="mb-6 bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 rounded-2xl shadow-2xl p-8 skeleton">
          <div className="h-32"></div>
        </div>
        
        {/* Skeleton for Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        
        {/* Skeleton for main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* AI Coaching Message */}
      <div className="mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-2xl shadow-2xl p-8 transition-all hover:shadow-3xl hover:-translate-y-1 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="text-6xl animate-bounce">🤖</div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-3">
              {student?.full_name ? `Xin chào, ${student.full_name}!` : 'Xin chào!'}
            </h2>
            <p className="text-lg opacity-90 leading-relaxed">{coachingMessage}</p>
            {student?.goal_score && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className="text-2xl">🎯</span>
                <span className="text-sm font-medium">Mục tiêu: Đạt {student.goal_score}+ điểm</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in-up delay-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Tổng buổi học</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">{progress.total_sessions}</p>
                <p className="text-xs text-blue-600">Buổi học</p>
              </div>
              <div className="text-4xl animate-float">📚</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in-up delay-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Đã hoàn thành</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">{progress.completed_sessions}</p>
                <p className="text-xs text-green-600">Buổi học</p>
              </div>
              <div className="text-4xl animate-float">✅</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in-up delay-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Tỷ lệ hoàn thành</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">{progress.completion_rate ?? progress.completion_percent}%</p>
                <p className="text-xs text-purple-600">Tiến độ</p>
              </div>
              <div className="text-4xl animate-float">📊</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in-up delay-400">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Chủ đề vững</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">{progress.topics_mastered}</p>
                <p className="text-xs text-yellow-600">Chủ đề</p>
              </div>
              <div className="text-4xl animate-float">💪</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Learning Journey */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Summary */}
          {progress && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl">
              <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-6 py-5">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">📊</span> 
                  <span>Your Learning Progress</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    <p className="text-sm text-purple-700 font-medium mb-1">Exercises Completed</p>
                    <p className="text-3xl font-bold text-purple-900">{progress.total_sessions}</p>
                    <p className="text-xs text-purple-600 mt-1">{progress.completed_sessions} correct</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-1">Accuracy Rate</p>
                    <p className="text-3xl font-bold text-green-900">{progress.discipline_score.toFixed(0)}%</p>
                    <p className="text-xs text-green-600 mt-1">Exercise accuracy</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <p className="text-sm text-blue-700 font-medium mb-1">Topics Mastered</p>
                    <p className="text-3xl font-bold text-blue-900">{progress.topics_mastered}</p>
                    <p className="text-xs text-blue-600 mt-1">≥75% score</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                    <p className="text-sm text-orange-700 font-medium mb-1">Need Improvement</p>
                    <p className="text-3xl font-bold text-orange-900">{progress.weak_topics}</p>
                    <p className="text-xs text-orange-600 mt-1">&lt;60% score</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl">
            <div className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 px-6 py-5">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <span>Recommended Next Steps</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {!progress || progress.total_sessions === 0 ? (
                  <Link href="/exercises" className="block p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                        ✨
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-base">Start Practicing!</p>
                        <p className="text-xs text-gray-600 mt-0.5">Begin with exercises to build your skills</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </Link>
                ) : (
                  <>
                    {progress.weak_topics > 0 && (
                      <Link href="/learning-path" className="block p-5 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                            🗺️
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 text-base">Review Learning Path</p>
                            <p className="text-xs text-gray-600 mt-0.5">Focus on {progress.weak_topics} weak topic{progress.weak_topics > 1 ? 's' : ''}</p>
                          </div>
                          <span className="text-gray-400">→</span>
                        </div>
                      </Link>
                    )}
                    <Link href="/exercises" className="block p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                          ✨
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-base">Continue Practicing</p>
                          <p className="text-xs text-gray-600 mt-0.5">More exercises to improve your score</p>
                        </div>
                        <span className="text-gray-400">→</span>
                      </div>
                    </Link>
                    <Link href="/analysis" className="block p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                          📊
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-base">View Detailed Analysis</p>
                          <p className="text-xs text-gray-600 mt-0.5">See AI insights and recommendations</p>
                        </div>
                        <span className="text-gray-400">→</span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100 transition-all hover:shadow-2xl">
            <h3 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Hành động nhanh</span>
            </h3>
            <div className="space-y-3">
              <Link href="/diagnostic" className="block p-5 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 hover:border-orange-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                    📝
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-base">Kiểm tra chẩn đoán</p>
                    <p className="text-xs text-gray-600 mt-0.5">Xác định trình độ hiện tại</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>

              <Link href="/exercises" className="block p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 hover:border-purple-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                    ✨
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-base">AI Tạo bài tập</p>
                    <p className="text-xs text-gray-600 mt-0.5">Luyện tập thông minh với AI</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>

              <Link href="/analysis" className="block p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 hover:border-blue-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                    📊
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-base">Phân tích năng lực</p>
                    <p className="text-xs text-gray-600 mt-0.5">Xem báo cáo chi tiết từ AI</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>

              <Link href="/progress" className="block p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 hover:border-green-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                    📈
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-base">Xem tiến độ</p>
                    <p className="text-xs text-gray-600 mt-0.5">Theo dõi quá trình học tập</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-yellow-900 flex items-center gap-2">
              <span className="text-2xl">💡</span> 
              <span>Mẹo học tập</span>
            </h3>
            <ul className="space-y-3 text-sm text-yellow-900">
              <li className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                <span className="text-lg mt-0.5">✓</span>
                <span className="leading-relaxed">Học đều đặn mỗi ngày 30-45 phút hiệu quả hơn học dồn</span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                <span className="text-lg mt-0.5">✓</span>
                <span className="leading-relaxed">Làm bài tập ngay sau khi học lý thuyết để ghi nhớ tốt</span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                <span className="text-lg mt-0.5">✓</span>
                <span className="leading-relaxed">Ôn lại kiến thức cũ định kỳ để không quên</span>
              </li>
            </ul>
          </div>

          {/* Progress Indicator */}
          {progress && progress.total_sessions > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 transition-all hover:shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🎯</span> 
                <span>Tiến độ tổng quan</span>
              </h3>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Hoàn thành</span>
                  <span className="font-bold text-blue-600">{progress.completed_sessions}/{progress.total_sessions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress.completion_rate ?? progress.completion_percent}%` }}
                  ></div>
                </div>
              </div>
              <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
                (progress.completion_rate ?? progress.completion_percent) < 30 ? 'bg-orange-50 text-orange-700' : 
                (progress.completion_rate ?? progress.completion_percent) < 70 ? 'bg-blue-50 text-blue-700' :
                'bg-green-50 text-green-700'
              }`}>
                {(progress.completion_rate ?? progress.completion_percent) < 30 ? '💪 Hãy tiếp tục cố gắng!' : 
                 (progress.completion_rate ?? progress.completion_percent) < 70 ? '👍 Bạn đang làm tốt!' :
                 '🌟 Xuất sắc! Tiếp tục phát huy!'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Get Started Section */}
      {(!progress || progress.total_sessions === 0) && (
        <div className="mt-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl p-10 text-center border-2 border-blue-200">
          <div className="text-7xl mb-5 animate-bounce">🚀</div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3">Bắt đầu hành trình học tập</h3>
          <p className="text-gray-600 mb-8 text-lg">
            Hoàn thành placement test và bắt đầu luyện tập để cải thiện kỹ năng
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 bg-white border-2 border-blue-300 rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 animate-fade-in-up delay-100">
              <div className="text-5xl mb-3">1️⃣</div>
              <p className="font-bold text-lg mb-2 text-gray-800">Placement Test</p>
              <p className="text-xs text-gray-600 mb-3">Đánh giá năng lực ban đầu</p>
              <Link href="/diagnostic" className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium">
                Bắt đầu →
              </Link>
            </div>
            <div className="p-6 bg-white border-2 border-purple-300 rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 animate-fade-in-up delay-200">
              <div className="text-5xl mb-3">2️⃣</div>
              <p className="font-bold text-lg mb-2 text-gray-800">Tạo Learning Path</p>
              <p className="text-xs text-gray-600 mb-3">Lộ trình học cá nhân hóa</p>
              <Link href="/learning-path" className="inline-block px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-medium">
                Tạo ngay →
              </Link>
            </div>
            <div className="p-6 bg-white border-2 border-pink-300 rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 animate-fade-in-up delay-300">
              <div className="text-5xl mb-3">3️⃣</div>
              <p className="font-bold text-lg mb-2 text-gray-800">Luyện tập</p>
              <p className="text-xs text-gray-600 mb-3">Thực hành với AI</p>
              <Link href="/exercises" className="inline-block px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all font-medium">
                Bắt đầu →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
