import shell from "shelljs";

import config from "../config.json";
import type Config from "./types/config.type";

const run = async () => {
	config.forEach((c: Config) => {
		c.domain.split(",").map(d => d.trim()).forEach((domain) => {
			const curl = `curl -s -o /dev/null -w "%{http_code}" https://${domain}`;
			const status = shell.exec(curl).stdout;

			if (status === "200") {
				console.log(` - https://${domain} ✅`);
			} else {
				console.log(` - https://${domain} ❌`);
			}
		})
	});
}

export default run;