import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Media from './Media';

@Entity()
class Season {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public seasonNumber: number;

  @ManyToOne(() => Media, (media) => media.seasons, { onDelete: 'CASCADE' })
  public media: Promise<Media>;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  constructor(init?: Partial<Season>) {
    Object.assign(this, init);
  }
}

export default Season;