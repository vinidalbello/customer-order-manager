<script lang="ts">
	import type { ApiError } from '$lib/types/database';
	import { formatCPF, isValidEmail } from '$lib/utils/helper';

	let cliente = {
		nome: '',
		email: '',
		dataNascimento: '',
		cpf: '',
		endereco: ''
	};
	let message = '';
	let isError = false;

	async function handleSubmit() {
		isError = false;

		if (!isValidEmail(cliente.email)) {
			message = 'Email inválido';
			isError = true;
			return;
		}

		const rawCPF = cliente.cpf.replace(/\D/g, '');
		if (rawCPF.length !== 11) {
			message = 'CPF deve conter exatamente 11 dígitos numéricos';
			isError = true;
			return;
		}

		// Verificação de Idade do Cliente
		const birthDate = new Date(cliente.dataNascimento);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		if (age < 18) {
			message = 'Cliente deve ter 18 anos ou mais';
			isError = true;
			return;
		}

		try {
			const response = await fetch('/api/clientes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					...cliente,
					data_nascimento: cliente.dataNascimento,
					cpf: rawCPF
				})
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.mensagem || 'Erro ao cadastrar cliente');
			}

			message = 'Cliente cadastrado com sucesso!';
			cliente = {
				nome: '',
				email: '',
				dataNascimento: '',
				cpf: '',
				endereco: ''
			};
		} catch (error) {
			isError = true;
			const apiError = error as ApiError;
			message = apiError.message || 'Erro ao cadastrar cliente';
			console.error('Erro detalhado:', apiError);
		}
	}
</script>

<div class="mx-auto max-w-md p-6">
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
	<h1 class="mb-6 text-center text-2xl font-semibold text-gray-800">Cadastro de Cliente</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label for="nome" class="mb-1 block text-sm text-gray-700">Nome:</label>
			<input
				type="text"
				id="nome"
				bind:value={cliente.nome}
				required
				maxlength="100"
				class="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<div>
			<label for="email" class="mb-1 block text-sm text-gray-700">Email:</label>
			<input
				type="email"
				id="email"
				bind:value={cliente.email}
				required
				maxlength="100"
				title="Digite um email válido"
				class="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<div>
			<label for="dataNascimento" class="mb-1 block text-sm text-gray-700"
				>Data de Nascimento:</label
			>
			<input
				type="date"
				id="dataNascimento"
				bind:value={cliente.dataNascimento}
				required
				class="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<div>
			<label for="cpf" class="mb-1 block text-sm text-gray-700">CPF:</label>
			<input
				type="text"
				id="cpf"
				on:input={(e) => (cliente.cpf = formatCPF(e.currentTarget.value))}
				bind:value={cliente.cpf}
				required
				maxlength="14"
				placeholder="000.000.000-00"
				title="Digite um CPF válido"
				class="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<div>
			<label for="endereco" class="mb-1 block text-sm text-gray-700">Endereço:</label>
			<input
				type="text"
				id="endereco"
				bind:value={cliente.endereco}
				required
				maxlength="200"
				class="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<button
			type="submit"
			class="w-full rounded bg-blue-500 py-2 font-semibold text-white transition duration-200 hover:bg-blue-600"
		>
			Cadastrar
		</button>
	</form>

	{#if message}
		<p
			class={`mt-4 rounded p-3 text-center ${isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
		>
			{message}
		</p>
	{/if}
</div>
