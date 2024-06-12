export const prerender = true;

import Image from './Og.svelte';
import { componentToPng } from '$lib/renderImage';

export const GET = async ({ params, url, locals }) => {
	const width = 800;
	const height = 400;
	const sanitizedSlug = params.slug.replace(/\.png$/, '');
	const getResponse = await locals.pb.collection('og').getOne(sanitizedSlug);

	// Get query parameters from the URL
	const queryParams = new URLSearchParams(url.search);

	// Replace placeholders in HTML with query parameter values
	let htmlContent = getResponse.html;
	for (const [key, value] of queryParams.entries()) {
		const placeholder = `{${key}}`;
		htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
	}

	// Wrap the HTML content in a <div> container
	htmlContent = `<div>${htmlContent}</div>`;

	return componentToPng(Image, { html: htmlContent }, height, width);
};
