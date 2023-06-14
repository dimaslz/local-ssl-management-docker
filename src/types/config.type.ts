type Config = {
	domain: string;
	port: number;
	ssl?: {
		cert: string;
		key: string;
	};
	nginxConf?: null | string;
}

export default Config;
