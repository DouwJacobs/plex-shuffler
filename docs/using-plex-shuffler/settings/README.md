# Settings

## General

### Application Title

You can display a custom application title to your users. Default is "Plex Shuffler"

## Users

### Enable New Plex Sign-In

When enabled, users with access to your Plex server will be able to sign in to Plex Shuffler even if they have not yet been imported. Users will be automatically assigned the permissions configured in the [Default Permissions](#default-permissions) setting upon first sign-in.

This setting is **enabled** by default.

### Default Permissions

Select the permissions you would like assigned to new users to have by default upon account creation.

If [Enable New Plex Sign-In](#enable-new-plex-sign-in) is enabled, any user with access to your Plex server will be able to sign in to Plex Shuffler, and they will be granted the permissions you select here upon first sign-in.

This setting only affects new users, and has no impact on existing users. In order to modify permissions for existing users, you will need to [edit the users](../users/README.md#editing-users).

## Plex

### Plex Settings

{% hint style="info" %}
To set up Plex, you can either enter your details manually or select a server retrieved from [plex.tv](https://plex.tv/). Press the button to the right of the "Server" dropdown to retrieve available servers.

Depending on your setup/configuration, you may need to enter your Plex server details manually in order to establish a connection from Plex Shuffler.
{% endhint %}

#### Hostname or IP Address

If you have Plex Shuffler installed on the same network as Plex, you can set this to the local IP address of your Plex server. Otherwise, this should be set to a valid hostname (e.g., `plex.myawesomeserver.com`).

#### Port

This value should be set to the port that your Plex server listens on. The default port that Plex uses is `32400`, but you may need to set this to `443` or some other value if your Plex server is hosted on a VPS or cloud provider.

#### Use SSL

Enable this setting to connect to Plex via HTTPS rather than HTTP. Note that self-signed certificates are _not_ supported.
