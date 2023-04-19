<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NForm, NFormItem, NInput, useMessage } from 'naive-ui'
import { login, register } from '@/api'
import { useAuthStore } from '@/store'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
const model = ref({
  name: '',
  password: '',
  checkPassword: '',
})

function validatePasswordSame(rule, value) {
  return value === model.value.password
}

const rules = {
  name: [
    {
      required: true,
      message: '请输入用户名',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
    },
  ],
  checkPassword: [
    {
      required: true,
      message: '请再次输入密码',
      trigger: ['input', 'blur'],
    },
    {
      validator: validatePasswordSame,
      message: '两次密码输入不一致',
      trigger: ['blur'],
    },
  ],
}

const isLogin = ref(true)

const loginForm = ref(null)

function handleLogin() {
  loginForm.value?.validate(async (errors: boolean) => {
    if (!errors) {
      try {
        if (isLogin.value) {
          const res = await login(model.value)
          console.log('res', res)
          authStore.setToken(res.data.token)
          router.push('/')
        }
        else {
          await register(model.value)
          message.success('注册成功')
          isLogin.value = true
        }
      }
      catch (error: any) {
        message.error(error.message)
      }
    }
  })
}
</script>

<template>
  <div class="flex h-full">
    <NCard class="card" :title="isLogin ? '登录' : '注册'">
      <NForm ref="loginForm" :model="model" :rules="rules">
        <NFormItem path="name" label="用户名">
          <NInput v-model:value="model.name" @keydown.enter.prevent />
        </NFormItem>
        <NFormItem path="password" label="密码">
          <NInput
            v-model:value="model.password"
            type="password"
          />
        </NFormItem>
        <NFormItem v-if="!isLogin" path="checkPassword" label="确认密码">
          <NInput
            v-model:value="model.checkPassword"
            type="password"
          />
        </NFormItem>

        <NFormItem>
          <NButton type="primary" @click="handleLogin">
            {{ isLogin ? '登录' : '注册' }}
          </NButton>
          <NButton text class="btn-text" @click="isLogin = !isLogin">
            {{ isLogin ? '没有账号？去注册' : '返回登录' }}
          </NButton>
        </NFormItem>
      </NForm>
    </NCard>
  </div>
</template>

<style lang="less" scoped>
.card{
  width: 350px;
  margin: auto;
}

.btn-text{
  position: absolute;
  right: 0;
}
</style>
