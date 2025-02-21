import {json} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import {sql, type Cliente} from '$lib/db';
import type {PostgresError} from '$lib/types/database';

export const POST: RequestHandler = async ({request}) => {
	try {
		const cliente: Cliente = await request.json();
		const {nome, email, data_nascimento, cpf, endereco} = cliente;

		// Verificação de campos obrigatórios
		if (!nome || !email || !data_nascimento || !cpf || !endereco) {
			return json({mensagem: 'Todos os campos são obrigatórios'}, {status: 400});
		}

		// Validação do CPF: deve conter exatamente 11 dígitos numéricos
		const trimmedCPF = cpf.toString().trim();
		if (!/^\d{11}$/.test(trimmedCPF)) {
			return json({mensagem: 'CPF deve conter exatamente 11 dígitos numéricos'}, {status: 400});
		}

		// Validação do email
		const trimmedEmail = email.toString().trim();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
			return json({mensagem: 'Email inválido'}, {status: 400});
		}

		// Verificação de idade: deve ter 18 anos ou mais
		const birthDate = new Date(data_nascimento);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		if (age < 18) {
			return json({mensagem: 'Cliente deve ter 18 anos ou mais'}, {status: 400});
		}

		// Insere o cliente no banco de dados
		const [novoCliente] = await sql`
            INSERT INTO clients (
                nome,
                email,
                data_nascimento,
                cpf,
                endereco
            ) VALUES (
                ${nome.trim()},
                ${trimmedEmail},
                ${data_nascimento},
                ${trimmedCPF},
                ${endereco.trim()}
            )
            RETURNING *
        `;

		return json(novoCliente);
	} catch (error) {
		console.error('Erro ao criar cliente:', error);

		const pgError = error as PostgresError;
		if (pgError.code === '23505') {
			if (pgError.constraint_name === 'clients_email_key') {
				return json({mensagem: 'Este email já está cadastrado'}, {status: 400});
			}
			if (pgError.constraint_name === 'clients_cpf_key') {
				return json({mensagem: 'Este CPF já está cadastrado'}, {status: 400});
			}
		}

		return json({mensagem: 'Erro ao cadastrar cliente'}, {status: 500});
	}
};

export const GET: RequestHandler = async ({url}) => {
	// Obtém o CPF da query string
	const cpf = url.searchParams.get('cpf');
	if (!cpf) {
		return json({mensagem: 'CPF não informado'}, {status: 400});
	}

	// Remove caracteres não numéricos
	const rawCPF = cpf.replace(/\D/g, '');
	if (rawCPF.length !== 11) {
		return json({mensagem: 'CPF inválido'}, {status: 400});
	}

	try {
		// Busca o cliente pelo CPF
		const clientes = await sql<Cliente[]>`
      SELECT * FROM clients WHERE cpf = ${rawCPF} LIMIT 1
    `;
		if (clientes.length === 0) {
			return json({mensagem: 'Cliente não encontrado'}, {status: 404});
		}
		return json(clientes[0]);
	} catch (error) {
		console.error('Erro ao buscar cliente:', error);
		return json({mensagem: 'Erro ao buscar cliente'}, {status: 500});
	}
};
