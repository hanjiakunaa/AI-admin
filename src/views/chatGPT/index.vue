<template>
  <div class="gpt-container">
    <div class="gpt-content">
      <div class="gpt-wrap" v-if="state.gptActiveName == 'text'" ref="gptWrapRef">
        <div class="item" v-for="item in gptChatHistory" :key="item.id">
          <gptUserPage v-if="item.sender == 'user'" :userText="item.text"></gptUserPage>
          <gptChatPage
            v-if="item.sender == 'chatTxt'"
            :chatText="item.text"
            :chatTime="item.time"
            :parentScroll="gptWrapRef"
            :show-loading="item.loading"
          ></gptChatPage>
        </div>
      </div>

      <div class="gpt-wrapImg" v-if="state.gptActiveName == 'pic'" ref="gptWrapImgRef">
        <div class="item" v-for="item in gptImgHistory" :key="item.id">
          <gptUserPage v-if="item.sender == 'userImg'" :userText="item.text"></gptUserPage>
          <gptPicPage v-if="item.sender == 'chatImg'" :chatImgOption="{ ...item }"></gptPicPage>
        </div>
      </div>
    </div>

    <div class="gpt-footer" ref="gptFooterRef" :class="state.isBorderFlag ? 'active' : ''">
      <div class="gpt-footer-top">
        <el-tabs v-model="state.gptActiveName" @tab-click="handleTabClick">
          <el-tab-pane name="text">
            <template #label>
              <div>
                <icon-bill size></icon-bill>
                <span style="margin-left: 10px">文本问答</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="pic">
            <template #label>
              <div>
                <icon-pic></icon-pic>
                <span style="margin-left: 10px">文本图像</span>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="gpt-footer-form">
        <el-input
          @focus="onFocus"
          @blur="onBlur"
          v-model="state.inputVal"
          type="textarea"
          resize="none"
          :placeholder="
            state.gptActiveName == 'text'
              ? '这这里输入您的问题'
              : '请使用中文或英文描述想要生成的画面内容'
          "
          ref="gptInputRef"
          @keyup.enter="onSend"
        ></el-input>
      </div>
      <div class="gpt-footer-btn">
        <div @click="onDrawer" :class="state.gptActiveName == 'pic' ? 'gpt-imgOptions' : ''">{{
          state.gptActiveName == 'pic' ? '图片配置' : ''
        }}</div>
        <!-- 图片配置 -->
        <drawerPage v-model:show="gptImgDrawerShow" @onSubmit="onImgQuery"></drawerPage>

        <div v-if="state.inputVal.length > 0" class="btns active" @click="onSend">
          <icon-send fill="#fff"></icon-send>
        </div>
        <div class="btns" v-else>
          <icon-send fill="#fff"></icon-send>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import gptUserPage from './components/gptUser.vue';
import gptChatPage from './components/gptChat.vue';
import gptPicPage from './components/pic.vue';
import drawerPage from './components/drawer.vue';
import gsap from 'gsap';
import dayJs from 'dayjs';
import { setting } from '@/config/setting.js';
import { getWXGPTAToken } from '@/utils/cookies.js';
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import { getWenxinChatText, getWenXinChatImg } from '@/api/gpt.js';
import { ElMessage } from 'element-plus';

const store = useStore();
const { chatGPTOption, imgGPTOption, gptWXKey, gptWxImgKey } = setting;

onMounted(() => {
  const wenXinGPTATextToken = getWXGPTAToken(gptWXKey);
  const wenXinGPTAImgToken = getWXGPTAToken(gptWxImgKey);

  if (!wenXinGPTATextToken) {
    store.dispatch('gpt/getAccessUserToken', { code: chatGPTOption, type: 'text' });
  }

  if (!wenXinGPTAImgToken) {
    store.dispatch('gpt/getAccessUserToken', { code: imgGPTOption, type: 'img' });
  }
});

const gptWrapRef = ref(null);
const gptWrapImgRef = ref(null);

const gptFooterRef = ref(null);
const gptInputRef = ref(null);
const indexToRemoveText = ref(null);
const indexToRemoveImg = ref(null);
const isTextprogress = ref(0); // 0 结束 1 进行
const isImgprogress = ref(0);

// 文本对话历史记录
const gptChatHistory = ref([]);
// 图像对话历史记录
const gptImgHistory = ref([]);
// 图片配置弹窗状态
const gptImgDrawerShow = ref(false);
let gptImgQuery = ref({
  prompt: '',
  negative_prompt: '',
  // 生成图片长宽
  size: '1024x1024',
  // 生成图片数量
  n: 1,
  // 迭代轮次
  steps: 10,
  // 采样方式
  sampler_index: 'Euler',
  // 随机种子
  seed: null,
  // 提示词相关性
  cfg_scale: 10,
  // 生成风格
  style: 'Base',
});

let state = reactive({
  gptActiveName: 'text',
  inputVal: '',
  // 是否给添加边框
  isBorderFlag: false,
});
// tabs 点击事件
const handleTabClick = (tab) => {
  state.isBorderFlag = false;
  state.inputVal = '';
  state.gptActiveName = tab.paneName;
  gptInputRef.value.focus();

  setTimeout(() => {
    state.isBorderFlag = true;
  }, 200);
};
// 输入框聚焦事件
const onFocus = () => {
  state.isBorderFlag = true;
};
// 输入框失去焦点事件
const onBlur = () => {
  state.isBorderFlag = false;
};

const onSend = () => {
  return state.gptActiveName == 'text' ? onChatSubmit() : onChatImgSubmit();
};

