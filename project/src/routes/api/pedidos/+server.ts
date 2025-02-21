import {json} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import {sql} from '$lib/db';
import type {PostgresError} from '$lib/types/database';

export const POST: RequestHandler = async ({request}) => {
	try {
		const pedido = await request.json();
		const {client_id, data_pedido, valor_total, itens} = pedido;

		// Verificação de campos obrigatórios
		if (!client_id || !data_pedido || !itens || !Array.isArray(itens) || itens.length === 0) {
			return json(
				{mensagem: 'Cliente, data do pedido e pelo menos um item são obrigatórios'},
				{status: 400},
			);
		}

		// Calcula o valor total com base nos itens
		const calculatedTotal = itens.reduce((total: number, item: any) => {
			return total + Number(item.valorUnitario);
		}, 0);

		if (Number(valor_total) !== calculatedTotal) {
			return json(
				{mensagem: 'Valor total incorreto. Deve ser a soma dos itens do pedido.'},
				{status: 400},
			);
		}

		// Insere o pedido no banco de dados
		const [novoPedido] = await sql`
			INSERT INTO pedidos (client_id, data_pedido, valor_total, itens, data_criacao)
			VALUES (${client_id}, ${data_pedido}, ${valor_total}, ${itens}, NOW())
			RETURNING *
		`;

		return json(novoPedido);
	} catch (error) {
		console.error('Erro ao criar pedido:', error);
		const pgError = error as PostgresError;
		return json({mensagem: 'Erro ao cadastrar pedido'}, {status: 500});
	}
};
