import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/club.css';
import '../../styles/category.css';
import TabBar from "../../components/TabBar.jsx";

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;
const API_CHAT_URL = import.meta.env.VITE_API_CHAT_URL;
const token = localStorage.getItem("accessToken");

function getClubId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('clubId');
}

const ChatRoomList = () => {
    const [clubName, setClubName] = useState('');
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateRoomButton, setShowCreateRoomButton] = useState(false);
    const [userInfo, setUserInfo] = useState({ userName: '사용자', gem: 0, clover: 0 });
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notices, setNotices] = useState([]);
    const [userRole, setUserRole] = useState('');

    const clubId = getClubId();
    const navigate = useNavigate();

    // 에러 처리 함수
    const handleApiError = (error, defaultMessage) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            alert('인증이 만료되었습니다. 다시 로그인해주세요.');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else if (error.response?.status === 403) {
            alert('접근 권한이 없습니다.');
        } else if (error.response?.status === 404) {
            alert('요청한 리소스를 찾을 수 없습니다.');
        } else if (error.response?.status >= 500) {
            alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
            alert(defaultMessage);
        }
    };

    // 페이지 로드 시 API 호출 및 상태 초기화
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const clubId = urlParams.get('clubId');

        if (!clubId || !token) {
            alert('잘못된 접근입니다.');
            return;
        }

        fetchUserProfile();
        fetchNotices();
        const fetchChatRooms = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/list`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                console.log('채팅방 리스트 API 응답 data:', data); // 전체 응답 로그

                // 클럽명 표시
                const clubName = data.data?.clubName || '클럽명 없음';
                setClubName(clubName);

                // 채팅방 목록 표시
                const rooms = data.data?.chatRooms || [];
                setChatRooms(rooms);

                // 채팅방 생성 버튼 노출 조건
                const userRole = data.data?.role || '';
                console.log('userRole:', userRole);
                setUserRole(userRole);
                setShowCreateRoomButton(userRole.toUpperCase() === 'ADMIN' || userRole.toUpperCase() === 'OWNER');

                setLoading(false);
            } catch (error) {
                console.error('채팅방 목록 조회 실패:', error);
                handleApiError(error, '채팅방 목록을 불러올 수 없습니다.');
                setLoading(false);
            }
        };

        fetchChatRooms();
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

    const fetchNotices = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !clubId) return;
        
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/clubs/${clubId}/notices?page=0&size=3`, {
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
                console.error('공지사항 API 응답:', res.status, errorText);
                throw new Error(`공지사항을 불러오지 못했습니다. (${res.status})`);
            }
            const data = await res.json();
            console.log('공지사항 API 성공 응답:', data);
            setNotices(data.data?.content || []);
        } catch (err) {
            console.error('공지사항 불러오기 오류:', err);
            setNotices([]);
        }
    };

    const goToChat = (roomId, clubName) => {
        console.log('clubId:', clubId);
        const roomName = chatRooms.find(room => room.id === roomId)?.name || '';
        window.location.href = `/chat?clubId=${clubId}&roomId=${roomId}&clubName=${clubName}&roomName=${encodeURIComponent(roomName)}`;
    };

    const goToCreateRoom = () => {
        window.location.href = `/crateroom?clubId=${clubId}`;
    };

    return (
        <div className="chat-room-list-page">
            {/* 상단바 */}
            <header className="app-bar" style={{ position: 'relative' }}>
                <button className="icon-btn" onClick={() => navigate('/myclubs')}>&larr;</button>
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
                {loading && <div id="loading" style={{ textAlign: 'center', color: '#888', margin: '40px 0' }}>로딩 중...</div>}

                {!loading && (
                    <>
                        {/* 클럽 이름 섹션 */}
                        <div style={{ 
                            backgroundColor: '#f8f9fa', 
                            borderRadius: '12px', 
                            padding: '20px', 
                            marginBottom: '24px',
                            border: '1px solid #e9ecef'
                        }}>
                            <h2 id="clubNameH2" style={{ 
                                display: clubName ? 'block' : 'none', 
                                margin: '0 0 16px 0',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                {clubName}
                            </h2>
                            
                            {/* 공지사항 섹션 */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <h3 style={{ 
                                        margin: 0, 
                                        fontSize: '1.1rem', 
                                        fontWeight: 'bold',
                                        color: '#6EE7B7'
                                    }}>
                                        📢 공지사항
                                    </h3>
                                    {userRole.toUpperCase() === 'OWNER' && (
                                        <button 
                                            onClick={() => navigate(`/notice/create?clubId=${clubId}`)}
                                            style={{
                                                background: '#6EE7B7',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '6px 12px',
                                                fontSize: '0.8rem',
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
                                        {notices.slice(0, 2).map((notice, index) => (
                                            <div key={notice.id} style={{
                                                padding: '12px',
                                                backgroundColor: 'white',
                                                borderRadius: '8px',
                                                marginBottom: '8px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold',
                                                    marginBottom: '4px',
                                                    color: '#333'
                                                }}>
                                                    {notice.title}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: '#666',
                                                    marginBottom: '4px',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {notice.contents.length > 50 ? notice.contents.substring(0, 50) + '...' : notice.contents}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.7rem',
                                                    color: '#999'
                                                }}>
                                                    공지사항
                                                </div>
                                            </div>
                                        ))}
                                        <div style={{
                                            textAlign: 'right',
                                            marginTop: '8px'
                                        }}>
                                            <button 
                                                onClick={() => navigate(`/notice/list?clubId=${clubId}`)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#6EE7B7',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                더보기 &gt;
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        color: '#888',
                                        padding: '20px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        공지사항이 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 채팅방 리스트 섹션 */}
                        <div>
                            <div id="chatRoomListTitle" style={{ 
                                fontSize: '1.1rem', 
                                color: '#6EE7B7', 
                                marginBottom: '16px',
                                fontWeight: 'bold',
                                display: chatRooms.length > 0 ? 'block' : 'none'
                            }}>
                                💬 채팅방
                            </div>

                            <div id="chatRoomList" style={{ display: chatRooms.length > 0 ? 'block' : 'none' }}>
                                {chatRooms.map(room => (
                                    <div
                                        key={room.id}
                                        className="chat-room-item"
                                        style={{ 
                                            cursor: 'pointer', 
                                            padding: '16px', 
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                            transition: 'background-color 0.2s',
                                            border: '1px solid #e9ecef'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                        onClick={() => goToChat(room.id, clubName)}
                                    >
                                        {room.name}
                                    </div>
                                ))}
                                {chatRooms.length === 0 && (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        color: '#888', 
                                        padding: '40px 0',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        채팅방이 없습니다.
                                    </div>
                                )}
                            </div>

                            {showCreateRoomButton && (
                                <div id="createRoomSection" style={{ marginTop: '20px', textAlign: 'center' }}>
                                    <button 
                                        onClick={goToCreateRoom}
                                        style={{
                                            background: '#6EE7B7',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '12px 24px',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        ➕ 새 채팅방 만들기
                                    </button>
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

export default ChatRoomList;
