<script setup lang="ts">
import { NButton, NCard, NInput, NPopover, NRadioButton, NRadioGroup, NScrollbar, NSlider } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { TextComponent } from '../components'
import List from './List.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { SvgIcon } from '@/components/common'
import { copyText } from '@/utils/format'
import { fetchWritingAPI } from '@/api'
import { useScroll } from '@/views/chat/hooks/useScroll'
import { t } from '@/locales'
import { useWritingStore } from '@/store'
import { useWriting } from '@/views/english/hooks/useWriting'
enum BizType {
  Correct = 1,
}
const route = useRoute()
const writingStore = useWritingStore()
const { isMobile } = useBasicLayout()
const { addWriting, updateWritingSome } = useWriting()
const { scrollToBottomIfAtBottom } = useScroll()

// const prompt = ref<string>('')
const loading = ref<boolean>(false)
let controller = new AbortController()

const { uuid } = route.params as { uuid: string }

const dataSource = computed(() => writingStore.getWritingByUuid(+uuid))

const buttonDisabled = computed(() => {
  return loading.value || !dataSource.value.title || dataSource.value.title.trim() === ''
})

const difficultyOptions = [
  {
    label: '四级（150词）',
    value: 1,
  },
  {
    label: '六级（180词）',
    value: 2,
  },
  {
    label: '专四（200词）',
    value: 3,
  },
  {
    label: '专八（300词）',
    value: 4,
  },
]

const textRef = ref<HTMLElement>()
function handleDownLoad() {

}
function copyAnswer() {
  const writingData = writingStore.getWritingByUuid((+uuid))
  copyText({ text: writingData.answer ?? '' })
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}
function handleSubmit() {
  onConversation()
}

async function onConversation() {
  const message = dataSource.value.title

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  loading.value = true

  addWriting(+uuid, {
    dateTime: new Date().toLocaleString(),
    difficulty: dataSource.value.difficulty,
    random: dataSource.value.random,
    title: message,
    answer: '',
  })
  controller = new AbortController()

  try {
    let lastText = ''
    const fetchWritingAPIOnce = async () => {
      await fetchWritingAPI<Chat.ConversationResponse>({
        title: message,
        random: dataSource.value.random,
        difficulty: dataSource.value.difficulty,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            lastText = data.text ?? ''
            console.log(lastText)
            updateWritingSome(
              +uuid, { answer: lastText },
            )
            if (data.detail.choices[0].finish_reason === 'length')
            // toast.success('已经到达最大长度')

              scrollToBottomIfAtBottom()
          }
          catch (error) {
            //
          }
        },
      })
      // return data
      updateWritingSome(+uuid, { loading: false })
    }
    await fetchWritingAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateWritingSome(
        +uuid,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<!-- flex-1 min-h-0 pb-4 overflow-hidden -->
<template>
  <div class="flex flex-row h-full">
    <div class="flex-none w-60 border-r">
      <List />
    </div>
    <NScrollbar class="p-4">
      <NCard title="作文" header-extra-style="gap:1rem">
        <template #header-extra>
          <NButton v-if="loading" type="error" @click="handleStop">
            <template #icon>
              <SvgIcon icon="ri:stop-circle-line" class="text-3xl" />
            </template>
          </NButton>
          <NPopover trigger="hover">
            <template #trigger>
              <NButton @click="handleDownLoad">
                <template #icon>
                  <SvgIcon icon="material-symbols:download" class="text-3xl" />
                </template>
              </NButton>
            </template>
            <span>导出</span>
          </NPopover>
          <NPopover trigger="hover">
            <template #trigger>
              <NButton @click="copyAnswer">
                <template #icon>
                  <SvgIcon icon="ph:copy-light" class="text-3xl" />
                </template>
              </NButton>
            </template>
            <span>复制</span>
          </NPopover>
        </template>
        <TextComponent
          v-if="!(dataSource.answer && dataSource.answer.trim() === '')"
          :text="dataSource.answer ?? ''"
          :html-text="false"
        />
      </NCard>
    </NScrollbar>
    <div class="flex flex-col gap-8 pt-4 pr-4">
      <div>
        <NPopover trigger="hover" content-style="max-width: 16rem" placement="right">
          <template #trigger>
            <span class="text-base">写作内容</span>
          </template>
          <span class="text-gray-500 text-sm font-sans text-justify">
            告诉我，你想写点什么～
          </span>
        </NPopover>
        <NInput
          v-model:value="dataSource.title"
          placeholder="告诉我，你想写点什么～" type="textarea"
          clearable
          :autosize="{
            minRows: 4,
            maxRows: 4,
          }"
        />
      </div>
      <div>
        <NPopover content-style="max-width: 16rem" trigger="hover" placement="right">
          <template #trigger>
            <span class="text-base">难度</span>
          </template>
          <span class="text-gray-500 text-sm font-sans text-justify">
            难度越大，生成的文章字数越多，内容更丰富，行文更高雅
          </span>
        </NPopover>
        <div class="mt-1">
          <NRadioGroup v-model:value="dataSource.difficulty">
            <NRadioButton
              v-for="difficulty in difficultyOptions"
              :key="difficulty.value"
              :value="difficulty.value"
              :label="difficulty.label"
            />
          </NRadioGroup>
        </div>
      </div>
      <div>
        <NPopover content-style="max-width: 16rem" trigger="hover" placement="right">
          <template #trigger>
            <span class="text-base">随机性</span>
          </template>
          <span class="text-gray-500 text-sm font-sans text-justify">随机值越大，生成的文章更加随机；随机值越小，生成的文章更加确定和重复</span>
        </NPopover>
        <NSlider v-model:value="dataSource.random" class="mt-1" :step="0.01" :min="0" :max="2" />
      </div>
      <NButton type="primary" :disabled="buttonDisabled" round @click="handleSubmit">
        生成文章
      </NButton>
    </div>
  </div>
</template>
