import React, { useEffect, useState } from "react";

const API_NOTIFICATION_URL = import.meta.env.VITE_API_NOTIFICATION_URL;
const API_DOMAIN_URL = import.meta.env.VITE_API_DOMAIN_URL;

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }

    fetchNotifications();
    connectSSE();
  }, []);

  const fetchNotifications = async () => {
    const res = await fetch(`${API_NOTIFICATION_URL}/notifications`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    setNotifications(data);
  };

  const markAsRead = async (notiId) => {
    await fetch(`${API_NOTIFICATION_URL}/notifications/${notiId}/read`, {
      method: "PATCH",
      headers: { Authorization: "Bearer " + token },
    });
  };

  const handleNotificationClick = async (noti) => {
    if (!noti.isRead) {
      await markAsRead(noti.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
      );
    }

    if (noti.targetType === "BOARD") {
      window.location.href = `/boards/${noti.targetId}`;
    }
  };

  const connectSSE = () => {
    const sse = new EventSource("/notifications/connect");

    sse.onmessage = (e) => {
      const newNoti = JSON.parse(e.data);
      setNotifications((prev) => [newNoti, ...prev]);
    };

    sse.onerror = () => {
      console.warn("SSE 재연결 시도 중...");
      sse.close();
      setTimeout(connectSSE, 5000);
    };
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "login.html";
  };

  return (
    <div>
      <h1>🔔 내 알림</h1>
      <button onClick={logout}>로그아웃</button>
      <div id="notifications">
        {notifications.map((noti) => (
          <div
            key={noti.id}
            className={`notification${noti.isRead ? "" : " unread"}`}
            onClick={() => handleNotificationClick(noti)}
          >
            <div>{noti.content}</div>
            <div className="timestamp">
              {new Date(noti.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPage;
