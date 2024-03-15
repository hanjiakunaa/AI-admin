import { getAccessToken } from '@/api/gpt.js';
import {  setWXGPTAToken } from '@/utils/cookies.js'


const state = {
    userAccessToken: null,
    userIMGToken: null,
};

const mutations = {
    setAccessToken(state, data) {
        state.userAccessToken = data;
    },
    setUserImgToken(state, data) {
        state.userIMGToken = data;
    },
};


const actions = {
    async getAccessUserToken({ commit }, { code, type }) {
        let { access_token, refresh_token } = await getAccessToken(code)
        if (access_token) {
            if (type == 'text') {
                commit('setAccessToken', access_token);
                setWXGPTAToken(access_token, type);
            } else {
                commit('setUserImgToken', access_token);
                setWXGPTAToken(access_token, type);
            }
        }

    },


};



export default { state, mutations, actions }