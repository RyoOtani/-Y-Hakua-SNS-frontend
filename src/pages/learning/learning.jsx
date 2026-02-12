import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import './learning.css';
import Sidebar from '../../components/sidebar/sidebar';
import Topbar from '../../components/topbar/topbarMain';
import Bottombar from '../../components/bottombar/bottombar';
import { AuthContext } from '../../state/AuthContext';
import axios from 'axios';
import {
    PlayArrow,
    Stop,
    LocalFireDepartment,
    TrendingUp,
    EmojiEvents,
    Timer,
    Flag,
} from '@mui/icons-material';

export default function Learning() {
    const { user } = useContext(AuthContext);
    const [isStudying, setIsStudying] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0); // 秒
    const [stats, setStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        total: 0,
        dailyStats: [],
    });
    const [streak, setStreak] = useState({
        currentStreak: 0,
        longestStreak: 0,
        learningDates: [],
    });
    const [goals, setGoals] = useState([]);
    const [recentSessions, setRecentSessions] = useState([]);
    const [goalInput, setGoalInput] = useState({
        daily: '',
        weekly: '',
        monthly: '',
    });
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);

    // データ取得
    const fetchData = useCallback(async () => {
        if (!user?._id) return;

        try {
            const [statsRes, streakRes, goalsRes, sessionsRes, activeRes] =
                await Promise.all([
                    axios.get(`/api/learning/stats/${user._id}`),
                    axios.get(`/api/learning/streak/${user._id}`),
                    axios.get(`/api/learning/goals/${user._id}`),
                    axios.get(`/api/learning/sessions/${user._id}?limit=10`),
                    axios.get(`/api/learning/sessions/active/${user._id}`),
                ]);

            setStats(statsRes.data);
            setStreak(streakRes.data);
            setGoals(goalsRes.data);
            setRecentSessions(sessionsRes.data);

            // アクティブセッションがあれば復元
            if (activeRes.data) {
                setIsStudying(true);
                const elapsed = Math.floor(
                    (Date.now() - new Date(activeRes.data.startTime).getTime()) / 1000
                );
                setElapsedTime(elapsed);
            }

            // 目標入力フィールドを初期化
            const goalMap = {};
            goalsRes.data.forEach((g) => {
                goalMap[g.type] = g.targetMinutes.toString();
            });
            setGoalInput({
                daily: goalMap.daily || '',
                weekly: goalMap.weekly || '',
                monthly: goalMap.monthly || '',
            });

            setLoading(false);
        } catch (err) {
            console.error('Error fetching learning data:', err);
            setLoading(false);
        }
    }, [user?._id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // タイマー
    useEffect(() => {
        if (isStudying) {
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isStudying]);

    // 学習開始
    const handleStart = async () => {
        try {
            await axios.post('/api/learning/sessions/start', {
                userId: user._id,
            });
            setIsStudying(true);
            setElapsedTime(0);
        } catch (err) {
            console.error('Error starting session:', err);
            if (err.response?.data?.session) {
                // 既にアクティブなセッションがある
                setIsStudying(true);
                const elapsed = Math.floor(
                    (Date.now() -
                        new Date(err.response.data.session.startTime).getTime()) /
                    1000
                );
                setElapsedTime(elapsed);
            }
        }
    };

    // 学習終了
    const handleStop = async () => {
        try {
            await axios.post('/api/learning/sessions/stop', {
                userId: user._id,
            });
            setIsStudying(false);
            setElapsedTime(0);
            // データを再取得
            fetchData();
        } catch (err) {
            console.error('Error stopping session:', err);
        }
    };

    // 目標設定
    const handleSetGoal = async (type) => {
        const minutes = parseInt(goalInput[type]);
        if (!minutes || minutes <= 0) return;

        try {
            await axios.post('/api/learning/goals', {
                userId: user._id,
                type,
                targetMinutes: minutes,
            });
            fetchData();
        } catch (err) {
            console.error('Error setting goal:', err);
        }
    };

    // 時間フォーマット
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatMinutes = (minutes) => {
        if (minutes >= 60) {
            const hrs = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hrs}時間${mins}分` : `${hrs}時間`;
        }
        return `${minutes}分`;
    };

    // 進捗率計算
    const getProgress = (type) => {
        const goal = goals.find((g) => g.type === type);
        if (!goal) return 0;

        let current = 0;
        if (type === 'daily') current = stats.today;
        else if (type === 'weekly') current = stats.week;
        else if (type === 'monthly') current = stats.month;

        return Math.min(100, Math.round((current / goal.targetMinutes) * 100));
    };

    // 日付フォーマット
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    if (loading) {
        return (
            <>
                <Topbar />
                <div className="learning">
                    <Sidebar />
                    <div className="learningWrapper">
                        <div className="learningLoading">読み込み中...</div>
                    </div>
                </div>
                <Bottombar />
            </>
        );
    }

    return (
        <>
            <Topbar />
            <div className="learning">
                <Sidebar />
                <div className="learningWrapper">
                    {/* タイマーセクション */}
                    <div className="learningTimer">
                        <div className="timerDisplay">
                            <Timer className="timerIcon" />
                            <span className="timerTime">{formatTime(elapsedTime)}</span>
                        </div>
                        <button
                            className={`timerButton ${isStudying ? 'stop' : 'start'}`}
                            onClick={isStudying ? handleStop : handleStart}
                        >
                            {isStudying ? (
                                <>
                                    <Stop /> 学習終了
                                </>
                            ) : (
                                <>
                                    <PlayArrow /> 学習開始
                                </>
                            )}
                        </button>
                        {isStudying && (
                            <p className="studyingMessage">学習中... 頑張れ！💪</p>
                        )}
                    </div>

                    {/* ストリークセクション */}
                    <div className="learningStreak">
                        <div className="streakCard current">
                            <LocalFireDepartment className="streakIcon" />
                            <div className="streakInfo">
                                <span className="streakNumber">{streak.currentStreak}</span>
                                <span className="streakLabel">日連続</span>
                            </div>
                        </div>
                        <div className="streakCard best">
                            <EmojiEvents className="streakIcon" />
                            <div className="streakInfo">
                                <span className="streakNumber">{streak.longestStreak}</span>
                                <span className="streakLabel">最長記録</span>
                            </div>
                        </div>
                    </div>

                    {/* 統計ダッシュボード */}
                    <div className="learningStats">
                        <h3 className="sectionTitle">
                            <TrendingUp /> 学習統計
                        </h3>
                        <div className="statsGrid">
                            <div className="statCard today">
                                <span className="statLabel">今日</span>
                                <span className="statValue">{formatMinutes(stats.today)}</span>
                                {goals.find((g) => g.type === 'daily') && (
                                    <div className="progressBar">
                                        <div
                                            className="progressFill"
                                            style={{ width: `${getProgress('daily')}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="statCard week">
                                <span className="statLabel">今週</span>
                                <span className="statValue">{formatMinutes(stats.week)}</span>
                                {goals.find((g) => g.type === 'weekly') && (
                                    <div className="progressBar">
                                        <div
                                            className="progressFill"
                                            style={{ width: `${getProgress('weekly')}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="statCard month">
                                <span className="statLabel">今月</span>
                                <span className="statValue">{formatMinutes(stats.month)}</span>
                                {goals.find((g) => g.type === 'monthly') && (
                                    <div className="progressBar">
                                        <div
                                            className="progressFill"
                                            style={{ width: `${getProgress('monthly')}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="statCard total">
                                <span className="statLabel">累計</span>
                                <span className="statValue">{formatMinutes(stats.total)}</span>
                            </div>
                        </div>

                        {/* 週間グラフ */}
                        {stats.dailyStats.length > 0 && (
                            <div className="weeklyChart">
                                <h4>過去7日間</h4>
                                <div className="chartBars">
                                    {stats.dailyStats.map((day) => (
                                        <div className="chartBar" key={day._id}>
                                            <div
                                                className="barFill"
                                                style={{
                                                    height: `${Math.min(
                                                        100,
                                                        (day.totalMinutes / 120) * 100
                                                    )}%`,
                                                }}
                                            />
                                            <span className="barLabel">{formatDate(day._id)}</span>
                                            <span className="barValue">
                                                {formatMinutes(day.totalMinutes)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 目標設定 */}
                    <div className="learningGoals">
                        <h3 className="sectionTitle">
                            <Flag /> 目標設定
                        </h3>
                        <div className="goalsGrid">
                            <div className="goalItem">
                                <label>日間目標</label>
                                <div className="goalInputGroup">
                                    <input
                                        type="number"
                                        placeholder="分"
                                        value={goalInput.daily}
                                        onChange={(e) =>
                                            setGoalInput({ ...goalInput, daily: e.target.value })
                                        }
                                    />
                                    <button onClick={() => handleSetGoal('daily')}>設定</button>
                                </div>
                                {goals.find((g) => g.type === 'daily') && (
                                    <span className="currentGoal">
                                        現在: {formatMinutes(goals.find((g) => g.type === 'daily').targetMinutes)}
                                    </span>
                                )}
                            </div>
                            <div className="goalItem">
                                <label>週間目標</label>
                                <div className="goalInputGroup">
                                    <input
                                        type="number"
                                        placeholder="分"
                                        value={goalInput.weekly}
                                        onChange={(e) =>
                                            setGoalInput({ ...goalInput, weekly: e.target.value })
                                        }
                                    />
                                    <button onClick={() => handleSetGoal('weekly')}>設定</button>
                                </div>
                                {goals.find((g) => g.type === 'weekly') && (
                                    <span className="currentGoal">
                                        現在: {formatMinutes(goals.find((g) => g.type === 'weekly').targetMinutes)}
                                    </span>
                                )}
                            </div>
                            <div className="goalItem">
                                <label>月間目標</label>
                                <div className="goalInputGroup">
                                    <input
                                        type="number"
                                        placeholder="分"
                                        value={goalInput.monthly}
                                        onChange={(e) =>
                                            setGoalInput({ ...goalInput, monthly: e.target.value })
                                        }
                                    />
                                    <button onClick={() => handleSetGoal('monthly')}>設定</button>
                                </div>
                                {goals.find((g) => g.type === 'monthly') && (
                                    <span className="currentGoal">
                                        現在: {formatMinutes(goals.find((g) => g.type === 'monthly').targetMinutes)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 学習履歴 */}
                    <div className="learningHistory">
                        <h3 className="sectionTitle">📚 学習履歴</h3>
                        {recentSessions.length === 0 ? (
                            <p className="noHistory">まだ学習記録がありません</p>
                        ) : (
                            <ul className="historyList">
                                {recentSessions.slice(0, 10).map((session) => (
                                    <li key={session._id} className="historyItem">
                                        <span className="historyDate">
                                            {new Date(session.startTime).toLocaleDateString('ja-JP', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                        <span className="historyDuration">
                                            {formatMinutes(session.duration)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            <Bottombar />
        </>
    );
}
