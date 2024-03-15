<template>
  <el-drawer
    v-model="props.show"
    size="30%"
    append-to-body
    :before-close="handleClose"
    title="图片配置"
  >
    <div class="drawer-content">
      <el-form
        ref="ruleFormRef"
        :model="formQuery"
        label-width="100px"
        label-position="top"
        :rules="formRules"
      >
        <el-form-item label="prompt" prop="prompt">
          <el-input
            type="textarea"
            maxlength="1000"
            show-word-limit
            v-model="formQuery.prompt"
            placeholder="请输入提示词"
          ></el-input>
        </el-form-item>

        <el-form-item label="negative_prompt">
          <el-input
            type="textarea"
            maxlength="1000"
            show-word-limit
            v-model="formQuery.negative_prompt"
            placeholder="请输入不想生成的提示词"
          ></el-input>
        </el-form-item>

        <el-form-item label="size">
          <el-select v-model="formQuery.size" placeholder="">
            <el-option
              v-for="item in resolution"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="图片数量">
          <div class="slider">
            <el-slider v-model="formQuery.n" show-input :max="4" :min="1" />
          </div>
        </el-form-item>

        <el-form-item label="生成图片风格">
          <div class="styleBard">
            <div class="more" @click="onMore">更多</div>
            <div class="styleBard-list" :style="{ height: styleOption.height }">
              <div
                @click="onStyle(item, index)"
                class="styleBard-list-item"
                :class="{ active: index == styleIndex }"
                v-for="(item, index) in styleData"
                :key="item.id"
              >
                <div class="base">
                  <img :src="item.img" alt="" />
                </div>
                <span>{{ item.name }}</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="提示词相关性">
          <div class="wordTag">
            <div
              class="tags"
              :class="{ active: tagsIndex == index }"
              @click="onTags(item, index)"
              v-for="(item, index) in tags"
              :key="item.id"
              >{{ item.name }}({{ item.scale }})</div
            >
          </div>
        </el-form-item>

        <el-form-item label="采样数量">
          <div style="padding: 0 20px; width: 100%">
            <el-slider v-model="formQuery.steps" :min="20" :max="50"></el-slider>
          </div>
        </el-form-item>

        <el-form-item label="采样方式">
          <div class="samplingBox">
            <div class="samplingBox-item" v-for="item in samplingOption" :key="item.id">
              <div class="samplingBox-item-header">方式1：{{ item.name }}</div>
              <div class="samplingBox-item-list">
                <div
                  @click="onSampling(el)"
                  :class="{ active: samplingOptionIndex == el.name }"
                  class="samplingBox-item-list-tag ellipsis"
                  v-for="el in item.samplingArr"
                  :key="el.id"
                  >{{ el.name }}</div
                >
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="随机种子">
          <el-input v-model="formQuery.seed" placeholder="请输入随机种子">
            <template #prepend>
              <div class="randSeed" @click="generateRandom">随机</div>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div style="margin: 10px 0 20px; display: flex; justify-content: flex-end">
            <el-button type="primary" @click="onSubmit(ruleFormRef)">提交</el-button>
            <el-button @click="handleClose">清空</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </el-drawer>
</template>
<script>
export default {
  name: 'drawer',
};
</script>
<script setup>
import { resolution, styleData, tags, samplingOption } from '@/utils/styleData.js';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const styleOption = ref({
  height: '93px',
});
const styleIndex = ref(0);
const tagsIndex = ref(0);
const samplingOptionIndex = ref('Euler a');
const ruleFormRef = ref(null);
const formRules = ref({
  prompt: [{ required: true, message: '请使用中文或英文描述想要生成的画面内容', trigger: 'blur' }],
});
const formQuery = ref({
  // 内容
  prompt: '',
  // 不想生成的内容
  negative_prompt: '',
  // 生成图片长宽
  size: '1024x1024',
  // 生成图片数量
  n: 1,
  // 迭代轮次
  steps: 20,
  // 采样方式
  sampler_index: 'Euler a',
  // 随机种子
  seed: null,
  // 提示词相关性
  cfg_scale: 10,
  // 生成风格
  style: 'Base',
});
const emit = defineEmits(['update:show', 'onSubmit']);

