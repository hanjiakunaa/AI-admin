import request from '@/utils/request.js';


// 获取token
export function getAccessToken(data) {
    return request({
        url: `/baidu/oauth/2.0/token?grant_type=client_credentials&client_id=${data.ak}&client_secret=${data.sk}`,
        method: 'post',

    })
}
// 文心一言问答
export function getWenxinChatText(token, data) {
    return request({
        url: `/baidu/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=${token}`,
        method: "post",
        data
    })
}



export function getWenXinChatImg(token, data) {
    return request({
        url:`/baidu/rpc/2.0/ai_custom/v1/wenxinworkshop/text2image/sd_xl?access_token=${token}`,
        method:"post",
        data
    })
}



