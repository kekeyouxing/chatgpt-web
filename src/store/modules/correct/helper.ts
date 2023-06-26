import { ss } from '@/utils/storage'

const LOCAL_NAME = 'correctStorage'

export function defaultState(): Correct.CorrectState {
  const uuid = 1002
  return {
    active: uuid,
    usingContext: true,
    history: [{ uuid, title: 'Correction', isEdit: false }],
    correct: [{ uuid, data: { dateTime: '', textAnswer: '', textQuestion: '', textAnswerMd: '' } }],
  }
}

export function getLocalState(): Correct.CorrectState {
  const localState = ss.get(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export function setLocalState(state: Correct.CorrectState) {
  ss.set(LOCAL_NAME, state)
}
