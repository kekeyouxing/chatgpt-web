declare namespace Writing{
	interface History {
		title: string
		isEdit: boolean
		uuid: number
	}

	interface WritingData {
		dateTime: string
		title: string
		difficulty: number
		answer: string
		random: number
		loading?: boolean
	}
	interface WritingState {
		active: number | null
		usingContext: boolean;
		history: History[]
		writing: { uuid: number; data: WritingData }[]
	}
	// stop: API returned complete model output
	// length: Incomplete model output due to max_tokens parameter or token limit
	// content_filter: Omitted content due to a flag from our content filters
	// null: API response still in progress or incomplete
	interface ConversationResponse {
		conversationId: string
		detail: {
			choices: { finish_reason: string; index: number; logprobs: any; text: string }[]
			created: number
			id: string
			model: string
			object: string
			usage: { completion_tokens: number; prompt_tokens: number; total_tokens: number }
		}
		id: string
		parentMessageId: string
		role: string
		text: string
	}
}
