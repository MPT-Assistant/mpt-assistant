import { ITeacher as ParserITeacher } from "@mpt-assistant/parser";

interface ITeacherRatingSourceVK {
    type: "vk";
    id: number;
}

interface ITeacherRatingItem {
    score: number;
    source: ITeacherRatingSourceVK;
}

interface ITeacher extends ParserITeacher {
    rating: ITeacherRatingItem[];
    vkId?: number;
}

export {
    ITeacher,
    ITeacherRatingItem,
    ITeacherRatingSourceVK
};
