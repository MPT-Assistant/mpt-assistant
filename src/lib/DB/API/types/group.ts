import { IScheduleDay, IScheduleLesson } from "@mpt-assistant/parser/dist/types/mpt";

interface IGroup {
    name: string;
    specialty: string;
    schedule: IScheduleDay[];
}

export {
    IGroup, IScheduleDay, IScheduleLesson
};
