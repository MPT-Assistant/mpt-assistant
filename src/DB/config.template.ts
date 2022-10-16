import IConfig from "./IConfig";

const config: IConfig = {
    vk: {
        token: "", pollingGroupId: 1
    },
    telegram: { token: "" },
    db: { mongo: {
        protocol: "",
        address: "",
        login: "",
        password: "",
    }, },
    server: { port: 80 }
};

export default config;
