import { defineStore } from 'pinia'
import { getLocalState, setLocalState } from '@/store/modules/correct/helper'
import { router } from '@/router'

export const useCorrectStore = defineStore('correct-store', {
  state: (): Correct.CorrectState => getLocalState(),
  getters: {
    getCorrectByUuid(state: Correct.CorrectState) {
      return (uuid?: number) => {
        if (uuid)
          return state.correct.find(item => item.uuid === uuid)?.data ?? { dateTime: '', textAnswer: '', textQuestion: '', textSuggestion: '', textAnswerMd: '' }
        return state.correct.find(item => item.uuid === state.active)?.data ?? { dateTime: '', textAnswer: '', textQuestion: '', textSuggestion: '', textAnswerMd: '' }
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
      await router.push({ name: 'Correct', params: { uuid } })
    },

    async deleteHistory(index: number) {
      this.history.splice(index, 1)
      this.correct.splice(index, 1)

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

    addHistory(history: Correct.History, correctData: Correct.CorrectData = { dateTime: '', textQuestion: '', textAnswer: '', textSuggestion: '', loading: false, textAnswerMd: '' }) {
      this.history.unshift(history)
      this.correct.unshift({ uuid: history.uuid, data: correctData })
      this.active = history.uuid
      this.reloadRoute(history.uuid)
    },

    addCorrectByUuid(uuid: number, correct: Correct.CorrectData) {
      if (!uuid || uuid === 0) {
        if (this.history.length === 0) {
          const uuid = Date.now()
          this.history.push({ uuid, title: correct.textQuestion, isEdit: false })
          this.correct.push({ uuid, data: correct })
          this.active = uuid
          this.recordState()
        }
        else {
          this.correct[0].data = correct
          if (this.history[0].title === 'Correction')
            this.history[0].title = correct.textQuestion
          this.recordState()
        }
      }

      const index = this.correct.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.correct[index].data = correct
        if (this.history[index].title === 'Correction')
          this.history[index].title = correct.textQuestion
        this.recordState()
      }
    },

    updateCorrectByUuid(uuid: number, correct: Correct.CorrectData) {
      if (!uuid || uuid === 0) {
        if (this.correct.length) {
          this.correct[0].data = correct
          this.recordState()
        }
        return
      }
      const index = this.correct.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.correct[index].data = correct
        this.recordState()
      }
    },
    updateCorrectSomeByUuid(uuid: number, correct: Partial<Correct.CorrectData>) {
      if (!uuid || uuid === 0) {
        if (this.correct.length) {
          this.correct[0].data = { ...this.correct[0].data, ...correct }
          this.recordState()
        }
        return
      }

      const correctIndex = this.correct.findIndex(item => item.uuid === uuid)
      if (correctIndex !== -1) {
        this.correct[correctIndex].data = { ...this.correct[correctIndex].data, ...correct }
        this.recordState()
      }
    },
  },
})
