export interface QuestSessionResponse {
    questSessionId: number;
    questId: number;
    questTitle?: string;
    questTitleShort?: string;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    isFinished: boolean;
    isEmpty: boolean;
    endReason?: string | null;
    inviteToken?: string | null;
    participantCount: number;
    questPointCount: number;
    passedQuestPointCount: number;
}

export interface QuestSessionsResponse {
    items: QuestSessionResponse[];
    total: number;
    pageNumber: number;
    pageSize: number;
}

export interface CreateQuestSessionRequest {
    startDate: string;
}

export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Session {
    id: string;
    name: string;
    status: SessionStatus;
    statusLabel?: string;
    start: string;
    participants: string;
}

export interface SessionParticipant {
    participantId: number | null;
    userId: number | null;
    userName: string | null;
    photoUrl?: string | null;
    joinedAt?: string | null;
    participationStatus?: string | null;
    rejectionReason?: string | null;
    passedQuestPointCount?: number;
}

export interface QuestSessionDetail extends QuestSessionResponse {
    endReason: string | null;
    inviteToken: string | null;
    participants: SessionParticipant[];
    questPhotoUrl?: string | null;
    questDescription?: string | null;
    questMaxDurationMinutes?: number | null;
    startPointName?: string | null;
}

export interface QuestSessionsState {
    quest: {
        id: number;
        title: string;
        description: string;
        maxParticipants?: number;
        maxDurationMinutes?: number;
    } | null;
    sessions: Session[];
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}

export interface ParticipantLocation {
    participantId: number;
    userId: number;
    userName: string;
    photoUrl?: string | null;
    latitude: number;
    longitude: number;
    timestamp: string;
    isActive: boolean;
}

export interface JoinSessionRequest {
    sessionId: number;
}

export interface JoinSessionResponse {
    success: boolean;
    message?: string;
}

export interface UpdateLocationRequest {
    sessionId: number;
    latitude: number;
    longitude: number;
}

export interface UpdateLocationResponse {
    success: boolean;
    location?: ParticipantLocation;
}

export interface PointPassedEvent {
    participantId: number;
    pointId: number;
    timestamp: string;
}

export interface ErrorResponse {
    error: string;
}

export interface SubscribeToSessionRequest {
    sessionId: number;
}

export interface SubscribeToSessionResponse {
    success: boolean;
    message: string;
    sessionId: number;
}

export interface UnsubscribeFromSessionRequest {
    sessionId: number;
}

export interface UnsubscribeFromSessionResponse {
    success: boolean;
    message: string;
    sessionId: number;
}

export interface ParticipantJoinedEvent {
    participantId: number;
    userId: number;
    userName: string;
    sessionId: number;
    joinedAt: string;
}

export interface ParticipantLeftEvent {
    participantId: number;
    userId: number;
    userName: string;
    sessionId: number;
    leftAt: string;
}

export interface SessionCancelledEvent {
    sessionId: number;
    cancelledBy: string;
    cancelledAt: string;
    message: string;
}

export interface UserJoinedEvent {
    userId: number;
    userName: string;
    sessionId: number;
}

export interface UserLeftEvent {
    userId: number;
    userName: string;
    sessionId: number;
}

export interface LocationUpdatedEvent {
    participantLocationId: number;
    participantId: number;
    userId: number;
    userName: string;
    latitude: number;
    longitude: number;
    timestamp: string;
}

export interface ParticipantPointPassedEvent {
    pointPassed: true;
    pointName: string;
    orderNumber: number;
    questPointId: number;
    userId: number;
    userName: string;
}

export interface TaskCompletedEvent {
    userId: number;
    userName: string;
    taskId: number;
    pointName: string;
    scoreEarned: number;
    totalScore: number;
    completedAt: string;
    sessionId: number;
}

export interface ParticipantScore {
    participantId: number;
    userId: number;
    userName: string;
    photoUrl?: string | null;
    totalScore: number;
    completedTasksCount: number;
}

export interface SessionScoresResponse {
    participants: ParticipantScore[];
    totalTasksInQuest: number;
}

export interface ScoresUpdatedEvent {
    sessionId: number;
    participants: ParticipantScore[];
    updatedAt: string;
}

export interface PhotoSubmittedEvent {
    participantTaskPhotoId: number;
    participantTaskId: number;
    userId: number;
    userName: string;
    questTaskId: number;
    taskDescription: string;
    pointName: string;
    photoUrl: string;
    uploadDate: string;
    sessionId: number;
}

export interface PhotoModeratedEvent {
    participantTaskPhotoId: number;
    participantTaskId: number;
    userId: number;
    userName: string;
    questTaskId: number;
    taskDescription: string;
    pointName: string;
    photoUrl: string;
    approved: boolean;
    rejectionReason?: string;
    scoreAdjustment: number;
    totalScore: number;
    sessionId: number;
    moderatedAt: string;
}

export enum RejectionReason {
    NO_LOCATION = 'NO_LOCATION',
    TOO_FAR_FROM_START = 'TOO_FAR_FROM_START',
    REQUIRED_TASK_NOT_COMPLETED = 'REQUIRED_TASK_NOT_COMPLETED'
}

export interface ParticipantRejectedEvent {
    participantId: number;
    userId: number;
    userName: string;
    sessionId: number;
    rejectionReason: string;
    rejectedAt: string;
}

export interface ParticipantDisqualifiedEvent {
    participantId: number;
    userId: number;
    userName: string;
    sessionId: number;
    rejectionReason: string;
    disqualifiedAt: string;
}

export interface PendingPhotoForModeration {
    participantTaskPhotoId: number;
    participantTaskId: number;
    userId: number;
    userName: string;
    questTaskId: number;
    taskDescription: string;
    pointName: string;
    photoUrl: string;
    uploadDate: string;
}

export interface ModeratePhotoRequest {
    approved: boolean;
    rejectionReason?: string;
}

export interface ModeratePhotoResponse {
    success: boolean;
    message?: string;
}
