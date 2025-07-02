import React from 'react';
import { Link } from 'react-router-dom';

const TabBar = ({ activeTab }) => {
    return (
        <nav className="tab-bar">
            <Link to="/home" className={`tab ${activeTab === 'home' ? 'active' : ''}`}>Home</Link>
            <Link to="/club" className={`tab ${activeTab === 'club' ? 'active' : ''}`}>Club</Link>
            <Link to="/board" className={`tab ${activeTab === 'board' ? 'active' : ''}`}>Board</Link>
            <Link to="/myclubs" className={`tab ${activeTab === 'myclubs' ? 'active' : ''}`}>My Clubs</Link>
            <Link to="/profile" className={`tab ${activeTab === 'profile' ? 'active' : ''}`}>Profile</Link>
        </nav>
    );
};

export default TabBar;
