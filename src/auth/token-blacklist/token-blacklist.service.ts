import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlacklistedToken,
  BlacklistedTokenDocument,
} from './token-blacklist.schema';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectModel(BlacklistedToken.name)
    private readonly blacklistModel: Model<BlacklistedTokenDocument>,
  ) {}

  async isRevoked(jti: string): Promise<boolean> {
    const exists = await this.blacklistModel.exists({ jti }).exec();
    return Boolean(exists);
  }

  async revoke(jti: string, expiresAt: Date): Promise<void> {
    await this.blacklistModel
      .updateOne(
        { jti },
        { jti, expiresAt },
        {
          upsert: true,
        },
      )
      .exec();
  }
}
