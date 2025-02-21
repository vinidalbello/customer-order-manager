export function formatCPF(value: string): string {
	value = value.replace(/\D/g, '');

	if (value.length > 3) {
		value = value.slice(0, 3) + '.' + value.slice(3);
	}
	if (value.length > 7) {
		value = value.slice(0, 7) + '.' + value.slice(7);
	}
	if (value.length > 11) {
		value = value.slice(0, 11) + '-' + value.slice(11);
	}
	return value.slice(0, 14);
}

export function isValidEmail(email: string): boolean {
	const emailRegex =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return emailRegex.test(email);
}

export function formatStringToCurrency(value: string): string {
	let onlyDigits = value.replace(/\D/g, '');
	if (onlyDigits.length < 3) return onlyDigits;
	if (onlyDigits.length > 6) {
		onlyDigits = onlyDigits.slice(0, 6);
	}
	if (Number(onlyDigits) > 100000) {
		onlyDigits = '100000';
	}
	const integerPart = onlyDigits.slice(0, -2);
	const decimalPart = onlyDigits.slice(-2);
	const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	return `${formattedInteger},${decimalPart}`;
}

export function formatCurrencyToBRL(amount: number): string {
	return amount.toLocaleString('pt-BR', {
		style: 'decimal',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatCurrency(amount: number) {
	return formatCurrencyToBRL(amount / 100);
}

export function stripNonDigits(value: string): string {
	return value.replace(/\D/g, '');
}

export function getAsNumber(value: string): number {
	return Number(stripNonDigits(value));
}

export function formatDateBrazil(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString('pt-BR', {timeZone: 'UTC'});
}
