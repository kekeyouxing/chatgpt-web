<script setup lang="ts">
import { NButton, NCard, NInput, NScrollbar } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import List from './List.vue'
import { useCorrect } from './hooks/useCorrect'

import { TextComponent } from './components'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { SvgIcon } from '@/components/common'
import { copyText } from '@/utils/format'
import { rl } from '@/utils/redlines'
import { fetchCorrectAPIProcess } from '@/api'
import { useScroll } from '@/views/chat/hooks/useScroll'
import { t } from '@/locales'
import { useCorrectStore } from '@/store'

const route = useRoute()
const correctStore = useCorrectStore()
const { isMobile } = useBasicLayout()
const { addCorrect, updateCorrectSome } = useCorrect()
const { scrollToBottomIfAtBottom } = useScroll()

// const prompt = ref<string>('')
const loading = ref<boolean>(false)
let controller = new AbortController()

const { uuid } = route.params as { uuid: string }

const dataSource = computed(() => correctStore.getCorrectByUuid(+uuid))

const buttonDisabled = computed(() => {
  const correctData = correctStore.getCorrectByUuid((+uuid))
  return loading.value || !correctData.textQuestion || correctData.textQuestion.trim() === ''
})
const textRef = ref<HTMLElement>()
function copySuggestion() {
  const correctData = correctStore.getCorrectByUuid((+uuid))
  copyText({ text: correctData.textSuggestion ?? '' })
}
function handleDownLoad() {

}
function copyPrompt() {
  const correctData = correctStore.getCorrectByUuid((+uuid))
  copyText({ text: correctData.textQuestion ?? '' })
}
function copyAnswer() {
  const correctData = correctStore.getCorrectByUuid((+uuid))
  copyText({ text: correctData.textAnswer ?? '' })
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
  const message = correctStore.getCorrectByUuid(+uuid).textQuestion

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  loading.value = true

  addCorrect(+uuid, {
    dateTime: new Date().toLocaleString(),
    textQuestion: message,
    textAnswer: '',
    textAnswerMd: '',
    textSuggestion: '',
  })
  controller = new AbortController()

  try {
    let lastText = ''
    const fetchCorrectionApiOnce = async () => {
      await fetchCorrectAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        bizType: 1,
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
            rl.setTest(lastText)
            let endIndex = lastText.length
            if (lastText.length > message.length)
              endIndex = message.length
            rl.setSource(message.substring(0, endIndex))
            updateCorrectSome(
              +uuid, { textAnswer: lastText, textAnswerMd: rl.getOutputMarkdown() },
            )
            if (data.detail.choices[0].finish_reason === 'length') {
              // todo
            }
            scrollToBottomIfAtBottom()
          }
          catch (error) {
            //
          }
        },
      })
      // return data
      updateCorrectSome(+uuid, { loading: false })
    }
    await fetchCorrectionApiOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateCorrectSome(
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
      <div class="flex flex-col gap-4">
        <NCard title="原文" header-extra-style="gap:1rem">
          <template #header-extra>
            <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
              <template #icon>
                <SvgIcon icon="wpf:sent" class="text-3xl" />
              </template>
            </NButton>
            <NButton v-if="loading" type="error" @click="handleStop">
              <template #icon>
                <SvgIcon icon="ri:stop-circle-line" class="text-3xl" />
              </template>
              stop
            </NButton>
            <NButton @click="handleDownLoad">
              <template #icon>
                <SvgIcon icon="material-symbols:download" class="text-3xl" />
              </template>
            </NButton>
            <NButton @click="copyPrompt">
              <template #icon>
                <SvgIcon icon="ph:copy-light" class="text-3xl" />
              </template>
            </NButton>
          </template>
          <NInput
            v-model:value="correctStore.getCorrectByUuid(+uuid).textQuestion"
            type="textarea"
            placeholder="请输入您需要修正的内容"
            :autosize="{
              minRows: 8,
              maxRows: 20,
            }"
          />
        </NCard>
        <NCard v-if="dataSource.textAnswerMd !== ''" title="修正后内容" header-extra-style="gap:1rem">
          <template #header-extra>
            <NButton @click="copyAnswer">
              <template #icon>
                <SvgIcon icon="ph:copy-light" class="text-3xl" />
              </template>
            </NButton>
          </template>
          <TextComponent
            ref="textRef"
            :text="dataSource.textAnswerMd ?? ''"
            :loading="loading"
            :as-raw-text="false"
          />
        </NCard>
      </div>
    </NScrollbar>
  </div>
</template>
