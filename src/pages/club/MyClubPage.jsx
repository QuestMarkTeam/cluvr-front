import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../../styles/club.css';
import '../../styles/category.css';
import TabBar from "../../components/TabBar.jsx";

const API_DOMAIN_URL = 'http://localhost:80';
const API_CHAT_URL = 'http://localhost:8082';

export default function MyClubPage() {
    const [clubs, setClubs] = useState([]);
    const [error, setError] = useState('');
    const [expired, setExpired] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`${API_DOMAIN_URL}/api/clubs/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                localStorage.clear();
                setExpired(true);
                return;
            }

            if (!response.ok) {
                throw new Error('클럽 리스트를 불러오지 못했습니다.');
            }

            const result = await response.json();
            setClubs(result.data || []);
        } catch (err) {
            console.error(err);
            setError('클럽 리스트를 불러오지 못했습니다.');
        }
    };

    const goToChat = (clubId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        window.location.href = `/chatroomlist?clubId=${clubId}&token=${encodeURIComponent(token)}`;
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    return (
        <>
            <header className="app-bar">
                <button className="icon-btn" onClick={() => navigate('/home')}>&larr;</button>
                <h1 className="app-title">My Clubs</h1>
                <span style={{ width: '2rem' }}></span>
            </header>

            <main className="main-content">
                {expired ? (
                    <div className="empty-state">
                        <div style={{ marginBottom: '16px' }}>로그인이 만료되었습니다</div>
                        <button className="main-btn" onClick={() => navigate('/login')}>다시 로그인하기</button>
                    </div>
                ) : error ? (
                    <div className="empty-state">
                        <div style={{ marginBottom: '16px' }}>{error}</div>
                        <button className="main-btn" onClick={fetchClubs}>다시 시도</button>
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ marginBottom: '16px' }}>가입된 클럽이 없습니다</div>
                        <button className="main-btn" onClick={() => navigate('/club')}>클럽 둘러보기</button>
                    </div>
                ) : (
                    <ul className="group-list">
                        {clubs.map(club => (
                            <li
                                key={club.clubId}
                                className="club-card"
                                onClick={() => goToChat(club.clubId)}
                            >
                                <div
                                    className="club-name"
                                    dangerouslySetInnerHTML={{ __html: escapeHtml(club.name) }}
                                />
                                <div
                                    className="club-description"
                                    dangerouslySetInnerHTML={{ __html: escapeHtml(club.description || '') }}
                                />
                                <div className="club-meta">클럽으로 이동 →</div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <TabBar />
        </>
    );
}
