import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/user.css';

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

export default function ProfilePage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [userProfile, setUserProfile] = useState(null);

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
            if (!res.ok) throw new Error('프로필 정보를 불러오지 못했습니다.');
            const data = await res.json();
            setUserProfile(data.data);
        } catch (err) {
            console.error('프로필 정보 불러오기 오류:', err);
        }
    };

    const handleLogout = async () => {
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
        navigate('/login');
    };

    const handleNotificationClick = () => {
        navigate('/notifications');
    };

    return (
        <div className="profile-page">
            <header className="app-bar">
                <h1 className="app-title">Profile</h1>
                <div>
                    <span>{userInfo.userName}</span>
                    <button onClick={handleNotificationClick}>알림</button>
                </div>
            </header>

            <main>
                <div className="profile-card">
                    {isLoggedIn ? (
                        <>
                            <img
                                src={userProfile?.imageUrl || "default.png"}
                                className="profile-avatar"
                                alt="User Avatar"
                            />
                            <div>{userInfo.userName}</div>
                            <div>{userInfo.userEmail}</div>
                            <div>💎 {userProfile?.gem || 0}</div>
                            <button onClick={() => navigate('/edit-profile')}>프로필 수정</button>
                            <Link to="/gems/log">젬 로그 보기</Link>
                        </>
                    ) : (
                        <Link to="/login">로그인</Link>
                    )}
                </div>
            </main>

            <button onClick={handleLogout}>로그아웃</button>
        </div>
    );
}
