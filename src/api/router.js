import request from '@/utils/request.js';
export const getRouterList = (data) => {
  return request({
    url: '/api/menu/navigate',
    method: 'post',
    data,
  });
};
