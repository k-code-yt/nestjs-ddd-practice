export enum TransactionState {
	IDLE = 'IDLE',
	INITIALIZING = 'INITIALIZING',
	ACTIVE = 'ACTIVE',
	TRACKING = 'TRACKING',
	COMMITTING = 'COMMITTING',
	COMMITTED = 'COMMITTED',
	ROLLING_BACK = 'ROLLING_BACK',
	ROLLED_BACK = 'ROLLED_BACK',
	FAILED = 'FAILED',
}

export interface OperationRecord {
	id: string;
	type: 'read' | 'write';
	repository: string;
	method: string;
	promise: Promise<any>;
	status: 'pending' | 'completed' | 'failed';
	startedAt: Date;
	completedAt?: Date;
	error?: Error;
}
