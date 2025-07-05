import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

export default function HomePage() {
    const [clubs, setClubs] = useState([]);
    const [posts, setPosts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const bannerImages = [
        '/img/banner1.png',
        '/img/banner2.png',
        '/img/banner3.png'
    ];

    useEffect(() => {
        fetchHomeClubs();
        fetchHomeLatestPosts();
        const interval = setInterval(() => nextSlide(), 3000);
        return () => clearInterval(interval);
    }, []);
    const fetchHomeClubs = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs?clubType=STUDY`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Authorization 헤더에 토큰 추가
                },
            });
            
            if (res.status === 401) {
                localStorage.clear();
                return;
            }
            
            if (!res.ok) {
                throw new Error('클럽 리스트를 불러오지 못했습니다.');
            }
            
            const data = await res.json();
            const content = data.data?.content || [];
            setClubs(content.slice(0, 2));
        } catch (err) {
            console.error('클럽 목록 조회 실패:', err);
            setClubs([]);
        }
    };

    const fetchHomeLatestPosts = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/boards/recommendation?category=DEVELOPMENT`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Authorization 헤더에 토큰 추가
                },
            });
            
            if (res.status === 401) {
                localStorage.clear();
                return;
            }
            
            if (!res.ok) {
                throw new Error('인기 게시글을 불러오지 못했습니다.');
            }
            
            const data = await res.json();
            const content = data.data || [];
            setPosts(content.slice(0, 5));
        } catch (err) {
            console.error('인기 게시글 조회 실패:', err);
            setPosts([]);
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
    };

    return (
        <div>
            <header className="app-bar">
                <h1 className="app-title">Cluvr</h1>
                <button className="icon-btn bell">🔔</button>
            </header>

            <section className="banner">
                <div className="banner-container" style={{ transform: `translateX(-${currentSlide * 100}%)`, display: 'flex' }}>
                    {bannerImages.map((src, idx) => (
                        <div className="banner-slide" key={idx}>
                            <img src={src} alt={`배너${idx + 1}`} />
                        </div>
                    ))}
                </div>
                <button className="banner-btn prev" onClick={prevSlide}>&#10094;</button>
                <button className="banner-btn next" onClick={nextSlide}>&#10095;</button>
                <div className="banner-dots">
                    {bannerImages.map((_, idx) => (
                        <div key={idx} className={`banner-dot ${idx === currentSlide ? 'active' : ''}`}></div>
                    ))}
                </div>
            </section>

            <main className="main-content">
                <div className="category-header">
                    <h2>Study Group</h2>
                    <Link to="/club" className="more-link">더보기 &gt;</Link>
                </div>
                <ul className="group-list">
                    {clubs.length === 0 ? (
                        <div style={{ color: '#888', textAlign: 'center' }}>클럽이 없습니다.</div>
                    ) : (
                        clubs.map((club, idx) => (
                            <li className="group-card" key={club.id || idx}> {/* club.id가 없을 경우 idx 사용 */}
                                <img src={club.posterUrl || 'static/img/study-coding.png'} className="group-thumb" />
                                <div className="group-info">
                                    <div className="group-title">{club.name}</div>
                                    <div className="group-desc">{club.greeting}</div>
                                    <div className="group-meta">멤버 {club.maxMemberCounter}명</div>
                                </div>
                            </li>

                        ))
                    )}
                </ul>

                <div className="category-header">
                    <h2>인기 게시글</h2>
                    <Link to="/board" className="more-link">더보기 &gt;</Link>
                </div>
                <ul className="group-list">
                    {posts.length === 0 ? (
                        <div style={{ color: '#888', textAlign: 'center' }}>게시글이 없습니다.</div>
                    ) : (
                        posts.map((post, idx) => (
                            <li
                                className="group-card"
                                key={post.id || idx}
                                onClick={() => navigate(`/board/${post.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="group-info">
                                    <div className="group-title">{post.title}</div>
                                    <div className="group-meta">
                                        by {post.userName || '익명'} · {post.createdAt?.split('T')[0]}
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </main>
            <TabBar />

        </div>
    );
}
