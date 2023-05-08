import * as SendInBlueSDK from "@sendinblue/client";
import { VintedItem } from "./vinted-api-client.js";
import { logger } from "../logger.js";
import process from "node:process";

export type Recipient = SendInBlueSDK.SendSmtpEmailTo;
export type Recipients = Array<Recipient>;

export class Mailer {
  apiKey: string;
  api: SendInBlueSDK.TransactionalEmailsApi;
  dryRun: boolean;

  constructor({ apiKey, dryRun }: { apiKey: string; dryRun: boolean }) {
    if (apiKey.length === 0) {
      throw new Error("missing SENDINBLUE api key");
    }
    if (dryRun) {
      logger.info("Mailer configured in dry run mode. No mail will be sent");
    }
    this.dryRun = dryRun;
    this.apiKey = apiKey;
    this.api = new SendInBlueSDK.TransactionalEmailsApi();
  }

  public async send(items: VintedItem[], to: Recipients) {
    this.api.setApiKey(
      SendInBlueSDK.TransactionalEmailsApiApiKeys.apiKey,
      this.apiKey
    );

    logger.debug("sending transac mails", "recipients");
    const payload = {
      to: to,
      subject: "Test mail",
      sender: {
        email: "noreply@vinted-watcher-bot.com",
        name: "Vinted Watcher bot",
      },
      htmlContent: this.htmlContent(items),
    };
    if (this.dryRun) {
      logger.info(
        "dryRun is enabled: Mail API would have been called",
        "payload",
        payload
      );
    } else {
      const data = await this.api.sendTransacEmail(payload);

      logger.debug("SIB called successfully", "Returned data", data.body);
    }
  }

  private htmlContent(items: VintedItem[]) {
    return `
        <html lang="en">
          <head>
            <title>Squirreled bot watcher found something for you.</title>
          </head>
          <body>
            <h4>Hello!</h4>
            <p>We detected new products you might be interested in on Vinted.</p>
            <ul>
              ${items.map((i) => {
                return `
                <li><a href="${i.url}">${i.title} - ${i.price} ${i.currency}</li>
              `;
              })}
            </ul>
          </body>
        </html>
      `;
  }
}

export const mailService = new Mailer({
  apiKey: process.env.SENDINBLUE_API_KEY ?? "",
  dryRun: process.env.MAIL_DRY_RUN === "true",
});
