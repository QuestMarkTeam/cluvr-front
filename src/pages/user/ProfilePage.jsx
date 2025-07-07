// ProfilePage.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/user.css';
import TabBar from "../../components/TabBar.jsx";

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

export default function ProfilePage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [userProfile, setUserProfile] = useState(null);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            setUserInfo({
                userName: localStorage.getItem('userName') || '사용자',
                userEmail: localStorage.getItem('userEmail') || '',
            });
            fetchUserProfile();
        }
    }, []);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('accessToken');
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
            if (!res.ok) throw new Error('프로필 정보를 불러오지 못했습니다.');

            const data = await res.json();
            setUserProfile(data.data);

            localStorage.setItem('userName', data.data.name || '사용자');
            localStorage.setItem('userGem', data.data.gem || 0);
            localStorage.setItem('userClover', data.data.clover || 0);

            const newUserInfo = {
                userName: data.data.name || '사용자',
                userEmail: data.data.email || '',
            };
            setUserInfo(newUserInfo);
        } catch (err) {
            console.error('프로필 정보 불러오기 오류:', err);
        }
    };

    const handleLogout = async () => {
        if (window.confirm('정말 로그아웃하시겠습니까?')) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                await fetch(`${API_DOMAIN_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }

            localStorage.clear();
            alert('로그아웃되었습니다.');
            window.location.reload();
        }
    };

    const handleMenuNavigation = (path) => {
        if (!isLoggedIn) {
            alert('로그인 후 이용하세요!');
            return;
        }
        navigate(path);
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
        <div className="profile-page">
            <header className="app-bar" style={{ position: 'relative' }}>
                <h1 className="app-title">Profile</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        {userInfo.userName || '사용자'}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#6EE7B7' }}>💎 {userProfile?.gem || 0}</span>
                    <span style={{ fontSize: '0.9rem', color: '#6EE7B7' }}>🍀 {userProfile?.clover || 0}</span>
                    <button
                        className="icon-btn"
                        onClick={handleNotificationClick}
                        style={{ fontSize: '1.2rem', color: '#666' }}
                    >
                        🔔
                    </button>
                </div>
            </header>

            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="profile-card">
                    {isLoggedIn ? (
                        <>
                            <img
                                src={userProfile?.imageUrl ? userProfile.imageUrl : "https://cluvr-image.s3.us-west-2.amazonaws.com/images/cluvr_default.png"}
                                className="profile-avatar"
                                alt="User Avatar"
                                onError={e => { e.target.onerror = null; e.target.src = "https://cluvr-image.s3.us-west-2.amazonaws.com/images/cluvr_default.png"; }}
                            />
                            <div className="profile-nickname">{userInfo.userName}</div>
                            <div className="profile-email">{userInfo.userEmail}</div>
                            <div className="profile-gem">💎 {userProfile?.gem || 0}</div>
                            <button className="profile-edit" onClick={() => handleMenuNavigation('/edit-profile')}>
                                &#9881;
                            </button>
                            {/* 젬 로그 보기 버튼 추가 */}
                            <Link to="/gems/log" className="profile-menu-btn">
                                젬 로그 보기
                            </Link>
                        </>
                    ) : (
                        <Link to="/login" className="profile-login-btn">
                            로그인
                        </Link>
                    )}
                </div>

                {isLoggedIn && (
                    <div className="profile-menu">
                        <button className="profile-menu-btn" onClick={() => handleMenuNavigation('/my-clubs')}>
                            My Clubs
                        </button>
                        <button className="profile-menu-btn" onClick={() => handleMenuNavigation('/my-questions')}>
                            나의 질문
                        </button>
                        <button className="profile-menu-btn" onClick={() => handleMenuNavigation('/my-answers')}>
                            나의 답변
                        </button>
                        <button className="profile-menu-btn" onClick={() => handleMenuNavigation('/settings')}>
                            설정
                        </button>
                        <button className="profile-menu-btn" onClick={() => handleMenuNavigation('/support')}>
                            고객센터
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            로그아웃
                        </button>
                    </div>
                )}
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
                                    }}>
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
