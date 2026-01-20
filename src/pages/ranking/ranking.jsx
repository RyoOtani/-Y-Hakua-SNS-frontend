import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ranking.css';
import Topbar from '../../components/topbar/topbarMain';
import Sidebar from '../../components/sidebar/sidebar';
import { TrendingUp } from '@mui/icons-material';
import Bottombar from '../../components/bottombar/bottombar';

export default function Ranking() {
    const [trending, setTrending] = useState([]);
    const [likeRanking, setLikeRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const [trendRes, likeRes] = await Promise.all([
                    axios.get('/api/hashtags/trending'),
                    axios.get('/api/posts/like-ranking'),
                ]);
                setTrending(trendRes.data);
                setLikeRanking(likeRes.data);
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
                    </div>
                </div>
            </div>
            <Bottombar />
        </>
    );
}
