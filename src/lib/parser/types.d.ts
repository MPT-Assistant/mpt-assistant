declare namespace MPT {
	type Week = "Знаменатель" | "Числитель";

	namespace Schedule {
		interface Lesson {
			num: number;
			name: [string, string?];
			teacher: [string, string?];
		}

		interface Day {
			num: number;
			place: string;
			lessons: ILesson[];
		}

		interface Group {
			name: string;
			days: Day[];
		}

		interface Specialty {
			name: string;
			groups: Group[];
		}
	}

	namespace Replacements {
		interface Replacement {
			num: number;
			old: {
				name: string;
				teacher: string;
			};
			new: {
				name: string;
				teacher: string;
			};
			created: number;
		}

		interface Group {
			group: string;
			replacements: Replacement[];
		}

		interface Day {
			date: number;
			groups: Group[];
		}
	}

	namespace Specialties {
		interface Specialty {
			name: string;
			code: string;
			url: string;
		}

		interface SiteGroupLeaders {
			name: string;
			roles: {
				photo: string;
				role: string;
				name: string;
			}[];
		}

		interface SiteItem {
			name: string;
			url: string;
			date: Date;
		}

		interface Site {
			name: string;
			code: string;
			url: string;
			importantInformation: SiteItem[];
			news: SiteItem[];
			examQuestions: SiteItem[];
			groupsLeaders: ISpecialtySiteGroupLeaders[];
		}
	}
}
