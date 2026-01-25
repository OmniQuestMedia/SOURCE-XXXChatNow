import { settingService } from '@services/setting.service';
import parse from 'html-react-parser';
import Document, {
  Head, Html, Main, NextScript
} from 'next/document';

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const resp = await settingService.all();
    const settings = resp.data;
    return {
      ...initialProps,
      settings
    };
  }

  render() {
    const { settings } = this.props as any;
    return (
      <Html>
        <Head>
          <link rel="icon" href={settings?.favicon} sizes="64x64" />
          {settings.headerScript && parse(settings.headerScript)}
        </Head>
        <body>
          <Main />
          <NextScript />

          {/* extra script */}
          {settings?.afterBodyScript && (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: settings.afterBodyScript }} />
          )}
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
