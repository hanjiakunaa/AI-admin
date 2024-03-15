<template>
  <div class="pic-container">
    <div class="gptImgBox-left">
      <img src="@/assets/gpt-logo.png" alt="" />
    </div>

    <div class="gptImgBox-right">
      <div
        class="gptImgBox-right-header"
        :style="{ paddingLeft: chatImgOption.loading ? '20px' : '0px' }"
      >
        <div class="loaders" v-if="chatImgOption.loading"></div>
        <div class="loading-text">{{ chatImgOption.loading ? '正在创作中...' : '创作完成!' }}</div>
      </div>
      <div class="gptImgBox-right-content">
        <skeletonPage
          :count="chatImgOption.imgCount"
          :show-loading="chatImgOption.loading"
          :animation="chatImgOption.loading"
          :size="imgSize"
        ></skeletonPage>
        <div class="imglist" v-if="!chatImgOption.loading">
          <div
            class="imgs"
            :style="imgSize"
            v-for="(item, index) in chatImgOption.imgCount"
            :key="index"
          >
            <el-image
              :src="imgSrcList[index]"
              :style="imgSize"
              :min-scale="0.2"
              :max-scale="2"
              :zomm-rate="1.5"
              :preview-src-list="imgSrcList"
              :initial-index="index"
            ></el-image>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'gptPic',
};
</script>
<script setup>
import skeletonPage from '@/components/Skeleton/index.vue';

const props = defineProps({
  chatImgOption: {
    type: Object,
    default: () => {},
  },
});

console.log(props.chatImgOption);

// 图片长宽
const imgSize = ref({
  width: '400px',
  height: '400px',
});

const imgSrcList = ref([]);

if (!props.chatImgOption.loading) {
  for (let i = 0; i < props.chatImgOption.urls.length; i++) {
    imgSrcList.value.push('data:image/jpeg;base64,' + props.chatImgOption.urls[i].b64_image);
  }
}
</script>
<style lang="scss" scoped>
.pic-container {
  background: $base-color-white;
  padding: 10px 22px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  border-radius: $base-gpt-borer-radius;
}

.gptImgBox-left {
  width: 40px;
  height: 40px;
  margin-right: 15px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.gptImgBox-right {
  flex: 1;
  width: 0;
  min-height: 123px;
  font-size: 18px;
  color: $base-font-color;
  line-height: 43px;
  position: relative;

  .gptImgBox-right-header {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 20px;
    text-align: center;

    .loading-text {
      margin-left: 20px;
    }
  }

  .imglist {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;

    .imgs {
      margin: 0 20px 20px 0;
      overflow: hidden;
      border-radius: 20px;
    }
  }
}
</style>

<style scoped lang="scss">
/* HTML: <div class="loader"></div> */
.loaders {
  width: 10px;
  aspect-ratio: 1;
  color: $base-color-primary;
  background: currentColor;
  border-radius: 50%;
  position: relative;
}
.loaders:before {
  content: '';
  position: absolute;
  background: radial-gradient(farthest-side at bottom right, #0000 94%, currentColor 96%) 0 0,
    radial-gradient(farthest-side at bottom left, #0000 94%, currentColor 96%) 100% 0,
    radial-gradient(farthest-side at top left, #0000 94%, currentColor 96%) 100% 100%,
    radial-gradient(farthest-side at top right, #0000 94%, currentColor 96%) 0 100%;
  background-size: 10px 10px;
  background-repeat: no-repeat;
  animation: l39-1 1s infinite, l39-2 1s infinite;
}
@keyframes l39-1 {
  0%,
  10%,
  90%,
  100% {
    inset: 0;
  }
  40%,
  60% {
    inset: -10px;
  }
}

@keyframes l39-2 {
  0%,
  40% {
    transform: rotate(0);
  }
  60%,
  100% {
    transform: rotate(90deg);
  }
}
</style>