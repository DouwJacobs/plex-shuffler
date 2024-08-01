import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlaylistShows } from './PlaylistShows';
import { User } from './User';

@Entity()
export class UserPlaylists {
  constructor(init?: Partial<UserPlaylists>) {
    Object.assign(this, init);
  }

  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => User, (user) => user.playlists)
  public user: User;

  @ManyToMany(() => PlaylistShows, { onDelete: 'CASCADE' })
  @JoinTable()
  public shows: PlaylistShows[];

  @Column({ default: '' })
  public ratingKey?: string;

  @Column({ nullable: true, default: 0 })
  public numEpisodes?: number;

  @Column({ nullable: true, default: 0 })
  public numEpisodesUnwatched?: number;

  @Column({ default: false })
  public unwatchedInd?: boolean;

  @Column({ default: false })
  public autoUpdate?: boolean;

  @Column({ default: '' })
  public autoUpdateInterval?: string;
}
