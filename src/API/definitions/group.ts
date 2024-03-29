import { Type } from "@sinclair/typebox";

const Specialty = Type.Object({
    name: Type.String(),
    code: Type.String(),
    url: Type.String()
});

const Group = Type.Object({
    name: Type.String(),
    specialty: Specialty,
});

const GroupsGetQueryParams = Type.Object({
    name: Type.String(),
});

const GroupsGetListQueryParams = Type.Object({
    specialty: Type.Optional(Type.String()),
});

const GroupsGetSpecialtyQueryParams = Type.Object({
    code: Type.String(),
});

export {
    Specialty,
    Group,
    GroupsGetQueryParams,
    GroupsGetListQueryParams,
    GroupsGetSpecialtyQueryParams
};