const handleClose = (e) => {
  if (e) {
    emit('update:show', false);
    formQuery.value = {
      // 内容
      prompt: '',
      // 不想生成的内容
      negative_prompt: '',
      // 生成图片长宽
      size: '1024x1024',
      // 生成图片数量
      n: 1,
      // 迭代轮次
      steps: 20,
      // 采样方式
      sampler_index: 'Euler a',
      // 随机种子
      seed: null,
      // 提示词相关性
      cfg_scale: 10,
      // 生成风格
      style: 'Base',
    };

    samplingOptionIndex.value = 'Euler a';
  }
};

//  style 更多
const onMore = () => {
  if (styleOption.value.height == '93px') {
    styleOption.value.height = 'auto';
  } else {
    styleOption.value.height = '93px';
  }
};

// 切换 style 类型
const onStyle = (item, index) => {
  console.log(index, 'onstyle');
  styleIndex.value = index;
  formQuery.value.style = item.style;
};

// 切换采样相关性
const onTags = (item, index) => {
  tagsIndex.value = index;
  formQuery.value.cfg_scale = item.scale;
};

// 切换采样方式
const onSampling = (item) => {
  samplingOptionIndex.value = item.name;
  formQuery.value.sampler_index = item.name;
};

// 随机种子
const seedrandom = (seed) => {
  const m = 0xffffffff; // 2^32 - 1
  const a = 1664525;
  const c = 1013904223;
  // 计算下一个随机数
  seed = (a * seed + c) % m;
  // 返回随机数
  return seed >>> 0; // 使用无符号右移来确保结果为正数
};
const generateRandom = () => {
  const seed = new Date().getTime();
  formQuery.value.seed = seedrandom(seed);
};

// 提交数据
const onSubmit = async (formEl) => {
  if (!formEl) return;

  await formEl.validate((valid) => {
    if (valid) {
      emit('update:show', false);
      emit('onSubmit', formQuery.value);
    } else {
      console.log('error submit');
    }
  });
};
</script>
<style lang="scss" scoped>
.drawer-content {
  width: 100%;
  height: 100%;
}

.slider {
  width: 100%;
  padding-left: 12px;
}

.styleBard {
  width: 100%;
  height: 100%;
  position: relative;

  .more {
    position: absolute;
    right: 0;
    top: -31px;
    font-size: 12px;
    color: $base-color-primary;
    cursor: pointer;
  }

  .styleBard-list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;

    .styleBard-list-item:nth-child(5n) {
      margin-right: 0;
    }
    .styleBard-list-item {
      border: 1px solid transparent;
      height: 63px;
      width: 95px;
      margin: 0 12px 32px 0;
      position: relative;
      cursor: pointer;

      &:hover {
        border-color: $base-color-primary;

        span {
          color: $base-color-primary;
        }
      }

      .base {
        width: 100%;
        height: 100%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
        }
      }

      span {
        position: absolute;
        bottom: -30px;
        left: 0;
        width: 100%;
        text-align: center;
      }
    }

    .active {
      border-color: $base-color-primary;

      span {
        color: $base-color-primary;
      }
    }
  }
}

.wordTag {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .tags {
    padding: 0 12px;
    height: 32px;
    border: 1px solid #e8e9eb;
    cursor: pointer;
    text-align: center;
    line-height: 32px;

    &:hover {
      border-color: $base-color-primary;
      color: $base-color-primary;
    }
  }

  .active {
    border-color: $base-color-primary;
    color: $base-color-primary;
  }
}

.samplingBox {
  width: 100%;
  height: 100%;
  border: 1px solid #e8e9eb;
  border-radius: 4px;
  margin: 0 4px;
  padding: 12px 12px 0;

  .samplingBox-item {
    width: 100%;

    .samplingBox-item-header {
      width: 100%;
      line-height: 20px;
      margin-bottom: 12px;
    }

    .samplingBox-item-list {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-start;

      .samplingBox-item-list-tag {
        border: 1px solid #e8e9eb;
        border-radius: 4px;
        margin-bottom: 12px;
        padding: 0 4px;
        width: 110px;
        text-align: center;
        cursor: pointer;

        &:hover {
          border-color: $base-color-primary;
          color: $base-color-primary;
        }
      }

      .active {
        border-color: $base-color-primary;
        color: $base-color-primary;
      }
    }
  }
}
.randSeed {
  padding: 0 10px;
  height: 34px;
  background: $base-color-primary;
  color: #ffffff;
  cursor: pointer;
}
.ellipsis {
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 显示省略号 */
}
</style>
<style scoped>
:deep(.el-drawer__body) {
  padding: 0 20px 20px !important;
}
:deep(.el-input-group__prepend){
  padding: 5px !important; 
}
</style>





