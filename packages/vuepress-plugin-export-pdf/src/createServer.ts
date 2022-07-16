import { chalk, logger, path } from "@vuepress/utils";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
// eslint-enable @typescript-eslint/ban-ts-comment
import { dev } from "vuepress";
import { generatePdf } from "./generatePdf";
import { timerTransformer } from "./utils";

const { red, cyanBright } = chalk;
const { join } = path;

export const createServer = async(dir = "docs", options: Record<string, any> = {}) => {
  dir = join(process.cwd(), dir);

  const devContext = await dev({
    sourceDir: dir,
    clearScreen: false,
    theme: "@vuepress/default",
  });

  await new Promise((resolve) => {
    devContext.devProcess.server.compiler.hooks.done.tap("webpack-dev-server", () => {
      logger.success(cyanBright("VuePress dev server compiler done\n"));
      resolve(true);
    });
  });

  logger.tip("Start to generate current site to PDF ...");

  const {
    sorter,
    puppeteerLaunchOptions,
    pageOptions,
  } = options;

  try {
    await generatePdf(devContext, {
      port: devContext.devProcess.port,
      /**
       * Why not devContext.devProcess.host
       * Because will get http://0.0.0.0:8080, and then fail
       * @see https://github.com/vuejs/vuepress/commit/4d5c50e
      */
      host: devContext.devProcess.displayHost,
      outputFileName: `vuepress-${timerTransformer()}.pdf`,
      sorter,
      puppeteerLaunchOptions,
      pageOptions,
    });
  }
  catch (error) {
    console.error(red(error));
  }

  devContext.devProcess.server.close();
  process.exit(0);
};
