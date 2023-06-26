import { defineStore } from 'pinia'
import { getLocalState, setLocalState } from '@/store/modules/writing/helper'
import { router } from '@/router'

export const useWritingStore = defineStore('writing-store', {
  state: (): Writing.WritingState => getLocalState(),
  getters: {
    getWritingByUuid(state: Writing.WritingState) {
      return (uuid?: number) => {
        if (uuid)
          return state.writing.find(item => item.uuid === uuid)?.data ?? { dateTime: '', title: '', difficulty: 1, answer: '', random: 0 }
        return state.writing.find(item => item.uuid === state.active)?.data ?? { dateTime: '', title: '', difficulty: 1, answer: '', random: 0 }
      }
    },
  },
  actions: {
    updateHistory(uuid: number, edit: Partial<Chat.History>) {
      const index = this.history.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.history[index] = { ...this.history[index], ...edit }
        this.recordState()
      }
    },

    recordState() {
      setLocalState(this.$state)
    },

    async setActive(uuid: number) {
      this.active = uuid
      return await this.reloadRoute(uuid)
    },

    async reloadRoute(uuid?: number) {
      this.recordState()
      await router.push({ name: 'Writing', params: { uuid } })
    },

    async deleteHistory(index: number) {
      this.history.splice(index, 1)
      this.writing.splice(index, 1)

      if (this.history.length === 0) {
        this.active = null
        this.reloadRoute()
        return
      }

      if (index > 0 && index <= this.history.length) {
        const uuid = this.history[index - 1].uuid
        this.active = uuid
        this.reloadRoute(uuid)
        return
      }

      if (index === 0) {
        if (this.history.length > 0) {
          const uuid = this.history[0].uuid
          this.active = uuid
          this.reloadRoute(uuid)
        }
      }

      if (index > this.history.length) {
        const uuid = this.history[this.history.length - 1].uuid
        this.active = uuid
        this.reloadRoute(uuid)
      }
    },

    addHistory(history: Writing.History, writingData: Writing.WritingData = { dateTime: '', title: '', difficulty: 1, answer: '', random: 0 }) {
      this.history.unshift(history)
      this.writing.unshift({ uuid: history.uuid, data: writingData })
      this.active = history.uuid
      this.reloadRoute(history.uuid)
    },

    addWritingByUuid(uuid: number, writing: Writing.WritingData) {
      if (!uuid || uuid === 0) {
        if (this.history.length === 0) {
          const uuid = Date.now()
          this.history.push({ uuid, title: writing.title, isEdit: false })
          this.writing.push({ uuid, data: writing })
          this.active = uuid
          this.recordState()
        }
        else {
          this.writing[0].data = writing
          if (this.history[0].title === 'Writing')
            this.history[0].title = writing.title
          this.recordState()
        }
      }

      const index = this.writing.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.writing[index].data = writing
        if (this.history[index].title === 'Writing')
          this.history[index].title = writing.title
        this.recordState()
      }
    },

    updateWritingByUuid(uuid: number, writing: Writing.WritingData) {
      if (!uuid || uuid === 0) {
        if (this.writing.length) {
          this.writing[0].data = writing
          this.recordState()
        }
        return
      }
      const index = this.writing.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.writing[index].data = writing
        this.recordState()
      }
    },
    updateWritingSomeByUuid(uuid: number, writing: Partial<Writing.WritingData>) {
      if (!uuid || uuid === 0) {
        if (this.writing.length) {
          this.writing[0].data = { ...this.writing[0].data, ...writing }
          this.recordState()
        }
        return
      }

      const writingIndex = this.writing.findIndex(item => item.uuid === uuid)
      if (writingIndex !== -1) {
        this.writing[writingIndex].data = { ...this.writing[writingIndex].data, ...writing }
        this.recordState()
      }
    },
  },
})