// 文本对话提交
const onChatSubmit = async () => {
  if (state.inputVal.trim() === '') return;
  if (isTextprogress.value == 1) {
    return ElMessage({
      message: '正在生成中，请稍等',
      type: 'warning',
    });
  }

  const textMessages = [
    {
      id: 1,
      sender: 'user',
      text: state.inputVal,
    },
    {
      id: 2,
      sender: 'chatTxt',
      gptId: '',
      text: '',
      time: '',
      loading: true,
    },
  ];

  // 添加用户输入内容
  gptChatHistory.value.push(...textMessages);

  // 记录当前有几项数据
  indexToRemoveText.value = gptChatHistory.value.length - 1;

  try {
    // 开始进行
    isTextprogress.value = 1;
    const messages = {
      messages: [
        {
          role: 'user',
          content: state.inputVal,
        },
      ],
    };
    state.inputVal = '';

    let { result, id, created } = await getWenxinChatText(getWXGPTAToken(gptWXKey), messages);
    if (result) {
      let resultItem = {
        id: gptChatHistory.value.length + 1,
        sender: 'chatTxt',
        gptId: id,
        text: result,
        time: dayJs(Number(created) * 1000).format('YYYY-MM-DD HH:mm:ss'),
        loading: false,
      };

      gptChatHistory.value.splice(indexToRemoveText.value, 1, resultItem);

      isTextprogress.value = 0;
    }
  } catch (error) {
    console.log(error, 'error');
  }
};

// 图像对话提交
const onChatImgSubmit = async () => {
  if (state.inputVal.trim() === '') return;

  if(isImgprogress.value == 1){
    return ElMessage({
      type:"warning",
      message:"正在处理中，请稍后..."
    })
  }

  const imgMessages = [
    {
      id: gptImgHistory.value.length + 1,
      sender: 'userImg',
      text: state.inputVal,
    },
    {
      id: gptImgHistory.value.length + 1,
      sender: 'chatImg',
      gptId: '',
      time: '',
      loading: true,
      imgCount: gptImgQuery.value.n,
    },
  ];

  gptImgHistory.value.push(...imgMessages);
  indexToRemoveImg.value = gptImgHistory.value.length - 1;
  gptImgQuery.value.prompt = state.inputVal;

  scrollToBottom();

  try {
    isImgprogress.value = 1;
    state.inputVal = '';

    let { created, data, id, object } = await getWenXinChatImg(
      getWXGPTAToken(gptWxImgKey),
      gptImgQuery.value
    );
    if (data.length > 0) {
      let resultItem = {
        id: indexToRemoveImg.value + 1,
        sender: 'chatImg',
        object,
        time: dayJs(Number(created) * 1000).format('YYYY-MM-DD HH:mm:ss'),
        loading: false,
        urls: data,
        gptId: id,
        imgCount: gptImgQuery.value.n,
      };

      gptImgHistory.value.splice(indexToRemoveImg.value, 1, resultItem);
      isImgprogress.value = 0;
    }
  } catch (error) {
    console.log(error);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (gptWrapImgRef.value) {
      gptWrapImgRef.value.scrollTop = gptWrapImgRef.value.scrollHeight;
    }
  });
};

// 图片配置
const onDrawer = () => {
  gptImgDrawerShow.value = !gptImgDrawerShow.value;
};

// 子组件传递的数据
const onImgQuery = (val) => {
  if (val) {
    state.inputVal = val.prompt;
    gptImgQuery.value = val;
  }
};
</script>

<style lang="scss" scoped>
.gpt-container {
  position: relative;
}

.gpt-content {
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - 305px);

  .gpt-wrap {
    width: 75%;
    height: 100%;
    margin: 0 auto;
    overflow-y: scroll;
  }

  .gpt-wrapImg {
    width: 75%;
    height: 100%;
    margin: 0 auto;
    overflow-y: scroll;
  }
}

.gpt-footer {
  width: 75%;
  height: 160px;
  background-color: $base-color-white;
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: $base-gpt-borer-radius;
  border: 2px solid transparent;

  background-origin: border-box;
  background-clip: content-box, border-box;

  &.active {
    background-image: linear-gradient($base-color-white, $base-color-white),
      linear-gradient(
        to bottom left,
        rgba(255, 216, 64, 1),
        rgba(243, 172, 255, 1),
        rgba(138, 236, 255, 1)
      );
  }
  .gpt-footer-top {
    padding: 0 $base-padding-10;
  }
  .gpt-footer-form {
    padding: 0 $base-padding-10;
  }

  .gpt-footer-btn {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 5px 0;
    padding: 0 $base-padding-10;

    .gpt-imgOptions {
      padding: 10px 20px;
      background: #ffffff;
      border-radius: 32px;
      border: 1px solid #eee;
      cursor: pointer;

      &:hover {
        border-color: #ffffff;
        background: #f1f2f5;
      }
    }
    .btns {
      width: 35px;
      height: 35px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #ccc;
      border-radius: $base-border-radius;
      cursor: not-allowed;

      &.active {
        cursor: pointer;
        background: $base-color-primary;
      }
    }
  }
}

// &:hover {
//     border-color: rgba(195, 197, 217, 0.65);
//     box-shadow: 0 4px 6px 0 rgba(115, 110, 240, 0.1);
//   }

:deep(.el-tabs__nav-wrap::after) {
  content: '';
  height: 0px;
}

:deep(.el-textarea__inner) {
  padding: 0 !important;
  box-shadow: none !important;
  max-height: 112px;
  line-height: 28px;
  @include base-scrollbar;
}
</style>

