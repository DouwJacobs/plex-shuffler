import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoUpdatePlaylist1690970642096 implements MigrationInterface {
  name = 'AutoUpdatePlaylist1690970642096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "playlist_shows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ratingKey" varchar NOT NULL DEFAULT (''), "numEpisodes" integer DEFAULT (0))`
    );
    await queryRunner.query(
      `CREATE TABLE "user_playlists" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ratingKey" varchar NOT NULL DEFAULT (''), "numEpisodes" integer DEFAULT (0), "numEpisodesUnwatched" integer DEFAULT (0), "unwatchedInd" boolean NOT NULL DEFAULT (0), "autoUpdate" boolean NOT NULL DEFAULT (0), "autoUpdateInterval" varchar NOT NULL DEFAULT (''), "userId" integer)`
    );
    await queryRunner.query(
      `CREATE TABLE "user_playlists_shows_playlist_shows" ("userPlaylistsId" integer NOT NULL, "playlistShowsId" integer NOT NULL, PRIMARY KEY ("userPlaylistsId", "playlistShowsId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5230834c14593c7b767a198147" ON "user_playlists_shows_playlist_shows" ("userPlaylistsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_472e90f730dbf4472c1e591185" ON "user_playlists_shows_playlist_shows" ("playlistShowsId") `
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_user_playlists" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ratingKey" varchar NOT NULL DEFAULT (''), "numEpisodes" integer DEFAULT (0), "numEpisodesUnwatched" integer DEFAULT (0), "unwatchedInd" boolean NOT NULL DEFAULT (0), "autoUpdate" boolean NOT NULL DEFAULT (0), "autoUpdateInterval" varchar NOT NULL DEFAULT (''), "userId" integer, CONSTRAINT "FK_edffa8ca753df446874d4e1a83b" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user_playlists"("id", "ratingKey", "numEpisodes", "numEpisodesUnwatched", "unwatchedInd", "autoUpdate", "autoUpdateInterval", "userId") SELECT "id", "ratingKey", "numEpisodes", "numEpisodesUnwatched", "unwatchedInd", "autoUpdate", "autoUpdateInterval", "userId" FROM "user_playlists"`
    );
    await queryRunner.query(`DROP TABLE "user_playlists"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_user_playlists" RENAME TO "user_playlists"`
    );
    await queryRunner.query(`DROP INDEX "IDX_5230834c14593c7b767a198147"`);
    await queryRunner.query(`DROP INDEX "IDX_472e90f730dbf4472c1e591185"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_user_playlists_shows_playlist_shows" ("userPlaylistsId" integer NOT NULL, "playlistShowsId" integer NOT NULL, CONSTRAINT "FK_5230834c14593c7b767a1981479" FOREIGN KEY ("userPlaylistsId") REFERENCES "user_playlists" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_472e90f730dbf4472c1e5911858" FOREIGN KEY ("playlistShowsId") REFERENCES "playlist_shows" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("userPlaylistsId", "playlistShowsId"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user_playlists_shows_playlist_shows"("userPlaylistsId", "playlistShowsId") SELECT "userPlaylistsId", "playlistShowsId" FROM "user_playlists_shows_playlist_shows"`
    );
    await queryRunner.query(`DROP TABLE "user_playlists_shows_playlist_shows"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_user_playlists_shows_playlist_shows" RENAME TO "user_playlists_shows_playlist_shows"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5230834c14593c7b767a198147" ON "user_playlists_shows_playlist_shows" ("userPlaylistsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_472e90f730dbf4472c1e591185" ON "user_playlists_shows_playlist_shows" ("playlistShowsId") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_472e90f730dbf4472c1e591185"`);
    await queryRunner.query(`DROP INDEX "IDX_5230834c14593c7b767a198147"`);
    await queryRunner.query(
      `ALTER TABLE "user_playlists_shows_playlist_shows" RENAME TO "temporary_user_playlists_shows_playlist_shows"`
    );
    await queryRunner.query(
      `CREATE TABLE "user_playlists_shows_playlist_shows" ("userPlaylistsId" integer NOT NULL, "playlistShowsId" integer NOT NULL, PRIMARY KEY ("userPlaylistsId", "playlistShowsId"))`
    );
    await queryRunner.query(
      `INSERT INTO "user_playlists_shows_playlist_shows"("userPlaylistsId", "playlistShowsId") SELECT "userPlaylistsId", "playlistShowsId" FROM "temporary_user_playlists_shows_playlist_shows"`
    );
    await queryRunner.query(
      `DROP TABLE "temporary_user_playlists_shows_playlist_shows"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_472e90f730dbf4472c1e591185" ON "user_playlists_shows_playlist_shows" ("playlistShowsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5230834c14593c7b767a198147" ON "user_playlists_shows_playlist_shows" ("userPlaylistsId") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_playlists" RENAME TO "temporary_user_playlists"`
    );
    await queryRunner.query(
      `CREATE TABLE "user_playlists" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ratingKey" varchar NOT NULL DEFAULT (''), "numEpisodes" integer DEFAULT (0), "numEpisodesUnwatched" integer DEFAULT (0), "unwatchedInd" boolean NOT NULL DEFAULT (0), "autoUpdate" boolean NOT NULL DEFAULT (0), "autoUpdateInterval" varchar NOT NULL DEFAULT (''), "userId" integer)`
    );
    await queryRunner.query(
      `INSERT INTO "user_playlists"("id", "ratingKey", "numEpisodes", "numEpisodesUnwatched", "unwatchedInd", "autoUpdate", "autoUpdateInterval", "userId") SELECT "id", "ratingKey", "numEpisodes", "numEpisodesUnwatched", "unwatchedInd", "autoUpdate", "autoUpdateInterval", "userId" FROM "temporary_user_playlists"`
    );
    await queryRunner.query(`DROP TABLE "temporary_user_playlists"`);
    await queryRunner.query(`DROP INDEX "IDX_472e90f730dbf4472c1e591185"`);
    await queryRunner.query(`DROP INDEX "IDX_5230834c14593c7b767a198147"`);
    await queryRunner.query(`DROP TABLE "user_playlists_shows_playlist_shows"`);
    await queryRunner.query(`DROP TABLE "user_playlists"`);
    await queryRunner.query(`DROP TABLE "playlist_shows"`);
  }
}
