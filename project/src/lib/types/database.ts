export interface PostgresError extends Error {
	code: string;
	constraint_name?: string;
}

export interface ApiError extends Error {
	message: string;
}
