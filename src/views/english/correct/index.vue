<script setup lang="ts">
import { NButton, NCard, NInput, NPopover, NScrollbar } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCorrect } from '../hooks/useCorrect'

import { TextComponent } from '../components'
import List from './List.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { SvgIcon } from '@/components/common'
import { copyText } from '@/utils/format'
import { rl } from '@/utils/redlines'
import { fetchCorrectAPIProcess } from '@/api'
import { useCorrectStore } from '@/store'
enum ErrorType {
  OpenAIError = '哎呀，系统好像出错啦～',
}
const route = useRoute()
const correctStore = useCorrectStore()
const { isMobile } = useBasicLayout()
const { addCorrect, updateCorrectSome } = useCorrect()

// const prompt = ref<string>('')
const loading = ref<boolean>(false)
let controller = new AbortController()

const { uuid } = route.params as { uuid: string }

const dataSource = computed(() => correctStore.getCorrectByUuid(+uuid))

const buttonDisabled = computed(() => {
  return loading.value || !dataSource.value.textQuestion || dataSource.value.textQuestion.trim() === ''
})
const textRef = ref<HTMLElement>()
function handleDownLoad() {

}
function copyPrompt() {
  copyText({ text: dataSource.value.textQuestion ?? '' })
}
function copyAnswer() {
  copyText({ text: dataSource.value.textAnswer ?? '' })
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
  })
  controller = new AbortController()

  try {
    let lastText = ''
    const fetchCorrectionApiOnce = async () => {
      await fetchCorrectAPIProcess<Chat.ConversationResponse>({
        prompt: message,
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
            if (lastText === ErrorType.OpenAIError) {
              updateCorrectSome(
                +uuid, { textAnswer: ErrorType.OpenAIError, textAnswerMd: rl.getErrorOutputMarkdown(lastText) },
              )
              return
            }

            rl.setTest(lastText)
            let endIndex = lastText.length
            if (message.length - lastText.length < message.length * 0.2)
              endIndex = message.length
            rl.setSource(message.substring(0, endIndex))
            updateCorrectSome(
              +uuid, { textAnswer: lastText, textAnswerMd: rl.getOutputMarkdown() },
            )
            // scrollToBottomIfAtBottom()

            // todo 优化length
            // if (data.detail.choices[0].finish_reason === 'length')
            // toast.success('已经到达最大长度')
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
    // const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateCorrectSome(
        +uuid,
        {
          loading: false,
        },
      )
      // scrollToBottomIfAtBottom()
      return
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-row h-full">
    <div class="flex-none w-60 border-r">
      <List />
    </div>
    <NScrollbar class="p-4">
      <NCard title="原文" header-extra-style="gap:1rem">
        <template #header-extra>
          <NPopover trigger="hover">
            <template #trigger>
              <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
                <template #icon>
                  <SvgIcon icon="wpf:sent" class="text-3xl" />
                </template>
              </NButton>
            </template>
            <span>发送</span>
          </NPopover>
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
              <NButton @click="copyPrompt">
                <template #icon>
                  <SvgIcon icon="ph:copy-light" class="text-3xl" />
                </template>
              </NButton>
            </template>
            <span>复制</span>
          </NPopover>
        </template>
        <NInput
          v-model:value="dataSource.textQuestion"
          type="textarea"
          placeholder="请输入您需要修正的内容"
          :autosize="{
            minRows: 8,
            maxRows: 20,
          }"
        />
      </NCard>
      <NCard v-if="dataSource.textAnswerMd !== ''" title="修正内容" header-extra-style="gap:1rem">
        <TextComponent
          ref="textRef"
          :text="dataSource.textAnswerMd ?? ''"
          :loading="loading"
          :html-text="true"
        />
      </NCard>
      <NCard v-if="dataSource.textAnswer !== ''" title="完整内容" header-extra-style="gap:1rem">
        <template #header-extra>
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
          ref="textRef"
          :text="dataSource.textAnswer ?? ''"
          :loading="loading"
          :html-text="false"
        />
      </NCard>
    </NScrollbar>
  </div>
</template>
