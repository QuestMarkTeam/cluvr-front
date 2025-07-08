import React, { useEffect, useState } from 'react';
import { useParams, useNavigate,Link } from 'react-router-dom';
import '../../styles/board.css';
import '../../styles/category.css';

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

export default function BoardDetailPage() {
    const { boardId } = useParams(); // URL에서 boardId 추출
    const navigate = useNavigate();

    const [clover, setClover] = useState([]);
    const [board, setBoard] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyChildren, setReplyChildren] = useState({}); // replyId별 대댓글 목록
    const [showReplyChildren, setShowReplyChildren] = useState({}); // replyId별 대댓글 표시 여부
    const [replyChildInputs, setReplyChildInputs] = useState({}); // replyId별 대댓글 입력값
    const [commentReactions, setCommentReactions] = useState({}); // replyId별 {like: boolean, dislike: boolean, likeCount, dislikeCount}
    const [boardReactions, setBoardReactions] = useState({ like: false, dislike: false }); // 게시글 리액션 상태
    const [userInfo, setUserInfo] = useState({ userName: '사용자', gem: 0, clover: 0 });
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchBoardDetail();
        fetchComments();
        fetchGetClover();
        fetchUserProfile();
    }, [boardId]);
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
            console.error('클로버 목록 조회 실패:', err);
            setClover([]);
        }
    }
    const fetchBoardDetail = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/boards/${boardId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // 토큰을 헤더에 추가
                }
            });

            if (res.status === 401) {
                localStorage.clear();
                return;
            }

            if (!res.ok) {
                throw new Error('게시글을 불러오지 못했습니다.');
            }

            const data = await res.json();
            console.log('게시글 데이터:', data.data); // 디버깅용
            setBoard(data.data);
        } catch (err) {
            console.error('게시글 상세 오류:', err);
        }
    };

    const fetchComments = async () => {
        const token = localStorage.getItem('accessToken');
        console.log('fetchComments 호출됨, boardId:', boardId); // 디버깅용
        console.log('토큰:', token ? '존재함' : '없음'); // 디버깅용

        try {
            const url = `${API_DOMAIN_URL}/api/boards/${boardId}/replies`;
            console.log('댓글 API URL:', url); // 디버깅용

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('댓글 API 응답 상태:', res.status); // 디버깅용

            if (res.status === 401) {
                console.log('401 에러: 인증 실패'); // 디버깅용
                localStorage.clear();
                return;
            }

            if (!res.ok) {
                console.log('API 응답 실패:', res.status, res.statusText); // 디버깅용
                throw new Error('댓글을 불러오지 못했습니다.');
            }

            const data = await res.json();
            console.log('댓글 API 전체 응답:', data); // 디버깅용
            console.log('댓글 데이터:', data.data); // 디버깅용
            console.log('댓글 content:', data.data?.content); // 디버깅용

            setComments(data.data?.content || []);
        } catch (err) {
            console.error('댓글 불러오기 오류:', err);
            setComments([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/boards/${boardId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

    // 대댓글 목록 불러오기
    const fetchReplyChildren = async (replyId) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/replies/${replyId}/reply-children`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.status === 401) {
                localStorage.clear();
                return;
            }
            if (!res.ok) throw new Error('대댓글을 불러오지 못했습니다.');
            const data = await res.json();
            console.log('대댓글 응답:', data); // 디버깅용
            // 페이징 응답 구조에 맞게 수정
            const replyChildrenData = data.data?.data?.content || data.data?.content || [];
            setReplyChildren(prev => ({ ...prev, [replyId]: replyChildrenData }));
        } catch (err) {
            console.error('대댓글 불러오기 오류:', err);
        }
    };

    // 대댓글 등록
    const handleReplyChildSubmit = async (e, replyId) => {
        e.preventDefault();
        const content = replyChildInputs[replyId]?.trim();
        if (!content) return;
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/replies/${replyId}/reply-children`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            if (!res.ok) throw new Error('대댓글 등록 실패');
            setReplyChildInputs(prev => ({ ...prev, [replyId]: '' }));
            fetchReplyChildren(replyId);
        } catch (err) {
            alert('대댓글 등록 실패');
        }
    };

    // 대댓글 입력값 변경
    const handleReplyChildInputChange = (e, replyId) => {
        setReplyChildInputs(prev => ({ ...prev, [replyId]: e.target.value }));
    };

    // 대댓글 보기 토글
    const toggleReplyChildren = (replyId) => {
        setShowReplyChildren(prev => {
            const next = { ...prev, [replyId]: !prev[replyId] };
            if (next[replyId]) fetchReplyChildren(replyId);
            return next;
        });
    };

    const handleCommentReaction = async (replyId, type, isSelected) => {
        if (!board) return;
        const token = localStorage.getItem('accessToken');
        const url = `${API_DOMAIN_URL}/api/reactions`;
        const body = { reactionType: type, boardId: board.id, replyId };
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

            // 로컬 리액션 상태 업데이트
            setCommentReactions(prev => ({
                ...prev,
                [replyId]: {
                    like: type === 'LIKE' ? !isSelected : prev[replyId]?.like || false,
                    dislike: type === 'DISLIKE' ? !isSelected : prev[replyId]?.dislike || false
                }
            }));

            // 댓글 목록 새로고침 (실제 카운트 반영)
            fetchComments();
        } catch (err) {
            alert('댓글 리액션 처리 실패');
        }
    };

    // 게시글 리액션 핸들러
    const handleBoardReaction = async (type, isSelected) => {
        if (!board) return;
        const token = localStorage.getItem('accessToken');
        const url = `${API_DOMAIN_URL}/api/reactions`;
        const body = { reactionType: type, boardId: board.id }; // replyId 없음 = 게시글 리액션
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
            setBoardReactions(prev => ({
                like: type === 'LIKE' ? !isSelected : prev.like,
                dislike: type === 'DISLIKE' ? !isSelected : prev.dislike
            }));
            // 게시글 정보 새로고침 (리액션 카운트 업데이트)
            fetchBoardDetail();
        } catch (err) {
            alert('게시글 리액션 처리 실패');
        }
    };

    // 최고 댓글 채택
    const handleSelectBestReply = async (replyId) => {
        if (!board) return;
        const token = localStorage.getItem('accessToken');
        console.log(board.id)
        console.log(replyId)
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/boards/${board.id}/replies/${replyId}/best-recommendation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('채택 실패');
            alert('댓글이 채택되었습니다!');
            // 페이지 새로고침 (전체 상태 초기화)
            window.location.reload();
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert('댓글 채택 실패');
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
        <div className="board-detail-page">
            {/* 상단바 */}
            <header className="app-bar" style={{ position: 'relative' }}>
                <h1 className="app-title">게시글</h1>
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

            <main className="main-content" style={{paddingTop: 0}}>
                {/* 게시글 */}
                <div className="detail-card">
                    {board ? (
                        <>
                            {/* 제목 + 작성자/날짜 한 줄 */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 8
                            }}>
                                <div className="detail-title" style={{marginBottom: 0}}>{board.title}</div>
                                <div className="detail-meta"
                                     style={{fontSize: '1rem', color: '#888', marginLeft: 16, whiteSpace: 'nowrap'}}>
                                    {board.userName || '익명'} · {board.createdAt?.split('T')[0]}
                                </div>
                            </div>
                            {/* 본문 */}
                            <div className="detail-content" style={{marginBottom: 20}}>{board.content}</div>

                            {/* 게시글 리액션 */}
                            <div className="reply-reaction" style={{marginTop: 16}}>
                                <button
                                    className={`reply-reaction-btn${boardReactions?.like ? ' liked' : ''}`}
                                    onClick={() => handleBoardReaction('LIKE', boardReactions?.like)}
                                    aria-label="좋아요"
                                    type="button"
                                >
                                    <span style={{fontSize: '1.2em'}}>👍</span>
                                    {board?.like ?? 0}
                                </button>
                                <button
                                    className={`reply-reaction-btn${boardReactions?.dislike ? ' disliked' : ''}`}
                                    onClick={() => handleBoardReaction('DISLIKE', boardReactions?.dislike)}
                                    aria-label="싫어요"
                                    type="button"
                                >
                                    <span style={{fontSize: '1.2em'}}>👎</span>
                                    {board?.dislike ?? 0}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{textAlign: 'center', padding: '20px 0'}}>로딩 중...</div>
                    )}
                </div>

                {/* 댓글 리스트 */}
                <h3 style={{margin: '16px 0 8px 0'}}>댓글</h3>
                <ul className="comment-list">
                    {comments.length === 0 ? (
                        <div style={{color: '#888', textAlign: 'center'}}>댓글이 없습니다.</div>
                    ) : (
                        [...comments].reverse().map((comment) => (
                            <li className={`comment-item ${comment.best ? 'best-comment' : ''}`} key={comment.id}>
                                {/* 첫 줄: 작성자 + 날짜 + 채택 버튼 */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 8
                                }}>
                                    <div className="comment-meta">
                                        {comment.userName || '익명'} · {comment.createdAt?.split('T')[0]}
                                    </div>
                                    {/* 채택 버튼 - 오른쪽 끝에 배치 */}
                                    {board?.author && board?.boardType === 'QUESTION' && !board?.isSelected && (
                                        <button
                                            style={{
                                                padding: '2px 6px',
                                                fontSize: '0.7rem',
                                                marginLeft: 8,
                                                backgroundColor: '#6EE7B7',
                                                color: '#333',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                            }}
                                            onClick={() => handleSelectBestReply(comment.id)}
                                        >
                                            채택
                                        </button>
                                    )}
                                </div>
                                {/* 두 번째 줄: 댓글 내용 */}
                                <div className="comment-content">
                                    {comment.content}
                                    {comment.best && <span className="best-label">채택됨</span>}
                                </div>
                                {/* 댓글 리액션 */}
                                <div className="reply-reaction">
                                    <button
                                        className={`reply-reaction-btn${commentReactions[comment.id]?.like ? ' liked' : ''}`}
                                        onClick={() => handleCommentReaction(comment.id, 'LIKE', commentReactions[comment.id]?.like)}
                                        aria-label="좋아요"
                                        type="button"
                                    >
                                        <span style={{fontSize: '1.2em'}}>👍</span>
                                        {comment.like ?? 0}
                                    </button>
                                    <button
                                        className={`reply-reaction-btn${commentReactions[comment.id]?.dislike ? ' disliked' : ''}`}
                                        onClick={() => handleCommentReaction(comment.id, 'DISLIKE', commentReactions[comment.id]?.dislike)}
                                        aria-label="싫어요"
                                        type="button"
                                    >
                                        <span style={{fontSize: '1.2em'}}>👎</span>
                                        {comment.dislike ?? 0}
                                    </button>
                                    <span
                                        style={{
                                            color: '#6EE7B7',
                                            fontSize: '0.98em',
                                            marginLeft: 12,
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                        }}
                                        onClick={() => toggleReplyChildren(comment.id)}
                                    >
                        {showReplyChildren[comment.id] ? '∧ 댓글 숨기기' : '∨ 댓글'}
                    </span>
                                </div>
                                {/* 대댓글 목록 */}
                                {showReplyChildren[comment.id] && (
                                    <ul className="reply-child-list" style={{marginLeft: 16, marginTop: 8}}>
                                        {(replyChildren[comment.id] || []).length === 0 ? (
                                            <li style={{color: '#aaa', fontSize: '0.95rem'}}>대댓글이 없습니다.</li>
                                        ) : (
                                            replyChildren[comment.id].map((child) => (
                                                <li
                                                    key={child.id}
                                                    style={{
                                                        marginBottom: 8,
                                                        listStyle: 'none',
                                                        border: 'none',
                                                        backgroundColor: 'transparent',
                                                        padding: 0,
                                                        boxShadow: 'none',
                                                        borderRadius: 0,
                                                    }}
                                                >
                                                    <div className="comment-meta">
                                                        {child.userName || '익명'} · {child.createdAt?.split('T')[0]}
                                                    </div>
                                                    <div className="comment-content">{child.content}</div>
                                                </li>
                                            ))
                                        )}
                                        {/* 대댓글 입력창 */}
                                        <li style={{marginTop: 8}}>
                                            <form onSubmit={(e) => handleReplyChildSubmit(e, comment.id)}
                                                  style={{display: 'flex', gap: 8}}>
                                                <input
                                                    type="text"
                                                    placeholder="대댓글을 입력하세요"
                                                    value={replyChildInputs[comment.id] || ''}
                                                    onChange={(e) => handleReplyChildInputChange(e, comment.id)}
                                                    style={{flex: 1}}
                                                    required
                                                />
                                                <button type="submit" className="main-btn"
                                                        style={{width: 80, minWidth: 0, padding: 0}}>
                                                    등록
                                                </button>
                                            </form>
                                        </li>
                                    </ul>
                                )}
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
                        <h4 style={{margin: 0, fontSize: '1rem', fontWeight: 'bold'}}>알림</h4>
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
