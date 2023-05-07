<script lang="ts" setup>
import { h, onMounted, reactive, ref } from 'vue'
import { NButton, NDataTable, NInputNumber, NModal, useMessage } from 'naive-ui'
import { addTimes, generateAccount, getUserList } from '@/api'

const message = useMessage()
const data = ref([])
const times = ref(0)
const show = ref(false)
const userId = ref(null)
const params = ref({
  pageNum: 1,
  pageSize: 10,
  name: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: async (page) => {
    pagination.page = page
    params.value.pageNum = page
    const res = await getUserList(params.value)
    console.log('res', res)
    data.value = res.data.items
    pagination.itemCount = res.data.count
  },
  onUpdatePageSize: async (pageSize) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    params.value.pageSize = pageSize
    const res = await getUserList(params.value)
    console.log('res', res)
    data.value = res.data.items
    pagination.itemCount = res.data.count
  },
})

async function getList() {
  const res = await getUserList(params.value)
  console.log('res', res)
  data.value = res.data.items
  pagination.itemCount = res.data.count
}
onMounted(() => {
  getList()
})

async function add() {
  await addTimes({ id: userId.value, times: times.value })
  message.info('操作成功')
  times.value = 0
  show.value = false
  getList()
}

function handleAdd(row) {
  userId.value = row.id
  show.value = true
}

async function generate() {
  await generateAccount()
}

const columns = [{
  title: '用户名',
  key: 'name',
},
{
  title: '次数',
  key: 'gpt_times',
},
{
  title: '操作',
  key: 'actions',
  render(row) {
    return h(
      NButton,
      {
        type: 'info',
        size: 'small',
        onClick: () => handleAdd(row),
      },
      { default: () => '增加次数' },
    )
  },
}]
</script>

<template>
  <div>
    <div style="margin:30px;">
      <NButton @click="generate">
        批量生成账号
      </NButton>
    </div>
    <NDataTable
      :columns="columns"
      :data="data"
      :bordered="false"
      :pagination="pagination"
    />
    <NModal
      :show="show" preset="dialog" positive-text="确认" negative-text="取消" @positive-click="add" @negative-click="show = false"
    >
      <template #header>
        <div>请输入要增加的次数</div>
      </template>
      <NInputNumber v-model:value="times" :show-button="false" />
    </NModal>
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
