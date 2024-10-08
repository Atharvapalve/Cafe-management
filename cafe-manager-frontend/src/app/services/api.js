import { API_BASE_URL } from '../config';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'An error occurred');
  }
  return response.json();
};

export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

export const register = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/logout/`);
  return handleResponse(response);
};

export const getMenuItems = async () => {
  const response = await fetch(`${API_BASE_URL}/menu-items/`);
  return handleResponse(response);
};

export const placeOrder = async (items, rewardPointsRedeemed) => {
  const response = await fetch(`${API_BASE_URL}/place-order/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, reward_points_redeemed: rewardPointsRedeemed }),
  });
  return handleResponse(response);
};

export const getUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/user-profile/`);
  return handleResponse(response);
};

export const updateUserProfile = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/update-profile/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
};