import { Type } from "@sinclair/typebox";

const TeachersGetByNameQueryParams = Type.Object({
    name: Type.String()
});

const Teacher = Type.Object({
    name: Type.String(),
    surname: Type.String(),
    patronymic: Type.String(),
    photo: Type.String(),
    link: Type.Optional(Type.String()),
    dosieId: Type.Optional(Type.String()),
    rating: Type.Number()
});

export {
    TeachersGetByNameQueryParams,
    Teacher
};