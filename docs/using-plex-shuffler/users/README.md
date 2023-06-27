# Users

## Owner Account

The user account created during Plex Shuffler setup is the "Owner" account, which cannot be deleted or modified by other users. This account's credentials are used to authenticate with Plex.

## Adding Users

Users can be imported from Plex. If **Settings &rarr; Enable New Plex Sign-In** is enabled users will be able to sign-in without the need to be imported. All new users will have the [default permissions](../settings/README.md#default-permissions) defined in **Settings &rarr; Users**.

### Importing Plex Users

Clicking the **Import Plex Users** button on the **User List** page will fetch the list of users with access to the Plex server from [plex.tv](https://www.plex.tv/), and add them to Plex Shuffler automatically.

Importing Plex users is not required, however. Any user with access to the Plex server can log in to Plex Shuffler even if they have not been imported, and will be assigned the configured [default permissions](../settings/README.md#default-permissions) upon their first login.

### General

#### Display Name

You can optionally set a "friendly name" for any user. This name will be used in lieu of their Plex username (for users imported from Plex) or their email address (for manually-created local users).

#### Display Language

Users can override the [global display language](../settings/README.md#display-language) to use Plex Shuffler in their preferred language.

### Permissions

Users cannot modify their own permissions. Users with the **Manage Users** permission can manage permissions of other users, except those of users with the **Admin** permission.

## Deleting Users

When users are deleted, all of their data is also cleared from the database.
