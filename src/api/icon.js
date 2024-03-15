import request from '@/utils/request.js';
export const getIcons = () => {
  return request({
    url: '/api/icon',
    method: 'get',
  });
};
