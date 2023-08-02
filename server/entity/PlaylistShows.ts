import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PlaylistShows {
  constructor(init?: Partial<PlaylistShows>) {
    Object.assign(this, init);
  }

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ default: '' })
  public ratingKey?: string;

  @Column({ nullable: true, default: 0 })
  public numEpisodes?: number;
}
