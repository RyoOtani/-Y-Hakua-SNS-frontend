import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ranking.css';
import Topbar from '../../components/topbar/topbarMain';
import Sidebar from '../../components/sidebar/sidebar';
import { TrendingUp, School } from '@mui/icons-material';
import Bottombar from '../../components/bottombar/bottombar';

export default function Ranking() {
    const [trending, setTrending] = useState([]);
    const [likeRanking, setLikeRanking] = useState([]);
    const [learningRanking, setLearningRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const [trendRes, likeRes, learningRes] = await Promise.all([
                    axios.get('/api/hashtags/trending'),
                    axios.get('/api/posts/like-ranking'),
                    axios.get('/api/learning/ranking/weekly'),
                ]);
                setTrending(trendRes.data);
                setLikeRanking(likeRes.data);
                setLearningRanking(learningRes.data);
            } catch (err) {
                console.error('Failed to fetch rankings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    const handleHashtagClick = (tag) => {
        navigate(`/search?q=${encodeURIComponent('#' + tag)}`);
    };

    // ランキングボード用：1〜10位までの枠を必ず表示する
    const displayHashtagRanking = Array.from({ length: 10 }, (_, index) => {
        const rank = index + 1;
        const item = trending.find((t) => t.rank === rank);
        return item || { rank, tag: null, count: 0 };
    });

    const displayLikeRanking = Array.from({ length: 10 }, (_, index) => {
        const rank = index + 1;
        const item = likeRanking.find((t) => t.rank === rank);
        return item || { rank, postId: null, count: 0, desc: null, user: null };
    });

    const displayLearningRanking = Array.from({ length: 10 }, (_, index) => {
        const rank = index + 1;
        const item = learningRanking.find((t) => t.rank === rank);
        return item || { rank, userId: null, totalMinutes: 0, username: null, profilePicture: null };
    });

    return (
        <>
            <Topbar />
            <div className="rankingContainer">
                <Sidebar />
                <div className="rankingMain">
                    <div className="rankingBoards">
                        <div className="rankingBoard">
                            <div className="rankingHeader">
                                <TrendingUp className="rankingIcon" />
                                <h2>トレンドランキング</h2>
                            </div>
                            <p className="rankingSubtitle">本日のトレンドハッシュタグ</p>

                            {loading ? (
                                <div className="rankingLoading">読み込み中...</div>
                            ) : (
                                <ul className="rankingList">
                                    {displayHashtagRanking.map((item) => (
                                        <li
                                            key={item.rank}
                                            className={`rankingItem ${item.tag ? '' : 'rankingItem--empty'}`}
                                            onClick={() => item.tag && handleHashtagClick(item.tag)}
                                        >
                                            <span className="rankNumber">{item.rank}</span>
                                            <div className="rankContent">
                                                {item.tag ? (
                                                    <>
                                                        <span className="rankTag">#{item.tag}</span>
                                                        <span className="rankCount">{item.count} 投稿</span>
                                                    </>
                                                ) : (
                                                    <span className="rankTag rankTag--empty">（空き）</span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="rankingBoard">
                            <div className="rankingHeader">
                                <TrendingUp className="rankingIcon" />
                                <h2>いいねランキング</h2>
                            </div>
                            <p className="rankingSubtitle">本日のいいね数ランキング</p>

                            {loading ? (
                                <div className="rankingLoading">読み込み中...</div>
                            ) : (
                                <ul className="rankingList">
                                    {displayLikeRanking.map((item) => (
                                        <li
                                            key={item.rank}
                                            className={`rankingItem ${item.postId ? '' : 'rankingItem--empty'}`}
                                        >
                                            <span className="rankNumber">{item.rank}</span>
                                            <div className="rankContent">
                                                {item.postId && item.user ? (
                                                    <>
                                                        <span className="rankTag">
                                                            {item.user.username} さんの投稿
                                                        </span>
                                                        <span className="rankCount">{item.count} いいね</span>
                                                    </>
                                                ) : (
                                                    <span className="rankTag rankTag--empty">（空き）</span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="rankingBoard">
                            <div className="rankingHeader">
                                <School className="rankingIcon" />
                                <h2>学習ランキング</h2>
                            </div>
                            <p className="rankingSubtitle">今週の学習時間ランキング</p>

                            {loading ? (
                                <div className="rankingLoading">読み込み中...</div>
                            ) : (
                                <ul className="rankingList">
                                    {displayLearningRanking.map((item) => (
                                        <li
                                            key={item.rank}
                                            className={`rankingItem ${item.userId ? '' : 'rankingItem--empty'}`}
                                            onClick={() => item.username && navigate(`/profile/${item.username}`)}
                                        >
                                            <span className="rankNumber">{item.rank}</span>
                                            <div className="rankContent">
                                                {item.userId ? (
                                                    <>
                                                        <div className="rankUser">
                                                            <img
                                                                src={item.profilePicture || "/assets/person/noAvatar.png"}
                                                                alt=""
                                                                className="rankUserImg"
                                                                style={{ width: '24px', height: '24px', borderRadius: '50%', marginRight: '8px', objectFit: 'cover' }}
                                                            />
                                                            <span className="rankTag">
                                                                {item.username}
                                                            </span>
                                                        </div>
                                                        <span className="rankCount">
                                                            {Math.floor(item.totalMinutes / 60)}時間 {item.totalMinutes % 60}分
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="rankTag rankTag--empty">（空き）</span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Bottombar />
        </>
    );
}
