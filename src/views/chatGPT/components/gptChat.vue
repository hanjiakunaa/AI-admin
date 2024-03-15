<template>
  <div class="gptBox">
    <div class="gptBox-left">
      <img src="@/assets/gpt-logo.png" alt="" />
    </div>
    <div class="gptBox-right">
      <div class="gptBox-loading" v-if="showLoading">
        <div class="loader"></div>
      </div>
      <div v-html="displayText" v-else> </div>

      <div class="gptBox-stopText" @click="stopAnswer" v-if="showStop">
        <icon-pause-one size="20" v-if="isTyping"></icon-pause-one>
        <span>{{ isTyping ? '暂停回答' : '回答已停止生成' }}</span>
      </div>
      <div class="gptBox-right-tool" v-if="isTool && !showLoading">
        <div class="tool-time">{{ chatTime }}</div>
        <div class="tool-iconBox">
          <div class="icon-copy" @click="copyText">
            <icon-copy></icon-copy>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script>
export default {
  name: 'gptChat',
};
</script>
<script setup>
import { computed, onUnmounted, ref } from 'vue';
import { ElMessage } from 'element-plus';

import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import MarkdownIt from 'markdown-it';
import mdKatex from '@traptitech/markdown-it-katex';
import useClipboard from 'vue-clipboard3';
const { toClipboard } = useClipboard();

const props = defineProps({
  chatText: {
    type: String,
    default: '',
  },
  chatTime: {
    type: String,
    default: '',
  },
  showLoading: {
    type: Boolean,
    default: true,
  },

  parentScroll: {
    default: () => {},
  },
});

const md = new MarkdownIt({
  // 将类似 URL 的文本自动转换为链接。
  linkify: false,
  html: false,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language));
    if (validLang) {
      const lang = language ?? '';
      return highlightBlock(hljs.highlight(lang, code, true).value, lang);
    }

    return highlightBlock(hljs.highlightAuto(code).value, '');
  },
});

md.use(mdKatex, { blockClass: '', errorColor: ' #cc0000' });

const highlightBlock = (str, lang) => {
  return `<pre class="pre-code-box"><div class="pre-code-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">复制代码</span></div><div class="pre-code"><code class="hljs code-block-body ${lang}">${str}</code></div></pre>`;
};

const displayText = ref('');
const timer = ref(null);
const isTyping = ref(true);
const showStop = ref(true);

// 计数器，用于跟踪当前输出到第几个字符
const counter = ref(0);
const showCursor = ref(false);
const isTool = ref(false);

const typeWriter = () => {
  if (counter.value >= props.chatText.length || !isTyping.value) {
    clearInterval(timer.value);
    showStop.value = false;
    isTool.value = true;
    return;
  }
  // 将 markDown 转成 HTML
  const parsedHtml = md.render(props.chatText.slice(0, counter.value + 1));
  displayText.value = parsedHtml;
  counter.value++;
  setTimeout(() => {
    showCursor.value = !showCursor.value;
    scrollToBottom();
    typeWriter();
  }, 500);
};

const scrollToBottom = () => {
  props.parentScroll.scrollTo({
    top: props.parentScroll.scrollHeight,
    behavior: 'smooth',
  });
};

// 复制文本
const copyText = async () => {
  try {
    if (props.chatText !== '') {
      await toClipboard(props.chatText.slice(0, counter.value));
      ElMessage({
        message: '复制成功',
        grouping: true,
        type: 'success',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// 停止回答
const stopAnswer = () => {
  isTool.value = true;
  isTyping.value = false;
};

onMounted(() => {
  isTool.value = false;
  counter.value = 0;
  showCursor.value = false;
  timer.value = setInterval(typeWriter, 500);
});

onUnmounted(() => {
  clearInterval(timer.value);
});
</script>

<style lang="scss" scoped>
.gptBox {
  width: 100%;
  background: $base-color-white;
  padding: 10px 22px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  border-radius: $base-gpt-borer-radius;

  .gptBox-left {
    width: 40px;
    height: 40px;
    margin-right: 15px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .gptBox-right {
    flex: 1;
    width: 0;
    min-height: 123px;
    font-size: 18px;
    color: $base-font-color;
    line-height: 43px;
    position: relative;

    .gptBox-loading {
      width: 100%;
      height: 40px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      color: #cecece;

      .loader {
        width: 25px;
        aspect-ratio: 4;
        background: radial-gradient(circle closest-side, $base-color-primary 90%, $base-color-white)
          0 / calc(100% / 3) 100% space;
        clip-path: inset(0 100% 0 0);
        animation: l1 1s steps(4) infinite;
      }
      @keyframes l1 {
        to {
          clip-path: inset(0 -34% 0 0);
        }
      }
    }

    .gptBox-right-tool {
      width: 100%;
      height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      border-top: 1px solid #f1f2f5;

      .icon-copy {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #cecece;

        &:hover {
          color: #000 !important;
        }
      }
    }

    .gptBox-stopText {
      position: absolute;
      bottom: 0px;
      left: 50%;
      transform: translateX(-50%);
      // min-width: 100px;
      width: 11%;
      height: 40px;
      border-radius: 20px;
      background-color: #f1f2f5;
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      span {
        margin-left: 5px;
      }
    }
  }
}
</style>
<style>
p {
  margin: 0;
  padding: 0;
}
</style>
