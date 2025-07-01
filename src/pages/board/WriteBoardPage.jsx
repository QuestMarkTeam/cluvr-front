import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import '../../styles/board.css';
import '../../styles/category.css';

const API_DOMAIN_URL = 'http://localhost:8080';

export default function WriteBoardPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        content: '',
        category: 'CHITCHAT',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/boards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                alert('게시글이 등록되었습니다!');
                navigate('/board');
            } else {
                alert('등록 실패');
            }
        } catch (err) {
            console.error('게시글 등록 오류:', err);
            alert('에러 발생');
        }
    };

    return (
        <div className="write-board-page">
            {/* 상단바 */}
            <header className="app-bar">
                <button className="icon-btn" onClick={() => navigate('/board')}>&larr;</button>
                <h1 className="app-title">글쓰기</h1>
                <span style={{ width: '2rem' }} />
            </header>

            {/* 본문 */}
            <main className="main-content" style={{ paddingTop: 0 }}>
                <form className="write-form" onSubmit={handleSubmit}>
                    <select name="category" value={form.category} onChange={handleChange} required>
                        <option value="CHITCHAT">자유게시판</option>
                        <option value="QUESTION">질문게시판</option>
                    </select>
                    <input
                        name="title"
                        placeholder="제목"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="content"
                        placeholder="내용"
                        value={form.content}
                        onChange={handleChange}
                        required
                        style={{ resize: 'none', height: '120px' }}
                    />
                    <button type="submit" className="main-btn">등록</button>
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
