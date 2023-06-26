import { ss } from '@/utils/storage'

const LOCAL_NAME = 'writingStorage'

export function defaultState(): Writing.WritingState {
  const uuid = 1002
  return {
    active: uuid,
    usingContext: true,
    history: [{ uuid, title: 'Writing', isEdit: false }],
    writing: [{ uuid, data: { dateTime: '', title: '', difficulty: 1, answer: '', random: 0 } }],
  }
}

export function getLocalState(): Writing.WritingState {
  const localState = ss.get(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export function setLocalState(state: Writing.WritingState) {
  ss.set(LOCAL_NAME, state)
}
