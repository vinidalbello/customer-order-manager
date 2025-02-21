<script lang="ts">
	export let item: {
		nome: string;
		descricao?: string;
		quantidade: number;
		valorUnitario: number;
	};

	// Função para remover o item, passada da página
	export let onRemove: () => void;

	// Importa a função para formatar o valor (converte centavos para reais)
	import { formatCurrency } from '$lib/utils/helper';
</script>

<div class="mb-2 flex items-center justify-between rounded border p-2">
	<div>
		<p class="font-semibold">{item.nome}</p>
		{#if item.descricao}
			<p class="text-sm text-gray-600">{item.descricao}</p>
		{/if}
		<p class="text-sm">
			Qtd: {item.quantidade} | Valor: R$ {formatCurrency(item.valorUnitario)}
		</p>
	</div>
	<button type="button" on:click={onRemove} class="text-red-500 hover:text-red-700"> X </button>
</div>
