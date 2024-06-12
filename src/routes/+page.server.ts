export const load = async () => {
	return {};
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const html = formData.get('html');

		try {
			if (!html || typeof html !== 'string') return;

			// Remove <script> tags
			const sanitizedHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
			const createdRecord = await locals.pb.collection('og').create({
				html: sanitizedHtml
			});

			// Extract placeholders
			const placeholderRegex = /\{(\w+)\}/g;
			const placeholders = [...sanitizedHtml.matchAll(placeholderRegex)].map((match) => match[1]);

			// Construct the URL
			const baseUrl = `http://localhost:5173/og/${createdRecord.id}/`;
			const queryParams = placeholders
				.map((placeholder) => `${placeholder}=${placeholder}`)
				.join('&');
			const dynamicUrl = `${baseUrl}?${queryParams}`;

			// Return or process the URL as needed
			console.log('Dynamic URL:', dynamicUrl);

			// Return the response (you can modify as needed)
			return {
				url: dynamicUrl
			};
		} catch (error) {
			console.error('Error processing HTML:', error);
		}
	}
};
