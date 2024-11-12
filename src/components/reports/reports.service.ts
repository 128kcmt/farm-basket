import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reports)
    private readonly reportRep : Repository<Reports>,
    @InjectRepository(Users)
    private readonly userrep : Repository<Users>,
    @InjectRepository(Products)
    private productrep : Repository<Products>
  ){}
  async create(createReportDto: CreateReportDto,@Req() req: Request) {
    try {

      const{ product, reporter, ...ReportData } = createReportDto
      const userid = req.user?.userid
      const user = await this.userrep.findOne({where : {userid}})
      const productid = await this.productrep.findOne({where: {productid : product}})
    
      if (!user) {
        throw new NotFoundException('User not found')
      }
      if (!productid) {
        throw new NotFoundException('Product not found')
      }
      const report = new Reports()
      report.reporter = user
      report.product = productid
      await this.reportRep.save(report)
      
      response.status(201).json ({
        message : "Reported Successfully"
      })
    }catch (error){
      response.status(500).json({
        message : "Internal Server Error"
      })
    }
      
  }

  async findAll() {
    return await this.reportRep.find() 
  }

  async findOne(id: number) {
    return await this.reportRep.findOne({where : {id}})
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
