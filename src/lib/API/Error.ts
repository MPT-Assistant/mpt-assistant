const ERRORS = {
	0: "Internal Server Error",
	1: "Method not found",
	2: "Group not found",
	3: "Invalid date",
} as const;

type TAPIErrorCode = keyof typeof ERRORS;

class APIError<Code extends TAPIErrorCode, Message = typeof ERRORS[Code]> {
	public readonly code: Code;
	public readonly message: Message;

	constructor(code: Code) {
		this.code = code;
		this.message = ERRORS[code] as unknown as Message;
	}

	public toJSON(): {
		code: Code;
		message: Message;
	} {
		return {
			code: this.code,
			message: this.message,
		};
	}
}

export { ERRORS };

export default APIError;
