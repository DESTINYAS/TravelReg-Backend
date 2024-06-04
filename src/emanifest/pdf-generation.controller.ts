// src/emanifest/pdf-generation.controller.ts

import { Controller, Get, Param, ParseIntPipe, NotFoundException, Res, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { EmanifestService } from './emanifest.service';
import { PdfGenerationService } from './pdf-generation.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import RoleAndJWTAuthenticationGuard from 'src/authentication/guards/role.and-jwt-authentication.guard';
import TravelRegRoles from 'src/roles/roles.enum';
import RequestWithUser from 'src/authentication/requestWithUser.interface';

@Controller('pdf')
@ApiTags('pdf')
export class PdfGenerationController {
  constructor(
    private readonly emanifestService: EmanifestService,
    private readonly pdfGenerationService: PdfGenerationService,
  ) {}

  @Get(':id')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Driver))
  @ApiBearerAuth()
  async generateEmanifestPdf(@Param('id', ParseIntPipe) id: string,@Req() request: RequestWithUser, @Res() res: Response): Promise<void> {
    const requestor = request.user
    const emanifest = await this.emanifestService.getEmanifestById(id);
    if (!emanifest) {
      throw new NotFoundException(`Emanifest with ID ${id} not found`);
    }
    if (requestor.id != emanifest.driverId) {
      throw new ForbiddenException(`Emanifest with ID ${id} not created by you`);
    }

    const pdfBuffer = await this.pdfGenerationService.generateEmanifestPdf(emanifest);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="emanifest_${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }
}
