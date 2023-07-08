# Installation

{% hint style="danger" %}
**Plex Shuffler is currently in ALPHA.** If you would like to help test Plex Shuffler, please use this image **`DouwJacobs/plex-shuffler:development`**!
{% endhint %}

{% hint style="info" %}
After running Plex Shuffler for the first time, configure it by visiting the web UI at `http://[address]:3210` and completing the setup steps.
{% endhint %}

## Docker

{% hint style="warning" %}
Be sure to replace `/path/to/appdata/config` in the below examples with a valid host directory path. If this volume mount is not configured correctly, your Plex Shuffler settings/data will not be persisted when the container is recreated (e.g., when updating the image or rebooting your machine).

The `TZ` environment variable value should also be set to the [TZ database name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) of your time zone!
{% endhint %}

{% tabs %}
{% tab title="Docker CLI" %}

For details on the Docker CLI, please [review the official `docker run` documentation](https://docs.docker.com/engine/reference/run/).

**Installation:**

```bash
docker run -d \
  --name plex-shuffler \
  -e LOG_LEVEL=debug \
  -e TZ=Asia/Tokyo \
  -e PORT=3210 `#optional` \
  -p 3210:3210 \
  -v /path/to/appdata/config:/app/config \
  --restart unless-stopped \
  douwjacobs/plex-shuffler
```

**Updating:**

Stop and remove the existing container:

```bash
docker stop plex-shuffler && docker rm plex-shuffler
```

Pull the latest image:

```bash
docker pull douwjacobs/plex-shuffler
```

Finally, run the container with the same parameters originally used to create the container:

```bash
docker run -d ...
```

{% hint style="info" %}
You may alternatively use a third-party updating mechanism, such as [Watchtower](https://github.com/containrrr/watchtower) or [Ouroboros](https://github.com/pyouroboros/ouroboros), to keep Plex Shuffler up-to-date automatically.
{% endhint %}

{% endtab %}

{% tab title="Docker Compose" %}

For details on how to use Docker Compose, please [review the official Compose documentation](https://docs.docker.com/compose/reference/).

**Installation:**

Define the `plex-shuffler` service in your `docker-compose.yml` as follows:

```yaml
---
version: '3'

services:
  plex-shuffler:
    image: douwjacobs/plex-shuffler
    container_name: plex-shuffler
    environment:
      - LOG_LEVEL=debug
      - TZ=Asia/Tokyo
      - PORT=3210 #optional
    ports:
      - 3210:3210
    volumes:
      - /path/to/appdata/config:/app/config
    restart: unless-stopped
```

Then, start all services defined in the Compose file:

```bash
docker-compose up -d
```

**Updating:**

Pull the latest image:

```bash
docker-compose pull plex-shuffler
```

Then, restart all services defined in the Compose file:

```bash
docker-compose up -d
```

{% endtab %}
{% endtabs %}
