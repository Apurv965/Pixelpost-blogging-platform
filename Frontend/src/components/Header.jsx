import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ theme, onToggleTheme }) {
  const { user, isAuthenticated, logout, updateProfile, changePassword } = useAuth();
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setNameValue(user?.name || '');
  }, [user?.name]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
        setEditingName(false);
        setChangingPassword(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile(nameValue);
      setEditingName(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update name');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setChangingPassword(false);
      alert('Password changed successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="pixelpost-header">
      <Link to="/feed" className="pixelpost-title-link">
        <h1 className="pixelpost-title">PixelPost</h1>
      </Link>
      <nav className="pixelpost-nav">
        <button
          type="button"
          className="theme-toggle-button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span className="theme-toggle-icon" aria-hidden="true">
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
          <span className="theme-toggle-text">
            {theme === 'light' ? 'Dark' : 'Light'}
          </span>
        </button>
        {isAuthenticated ? (
          <>
            <Link to="/create-post" className="header-action-link">+ create post</Link>
            <div className="header-user-badge" aria-label={user?.name || "User profile"} ref={menuRef}>
              <button
                type="button"
                className="header-user-trigger"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Open user menu"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || "User avatar"} className="header-user-avatar" />
                ) : (
                  <span className="header-user-initial">{userInitial}</span>
                )}
              </button>
              {menuOpen && (
                <div className="header-user-menu">
                  <div className="header-user-menu-header">
                    <p className="header-user-menu-name">{user?.name}</p>
                    <p className="header-user-menu-email">{user?.email}</p>
                  </div>

                  {!editingName && !changingPassword && (
                    <div className="header-user-menu-actions">
                      <button type="button" className="header-menu-button" onClick={() => setEditingName(true)}>
                        Edit name
                      </button>
                      <button type="button" className="header-menu-button" onClick={() => setChangingPassword(true)}>
                        Change password
                      </button>
                      <button type="button" className="header-menu-button logout-menu-button" onClick={logout}>
                        Logout
                      </button>
                    </div>
                  )}

                  {editingName && (
                    <form className="header-menu-form" onSubmit={handleNameSubmit}>
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        placeholder="Enter new name"
                        required
                      />
                      <div className="header-menu-form-actions">
                        <button type="submit" className="header-menu-submit" disabled={saving}>
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="header-menu-cancel" onClick={() => setEditingName(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {changingPassword && (
                    <form className="header-menu-form" onSubmit={handlePasswordSubmit}>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Current password"
                        required
                      />
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="New password"
                        required
                      />
                      <div className="header-menu-form-actions">
                        <button type="submit" className="header-menu-submit" disabled={saving}>
                          {saving ? 'Saving...' : 'Update'}
                        </button>
                        <button type="button" className="header-menu-cancel" onClick={() => setChangingPassword(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/signin" className="header-nav-link">Sign in</Link>
            <Link to="/signup" className="header-nav-link">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
