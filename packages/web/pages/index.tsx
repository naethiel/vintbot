import { Logger, logLvl } from "logger";

const l = new Logger({ app: "app" }, logLvl.debug);

export default function Web() {
  l.debug("coucou");
  return (
    <div>
      <h1>Web</h1>
      <p>foobar</p>
    </div>
  );
}
