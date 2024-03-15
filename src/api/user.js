import request from '@/utils/request.js';
import { setting } from '@/config/setting';
const { tokenName } = setting;
export const login = async (data) => {
  return request({
    url: '/api/login',
    method: 'post',
    data,
  });
};

export const getUserInfo = (accessToken) => {
  return request({
    url: '/api/userInfo',
    method: 'get',
    data: {
      [tokenName]: accessToken,
    },
  });
};

export const logout = () => {
  return request({
    url: '/api/logout',
    method: 'post',
  });
};

export const register = async () => {
  return request({
    url: '/api/register',
    method: 'post',
  });
};
