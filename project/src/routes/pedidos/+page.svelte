<script lang="ts">
	import {
		formatCPF,
		formatStringToCurrency,
		getAsNumber,
		formatCurrency
	} from '$lib/utils/helper';
	import ItemDisplay from '$lib/components/ItemDisplay.svelte';

	let cpf = '';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let cliente: any = null;
	let searchMessage = '';
	let pedido = {
		client_id: '',
		dataPedido: '',
		itens: [] as {
			nome: string;
			descricao?: string;
			quantidade: number;
			valorUnitario: number;
		}[]
	};
	// newItem possui os campos para o item a ser adicionado.
	let newItem = { nome: '', descricao: '', quantidade: '', valor: '' };
	let totalValue = 0;
	let message = '';
	let isError = false;

	function handleCPFInput(event: Event) {
		const input = event.target as HTMLInputElement;
		cpf = formatCPF(input.value);
	}

	// Busca o cliente pelo CPF
	async function searchCliente() {
		const rawCPF = cpf.replace(/\D/g, '');
		if (rawCPF.length !== 11) {
			searchMessage = 'CPF inválido';
			cliente = null;
			return;
		}
		const res = await fetch(`/api/clientes?cpf=${rawCPF}`);
		const data = await res.json();
		if (res.ok) {
			cliente = data;
			pedido.client_id = cliente.id;
			searchMessage = `Cliente encontrado: ${cliente.nome}`;
		} else {
			searchMessage = data.mensagem || 'Cliente não encontrado';
			cliente = null;
		}
	}

	// Adiciona um novo item ao pedido
	function addItem() {
		if (
			!newItem.nome ||
			!newItem.quantidade ||
			Number(newItem.quantidade) <= 0 ||
			!newItem.valor ||
			getAsNumber(newItem.valor) <= 0
		) {
			// Opcional: exiba uma mensagem de erro para os campos obrigatórios.
			return;
		}
		pedido.itens.push({
			nome: newItem.nome,
			descricao: newItem.descricao,
			quantidade: Number(newItem.quantidade),
			valorUnitario: getAsNumber(newItem.valor)
		});
		pedido.itens = [...pedido.itens];
		newItem = { nome: '', descricao: '', quantidade: '', valor: '' };
	}

	// Remove um item já adicionado
	function removeItem(index: number) {
		pedido.itens.splice(index, 1);
		pedido.itens = [...pedido.itens];
	}

	// Recalcula o valor total do pedido (valorUnitario em centavos)
	$: totalValue = pedido.itens.reduce((acc, item) => acc + item.valorUnitario, 0);

	async function handleSubmit() {
		isError = false;
		if (!pedido.client_id) {
			message = 'Nenhum cliente selecionado';
			isError = true;
			return;
		}
		if (!pedido.dataPedido) {
			message = 'Data do pedido é obrigatória';
			isError = true;
			return;
		}
		if (pedido.itens.length === 0) {
			message = 'Adicione pelo menos um item ao pedido';
			isError = true;
			return;
		}

		const payload = {
			client_id: pedido.client_id,
			data_pedido: pedido.dataPedido,
			valor_total: totalValue,
			itens: pedido.itens
		};

		const res = await fetch('/api/pedidos', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const data = await res.json();
		if (!res.ok) {
			isError = true;
			message = data.mensagem || 'Erro ao cadastrar pedido';
		} else {
			message = 'Pedido cadastrado com sucesso!';
			// Reseta os formulários
			pedido = { client_id: '', dataPedido: '', itens: [] };
			cpf = '';
			cliente = null;
			searchMessage = '';
		}
	}
</script>

<div class="mx-auto max-w-2xl p-6">
	<div class="mb-4">
		<a href="/" class="flex items-center text-blue-500 hover:text-blue-700">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			<span class="ml-2">Voltar</span>
		</a>
	</div>
	<h1 class="mb-6 text-center text-2xl font-semibold text-gray-800">Cadastro de Pedido</h1>

	<!-- Seção para busca do cliente via CPF -->
	<div class="mb-4">
		<label for="cpfSearch" class="mb-1 block text-sm text-gray-700">CPF do Cliente:</label>
		<input
			id="cpfSearch"
			type="text"
			value={cpf}
			on:input={handleCPFInput}
			placeholder="000.000.000-00"
			class="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
		<button
			on:click={searchCliente}
			type="button"
			class="mt-2 w-full rounded bg-blue-500 py-2 text-white transition hover:bg-blue-600"
		>
			Buscar Cliente
		</button>
		{#if searchMessage}
			<p class="mt-2 text-center text-sm">{searchMessage}</p>
		{/if}
	</div>

	{#if cliente}
		<!-- Seção de dados do pedido -->
		<div class="mb-6">
			<h2 class="mb-2 text-lg font-semibold">Dados do Pedido</h2>
			<div>
				<label for="dataPedido" class="mb-1 block text-sm text-gray-700">Data do Pedido:</label>
				<input
					id="dataPedido"
					type="date"
					bind:value={pedido.dataPedido}
					class="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
				/>
			</div>
		</div>

		<!-- Seção de itens do pedido (sempre visível, independente da data) -->
		<div class="mb-6">
			<h2 class="mb-2 text-lg font-semibold">Itens do Pedido</h2>

			<!-- Lista dos itens adicionados -->
			{#if pedido.itens.length > 0}
				<div class="mb-4 space-y-2">
					{#each pedido.itens as item, index}
						<ItemDisplay {item} onRemove={() => removeItem(index)} />
					{/each}
				</div>
			{/if}

			<!-- Formulário para adicionar novo item -->
			<div class="mb-2 grid grid-cols-2 gap-2">
				<input
					type="text"
					placeholder="Nome do item"
					bind:value={newItem.nome}
					class="col-span-2 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
				/>
				<input
					type="text"
					placeholder="Descrição (opcional)"
					bind:value={newItem.descricao}
					class="col-span-2 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
				/>
				<input
					type="number"
					min="1"
					placeholder="Quantidade"
					bind:value={newItem.quantidade}
					class="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
				/>
				<input
					type="text"
					placeholder="Valor (R$)"
					bind:value={newItem.valor}
					on:blur={() => (newItem.valor = formatStringToCurrency(newItem.valor))}
					class="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
				/>
			</div>
			<button
				type="button"
				on:click={addItem}
				class="mb-4 w-full rounded bg-blue-500 py-2 text-white transition hover:bg-blue-600"
			>
				Adicionar Item
			</button>

			<!-- Valor total -->
			<div class="mb-6 rounded bg-gray-50 p-4">
				<p class="text-xl font-semibold text-gray-800">
					Valor Total: R$ {formatCurrency(totalValue)}
				</p>
			</div>
		</div>

		<button
			on:click={handleSubmit}
			type="button"
			class="w-full rounded bg-green-500 py-2 font-semibold text-white transition hover:bg-green-600"
		>
			Cadastrar Pedido
		</button>
	{/if}

	{#if message}
		<p
			class={`mt-4 rounded p-3 text-center ${isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
		>
			{message}
		</p>
	{/if}
</div>
