import {json} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import {sql} from '$lib/db';

export const GET: RequestHandler = async ({url}) => {
	const nomeFiltro = url.searchParams.get('nome');
	const cpfFiltro = url.searchParams.get('cpf');
	const dataInicio = url.searchParams.get('data_inicio');
	const dataFim = url.searchParams.get('data_fim');

	try {
		const conditions: string[] = [];
		const params: any[] = [];

		// Se CPF for fornecido, usamos CPF; caso contrário, se nome for fornecido, usamos nome
		if (cpfFiltro) {
			conditions.push(`c.cpf = $${params.length + 1}`);
			// Certifique-se de enviar o CPF sem formatação
			params.push(cpfFiltro);
		} else if (nomeFiltro) {
			conditions.push(`c.nome ILIKE $${params.length + 1}`);
			params.push(`%${nomeFiltro}%`);
		}

		if (dataInicio) {
			conditions.push(`p.data_pedido >= $${params.length + 1}`);
			params.push(dataInicio);
		}

		if (dataFim) {
			conditions.push(`p.data_pedido <= $${params.length + 1}`);
			params.push(dataFim);
		}

		const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

		const query = `
      SELECT p.*, c.nome AS cliente_nome
      FROM pedidos p
      JOIN clients c ON p.client_id = c.id
      ${whereClause}
      ORDER BY p.data_pedido DESC
    `;

		const pedidos = await sql.unsafe(query, params);
		const totalGasto = pedidos.reduce(
			(total: number, pedido: any) => total + Number(pedido.valor_total),
			0,
		);

		return json({pedidos, totalGasto});
	} catch (error) {
		console.error('Erro na consulta de pedidos:', error);
		return json({mensagem: 'Erro ao consultar pedidos'}, {status: 500});
	}
};
