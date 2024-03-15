<template>
  <div class="gpt-userBox">
    <div class="userBox-left">{{ userText }} </div>
    <div class="userBox-right">
      <icon-user :size="20" fill="#ffffff"></icon-user>
    </div>
  </div>
</template>

<script>
export default {
  name: 'gptUser',
};
</script>
<script setup>
const props = defineProps({
  userText: {
    type: String,
    default: '',
  },
});



</script>
<style lang="scss" scoped>
.gpt-userBox {
  width: 100%;
  padding: 20px 22px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;

  .userBox-left {
    flex: 1;
    font-size: 18px;
    color: $base-font-color;
    line-height: 43px;
    white-space: pre-wrap;
    word-break: break-all;
    margin-right: 15px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }
  .userBox-right {
    width: 40px;
    height: 40px;
    background: $base-color-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $base-border-radius-circle;
  }
}
</style>