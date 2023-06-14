import fs from "fs";
import path from "path";
import shell from "shelljs";
import chalk from "chalk";

import getLocalIP from "./utils/get-local-ip";
import type Config from "./types/config.type";
import ping from "./ping";

const ROOT = `${__dirname}/../`;

const LOCAL_IP = getLocalIP();
const toReplace = "#--server-config--#";

// check if mkcert is installed
if (!shell.which('mkcert')) {
	shell.echo('Sorry, this script requires "mkcert"');
	shell.exit(1);
}

// check if docker is installed
if (!shell.which('docker')) {
	shell.echo('Sorry, this script requires "docker"');
	shell.exit(1);
}

const configPath = path.resolve(ROOT, "config.json");
if (!fs.existsSync(configPath)) {

	shell.echo('Sorry, config.json does not exists.');
	shell.exit(1);
}

const up = () => {
	const config: Config[] = JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }) || "[]");

	const domains = config.map((c) => c.domain.split(",")
		.map(d => d.trim())
		.join("_"))
		.concat("localhost");

	const filesToRemove = fs.readdirSync(path.resolve(ROOT, ".temp/ssl"))
		.filter((file) => {
			const f = file.replace(/-?cert\..+?$|-?key\..+?$/, "");
			return !domains.includes(f)
		});

	filesToRemove.forEach(file => fs.unlinkSync(path.resolve(ROOT, `.temp/ssl/${file}`)))

	const localhostCertExists = fs.existsSync(
		path.resolve(ROOT, ".temp/ssl/localhost-cert.pem")
	);
	const localhostKeyExists = fs.existsSync(
		path.resolve(ROOT, ".temp/ssl/localhost-key.pem")
	);

	if (!localhostCertExists || !localhostKeyExists) {
		shell.exec(`mkcert -install \
		-key-file .temp/ssl/localhost-key.pem \
		-cert-file .temp/ssl/localhost-cert.pem \
		localhost 127.0.0.1 ::1`)
	}

	const nginxConfServerTplPath = path.resolve(ROOT, "assets/nginx.conf.server.tpl");

	const certsUrl: { cert: string; key: string; }[] = [];
	const newConfig: Config[] = [];
	const serverConfigs: string[] = config.map((c: Config) => {
		if (!fs.existsSync(nginxConfServerTplPath)) {

			shell.echo("Sorry, is not possible to find './assets/nginx.conf.server.tpl' file.");
			shell.exit(1);
		}

		const nginxConfServerTpl = fs.readFileSync(nginxConfServerTplPath, { encoding: "utf8" });

		if (c.nginxConf) {
			return nginxConf;
		}

		const multipleDomains = c.domain.split(",").length > 1;
		const domain = multipleDomains
			? c.domain.split(",").map(d => d.trim()).join(" ")
			: c.domain.trim();
		const certName = multipleDomains
			? c.domain.split(",").map(d => d.trim()).join("_")
			: c.domain.trim();

		const certFilenamePath = `.temp/ssl/${certName}-cert.pem`;
		const certFilenameExists = fs.existsSync(certFilenamePath);
		const keyFilenamePath = `.temp/ssl/${certName}-cert.pem`;
		const keyFilenameExists = fs.existsSync(keyFilenamePath);

		const certsAlreadyExists = certFilenameExists || keyFilenameExists;
		if (certFilenameExists) {
			shell.echo(
				chalk.green("Certs files already exists")
			);
		}

		if (!certsAlreadyExists) {
			shell.echo(
				chalk.yellow(`Creating new certs for ${domain}`)
			);
			shell.exec(`mkcert -install \
			-key-file .temp/ssl/${certName}-key.pem \
			-cert-file .temp/ssl/${certName}-cert.pem \
			${domain} localhost 127.0.0.1 ::1`)
		}

		certsUrl.push({
			cert: `.temp/ssl/${certName}-cert.pem`,
			key: `.temp/ssl/${certName}-key.pem`,
		});

		newConfig.push(c);

		return nginxConfServerTpl
			.replaceAll("%APP_DOMAIN%", certName)
			.replace("%SERVER_NAME%", c.domain.split(",").map(i => i.trim()).join(' '))
			.replace("%LOCAL_IP%", LOCAL_IP)
			.replace("%PORT%", String(c.port));
	});

	fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));

	const nginxConfTplPath = path.resolve(ROOT, "assets/nginx.conf.tpl");
	if (!fs.existsSync(nginxConfTplPath)) {
		console.log("Sorry, is not possible to find 'nginx.conf.tpl' file.");
	}

	const nginxConfTpl = fs.readFileSync(nginxConfTplPath, { encoding: "utf8" });
	const nginxConf = nginxConfTpl.replace(toReplace, serverConfigs.join("\n"));

	const nginxConfDest = path.resolve(ROOT, ".temp/nginx.conf");
	fs.writeFileSync(nginxConfDest, nginxConf);

	const dockerfileTplPath = path.resolve(ROOT, "assets/Dockerfile.tpl");
	const dockerfileContent = fs.readFileSync(dockerfileTplPath, { encoding: "utf8" });
	const dockerfileDest = path.resolve(ROOT, ".temp/Dockerfile");
	fs.writeFileSync(dockerfileDest, dockerfileContent.replace(
		"#-certs-#",
		certsUrl.map((d: { cert: string; key: string; }) => {
			return `COPY ${d.key} /etc/nginx/
COPY ${d.cert} /etc/nginx/`
		}).join("\n\n")
	));

	shell.exec(`NAME=local-ssl-management && \
	docker rm -f $NAME && \
	docker rmi -f $NAME && \
	docker build -f .temp/Dockerfile --no-cache -t $NAME . && \
	docker run --name $NAME -p 80:80 -p 443:443 -d $NAME && \
	docker ps`);

	ping();
}

up();