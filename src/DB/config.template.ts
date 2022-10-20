import IConfig from "./IConfig";

const config: IConfig = {
    vk: {
        group: {
            token: "",
            pollingGroupId: 1
        },
        miniapp: {
            secureKey: "",
            serviceToken: ""
        }
    },
    telegram: { token: "" },
    db: {
        mongo: {
            protocol: "",
            address: "",
            login: "",
            password: "",
        },
    },
    server: {
        port: 80,
        cert: "./cert.pem",
        key: "./key.pem",
    }
};

export default config;
