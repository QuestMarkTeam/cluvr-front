import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;
const API_NOTIFICATION_URL = import.meta.env.VITE_API_NOTIFICATION_URL;

export default function HomePage() {
    const [clubs, setClubs] = useState([]);
    const [posts, setPosts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [userInfo, setUserInfo] = useState({ userName: '사용자', gem: 0, clover: 0 });
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const bannerImages = [
        '/img/banner1.png',
        '/img/banner2.png',
        '/img/banner3.png'
    ];

    useEffect(() => {
        fetchHomeClubs();
        fetchHomeLatestPosts();
        fetchUserProfile(); // 사용자 정보 로드
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

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('accessToken');
        console.log('HomePage - fetchUserProfile 시작, 토큰:', token ? '존재함' : '없음');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('HomePage - API 응답 상태:', res.status);
            
            if (res.status === 401) {
                console.log('HomePage - 401 에러: 인증 실패');
                localStorage.clear();
                return;
            }
            if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
            
            const data = await res.json();
            console.log('HomePage - API 전체 응답:', data);
            console.log('HomePage - data.data:', data.data);
            console.log('HomePage - name:', data.data?.name);
            
            // localStorage에 사용자 정보 저장
            localStorage.setItem('userName', data.data.name || '사용자');
            localStorage.setItem('userGem', data.data.gem || 0);
            localStorage.setItem('userClover', data.data.clover || 0);
            
            // userInfo 상태 업데이트
            const newUserInfo = {
                userName: data.data.name || '사용자',
                gem: data.data.gem || 0,
                clover: data.data.clover || 0
            };
            console.log('HomePage - 새로운 userInfo:', newUserInfo);
            setUserInfo(newUserInfo);
            
            console.log('HomePage - localStorage 저장 후 확인:');
            console.log('  userName:', localStorage.getItem('userName'));
        } catch (err) {
            console.error('HomePage - 사용자 정보 불러오기 오류:', err);
        }
    };

    const handleNotificationClick = () => {
        setShowNotificationModal(true);
        fetchNotifications();
    };

    const fetchNotifications = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_NOTIFICATION_URL}/notifications`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (res.status === 401) {
                localStorage.clear();
                return;
            }
            if (!res.ok) throw new Error('알림을 불러오지 못했습니다.');
            const data = await res.json();
            setNotifications(data.data || []);
        } catch (err) {
            console.error('알림 불러오기 오류:', err);
            setNotifications([]);
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
            <header className="app-bar" style={{ position: 'relative' }}>
                <h1 className="app-title">Cluvr</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        {userInfo.userName}
                        {console.log('HomePage - 상단바 렌더링, userInfo:', userInfo)}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#6EE7B7' }}>💎 {userInfo.gem}</span>
                    <span style={{ fontSize: '0.9rem', color: '#6EE7B7' }}>🍀 {userInfo.clover}</span>
                    <button 
                        className="icon-btn" 
                        onClick={handleNotificationClick}
                        style={{ fontSize: '1.2rem', color: '#666' }}
                    >
                        🔔
                    </button>
                </div>
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

            {/* 알림 드롭다운 */}
            {showNotificationModal && (
                <div style={{
                    position: 'fixed',
                    top: '70px',
                    right: '420px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    width: '300px',
                    maxHeight: '400px',
                    overflow: 'hidden',
                    zIndex: 1000,
                    border: '1px solid #eee'
                }}>
                    {/* 드롭다운 헤더 */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: '1px solid #eee',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>알림</h4>
                        <button 
                            onClick={() => setShowNotificationModal(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '0',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* 알림 리스트 */}
                    <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                color: '#888',
                                padding: '20px'
                            }}>
                                알림이 없습니다.
                            </div>
                        ) : (
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}>
                                {notifications.map((notification, index) => (
                                    <li key={notification.id || index} style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            marginBottom: '4px',
                                            color: '#333'
                                        }}>
                                            {notification.title || '알림'}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: '#666',
                                            marginBottom: '4px',
                                            lineHeight: '1.3'
                                        }}>
                                            {notification.content || '알림 내용'}
                                        </div>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: '#999'
                                        }}>
                                            {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ''}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
