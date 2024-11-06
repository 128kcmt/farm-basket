import { Role } from "src/components/enums/role.enums";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    userid : number

    @Column()
    name : string

    @Column()
    email : string

    @Column()
    password : string

    @Column({
        type: 'enum',
        enum:Role,
        default:Role.BUYER
    })
    role : Role

    @Column()
    location : string

    @Column({nullable :true})
    reset_token: string

    @Column({nullable : true, type: 'timestamp'})
    reset_token_expiry: Date
}
