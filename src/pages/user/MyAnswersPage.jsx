import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/answer.css';
const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

export default function MyRepliesPage() {
    const [replies, setReplies] = useState([]);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1); // 현재 페이지 상태
    const [userProfile, setUserProfile] = useState(null);
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수 상태
    const navigate = useNavigate();
    const [clover, setClover] = useState([]);

    useEffect(() => {
        fetchGetClover();
        fetchMyReplies(page);
        fetchUserProfile();
    }, [page]);
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
    const fetchMyReplies = async (currentPage) => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`${API_DOMAIN_URL}/api/replies/me?page=${currentPage - 1}&size=5`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                localStorage.clear();
                setError('로그인 세션이 만료되었습니다.');
                return;
            }

            if (!response.ok) {
                throw new Error('답변 목록을 불러오지 못했습니다.');
            }

            const result = await response.json();
            setReplies(result.data.content || []);
            setTotalPages(result.data.totalPages); // 전체 페이지 수 설정
        } catch (err) {
            console.error(err);
            setError('답변 목록을 불러오지 못했습니다.');
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage); // 페이지 변경
        }
    };

    return (
        <>
            {/* 상단 바 */}
            <header className="app-bar">
                <h1 className="app-title">나의 답변</h1>
                <div className="user-info">
                    <span className="user-name">사용자</span>
                    <span className="user-gem">💎 {userProfile?.gem || 0}</span>
                    <span className="user-clover">🍀 {clover|| 0} </span>
                </div>
            </header>

            <main className="main-content">
                {error && <p className="error-message">{error}</p>}
                {replies.length === 0 ? (
                    <div className="empty-state">
                        <p>작성한 답변이 없습니다.</p>
                    </div>
                ) : (
                    <ul className="reply-list">
                        {replies.map((reply) => (
                            <li key={reply.id} className="reply-card">
                                <p className="reply-content">{reply.content}</p>
                                <p className="reply-time">{new Date(reply.createdAt).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            {/* 페이지 네비게이션 */}
            <footer className="footer">
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        이전
                    </button>
                    <span>{page} / {totalPages}</span>
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                    >
                        다음
                    </button>
                </div>

                {/* 홈으로 가기 버튼 */}
                <button className="home-btn" onClick={() => navigate('/')}>홈으로 가기</button>
            </footer>
        </>
    );
}
