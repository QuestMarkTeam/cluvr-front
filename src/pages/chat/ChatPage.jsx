// ChatPage.jsx

import React, { useState, useEffect } from 'react';
import '../../styles/chat.css';

let stompClient = null;
let socket = null;
let currentRoomId = null;
let lastDisplayedDate = null;

const API_CHAT_URL = 'http://localhost:8082';
const token = localStorage.getItem("accessToken");

const Chat = () => {
    const [clubId, setClubId] = useState('');
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [members, setMembers] = useState([]);
    const [message, setMessage] = useState('');
    const [roomName, setRoomName] = useState('채팅방을 선택해주세요');
    const [clubName, setClubName] = useState('');



    // 초기화 함수
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const clubId = params.get('clubId');
        const roomId = params.get('roomId');
        const roomName = params.get('roomName');

        if (clubId) setClubId(clubId);

        if (roomId && roomName) {
            setRoomName(roomName);
            connectSocketAndSubscribe(roomId, roomName);
        }

        const clubNameFromQuery = params.get('clubName');
        if (clubNameFromQuery) {
            setClubName(decodeURIComponent(clubNameFromQuery));
        }
    }, []);


    const sendMessage = () => {
        if (!message || !currentRoomId || !stompClient || !stompClient.connected) {
            console.log("❌ 메시지 전송 실패:", { message, currentRoomId, connected: stompClient?.connected });
            return;
        }

        const messageData = {
            roomId: currentRoomId,
            message: message,
            type: "TALK",
            createdAt: new Date().toISOString()
        };

        stompClient.send("/app/message", {}, JSON.stringify(messageData));
        setMessage('');
    };

    const connectSocketAndSubscribe = (roomId, roomName) => {
        currentRoomId = roomId;

        setRoomName(roomName);

        if (currentSubscription) {
            currentSubscription.unsubscribe();
        }

        // 소켓 연결
        socket = new SockJS(`${API_CHAT_URL}/ws/chat?token=${encodeURIComponent(token)}`);
        stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            joinChatRoom().then(() => {
                const subscription = stompClient.subscribe(`/sub/ws/chat/rooms/${currentRoomId}`, (message) => {
                    const msgObj = JSON.parse(message.body);
                    renderMessage(msgObj);
                });
                setCurrentSubscription(subscription);
            });

            fetchRoomMembers(currentRoomId);
        }, (error) => {
            console.error('WebSocket 연결 실패:', error);
        });
    };

    const joinChatRoom = () => {
        return fetch(`${API_CHAT_URL}/api/clubs/${clubId}/chat/rooms/${currentRoomId}/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).catch(error => {
            console.error('채팅방 입장에 실패했습니다.', error);
        });
    };

    const fetchRoomMembers = (roomId) => {
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
    };

    const renderMessage = (message) => {
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

        if (lastDisplayedDate !== messageDateStr) {
            const dateDiv = document.createElement("div");
            dateDiv.className = "date-divider";
            dateDiv.innerHTML = `<span class="date-text">${dateLabel}</span>`;
            chatBox.appendChild(dateDiv);
            lastDisplayedDate = messageDateStr;
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
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const goBackToMyClubs = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const clubId = urlParams.get('clubId');
        const clubName = urlParams.get('clubName');
        window.location.href = `/chatroomlist?clubId=${clubId}&token=${encodeURIComponent(token)}&clubName=${encodeURIComponent(clubName)}`;
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
                        💬 - <span id="currentRoomName">{roomName}</span>
                        <button id="openMembersBtn" title="채팅 멤버 보기">
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
                            disabled={!stompClient?.connected}
                        />
                        <button
                            className="send-btn"
                            id="sendBtn"
                            onClick={sendMessage}
                            disabled={!stompClient?.connected}
                        >
                            📤
                        </button>
                    </div>
                    <div id="membersOverlay">
                        <div className="members-header">
                            <span>👥 Member (<span id="memberCount">{members.length}</span>)</span>
                            <button id="closeMembersBtn" title="닫기">✕</button>
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
                </div>
            </div>
        </div>
    );
};

export default Chat;
