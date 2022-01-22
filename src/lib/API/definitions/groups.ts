import { Static, Type } from "@sinclair/typebox";

const Group = Type.Object({
	name: Type.String(),
	specialty: Type.String(),
});
const GroupList = Type.Array(Group);

const GroupsGetQueryParams = Type.Object({
	name: Type.String(),
});
const GroupsGetListQueryParams = Type.Object({
	specialty: Type.Optional(Type.String()),
});

type TGroup = Static<typeof Group>;
type TGroupList = Static<typeof GroupList>;
type TGroupsGetQueryParams = Static<typeof GroupsGetQueryParams>;
type TGroupsGetListQueryParams = Static<typeof GroupsGetListQueryParams>;

export {
	TGroup,
	TGroupList,
	TGroupsGetQueryParams,
	TGroupsGetListQueryParams,
	Group,
	GroupList,
	GroupsGetQueryParams,
	GroupsGetListQueryParams,
};
