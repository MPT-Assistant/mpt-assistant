import EventEmitter from "eventemitter3";
import { IReplacement } from "../../DB/API/types";

export interface IEvents {
    on(
        event: "new_replacement",
        listener: (replacement: IReplacement) => void
    ): this;
    emit(event: "new_replacement", replacement: IReplacement): boolean;
}

class Emitter extends EventEmitter {
    public emitReplacement(replacement: IReplacement): void {
        this.emit("new_replacement", replacement);
    }
}

export default Emitter;
