interface IConfig {
    db: {
        mongo: {
            protocol: string;
            address: string;
            login: string;
            password: string;
        };
    };
}

export default IConfig;
