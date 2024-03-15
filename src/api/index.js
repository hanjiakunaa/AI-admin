import request from '@/utils/request.js';
export const getResouceList = () => {
  return request({
    url: '/api/getResouceList',
    method: 'get',
  });
};
