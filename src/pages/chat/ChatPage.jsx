import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/chat.css';
import { jwtDecode } from 'jwt-decode'; // jwt-decode를 import 방식으로 가져오기

const API_CHAT_URL = import.meta.env.VITE_API_CHAT_URL;
const token = localStorage.getItem("accessToken");

function getClubId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('clubId');
}

const isTokenExpired = (token) => {
    if (!token) return true;
    const decoded = jwtDecode(token);  // 토큰 디코딩
    const expirationTime = decoded.exp * 1000;  // exp는 초 단위이므로 밀리초로 변환
    return Date.now() > expirationTime;  // 현재 시간이 만료 시간 이후이면 만료된 것
};

const Chat = () => {
    const [members, setMembers] = useState([]);
    const [message, setMessage] = useState('');
    const [roomName, setRoomName] = useState('채팅방을 선택해주세요');
    const [clubName, setClubName] = useState('');
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    // 소켓/구독/roomId 등은 useRef로 관리
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const socketRef = useRef(null);
    const currentRoomIdRef = useRef(null);
    const lastDisplayedDateRef = useRef(null);

    const clubId = getClubId();

    // 채팅방 입장
    const joinChatRoom = useCallback((roomId) => {
        return fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/rooms/${roomId}/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).catch(error => {
            console.error('채팅방 입장에 실패했습니다.', error);
        });
    }, [clubId]);

    // 멤버 목록 조회
    const fetchRoomMembers = useCallback((roomId) => {
        fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/rooms/${roomId}/users`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setMembers(data.data || []);
            })
            .catch(error => {
                console.error('멤버 목록 조회 실패:', error);
            });
    }, [clubId]);

    // 메시지 렌더링 함수 (useCallback으로 메모이제이션)
    const renderMessage = useCallback((message) => {
        const chatBox = document.getElementById("chatBox");
        if (!message.createdAt) {
            message.createdAt = new Date().toISOString();
        }
        const messageDate = new Date(message.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const messageDateStr = messageDate.toDateString();
        const todayStr = today.toDateString();
        const yesterdayStr = yesterday.toDateString();
        let dateLabel;
        if (messageDateStr === todayStr) {
            dateLabel = "Today";
        } else if (messageDateStr === yesterdayStr) {
            dateLabel = "Yesterday";
        } else {
            dateLabel = messageDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
        if (lastDisplayedDateRef.current !== messageDateStr) {
            const dateDiv = document.createElement("div");
            dateDiv.className = "date-divider";
            dateDiv.innerHTML = `<span class="date-text">${dateLabel}</span>`;
            chatBox.appendChild(dateDiv);
            lastDisplayedDateRef.current = messageDateStr;
        }
        const msgDiv = document.createElement("div");
        if (message.type === "ENTER" || message.type === "LEAVE") {
            msgDiv.className = "chat system";
            msgDiv.innerHTML = `<div class="system-message">${escapeHtml(message.message)}</div>`;
        } else {
            msgDiv.className = "chat other";
            const contentDiv = document.createElement("div");
            contentDiv.className = "message-content";
            const bubble = document.createElement("div");
            bubble.className = "message-bubble";
            bubble.innerHTML = `<strong>${escapeHtml(message.nickname || '익명')}</strong><br>${escapeHtml(message.message)}`;
            const timeDiv = document.createElement("div");
            timeDiv.className = "message-time";
            const messageTime = new Date(message.createdAt);
            timeDiv.textContent = messageTime.toLocaleTimeString('ko-KR', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Seoul'
            });
            contentDiv.appendChild(bubble);
            contentDiv.appendChild(timeDiv);
            msgDiv.appendChild(contentDiv);
        }
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, []);

    // 소켓 연결 및 구독 (roomId, roomName 변경 시만 재연결)
    const connectSocketAndSubscribe = useCallback((roomId, roomName) => {
        // 기존 연결 해제
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
        }
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.disconnect();
        }
        if (socketRef.current) {
            socketRef.current.close();
        }
        currentRoomIdRef.current = roomId;
        setRoomName(roomName);
        // 소켓 연결
        socketRef.current = new SockJS(`${API_CHAT_URL}/ws/chat?token=${encodeURIComponent(token)}`);
        stompClientRef.current = Stomp.over(socketRef.current);
        stompClientRef.current.connect({}, () => {
            joinChatRoom(roomId).then(() => {
                subscriptionRef.current = stompClientRef.current.subscribe(
                    `/sub/ws/chat/rooms/${roomId}`,
                    (message) => {
                        const msgObj = JSON.parse(message.body);
                        renderMessage(msgObj);
                    }
                );
            });
            fetchRoomMembers(roomId);
        }, (error) => {
            console.error('WebSocket 연결 실패:', error);
        });
    }, [fetchRoomMembers, joinChatRoom, renderMessage]);

    // 언마운트 시 소켓/구독 해제
    useEffect(() => {
        return () => {
            if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
            if (stompClientRef.current && stompClientRef.current.connected) stompClientRef.current.disconnect();
            if (socketRef.current) socketRef.current.close();
        };
    }, []);

    // 쿼리스트링에서 roomId, roomName, clubName 읽어서 연결
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('roomId');
        const roomName = params.get('roomName');
        const clubNameFromQuery = params.get('clubName');
        if (clubNameFromQuery) setClubName(decodeURIComponent(clubNameFromQuery));
        if (roomId && roomName) {
            // 1. 방 멤버 목록 조회
            fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/rooms/${roomId}/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                const members = data.data || [];
                const myUserId = isTokenExpired(token);
                const alreadyJoined = members.some(m => String(m.userId) === String(myUserId));
                if (!alreadyJoined) {
                    // 2. 아직 입장 안 했으면 조인 API 호출 후 소켓 연결
                    joinChatRoom(roomId).then(() => {
                        connectSocketAndSubscribe(roomId, roomName);
                    });
                } else {
                    // 3. 이미 입장했으면 바로 소켓 연결
                    connectSocketAndSubscribe(roomId, roomName);
                }
            });
        }
        // eslint-disable-next-line
    }, [connectSocketAndSubscribe, joinChatRoom]);

    // ESC 키로 오버레이 닫기
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') setIsOverlayVisible(false);
        };
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, []);

    // 메시지 전송
    const sendMessage = () => {
        if (!message || !currentRoomIdRef.current || !stompClientRef.current || !stompClientRef.current.connected) {
            console.log("❌ 메시지 전송 실패:", { message, currentRoomId: currentRoomIdRef.current, connected: stompClientRef.current?.connected });
            return;
        }
        const messageData = {
            roomId: currentRoomIdRef.current,
            message: message,
            type: "TALK",
            createdAt: new Date().toISOString()
        };
        stompClientRef.current.send("/app/message", {}, JSON.stringify(messageData));
        setMessage('');
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const goBackToMyClubs = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const clubId = urlParams.get('clubId');
        window.location.href = `/chatroomlist?clubId=${clubId}`;
    };

    const toggleOverlay = () => {
        setIsOverlayVisible(prevState => !prevState);
    };

    return (
        <div>
            <div className="backtotheclublist">
                <button onClick={goBackToMyClubs}> ← </button>
            </div>
            <div className="container">
                <h2 id="clubNameHeader">{clubName}</h2>
            </div>
            <div className="chat-layout">
                <div className="chat-container">
                    <div className="chat-header">
                        💬  <span id="currentRoomName">{roomName}</span>
                        <button id="openMembersBtn" title="채팅 멤버 보기" onClick={toggleOverlay}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05C17.16 14.1 19 15.03 19 16.5V19h5v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            </svg>
                        </button>
                    </div>
                    <div id="chatBox"></div>
                    <div className="message-input-container">
                        <input
                            type="text"
                            id="messageInput"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="메시지를 입력하세요"
                            disabled={!stompClientRef.current?.connected}
                        />
                        <button
                            className="send-btn"
                            id="sendBtn"
                            onClick={sendMessage}
                            disabled={!stompClientRef.current?.connected}
                        >
                            📤
                        </button>
                    </div>
                    {/* 멤버 오버레이 */}
                    {isOverlayVisible && (
                        <div id="membersOverlay">
                            <div className="members-header">
                                <span>👥 Member (<span id="memberCount">{members.length}</span>)</span>
                                <button id="closeMembersBtn" title="닫기" onClick={toggleOverlay}>✕</button>
                            </div>
                            <hr className="divider" />
                            <div className="members-list">
                                {members.map(member => (
                                    <div className="member-item" key={member.userId}>
                                        <div className="member-avatar">{member.nickname.charAt(0).toUpperCase()}</div>
                                        <div className="member-info">
                                            <div className="member-name">{member.nickname || '익명'}</div>
                                            <div className="member-role">
                                                <span className={`role-badge role-${member.clubRole.toLowerCase()}`}>{member.clubRole}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
