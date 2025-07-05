import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

export default function WriteBoardPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    boardType: 'CHITCHAT',
    category: 'DEVELOPMENT',
    clover: 0
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_DOMAIN_URL}/api/boards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        localStorage.clear();
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.result?.message || '게시글 등록에 실패했습니다.');
      }

      alert('게시글이 등록되었습니다!');
      navigate('/board');
    } catch (err) {
      console.error('게시글 등록 오류:', err);
      alert(err.message || '에러 발생');
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
          <div className="form-section">
            <label>게시판 종류</label>
            <select name="boardType" value={form.boardType} onChange={handleChange} required>
              {boardTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="form-section">
            <label>카테고리</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="form-section">
            <label>제목</label>
            <input
              name="title"
              placeholder="제목"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-section">
            <label>내용</label>
            <textarea
              name="content"
              placeholder="내용"
              value={form.content}
              onChange={handleChange}
              required
              style={{ resize: 'none', height: '120px' }}
            />
          </div>
          <div className="form-section">
            <label>클로버 (0~100)</label>
            <input
              name="clover"
              type="number"
              min={0}
              max={100}
              value={form.clover}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="main-btn">등록</button>
        </form>
      </main>
      <TabBar />
    </div>
  );
}
