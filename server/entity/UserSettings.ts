import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class UserSettings {
  constructor(init?: Partial<UserSettings>) {
    Object.assign(this, init);
  }

  @PrimaryGeneratedColumn()
  public id: number;

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn()
  public user: User;

  @Column({ default: '' })
  public locale?: string;

  @Column({ nullable: true })
  public region?: string;

  @Column({ nullable: true })
  public originalLanguage?: string;

  @Column({ default: false })
  public appendToTitle?: boolean;

  @Column({ default: false })
  public appendToSummary?: boolean;

  @Column({ nullable: true })
  public userDefaultShowLibraryID?: number;
}
