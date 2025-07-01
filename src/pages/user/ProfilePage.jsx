import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/user.css';

const API_DOMAIN_URL = 'http://localhost:80';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            // 사용자 정보 가져오기 (예시로 localStorage에서)
            setUserInfo({
                userName: localStorage.getItem('userName') || '사용자',
                userEmail: localStorage.getItem('userEmail') || '',
            });
        }
    }, []);

    const handleLogout = async () => {
        if (window.confirm('정말 로그아웃하시겠습니까?')) {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                try {
                    // 로그아웃 API 요청
                    await fetch(`${API_DOMAIN_URL}/api/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    console.log('로그아웃 요청 완료');
                } catch (error) {
                    console.error('로그아웃 요청 실패:', error);
                }
            }

            // 로컬스토리지 초기화
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');

            alert('로그아웃되었습니다.');
            window.location.reload(); // 페이지 새로고침
        }
    };

    const handleMenuNavigation = (path) => {
        if (!isLoggedIn) {
            alert('로그인 후 이용하세요!');
            return;
        }
        navigate(path);
    };

    return (
        <div className="profile-page">
            <header className="app-bar">
                <Link to="/home" className="icon-btn">←</Link>
                <h1 className="app-title">Profile</h1>
            </header>

            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="profile-card">
                    {isLoggedIn ? (
                        <>
                            <img
                                src="img/avatar-default.png"
                                className="profile-avatar"
                                alt="User Avatar"
                                onError={(e) => (e.target.style.display = 'none')}
                            />
                            <div className="profile-nickname">{userInfo.userName}</div>
                            <div className="profile-email">{userInfo.userEmail}</div>
                            <div className="profile-gem">Gem: 123</div>
                            <button className="profile-edit" onClick={() => handleMenuNavigation('/edit-profile')}>
                                &#9881;
                            </button>
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

            <nav className="tab-bar">
                <Link to="/home" className="tab">Home</Link>
                <Link to="/club" className="tab">Club</Link>
                <Link to="/board" className="tab">Board</Link>
                <Link to="/my-club" className="tab">My Clubs</Link>
                <Link to="/profile" className="tab active">Profile</Link>
            </nav>
        </div>
    );
}
