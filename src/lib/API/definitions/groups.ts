import { Static, Type } from "@sinclair/typebox";

const Group = Type.Object({
	name: Type.String(),
	specialty: Type.String(),
});
type TGroup = Static<typeof Group>;

const GroupsGetQueryParams = Type.Object({
	name: Type.String(),
});
type TGroupsGetQueryParams = Static<typeof GroupsGetQueryParams>;

export { TGroup, TGroupsGetQueryParams, Group, GroupsGetQueryParams };
