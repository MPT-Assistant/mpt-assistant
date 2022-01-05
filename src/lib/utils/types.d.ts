declare namespace MPT {
	namespace Timetable {
		interface ParsedElement {
			status: "await" | "process" | "finished";
			num: number;
			type: "lesson" | "recess";
			start: import("moment").Moment;
			end: import("moment").Moment;
			diffStart: import("moment").PreciseRangeValueObject;
			diffEnd: import("moment").PreciseRangeValueObject;
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
