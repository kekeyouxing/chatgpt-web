declare namespace Menu {
	interface Card {
		title: string
		description: string
		cardCategory: number
		cardType: number
	}
	interface CardState {
		card: Card[]
	}
}
