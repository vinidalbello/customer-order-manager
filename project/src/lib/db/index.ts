import postgres from 'postgres';
import {DATABASE_URL} from '$env/static/private';

// Conexão com o banco de dados como singleton
export const sql = postgres(DATABASE_URL, {
	max: 20,
	idle_timeout: 20,
	connect_timeout: 10,
});

export type Cliente = {
	id?: number;
	nome: string;
	email: string;
	data_nascimento: string;
	cpf: string;
	endereco: string;
	created_at?: Date;
	updated_at?: Date;
};
