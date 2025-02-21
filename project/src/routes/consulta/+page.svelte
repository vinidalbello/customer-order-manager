<script lang="ts">
	import { formatCurrency, formatDateBrazil } from '$lib/utils/helper';

	// Campo único para filtro (nome ou CPF) e datas para o intervalo
	let filtro = '';
	let dataInicio = '';
	let dataFim = '';

	// Resultados da consulta
	let pedidos: any[] = [];
	let totalGasto = 0;
	let message = '';

	// Variável reativa para habilitar o botão somente se todos os filtros forem preenchidos
	$: filtrosCompletos =
		filtro.trim().length > 0 && dataInicio.trim().length > 0 && dataFim.trim().length > 0;

	// Função para buscar os pedidos conforme os filtros
	async function buscarPedidos() {
		if (!filtrosCompletos) {
			message = 'Preencha o nome ou CPF e o intervalo de datas.';
			return;
		}

		const params = new URLSearchParams();
		// Se o filtro contiver somente dígitos e tiver 11 caracteres, tratamos como CPF
		const onlyDigits = filtro.replace(/\D/g, '');
		if (onlyDigits.length === 11) {
			params.append('cpf', onlyDigits);
		} else {
			params.append('nome', filtro);
		}
		params.append('data_inicio', dataInicio);
		params.append('data_fim', dataFim);

		try {
			const res = await fetch(`/api/consulta-pedidos?${params.toString()}`);
			const data = await res.json();
			if (res.ok) {
				pedidos = data.pedidos;
				totalGasto = data.totalGasto;
				message = pedidos.length === 0 ? 'Nenhum pedido encontrado.' : '';
			} else {
				message = data.mensagem || 'Erro ao buscar pedidos.';
				pedidos = [];
				totalGasto = 0;
			}
		} catch (error) {
			console.error('Erro na consulta:', error);
			message = 'Erro ao buscar pedidos.';
			pedidos = [];
			totalGasto = 0;
		}
	}
</script>

<div class="mx-auto max-w-3xl p-6">
	<h1 class="mb-6 text-center text-3xl font-bold text-gray-800">Consulta de Pedidos</h1>

	<!-- Formulário de filtros -->
	<div class="mb-8 rounded bg-gray-50 p-4">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div>
				<label for="filtro" class="block text-sm text-gray-700">Nome ou CPF do Cliente:</label>
				<input
					id="filtro"
					type="text"
					bind:value={filtro}
					placeholder="Digite o nome ou CPF"
					class="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			<div>
				<label for="dataInicio" class="block text-sm text-gray-700">Data Início:</label>
				<input
					id="dataInicio"
					type="date"
					bind:value={dataInicio}
					class="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			<div>
				<label for="dataFim" class="block text-sm text-gray-700">Data Fim:</label>
				<input
					id="dataFim"
					type="date"
					bind:value={dataFim}
					class="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
		</div>
		<button
			on:click={buscarPedidos}
			class="mt-4 w-full rounded bg-green-500 py-2 text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={!filtrosCompletos}
		>
			Buscar Pedidos
		</button>
	</div>

	{#if message}
		<p class="mb-4 rounded bg-red-100 p-3 text-center text-red-600">{message}</p>
	{/if}

	<!-- Exibição dos pedidos -->
	{#if pedidos.length > 0}
		<div class="mb-4 space-y-4">
			{#each pedidos as pedido}
				<div class="rounded border bg-white p-4 shadow-sm">
					<h2 class="mb-2 text-xl font-semibold text-gray-800">
						Pedido #{pedido.id} - {formatDateBrazil(pedido.data_pedido)}
					</h2>
					<p class="mb-2 text-sm text-gray-600">
						Cliente: {pedido.cliente_nome}
					</p>
					<div class="mb-2 space-y-2">
						<h3 class="font-medium">Itens:</h3>
						{#each pedido.itens as item}
							<div class="flex justify-between border-b pb-1">
								<div>
									<p class="text-sm font-semibold">{item.nome}</p>
									{#if item.descricao}
										<p class="text-xs text-gray-500">{item.descricao}</p>
									{/if}
								</div>
								<div class="text-sm font-medium text-gray-700">
									R$ {formatCurrency(item.valorUnitario)}
								</div>
							</div>
						{/each}
					</div>
					<p class="font-semibold text-gray-800">
						Valor Total: R$ {formatCurrency(pedido.valor_total)}
					</p>
				</div>
			{/each}
		</div>
		<div class="rounded bg-gray-50 p-4">
			<p class="text-xl font-semibold text-gray-800">
				Total Gasto: R$ {formatCurrency(totalGasto)}
			</p>
		</div>
	{:else}
		<p class="text-center text-gray-600">Nenhum pedido encontrado.</p>
	{/if}
</div>
