import IConfig from "./IConfig";

const config: IConfig = {
    vk: {
        token: "", pollingGroupId: 1
    },
    db: { mongo: {
        protocol: "",
        address: "",
        login: "",
        password: "",
    }, },
};

export default config;
