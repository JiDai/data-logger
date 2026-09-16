import type { Header, Param, Entry as _HAREntry } from 'har-format';
import type { OperationTypeNode } from 'graphql';
import type { QueryObject } from 'ufo';

export interface HAREntry extends _HAREntry {
	_resourceType: 'xhr' | 'fetch' | 'preflight';
	getContent: () => Promise<[string, string]>;
}

interface BaseEntryRequest {
	url: string;
	headers: Header[];
	preflightHeaders?: Header[];
	mimeType?: string;
	method: string;
}

interface BaseEntryResponse {
	status: number;
	statusMessage?: string;
	isError: boolean;
	headers: Header[];
	preflightHeaders?: Header[];
	mimeType: string;
}

export interface BaseEntry {
	id: string;
	time: number;
	timestamp: number;
	request: BaseEntryRequest;
	response: BaseEntryResponse;
}

interface HTTPEntryRequest extends BaseEntryRequest {
	name: string;
	host?: string;
	pathname: string;
	queryString: string;
	query: QueryObject;
	body: BodyInit;
	params?: Param[];
}

interface HTTPEntryResponse extends BaseEntryResponse {
	getResponse: () => Promise<unknown>;
}

export interface HTTPEntry extends BaseEntry {
	type: string;
	request: HTTPEntryRequest;
	response: HTTPEntryResponse;
}

interface GQLEntryRequest extends BaseEntryRequest {
	name?: string;
	operations: string[];
	operationType: OperationTypeNode;
	query: string;
	variables: unknown;
	batch?: {
		length: number;
		count: number;
	};
}

interface GQLEntryResponse extends BaseEntryResponse {
	getResponse: () => Promise<{
		data?: unknown;
		errors?: unknown[];
	}>;
}

export interface GQLEntry extends BaseEntry {
	type: string;
	request: GQLEntryRequest;
	response: GQLEntryResponse;
}

export type Entry = HTTPEntry | GQLEntry;

export type RequestItem = {
	id: string;
	timestamp: number;
	name: string;
	type: 'GQL' | 'JSON' | 'XML' | 'SVG' | 'IMG' | 'HTML' | 'Other';
	method: string;
	responseStatusCode: number;
	responseStatusMessage?: string;
	time: number;
	headers: Array<Header>;
	requestDomain: string;
	requestQueryString: string | null;
	requestQueryStringCode: string | null;
	requestGQLQuery: string | null;
	requestGQLQueryCode: string | null;
	requestGQLVariables: string | null;
	requestGQLVariablesCode: string | null;
	requestPostData: string | null;
	requestPostDataCode: string | null;
	requestParams: Param[] | null;
	responsePayload: unknown;
	responseMimeType: string;
};
