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
    const navigate = useNavigate();

    useEffect(() => {
        fetchBoards();
    }, [currentBoardType, currentCategory]);

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

    return (
        <div className="board-page">
            {/* 상단바 */}
            <header className="app-bar">
                <button className="icon-btn" onClick={() => navigate('/home')}>&larr;</button>
                <h1 className="app-title">Board</h1>
                <span style={{ width: '2rem' }} />
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
                            >
                                <div className="group-info">
                                    <div className="group-title">{board.title}</div>
                                    <div className="group-meta">
                                        by {board.userName || '익명'} · {board.createdAt?.split('T')[0]}
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
        </div>
    );
}
