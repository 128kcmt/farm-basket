import { PaymentStatus } from "src/components/enums/payment.enum";
import { Products } from "src/components/products/entities/product.entity";
import { Users } from "src/components/users/entities/user.entity";
import { Column, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export class Payments {
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    amount : string

    @Column({unique:true})
    tx_ref : string

    @Column({
        type:'enum',
        enum : PaymentStatus,
        default : PaymentStatus.PENDING
    })
    status : PaymentStatus

    @Column()
    mobile : number

    @Column()
    currency : string

    @Column()
    charges : number

    @Column({
        type:'timestamp',
        default:'CURRENT_TIMESTAMPT'

    })
    created_at : Date

    @Column({
        type : 'timestamp',
        nullable : true
    })
    completed_at : Date

    @ManyToOne(()=> Products, product => product.payments)
    @JoinColumn({name: 'productid'})
    product: Products

    @ManyToOne(()=> Users, user=> user.payments)
    @JoinColumn({name : 'userid'})
    user : Users
}
