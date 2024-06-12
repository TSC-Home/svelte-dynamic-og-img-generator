<script lang="ts">
	import { writable, derived } from 'svelte/store';

	// Stores to manage editor content and placeholders
	const editorContent = writable('');
	const placeholders = writable<{ [key: string]: string }>({});

	// Function to update the preview based on editor content
	const updatePreview = (html: string) => {
		editorContent.set(html);
		const matches = html.match(/{(.*?)}/g) || [];
		const newPlaceholders: { [key: string]: string } = {};
		matches.forEach((match) => {
			const cleanName = match.replace(/{|}/g, '');
			if (!newPlaceholders[cleanName]) {
				newPlaceholders[cleanName] = '';
			}
		});
		placeholders.set(newPlaceholders);
	};

	// Function to handle input changes for placeholders
	const handleInput = (name: string, value: string) => {
		placeholders.update((current) => {
			current[name] = value;
			return { ...current };
		});
	};

	const handleTextareaInput = (event: Event) => {
		const target = event.target as HTMLTextAreaElement;
		updatePreview(target.value);
	};

	const handlePlaceholderInput = (event: Event, name: string) => {
		const target = event.target as HTMLInputElement;
		handleInput(name, target.value);
	};

	// Embed Tailwind CSS into the preview HTML
	const tailwindCSS = `
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  `;

	const previewHTML = derived([editorContent, placeholders], ([$editorContent, $placeholders]) => {
		let html = $editorContent;
		for (const [key, value] of Object.entries($placeholders)) {
			html = html.replace(new RegExp(`{${key}}`, 'g'), value);
		}
		return `${tailwindCSS}<div class="p-4">${html}</div>`;
	});
</script>

<div class="h-screen w-screen">
	<div class="mx-auto w-full max-w-sm p-4 text-center">
		<h1 class="text-3xl font-bold">Svelte Dynamic OG Image Generator</h1>
	</div>
	<div class="flex h-[85%] space-x-4 p-4">
		<div class="flex h-full w-1/2 flex-col rounded-md border-2 border-gray-200 p-4">
			<textarea
				class="mb-4 h-full w-full border-2 border-gray-200 p-2"
				placeholder="Schreibe HTML mit"
				on:input={handleTextareaInput}
			></textarea>
			<div>
				{#each Object.keys($placeholders) as name}
					<input
						type="text"
						placeholder={name}
						class="my-2 block w-full border-2 border-gray-200 p-2"
						value={$placeholders[name]}
						on:input={(e) => handlePlaceholderInput(e, name)}
					/>
				{/each}
			</div>
		</div>
		<div class="h-full w-1/2 p-4">
			<div
				class="relative mx-auto h-full max-h-[630px] w-full max-w-[1200px] overflow-hidden border bg-white shadow-lg"
			>
				<iframe class="absolute inset-0 h-full w-full" srcdoc={$previewHTML}></iframe>
			</div>
		</div>
	</div>
	<footer
		class="flex items-center justify-center space-x-2 p-4 text-sm font-semibold uppercase text-gray-500"
	>
		<a class="hover:text-gray-800 hover:underline" href="https://synthetix.me">Synthetix.me🦕</a>
		<a class="hover:text-gray-800 hover:underline" href="https://github.com/tsc-home">My Github🔥</a
		>
		<a
			class="hover:text-gray-800 hover:underline"
			href="https://github.com/tsc-home/svelte-dynamic-og-img-generator">Source Code❤️</a
		>
	</footer>
</div>

<style>
	textarea {
		resize: none;
	}
</style>
