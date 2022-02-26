import utils from "./index";

const ERRORS = {
	0: "Неизвестная ошибка",
} as const;

type TAPIErrorCode = keyof typeof ERRORS;

class CoreError<Code extends TAPIErrorCode, Meta extends object> extends Error {
	public readonly code: Code;
	public readonly name: typeof ERRORS[Code];
	public readonly meta: Meta;
	public readonly cause: Error;

	constructor(code: Code, cause: Error, meta?: Meta) {
		super();
		this.code = code;
		this.name = ERRORS[code];
		this.meta = meta || ({} as Meta);
		this.cause = cause;

		utils.events.emit("core_error", this);
	}

	public toString(): string {
		return `${this.name} #${this.code}`;
	}
}

export default CoreError;
