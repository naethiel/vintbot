import * as SendInBlueSDK from "@sendinblue/client";
import { VintedItem } from "./vinted-api-client.js";
import { logger } from "../logger.js";

export type Recipient = SendInBlueSDK.SendSmtpEmailTo;
export type Recipients = Array<Recipient>;

export class Mailer {
  apiKey: string;
  api: SendInBlueSDK.TransactionalEmailsApi;

  constructor(apiKey?: string) {
    if (!apiKey) {
      throw new Error("missing SENDINBLUE api key");
    }

    this.apiKey = apiKey;
    this.api = new SendInBlueSDK.TransactionalEmailsApi();
  }

  public async send(items: VintedItem[], to: Recipients, dryRun: boolean) {
    this.api.setApiKey(
      SendInBlueSDK.TransactionalEmailsApiApiKeys.apiKey,
      this.apiKey
    );

    logger.debug("sending transac mails", "recipients", to);
    const payload = {
      to: to,
      subject: "Test mail",
      sender: {
        email: "noreply@vinted-watcher-bot.com",
        name: "Vinted Watcher bot",
      },
      htmlContent: this.htmlContent(items),
    };
    if (dryRun) {
      logger.info("dryRun is enabled: sending email", "payload", payload);
    } else {
      const data = await this.api.sendTransacEmail(payload);

      logger.debug("SIB called successfully", "Returned data", data.body);
    }
  }

  private htmlContent(items: VintedItem[]) {
    return `
        <html>
          <head>
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

export const mailService = new Mailer(process.env.SENDINBLUE_API_KEY);
