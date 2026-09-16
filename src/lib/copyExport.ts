import type { RequestItem } from '../types';

function escapeShellSingleQuotes(value: string): string {
	return value.replace(/'/g, `'\\''`);
}

function getContentTypeHeader(item: RequestItem): string | undefined {
	return item.headers.find((header) => header.name.toLowerCase() === 'content-type')?.value;
}

function getRequestBodyText(item: RequestItem): string | null {
	if (item.type === 'GQL' && item.requestGQLQuery) {
		const variables = item.requestGQLVariables ? JSON.parse(item.requestGQLVariables) : undefined;
		return JSON.stringify({ query: item.requestGQLQuery, variables }, null, 2);
	}

	return item.requestPostData;
}

export function canCopyAsCurl(item: RequestItem): boolean {
	return !!item.url;
}

export function canCopyAsHar(item: RequestItem): boolean {
	return !!item.url;
}

export function canCopyRequestHeaders(item: RequestItem): boolean {
	return item.headers.length > 0;
}

export function getResponseBodyText(item: RequestItem): string | null {
	const { responsePayload } = item;

	if (responsePayload == null || responsePayload === 'No response') return null;
	if (typeof responsePayload === 'string') return responsePayload;

	try {
		return JSON.stringify(responsePayload, null, 2);
	} catch {
		return null;
	}
}

export function canCopyResponseBody(item: RequestItem): boolean {
	return getResponseBodyText(item) !== null;
}

export function buildCurlCommand(item: RequestItem): string {
	const lines = [`curl '${escapeShellSingleQuotes(item.url)}' \\`, `  -X '${escapeShellSingleQuotes(item.method)}' \\`];

	for (const header of item.headers) {
		if (header.name.startsWith(':')) continue;
		lines.push(`  -H '${escapeShellSingleQuotes(`${header.name}: ${header.value}`)}' \\`);
	}

	if (item.requestParams && item.requestParams.length > 0) {
		const isMultipart = /multipart\/form-data/i.test(getContentTypeHeader(item) || '');

		for (const param of item.requestParams) {
			if (param.fileName) {
				lines.push(`  -F '${escapeShellSingleQuotes(`${param.name}=@${param.fileName}`)}' \\`);
			} else {
				const flag = isMultipart ? '-F' : '--data-urlencode';
				lines.push(`  ${flag} '${escapeShellSingleQuotes(`${param.name}=${param.value ?? ''}`)}' \\`);
			}
		}
	} else {
		const body = getRequestBodyText(item);
		if (body) lines.push(`  --data-raw '${escapeShellSingleQuotes(body)}' \\`);
	}

	const lastLine = lines[lines.length - 1];
	lines[lines.length - 1] = lastLine.endsWith(' \\') ? lastLine.slice(0, -2) : lastLine;

	return lines.join('\n');
}

export function buildHarEntry(item: RequestItem): object {
	const requestBody = getRequestBodyText(item);
	const responseBody = getResponseBodyText(item);

	return {
		log: {
			version: '1.2',
			creator: { name: 'data-logger', version: '1.0' },
			entries: [
				{
					startedDateTime: new Date(item.timestamp).toISOString(),
					time: item.time,
					request: {
						method: item.method,
						url: item.url,
						httpVersion: 'HTTP/1.1',
						cookies: [],
						headers: item.headers.map(({ name, value }) => ({ name, value })),
						queryString: [],
						headersSize: -1,
						bodySize: requestBody ? requestBody.length : -1,
						...(requestBody
							? { postData: { mimeType: getContentTypeHeader(item) || 'application/octet-stream', text: requestBody } }
							: {}),
					},
					response: {
						status: item.responseStatusCode,
						statusText: item.responseStatusMessage || '',
						httpVersion: 'HTTP/1.1',
						cookies: [],
						headers: item.responseHeaders.map(({ name, value }) => ({ name, value })),
						content: {
							size: responseBody ? responseBody.length : 0,
							mimeType: item.responseMimeType,
							text: responseBody || '',
						},
						redirectURL: '',
						headersSize: -1,
						bodySize: -1,
					},
					cache: {},
					timings: { send: 0, wait: item.time, receive: 0 },
				},
			],
		},
	};
}

export function formatRequestHeaders(item: RequestItem): string {
	return item.headers.map(({ name, value }) => `${name}: ${value}`).join('\n');
}
