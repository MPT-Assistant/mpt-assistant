import { Static, Type } from "@sinclair/typebox";

const Group = Type.Object({
	name: Type.String(),
	specialty: Type.String(),
}); 
const GroupList = Type.Array(Group);

const GroupsGetQueryParams = Type.Object({
	name: Type.String(),
});

type TGroup = Static<typeof Group>;
type TGroupList = Static<typeof GroupList>;
type TGroupsGetQueryParams = Static<typeof GroupsGetQueryParams>;

export {
	TGroup,
	TGroupList,
	TGroupsGetQueryParams,
	Group,
	GroupList,
	GroupsGetQueryParams,
};
