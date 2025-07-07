import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

export default function GemLogPage() {
    const [gemLogs, setGemLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGemLogs();
    }, []);

    const fetchGemLogs = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const res = await fetch(`${API_DOMAIN_URL}/api/gems/logs`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('젬 로그를 불러오지 못했습니다.');
            }

            const data = await res.json();
            setGemLogs(data.data || []);
        } catch (err) {
            console.error('젬 로그 불러오기 오류:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gem-log-page">
            <h1>젬 적립 로그</h1>
            {loading ? (
                <p>로딩 중...</p>
            ) : (
                <div>
                    {gemLogs.length === 0 ? (
                        <p>적립된 젬 로그가 없습니다.</p>
                    ) : (
                        <ul>
                            {gemLogs.map((log, index) => (
                                <li key={index}>
                                    <strong>{log.action}</strong>
                                    <p>{log.description}</p>
                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            <Link to="/payment/charge" className="charge-btn">충전하기</Link>
        </div>
    );
}
