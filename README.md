# Local SSL management

Script to manage local SSL certifications by [mkcert](https://github.com/FiloSottile/mkcert). The key of this script: do not use ports in the domain and use all of them through port 443.

**Example**:

`https://local.your-domain.tld:3000` → `https://local.your-domain.tld`

> ℹ️ At the moment, just tested in MacOS

## Use case

Sometimes we need to use HTTPS for some security restrictions or just to work closely to the PRODUCTION reality.

This is not a common use case, just it is a particular scenario on my side. Probably you do not need this to work with multiple projects in local but, it is helpful for me, also maybe for you.

Some of projects I work, has a authentication process linked to some platform like Github for example. Following this case, to setup your authentication process, you need to give a callback url like `https://local.your-domain.com:3000`, but sometimes I need to change the PORT for some reason. The problem is, I need to change the PORT in the service where I doing the authentication process and, all the parts in the code where I have the domain set, as for example, in the environment vars.

Now, you can work without port when you use HTTPS, so, you can access to `https://local.your-domain.com` directly, without specify the PORT. With this script (`yarn cli`), back to the Github authentication case, just you need to give the domain, without care when you change teh PORT.

Yes, this is a specific use case but, for me sometimes is very useful and, I do not need to touch anything on my machine.

### Others

* When you need to do something related with different TLD, as for example: setup a default language according to the TLD. You do not need to add a special script to get the TLD.
* ...

## Requirements

* Nodejs +16
* Docker
* Mkcert
* Update /etc/hosts manually

## TODO

* [ ] Add certs manually
* [ ] Add custom nginx config
* [ ] CLI

## How it works?

![alt text](/architecture-schema.png)

Basically, the script creates a container based on [Nginx](https://hub.docker.com/_/nginx), and this container works as proxy for local domains, like in a server.

## How to use

**#1 - Update your /hosts**:

OSX:

```bash
...
127.0.0.1					local.your-domain.com
```

**#2 - Setup config**:

```json
[
  {
    "domain": "local.your-domain.com",
    "port": 2000, // port where the application is running http://localhost:2000
  },
  ...
]
```

**#3 - Run your application**:

The script will work but, if your application is not running, the domain with not resolve the source.

**#4 - Run the script**:

Before all, build the script by running `yarn build` and after `yarn up`

The script will:

* Check the `config.json` file, creating the new SSL certificates if needed.
* Create the `nginx.conf` per each domain.
* Generate the `Dockerfile` configuration.
* Remove and create the new image (named `local-ssl-management`).
* Remove and create the new container (named `local-ssl-management`).

> All files create will be into `.temp` folder.

**#4 - Go to your domain and check it**:

Go you your application local domain: [https://local.your-domain.com](https://local.your-domain.com) and... should work 😅.

## Author

```json
{
  "name": "Dimas López Zurita",
  "role": "Senior Software Engineer",
  "alias": "dimaslz",
  "linkedin": "https://www.linkedin.com/in/dimaslopezzurita",
  "github": "https://github.com/dimaslz",
  "twitter": "https://twitter.com/dimaslz",
  "tags": "tooling, docker, tailwindcss, vue, SAAS, nodejs+express"
}
```

## My other projects

* [https://ng-heroicons.dimaslz.dev/](https://ng-heroicons.dimaslz.dev/): An Angular components library to use Heroicons.com in your Angular projects.
* [https://randomdata.loremapi.io/](https://randomdata.loremapi.io/): A tool to create mock Api responses with your custom schema.
* [https://svg-icon-2-fw-component.dimaslz.dev](https://svg-icon-2-fw-component.dimaslz.dev): A tool to create a framework icon component from a SVG
* [https://loremapi.io](https://loremapi.io): Mock and document your Api's
* [https://cv.dimaslz.dev](https://cv.dimaslz.dev): My online CV
* [https://api.dimaslz.dev](https://api.dimaslz.dev): My professional info by API
* [https://dimaslz.dev](https://dimaslz.dev): Dev landing
* [https://dimaslz.com](https://dimaslz.com): Profesional landing profile
