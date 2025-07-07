import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/club.css';
import '../../styles/category.css';
import TabBar from "../../components/TabBar.jsx";

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

function getClubId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('clubId');
}

const NoticeListPage = () => {
    const [clubName, setClubName] = useState('');
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({ userName: '사용자', gem: 0, clover: 0 });
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [userRole, setUserRole] = useState('');

    const clubId = getClubId();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
        fetchNotices();
        fetchClubInfo();
    }, []);

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

    const fetchClubInfo = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !clubId) return;
        
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs/${clubId}`, {
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
            if (!res.ok) throw new Error('클럽 정보를 불러오지 못했습니다.');
            const data = await res.json();
            setClubName(data.data.name || '클럽명 없음');
        } catch (err) {
            console.error('클럽 정보 불러오기 오류:', err);
        }
    };

    const fetchNotices = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !clubId) return;
        
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs/${clubId}/notices?page=0&size=10`, {
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
            if (!res.ok) {
                const errorText = await res.text();
                console.error('공지사항 목록 API 응답:', res.status, errorText);
                throw new Error(`공지사항을 불러오지 못했습니다. (${res.status})`);
            }
            const data = await res.json();
            console.log('공지사항 목록 API 성공 응답:', data);
            setNotices(data.data?.content || []);
            setLoading(false);
        } catch (err) {
            console.error('공지사항 불러오기 오류:', err);
            setNotices([]);
            setLoading(false);
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
        <div className="notice-list-page">
            {/* 상단바 */}
            <header className="app-bar" style={{ position: 'relative' }}>
                <button className="icon-btn" onClick={() => navigate(`/chatroomlist?clubId=${clubId}`)}>&larr;</button>
                <h1 className="app-title">공지사항</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>{userInfo.userName}</span>
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

            {/* 메인 컨텐츠 */}
            <main className="main-content">
                {loading && <div style={{ textAlign: 'center', color: '#888', margin: '40px 0' }}>로딩 중...</div>}

                {!loading && (
                    <>
                        {/* 클럽 이름 */}
                        <div style={{ 
                            backgroundColor: '#f8f9fa', 
                            borderRadius: '12px', 
                            padding: '16px', 
                            marginBottom: '20px',
                            border: '1px solid #e9ecef'
                        }}>
                            <h2 style={{ 
                                margin: 0,
                                fontSize: '1.3rem',
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                {clubName}
                            </h2>
                        </div>

                        {/* 공지사항 목록 */}
                        <div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <h3 style={{ 
                                    margin: 0, 
                                    fontSize: '1.1rem', 
                                    fontWeight: 'bold',
                                    color: '#6EE7B7'
                                }}>
                                    📢 공지사항 목록
                                </h3>
                                {userRole.toUpperCase() === 'OWNER' && (
                                    <button 
                                        onClick={() => navigate(`/notice/create?clubId=${clubId}`)}
                                        style={{
                                            background: '#6EE7B7',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        작성
                                    </button>
                                )}
                            </div>

                            {notices.length > 0 ? (
                                <div>
                                    {notices.map((notice) => (
                                        <div key={notice.id} style={{
                                            padding: '16px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            marginBottom: '12px',
                                            border: '1px solid #e9ecef',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                        onClick={() => navigate(`/notice/detail?clubId=${clubId}&noticeId=${notice.id}`)}
                                        >
                                            <div style={{
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                marginBottom: '8px',
                                                color: '#333'
                                            }}>
                                                {notice.title}
                                            </div>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                color: '#666',
                                                marginBottom: '8px',
                                                lineHeight: '1.4'
                                            }}>
                                                {notice.content.length > 100 ? notice.content.substring(0, 100) + '...' : notice.content}
                                            </div>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: '#999'
                                            }}>
                                                {new Date(notice.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    color: '#888',
                                    padding: '40px 0',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    공지사항이 없습니다.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* 하단 네비게이션 */}
            <nav className="tab-bar">
                <Link to="/home" className="tab">Home</Link>
                <Link to="/club" className="tab">Club</Link>
                <Link to="/board" className="tab">Board</Link>
                <Link to="/myclubs" className="tab active">My Clubs</Link>
                <Link to="/profile" className="tab">Profile</Link>
            </nav>

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
};

export default NoticeListPage; 