import React, { useEffect, useState } from 'react';
import { useParams, useNavigate,Link } from 'react-router-dom';
import '../../styles/board.css';
import '../../styles/category.css';

const API_DOMAIN_URL = 'http://localhost:80';

export default function BoardDetailPage() {
    const { boardId } = useParams(); // URL에서 boardId 추출
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchBoardDetail();
        fetchComments();
    }, [boardId]);

    const fetchBoardDetail = async () => {
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/boards/${boardId}`);
            const data = await res.json();
            setBoard(data.data);
        } catch (err) {
            console.error('게시글 상세 오류:', err);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/boards/${boardId}/replies`);
            const data = await res.json();
            setComments(data.data?.content || []);
        } catch (err) {
            console.error('댓글 불러오기 오류:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/boards/${boardId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                setNewComment('');
                fetchComments();
            } else {
                alert('댓글 등록 실패');
            }
        } catch (err) {
            console.error('댓글 등록 오류:', err);
        }
    };

    return (
        <div className="board-detail-page">
            {/* 상단바 */}
            <header className="app-bar">
                <button className="icon-btn" onClick={() => navigate('/board')}>&larr;</button>
                <h1 className="app-title">게시글</h1>
                <span style={{ width: '2rem' }} />
            </header>

            <main className="main-content" style={{ paddingTop: 0 }}>
                {/* 게시글 */}
                <div className="detail-card">
                    {board ? (
                        <>
                            <div className="detail-title">{board.title}</div>
                            <div className="detail-content">{board.content}</div>
                            <div className="detail-meta">
                                by {board.userName || '익명'} · {board.createdAt?.split('T')[0]}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>로딩 중...</div>
                    )}
                </div>

                {/* 댓글 리스트 */}
                <h3 style={{ margin: '16px 0 8px 0' }}>댓글</h3>
                <ul className="comment-list">
                    {comments.length === 0 ? (
                        <div style={{ color: '#888', textAlign: 'center' }}>댓글이 없습니다.</div>
                    ) : (
                        comments.map((comment) => (
                            <li className="comment-item" key={comment.id}>
                                <div className="comment-meta">
                                    {comment.userName || '익명'} · {comment.createdAt?.split('T')[0]}
                                </div>
                                <div className="comment-content">{comment.content}</div>
                            </li>
                        ))
                    )}
                </ul>

                {/* 댓글 작성 */}
                <form className="comment-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="댓글을 입력하세요"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                    />
                    <button type="submit">등록</button>
                </form>
            </main>

            {/* 하단 네비게이션 */}
            <nav className="tab-bar">
                <Link to="/home" className="tab">Home</Link>
                <Link to="/club" className="tab">Club</Link>
                <Link to="/board" className="tab active">Board</Link>
                <Link to="/myclubs" className="tab">My Clubs</Link>
                <Link to="/profile" className="tab">Profile</Link>
            </nav>
        </div>
    );
}
