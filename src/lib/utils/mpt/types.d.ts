declare namespace MPT {
	namespace Timetable {
		type TStatus = "await" | "process" | "finished";
		type TType = "lesson" | "recess";
		interface ParsedElement {
			status: TStatus;
			num: number;
			type: TType;
			start: import("moment").Moment;
			end: import("moment").Moment;
			diffStart: import("moment").PreciseRangeValueObject;
			diffEnd: import("moment").PreciseRangeValueObject;
		}

		interface Parsed {
			current: ParsedElement;
			next: ParsedElement;
			list: ParsedElement[];
		}
	}

	namespace Schedule {
		interface ParsedLesson {
			num: number;
			name: string;
			teacher: string;
			timetable: MPT.Timetable.ParsedElement;
		}
	}
}
