import { FastifyRequest } from "fastify";

const ERRORS = {
	0: "Internal Server Error",
	1: "Method not found",
	2: "Group not found",
	3: "Invalid date",
	4: "Rate limit exceeded, retry in 1 minute",
	5: "One of the required parameters is not transmitted",
} as const;

type TAPIErrorCode = keyof typeof ERRORS;

interface IAdditionalErrorParams {
	code?: never;
	message?: never;
	request_params?: never;
	[prop: string]: unknown;
}

class APIError<
	Code extends TAPIErrorCode,
	Message = typeof ERRORS[Code],
	Additional extends IAdditionalErrorParams = IAdditionalErrorParams,
> {
	public readonly code: Code;
	public readonly message: Message;
	public readonly request: FastifyRequest<{
		Querystring: {
			[prop: string]: string;
		};
	}>;
	public readonly additional: Additional;

	constructor({
		code,
		request,
		additional = {} as Additional,
	}: {
		code: Code;
		request: FastifyRequest;
		additional?: Additional;
	}) {
		this.code = code;
		this.message = ERRORS[code] as unknown as Message;
		this.request = request as FastifyRequest<{
			Querystring: {
				[prop: string]: string;
			};
		}>;
		this.request.query = this.request.query || {};
		this.additional = additional;
	}

	public toJSON(): {
		code: Code;
		message: Message;
		request_params: { key: string; value: string }[];
	} & Additional {
		return {
			code: this.code,
			message: this.message,
			request_params: Object.keys(this.request.query).map((key) => {
				return { key, value: this.request.query[key] };
			}),
			...this.additional,
		};
	}
}

export { ERRORS };

export default APIError;
