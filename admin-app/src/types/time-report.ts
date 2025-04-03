export interface TimeEntry {
    memberId?: string;
    date?: string;
    hours: number;
    comment: string;
}

export interface TrelloLabel {
    id: string;
    name: string;
    color: string;
}

export interface ProcessedCardData {
    cardId: string;
    cardName: string;
    cardUrl: string;
    listId: string;
    memberIds: string[];
    labels: TrelloLabel[];
    estimatedHours: number;
    timeEntries: TimeEntry[];
}
