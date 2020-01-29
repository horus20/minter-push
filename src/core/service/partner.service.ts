import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PartnerService {

  /**
   * biptophone.ru
   * send phone number -> get message with mxaddress -> return mxaddress
   * @param phone
   * @return string (empty or mxaddress if success)
   */
  async sendToPhone(phone: string): Promise<string> {
    try {
      const response = await axios.post('https://biptophone.ru/send.php', `phone=${phone}`);

      if (response.data.valid === 1) {
        // phone valid try get mx
        const result = response.data.message.match(/"wallet">(Mx[0-9abcdef]+)<\//);
        if (result) {
          const mxaddress = result[1];
          global.console.info(`New phone ${phone} - ${mxaddress}`);

          return mxaddress;
        }
      }
    } catch (error) {
      global.console.error(error);
    }
    return '';
  }
}
