import EventEmitter from "eventemitter3";
import { IReplacement } from "../../DB/API/types";

interface IEvents {
    on(
        event: "new_replacement",
        listener: (replacement: IReplacement) => void
    ): this;
    emit(event: "new_replacement", replacement: IReplacement): boolean;
}

const emitter: IEvents & EventEmitter = new EventEmitter();

export default emitter;
