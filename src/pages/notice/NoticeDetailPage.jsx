import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        clubId: params.get('clubId'),
        noticeId: params.get('noticeId')
    };
}

const NoticeDetailPage = () => {
    const [notice, setNotice] = useState(null);
    const navigate = useNavigate();
    const { clubId, noticeId } = getParams();

    useEffect(() => {
        const fetchNotice = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token || !clubId || !noticeId) return;
            try {
                const res = await fetch(`${API_DOMAIN_URL}/api/clubs/${clubId}/notices/${noticeId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!res.ok) throw new Error('공지사항을 불러오지 못했습니다.');
                const data = await res.json();
                setNotice(data.data);
            } catch (err) {
                alert('공지사항을 불러오지 못했습니다.');
                navigate(-1);
            }
        };
        fetchNotice();
    }, [clubId, noticeId, navigate]);

    if (!notice) return <div style={{ textAlign: 'center', marginTop: '40px' }}>로딩 중...</div>;

    return (
        <div className="notice-detail-page" style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <button className="icon-btn" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>&larr;</button>
            <h2 style={{ marginBottom: 12 }}>{notice.title}</h2>
            <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: 24 }}>{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : ''}</div>
            <div style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>{notice.content || notice.contents}</div>
        </div>
    );
};

export default NoticeDetailPage; 