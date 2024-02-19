import { parseGQLEntry } from '../utils';

export const fixtures = [
	// GET XHR
	{
		startedDateTime: new Date('2024-02-19T18:18:41.314+01:00').getTime(),
		async getContent() {
			return ['{"test":12}', 'application/json'];
		},
		request: {
			bodySize: 0,
			method: 'GET',
			url: 'http://localhost:3000/user?title=Test1',
			httpVersion: 'HTTP/1.1',
			headers: [
				{
					name: 'Host',
					value: 'localhost:3000',
				},
				{
					name: 'User-Agent',
					value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
				},
				{
					name: 'Accept',
					value: '*/*',
				},
				{
					name: 'Accept-Language',
					value: 'en-US,en;q=0.5',
				},
				{
					name: 'Accept-Encoding',
					value: 'gzip, deflate, br',
				},
				{
					name: 'Referer',
					value: 'http://localhost:3001/',
				},
				{
					name: 'Origin',
					value: 'http://localhost:3001',
				},
				{
					name: 'Connection',
					value: 'keep-alive',
				},
				{
					name: 'Sec-Fetch-Dest',
					value: 'empty',
				},
				{
					name: 'Sec-Fetch-Mode',
					value: 'cors',
				},
				{
					name: 'Sec-Fetch-Site',
					value: 'same-site',
				},
			],
			cookies: [],
			queryString: [
				{
					name: 'title',
					value: 'Test1',
				},
			],
			headersSize: 396,
		},
		response: {
			status: 200,
			statusText: 'OK',
			httpVersion: 'HTTP/1.1',
			headers: [
				{
					name: 'access-control-allow-origin',
					value: '*',
				},
				{
					name: 'set-cookie',
					value: 'testcookie=testvalue; Path=/; Expires=Tue, 18 Feb 2025 17:18:41 GMT; Secure; SameSite=None',
				},
				{
					name: 'content-type',
					value: 'application/json',
				},
				{
					name: 'Date',
					value: 'Mon, 19 Feb 2024 17:18:41 GMT',
				},
				{
					name: 'Connection',
					value: 'keep-alive',
				},
				{
					name: 'Keep-Alive',
					value: 'timeout=5',
				},
				{
					name: 'Content-Length',
					value: '11',
				},
			],
			cookies: [
				{
					name: 'testcookie',
					value: 'testvalue',
				},
			],
			content: {
				mimeType: 'application/json',
				size: 11,
				comment: 'Response bodies are not included.',
			},
			redirectURL: '',
			headersSize: 291,
			bodySize: 302,
		},
		cache: {},
		timings: {
			blocked: 1,
			dns: 1,
			connect: 0,
			ssl: 0,
			send: 0,
			wait: 1,
			receive: 0,
		},
		time: 3,
		_securityState: 'insecure',
		serverIPAddress: '127.0.0.1',
		connection: '3000',
	},
	// POSTXHR
	{
		startedDateTime: new Date('2024-02-19T18:28:34.953+01:00').getTime(),
		async getContent() {
			return ['{"test":12}', 'application/json'];
		},
		request: {
			bodySize: 15,
			method: 'POST',
			url: 'http://localhost:3000/user?title=Test1',
			httpVersion: 'HTTP/1.1',
			headers: [
				{
					name: 'Host',
					value: 'localhost:3000',
				},
				{
					name: 'User-Agent',
					value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
				},
				{
					name: 'Accept',
					value: 'application/json',
				},
				{
					name: 'Accept-Language',
					value: 'en-US,en;q=0.5',
				},
				{
					name: 'Accept-Encoding',
					value: 'gzip, deflate, br',
				},
				{
					name: 'Referer',
					value: 'http://localhost:3001/',
				},
				{
					name: 'content-type',
					value: 'application/json',
				},
				{
					name: 'Content-Length',
					value: '15',
				},
				{
					name: 'Origin',
					value: 'http://localhost:3001',
				},
				{
					name: 'Connection',
					value: 'keep-alive',
				},
				{
					name: 'Sec-Fetch-Dest',
					value: 'empty',
				},
				{
					name: 'Sec-Fetch-Mode',
					value: 'cors',
				},
				{
					name: 'Sec-Fetch-Site',
					value: 'same-site',
				},
			],
			cookies: [],
			queryString: [
				{
					name: 'title',
					value: 'Test1',
				},
			],
			headersSize: 462,
			postData: {
				mimeType: 'application/json',
				params: [],
				text: '{"test":"true"}',
			},
		},
		response: {
			status: 200,
			statusText: 'OK',
			httpVersion: 'HTTP/1.1',
			headers: [
				{
					name: 'access-control-allow-origin',
					value: '*',
				},
				{
					name: 'set-cookie',
					value: 'testcookie=testvalue; Path=/; Expires=Tue, 18 Feb 2025 17:28:34 GMT; Secure; SameSite=None',
				},
				{
					name: 'content-type',
					value: 'application/json',
				},
				{
					name: 'Date',
					value: 'Mon, 19 Feb 2024 17:28:34 GMT',
				},
				{
					name: 'Connection',
					value: 'keep-alive',
				},
				{
					name: 'Keep-Alive',
					value: 'timeout=5',
				},
				{
					name: 'Content-Length',
					value: '11',
				},
			],
			cookies: [
				{
					name: 'testcookie',
					value: 'testvalue',
				},
			],
			content: {
				mimeType: 'application/json',
				size: 11,
				comment: 'Response bodies are not included.',
			},
			redirectURL: '',
			headersSize: 291,
			bodySize: 302,
		},
		cache: {},
		timings: {
			blocked: -1,
			dns: 0,
			connect: 0,
			ssl: 0,
			send: 0,
			wait: 2,
			receive: 0,
		},
		time: 2,
		_securityState: 'insecure',
		serverIPAddress: '127.0.0.1',
		connection: '3000',
	},
	// GQL query
	{
		startedDateTime: '2024-02-19T20:05:54.241+01:00',
		async getContent() {
			return [
				'[{"data":{"book":{"id":"1","author":null,"__typename":"Book"}}}\n]',
				'application/json; charset=utf-8',
			];
		},
		request: {
			bodySize: 155,
			method: 'POST',
			url: 'http://localhost:3000/graphql',
			httpVersion: 'HTTP/1.1',
			headers: [
				{
					name: 'Host',
					value: 'localhost:3000',
				},
				{
					name: 'User-Agent',
					value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
				},
				{
					name: 'Accept',
					value: '*/*',
				},
				{
					name: 'Accept-Language',
					value: 'en-US,en;q=0.5',
				},
				{
					name: 'Accept-Encoding',
					value: 'gzip, deflate, br',
				},
				{
					name: 'Referer',
					value: 'http://localhost:3001/',
				},
				{
					name: 'content-type',
					value: 'application/json',
				},
				{
					name: 'Content-Length',
					value: '155',
				},
				{
					name: 'Origin',
					value: 'http://localhost:3001',
				},
				{
					name: 'Connection',
					value: 'keep-alive',
				},
				{
					name: 'Sec-Fetch-Dest',
					value: 'empty',
				},
				{
					name: 'Sec-Fetch-Mode',
					value: 'cors',
				},
				{
					name: 'Sec-Fetch-Site',
					value: 'same-site',
				},
			],
			cookies: [],
			queryString: [],
			headersSize: 441,
			postData: {
				mimeType: 'application/json',
				params: [],
				text: '[{"operationName":"BookQuery","variables":{"id":"1"},"query":"query BookQuery($id: ID!) {\\n  book(id: $id) {\\n    id\\n    author\\n    __typename\\n  }\\n}"}]',
			},
		},
		response: {
			status: 200,
			statusText: 'OK',
			httpVersion: 'HTTP/1.1',
			headers: [
				{
					name: 'access-control-allow-origin',
					value: '*',
				},
				{
					name: 'cache-control',
					value: 'no-store',
				},
				{
					name: 'content-type',
					value: 'application/json; charset=utf-8',
				},
				{
					name: 'Date',
					value: 'Mon, 19 Feb 2024 19:05:54 GMT',
				},
				{
					name: 'Connection',
					value: 'keep-alive',
				},
				{
					name: 'Keep-Alive',
					value: 'timeout=5',
				},
				{
					name: 'Content-Length',
					value: '65',
				},
			],
			cookies: [],
			content: {
				mimeType: 'application/json; charset=utf-8',
				size: 65,
				comment: 'Response bodies are not included.',
			},
			redirectURL: '',
			headersSize: 227,
			bodySize: 292,
		},
		cache: {},
		timings: {
			blocked: -1,
			dns: 0,
			connect: 0,
			ssl: 0,
			send: 0,
			wait: 2,
			receive: 0,
		},
		time: 2,
		_securityState: 'insecure',
		serverIPAddress: '127.0.0.1',
		connection: '3000',
	},
];
