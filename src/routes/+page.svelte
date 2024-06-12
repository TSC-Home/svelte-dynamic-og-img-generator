<script lang="ts">
	import type monaco from 'monaco-editor';
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { tailwindClasses } from '$lib/index';
	import { enhance } from '$app/forms';

	// Stores to manage editor content and placeholders
	const editorContent = writable('');
	const placeholders = writable<{ [key: string]: string }>({});

	let divEl: HTMLDivElement;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco: any;

	const initialEditorValue = `
    <div class="text-3xl h-[400px] bg-zinc-900 p-12">
        <div class="w-[800px] p-8  justify-center items-center text-center border-8 rounded-[50px] border-rose-600 text-white">
            <p class="font-bold" style="font-size: 80px">{title}</p>
            <p class="mt-4">{description}</p>
        </div>
    </div>`;

	async function initializeEditor() {
		// @ts-ignore
		self.MonacoEnvironment = {
			getWorker: function (_moduleId: any, label: string) {
				if (label === 'json') {
					return new jsonWorker();
				}
				if (label === 'css' || label === 'scss' || label === 'less') {
					return new cssWorker();
				}
				if (label === 'html' || label === 'handlebars' || label === 'razor') {
					return new htmlWorker();
				}
				if (label === 'typescript' || label === 'javascript') {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};

		Monaco = await import('monaco-editor');
		editor = Monaco.editor.create(divEl, {
			value: initialEditorValue,
			language: 'html',
			minimap: {
				enabled: false
			}
		});

		Monaco.languages.registerCompletionItemProvider('html', {
			provideCompletionItems: () => {
				const suggestions = tailwindClasses.map((className) => ({
					label: className,
					kind: Monaco.languages.CompletionItemKind.Keyword,
					insertText: className
				}));
				return { suggestions: suggestions };
			}
		});

		editor.onDidChangeModelContent(() => {
			const value = editor.getValue();
			updatePreview(value);
		});

		// Initialize preview with the initial value
		updatePreview(initialEditorValue);
	}

	onMount(() => {
		initializeEditor();

		return () => {
			if (editor) {
				editor.dispose();
			}
		};
	});

	function updatePreview(html: string) {
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
	}

	function handleInput(name: string, value: string) {
		placeholders.update((current) => {
			current[name] = value;
			return { ...current };
		});
	}

	function handlePlaceholderInput(event: Event, name: string) {
		const target = event.target as HTMLInputElement;
		handleInput(name, target.value);
	}

	const previewHTML = derived([editorContent, placeholders], ([$editorContent, $placeholders]) => {
		let html = $editorContent;
		for (const [key, value] of Object.entries($placeholders)) {
			html = html.replace(new RegExp(`{${key}}`, 'g'), value);
		}
		return `
        <script src="https://cdn.tailwindcss.com"><\/script>
        <div class="h-full w-full max-w-[800px] max-h-[400px]">${html}</div>`;
	});
</script>

<div class="h-screen w-screen">
	<div class="mx-auto w-full max-w-sm p-4 text-center">
		<h1 class="text-3xl font-bold">Svelte Dynamic OG Image Generator</h1>
	</div>
	<div class="flex h-[85%] space-x-4 p-4">
		<div class="flex h-full w-1/2 flex-col rounded-md border-2 border-gray-200">
			<div bind:this={divEl} class="h-full w-full" />
		</div>
		<div class="h-full w-1/2 p-4">
			<iframe
				class=" mx-auto h-full max-h-[400px] w-full max-w-[800px] border bg-white shadow-lg"
				srcdoc={$previewHTML}
				title="preview"
			></iframe>
			<div class="  mt-4 flex space-x-2">
				<form use:enhance={() => {}} method="POST">
					<button
						class=" rounded-md bg-black p-2 text-sm font-semibold uppercase text-white hover:bg-gray-800"
						>Get Url</button
					>
					<input type="hidden" name="html" value={$editorContent} />
				</form>
			</div>
			<div class="flex flex-col space-y-2">
				<label for="title"
					>Hint: If you change somthing you must get a new url to see the changes</label
				>
			</div>
			<div class="flex flex-col space-y-2">
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
	</div>
</div>
<footer
	class=" bottom-0 mt-8 flex items-center justify-center space-x-2 p-4 text-sm font-semibold uppercase text-gray-500"
>
	<a class="hover:text-gray-800 hover:underline" href="https://synthetix.me">Synthetix.me🦕</a>
	<a class="hover:text-gray-800 hover:underline" href="https://github.com/tsc-home">My Github🔥</a>
	<a
		class="hover:text-gray-800 hover:underline"
		href="https://github.com/tsc-home/svelte-dynamic-og-img-generator">Source Code❤️</a
	>
</footer>
