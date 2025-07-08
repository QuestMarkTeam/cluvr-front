import React, { useEffect, useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import '../../styles/board.css';
import '../../styles/category.css';
import TabBar from "../../components/TabBar.jsx";

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

const boardTypes = [
    { label: '자유게시판', value: 'CHITCHAT' },
    { label: '질문게시판', value: 'QUESTION' }
];
const categories = [
    { label: '개발', value: 'DEVELOPMENT' },
    { label: '알고리즘', value: 'ALGORITHMS_CODING_TESTS' },
    { label: '면접', value: 'INTERVIEW_PREPARATION' },
    { label: '자격증', value: 'CERTIFICATIONS_EXAMS' },
    { label: '디자인', value: 'DESIGN' },
    { label: '언어', value: 'LANGUAGE_LEARNING' },
    { label: 'AI/데이터', value: 'AI_DATA_SCIENCE' },
    { label: '대외활동', value: 'EXTRACURRICULAR_COMPETITIONS' },
    { label: '음악', value: 'MUSIC_EDUCATION' },
    { label: '기타', value: 'OTHERS' }
];

export default function BoardPage() {
    const [currentBoardType, setCurrentBoardType] = useState('CHITCHAT');
    const [currentCategory, setCurrentCategory] = useState('DEVELOPMENT');
    const [boards, setBoards] = useState([]);
    const [clover, setClover] = useState([]);
    const [reactionState, setReactionState] = useState({});
    const [userInfo, setUserInfo] = useState({ userName: '사용자', gem: 0, clover: 0 });
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBoards();
        fetchGetClover();
        fetchUserProfile();
    }, [currentBoardType, currentCategory]);
    const fetchGetClover= async () =>{
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clovers`, {
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
                throw new Error('클로버를 불러오지 못했습니다.');
            }

            const data = await res.json();
            console.log(data.data.score);
            setClover(data.data.score);
        } catch (err) {
            console.error('클럽 목록 조회 실패:', err);
            setClover([]);
        }
    }
    const fetchBoards = async () => {
        const token = localStorage.getItem('accessToken');
        let url = `${API_DOMAIN_URL}/api/boards?boardType=${currentBoardType}`;
        url += `&category=${currentCategory}`;

        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (res.status === 401) {
                localStorage.clear();
                return;
            }
            
            if (!res.ok) {
                throw new Error('게시글 목록을 불러오지 못했습니다.');
            }
            
            const data = await res.json();
            const list = data.data?.content || [];
            setBoards(list);
        } catch (err) {
            console.error('게시글 목록 조회 실패:', err);
            setBoards([]);
        }
    };

    const handleReaction = async (boardId, type, isSelected) => {
        const token = localStorage.getItem('accessToken');
        const url = `${API_DOMAIN_URL}/api/reactions`;
        const body = { reactionType: type, boardId };
        try {
            const res = await fetch(url, {
                method: isSelected ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('리액션 실패');
            setReactionState(prev => ({
                ...prev,
                [boardId]: {
                    like: type === 'LIKE' ? !isSelected : prev[boardId]?.like || false,
                    dislike: type === 'DISLIKE' ? !isSelected : prev[boardId]?.dislike || false
                }
            }));
        } catch (err) {
            alert('리액션 처리 실패');
        }
    };

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/users/me`, {
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
            if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
            const data = await res.json();
            
            setUserInfo({
                userName: data.data.name || '사용자',
                gem: data.data.gem || 0,
                clover: data.data.clover || 0
            });
        } catch (err) {
            console.error('사용자 정보 불러오기 오류:', err);
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
            const res = await fetch(`${API_DOMAIN_URL}/api/notifications`, {
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

    return (
        <div className="board-page">
            {/* 상단바 */}
            <header className="app-bar" style={{ position: 'relative' }}>
                <h1 className="app-title">Board</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>{userInfo.userName}</span>
                    <span style={{ fontSize: '0.9rem', color: '#6EE7B7' }}>💎 {userInfo.gem}</span>
                    <span style={{ fontSize: '0.9rem', color: '#6EE7B7' }}>🍀 {clover}</span>
                    <button 
                        className="icon-btn" 
                        onClick={handleNotificationClick}
                        style={{ fontSize: '1.2rem', color: '#666' }}
                    >
                        🔔
                    </button>
                </div>
            </header>

            {/* 게시판 탭 */}
            <div className="board-type-tabs">
                {boardTypes.map(type => (
                    <button
                        key={type.value}
                        className={`board-type-btn ${currentBoardType === type.value ? 'active' : ''}`}
                        onClick={() => setCurrentBoardType(type.value)}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* 카테고리 탭 */}
            <div className="category-section">
                <div className="category-title">카테고리</div>
                <div className="category-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            className={`category-tab-btn ${currentCategory === cat.value ? 'active' : ''}`}
                            onClick={() => setCurrentCategory(cat.value)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 게시글 목록 */}
            <main className="main-content board-list-container">
                {boards.length === 0 ? (
                    <div style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>
                        게시글이 없습니다.
                    </div>
                ) : (
                    <ul className="group-list">
                        {boards.map(board => (
                            <li
                                key={board.id}
                                className="group-card"
                                onClick={() => navigate(`/board/${board.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="group-info">
                                    {/* 첫 번째 줄: 제목과 작성자 정보 */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div className="group-title" style={{ flex: 1, marginRight: 16 }}>{board.title}</div>
                                        <div className="group-meta" style={{ whiteSpace: 'nowrap' }}>
                                            {board.userName || '익명'} · {board.createdAt?.split('T')[0]}
                                        </div>
                                    </div>
                                    {/* 두 번째 줄: 조회수 */}
                                    <div className="group-views" style={{ fontSize: '0.9rem', color: '#666' }}>
                                        <span>조회수 {board.viewCount || 0}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <button
                    className="main-btn"
                    style={{ marginBottom: '60px' }}
                    onClick={() => navigate('/board/write')}
                >
                    글쓰기
                </button>
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
